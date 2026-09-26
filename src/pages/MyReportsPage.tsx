import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, PlusCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/EmptyState';
import StatusTracker from '@/components/StatusTracker';
import ResolveModal from '@/components/ResolveModal';
import type { LostItem, FoundItem } from '@/types';

type Tab = 'all' | 'lost' | 'found' | 'resolved';

interface ReportEntry {
  id: string;
  type: 'lost' | 'found';
  item: LostItem | FoundItem;
}

export default function MyReportsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolve, setShowResolve] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState<LostItem | FoundItem | null>(null);
  const [resolveTargetType, setResolveTargetType] = useState<'lost' | 'found'>('lost');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [lostRes, foundRes] = await Promise.all([
        supabase.from('lost_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('found_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      const lost: ReportEntry[] = ((lostRes.data as LostItem[]) || []).map((item) => ({ id: item.id, type: 'lost' as const, item }));
      const found: ReportEntry[] = ((foundRes.data as FoundItem[]) || []).map((item) => ({ id: item.id, type: 'found' as const, item }));
      setReports([...lost, ...found].sort((a, b) => new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime()));
      setLoading(false);
    })();
  }, [user]);

  const filtered = reports.filter((r) => {
    if (tab === 'lost') return r.type === 'lost';
    if (tab === 'found') return r.type === 'found';
    if (tab === 'resolved') return r.item.status === 'resolved';
    return true;
  });

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: reports.length },
    { key: 'lost', label: 'Lost', count: reports.filter((r) => r.type === 'lost').length },
    { key: 'found', label: 'Found', count: reports.filter((r) => r.type === 'found').length },
    { key: 'resolved', label: 'Resolved', count: reports.filter((r) => r.item.status === 'resolved').length },
  ];

  const openResolve = (item: LostItem | FoundItem, type: 'lost' | 'found') => {
    setResolveTargetItem(item);
    setResolveTargetType(type);
    setShowResolve(true);
  };

  const handleResolve = async () => {
    if (!resolveTargetItem) return;
    const table = resolveTargetType === 'lost' ? 'lost_items' : 'found_items';
    const { error } = await supabase.from(table).update({ status: 'resolved' }).eq('id', resolveTargetItem.id);
    if (!error) {
      setReports(reports.map((r) =>
        r.id === resolveTargetItem.id ? { ...r, item: { ...r.item, status: 'resolved' } } : r
      ));
    } else {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage your lost and found reports</p>
          </div>
          <div className="flex gap-2">
            <Link to="/report/lost" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
              <PlusCircle className="w-4 h-4" /> Report Lost
            </Link>
            <Link to="/report/found" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
              <PlusCircle className="w-4 h-4" /> Report Found
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-lg p-1 mb-6 w-full sm:w-auto sm:inline-flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label} <span className="text-xs text-slate-400 ml-1">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No reports here yet"
            message={tab === 'all'
              ? "You haven't reported any items yet. Start by reporting a lost or found item."
              : `No ${tab} reports to show.`}
            action={
              <div className="flex gap-2">
                <Link to="/report/lost" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Report Lost
                </Link>
                <Link to="/report/found" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Report Found
                </Link>
              </div>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(({ item, type }) => {
              const isExpired = item.status === 'expired';
              return (
                <div key={`${type}-${item.id}`} className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${isExpired ? 'opacity-70' : ''}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Card */}
                    <div className="lg:col-span-1 max-w-xs">
                      <ItemCard item={item} type={type} />
                    </div>
                    {/* Status + actions */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      {isExpired && (
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <p className="text-xs text-slate-500">This report expired after 30 days without activity.</p>
                        </div>
                      )}
                      <StatusTracker status={item.status} />
                      {item.status === 'active' && (
                        <button
                          onClick={() => openResolve(item, type)}
                          className="mt-3 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ResolveModal
        open={showResolve}
        onClose={() => setShowResolve(false)}
        onConfirm={handleResolve}
        itemName={resolveTargetItem?.item_name || ''}
      />
    </div>
  );
}
