import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Filter, MapPin, ArrowUpDown, PlusCircle, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ItemCard from '@/components/ItemCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import FilterChip from '@/components/FilterChip';
import { StatusBadge } from '@/components/StatusTracker';
import type { LostItem, FoundItem } from '@/types';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/types';

type ItemType = 'all' | 'lost' | 'found';
type SortOrder = 'newest' | 'oldest';

export default function ItemListPage({ initialType }: { initialType?: ItemType }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [type, setType] = useState<ItemType>(initialType || (searchParams.get('type') as ItemType) || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'active');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sort') as SortOrder) || 'newest');

  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const updateURL = useCallback(() => {
    const params: Record<string, string> = {};
    if (type !== 'all') params.type = type;
    if (searchQuery) params.q = searchQuery;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (locationFilter !== 'all') params.location = locationFilter;
    if (statusFilter !== 'active') params.status = statusFilter;
    if (sortOrder !== 'newest') params.sort = sortOrder;
    setSearchParams(params, { replace: true });
  }, [type, searchQuery, categoryFilter, locationFilter, statusFilter, sortOrder, setSearchParams]);

  useEffect(() => { updateURL(); }, [updateURL]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(false);
      const [lostRes, foundRes] = await Promise.all([
        supabase.from('lost_items').select('*').order('created_at', { ascending: false }),
        supabase.from('found_items').select('*').order('created_at', { ascending: false }),
      ]);
      if (lostRes.error || foundRes.error) {
        setError(true);
      } else {
        setLostItems((lostRes.data as LostItem[]) || []);
        setFoundItems((foundRes.data as FoundItem[]) || []);
      }
      setLoading(false);
    })();
  }, []);

  const allItems: { item: LostItem | FoundItem; type: 'lost' | 'found' }[] = [
    ...lostItems.map((item) => ({ item, type: 'lost' as const })),
    ...foundItems.map((item) => ({ item, type: 'found' as const })),
  ];

  const filteredItems = allItems
    .filter(({ item, type: itemType }) => {
      if (type !== 'all' && itemType !== type) return false;
      const matchesSearch =
        !searchQuery ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const location = itemType === 'lost' ? (item as LostItem).location_lost : (item as FoundItem).location_found;
      const matchesLocation = locationFilter === 'all' || location === locationFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    })
    .sort((a, b) => {
      const cmp = new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime();
      return sortOrder === 'newest' ? cmp : -cmp;
    });

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (categoryFilter !== 'all') activeFilters.push({ label: categoryFilter, onRemove: () => setCategoryFilter('all') });
  if (locationFilter !== 'all') activeFilters.push({ label: locationFilter, onRemove: () => setLocationFilter('all') });
  if (statusFilter !== 'all') activeFilters.push({ label: statusFilter, onRemove: () => setStatusFilter('all') });
  if (searchQuery) activeFilters.push({ label: `"${searchQuery}"`, onRemove: () => setSearchQuery('') });

  const clearAll = () => {
    setCategoryFilter('all');
    setLocationFilter('all');
    setStatusFilter('active');
    setSearchQuery('');
  };

  const typeToggle: { key: ItemType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'lost', label: 'Lost' },
    { key: 'found', label: 'Found' },
  ];

  const FilterControls = () => (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items, descriptions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer min-w-[150px]">
            <option value="all">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer min-w-[150px]">
            <option value="all">All Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer min-w-[120px]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="matched">Matched</option>
          <option value="resolved">Resolved</option>
          <option value="expired">Expired</option>
        </select>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer min-w-[140px]">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Find Lost &amp; Found Items</h1>
          <p className="text-sm text-slate-500">Search reports from across campus.</p>
        </div>

        {/* Helpful discovery prompt */}
        <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-lg mb-6">
          <SlidersHorizontal className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700">
            Lost something recently? Start with the campus zone where you last remember having it.
          </p>
        </div>

        {/* Type toggle */}
        <div className="flex bg-slate-100 rounded-lg p-1 mb-4 w-full sm:w-auto sm:inline-flex">
          {typeToggle.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                type === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters - desktop */}
        <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
          <FilterControls />
        </div>

        {/* Filters - mobile toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          {showFiltersMobile && (
            <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-fade-in">
              <FilterControls />
            </div>
          )}
        </div>

        {/* Filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {activeFilters.map((f, i) => (
              <FilterChip key={i} label={f.label} onRemove={f.onRemove} />
            ))}
            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 font-medium underline">
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-slate-400 mb-4">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found</p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message="Couldn't load campus reports. Please try again." onRetry={() => window.location.reload()} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={allItems.length === 0 ? 'Nothing here yet.' : 'We couldn\'t find that item.'}
            message={allItems.length === 0
              ? 'Be the first to report a lost or found item on campus.'
              : 'Try another keyword or browse all reports.'}
            action={
              allItems.length === 0 ? (
                <div className="flex gap-2">
                  <Link to="/report/lost" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Report Lost
                  </Link>
                  <Link to="/report/found" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Report Found
                  </Link>
                </div>
              ) : (
                <button onClick={clearAll} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" /> Clear filters
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(({ item, type: itemType }) => (
              <ItemCard key={`${itemType}-${item.id}`} item={item} type={itemType} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
