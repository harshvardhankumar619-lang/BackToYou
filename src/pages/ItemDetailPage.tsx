import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, Package, Tag, MapPin, Calendar, FileText, ArrowLeft, Loader2,
  ShieldCheck, Award, CheckCircle, Lightbulb, ChevronLeft, ChevronRight,
  AlertCircle, ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { daysAgo } from '@/types';
import type { LostItem, FoundItem, Profile } from '@/types';
import Avatar from '@/components/Avatar';
import StatusTracker, { StatusBadge } from '@/components/StatusTracker';
import ItemCard from '@/components/ItemCard';
import ReferenceCode from '@/components/ReferenceCode';
import ResolveModal from '@/components/ResolveModal';
import ContactReporterModal from '@/components/ContactReporterModal';
import ErrorState from '@/components/ErrorState';

export default function ItemDetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLost = type === 'lost';
  const table = isLost ? 'lost_items' : 'found_items';

  const [item, setItem] = useState<LostItem | FoundItem | null>(null);
  const [reporter, setReporter] = useState<Profile | null>(null);
  const [reporterItemCount, setReporterItemCount] = useState(0);
  const [related, setRelated] = useState<(LostItem | FoundItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(false);
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        setError(true);
        setLoading(false);
        return;
      }
      const itemData = data as LostItem | FoundItem;
      setItem(itemData);

      // Fetch reporter profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', itemData.user_id).maybeSingle();
      setReporter(profileData as Profile | null);

      // Fetch reporter's total item count for contributor tag
      const [lostCount, foundCount] = await Promise.all([
        supabase.from('lost_items').select('id', { count: 'exact', head: true }).eq('user_id', itemData.user_id),
        supabase.from('found_items').select('id', { count: 'exact', head: true }).eq('user_id', itemData.user_id),
      ]);
      setReporterItemCount((lostCount.count || 0) + (foundCount.count || 0));

      // Fetch related items (opposite type, same category)
      const relatedTable = isLost ? 'found_items' : 'lost_items';
      const { data: relatedData } = await supabase
        .from(relatedTable)
        .select('*')
        .eq('category', itemData.category)
        .neq('user_id', user?.id || '')
        .limit(3)
        .order('created_at', { ascending: false });
      setRelated((relatedData as (LostItem | FoundItem)[]) || []);

      setLoading(false);
    })();
  }, [id, table, isLost, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Item not found</h2>
          <p className="text-sm text-slate-400 mb-4">This item could not be found or may have been removed.</p>
          <Link to="/browse" className="text-teal-600 font-medium hover:underline">Back to Browse</Link>
        </div>
      </div>
    );
  }

  const date = isLost ? (item as LostItem).date_lost : (item as FoundItem).date_found;
  const location = isLost ? (item as LostItem).location_lost : (item as FoundItem).location_found;
  const images = item.image_urls?.length > 0 ? item.image_urls : (item.image_url ? [item.image_url] : []);
  const isOwner = user?.id === item.user_id;
  const isContributor = reporterItemCount >= 3;
  const isExpired = item.status === 'expired';

  const handleResolve = async () => {
    const { error } = await supabase.from(table).update({ status: 'resolved' }).eq('id', item.id);
    if (!error) {
      setItem({ ...item, status: 'resolved' });
    } else {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Expired notice */}
        {isExpired && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="text-sm text-slate-500">This report expired after 30 days without activity.</p>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 ${isExpired ? 'opacity-80' : ''}`}>
          {/* LEFT: Image gallery */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {images.length > 0 ? (
                <>
                  <div className="relative h-64 sm:h-80 lg:h-96 bg-slate-100">
                    <img src={images[activeImage]} alt={item.item_name} className="w-full h-full object-cover" />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setActiveImage((activeImage + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                        <span className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                          {activeImage + 1} / {images.length}
                        </span>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {images.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === activeImage ? 'border-teal-500' : 'border-transparent'}`}
                        >
                          <img src={url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-48 lg:h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {isLost ? <Search className="w-16 h-16 text-slate-300" /> : <Package className="w-16 h-16 text-slate-300" />}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Item info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isLost ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {isLost ? 'Lost' : 'Found'}
                </span>
                <StatusBadge status={item.status} />
                {item.reference_code && <ReferenceCode code={item.reference_code} size="sm" />}
              </div>

              <h1 className="text-xl font-bold text-slate-800 mb-4">{item.item_name}</h1>

              {/* Status tracker */}
              <div className="mb-5">
                <StatusTracker status={item.status} />
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-700">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">{isLost ? 'Lost:' : 'Found:'}</span>
                  <span className="font-medium text-slate-700">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-700">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Reported:</span>
                  <span className="font-medium text-slate-700">{daysAgo(item.created_at)}</span>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              )}

              {/* Found-only: holder note */}
              {!isLost && (item as FoundItem).current_holder_note && (
                <div className="mt-4 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <h3 className="text-xs font-semibold text-slate-600 mb-1">Currently kept at:</h3>
                  <p className="text-sm text-slate-600">{(item as FoundItem).current_holder_note}</p>
                </div>
              )}
            </div>

            {/* Reporter card */}
            {reporter && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Reported by</h3>
                <div className="flex items-center gap-3">
                  <Avatar name={reporter.name} avatarUrl={reporter.avatar_url} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{reporter.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {reporter.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {isContributor && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <Award className="w-3 h-3" /> Contributor
                        </span>
                      )}
                      <span className="text-xs text-slate-400">Trust: {reporter.trust_score}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {!isOwner && item.status === 'active' && (
                <button
                  onClick={() => setShowContact(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  {isLost ? 'I think this is mine' : 'I think I found this'}
                </button>
              )}
              {isOwner && item.status === 'active' && (
                <button
                  onClick={() => setShowResolve(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </button>
              )}
              <Link
                to="/browse"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Back to Browse
              </Link>
            </div>
          </div>
        </div>

        {/* Related items */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-800">You might also want to check</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Basic category suggestion — smarter matching is coming later.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((relItem) => (
                <ItemCard key={relItem.id} item={relItem} type={isLost ? 'found' : 'lost'} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ResolveModal
        open={showResolve}
        onClose={() => setShowResolve(false)}
        onConfirm={handleResolve}
        itemName={item.item_name}
      />
      <ContactReporterModal
        open={showContact}
        onClose={() => setShowContact(false)}
        reporter={reporter}
        item={item}
        isLost={isLost}
      />
    </div>
  );
}
