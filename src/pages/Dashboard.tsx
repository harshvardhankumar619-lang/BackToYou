import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, PlusCircle, ArrowRight, Clock, TrendingUp, CheckCircle, AlertCircle, ShieldCheck, Award, Users, Lightbulb } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { FeaturesCard } from '@/components/ui/features-card';
import type { DashboardFeature, DashboardMetric, DashboardStat } from '@/components/ui/features-card';
import ItemCard from '@/components/ItemCard';
import SkeletonCard from '@/components/SkeletonCard';
import StatusTracker from '@/components/StatusTracker';
import type { LostItem, FoundItem } from '@/types';
import { daysAgo } from '@/types';

interface ActivityItem {
  id: string;
  type: 'lost' | 'found';
  item_name: string;
  created_at: string;
  status: string;
}

interface RecentItem {
  id: string;
  type: 'lost' | 'found';
  item: LostItem | FoundItem;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ activeLost: 0, activeFound: 0, resolved: 0, myReports: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [myActivity, setMyActivity] = useState<ActivityItem[]>([]);
  const [weekCount, setWeekCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [lostActive, foundActive, lostResolved, foundResolved, myLost, myFound] = await Promise.all([
        supabase.from('lost_items').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('found_items').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('lost_items').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('found_items').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('lost_items').select('id, item_name, created_at, status').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('found_items').select('id, item_name, created_at, status').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      setStats({
        activeLost: lostActive.count || 0,
        activeFound: foundActive.count || 0,
        resolved: (lostResolved.count || 0) + (foundResolved.count || 0),
        myReports: (myLost.data?.length || 0) + (myFound.data?.length || 0),
      });

      const lostActivity: ActivityItem[] = (myLost.data || []).map((item) => ({
        id: item.id, type: 'lost' as const, item_name: item.item_name,
        created_at: item.created_at, status: item.status,
      }));
      const foundActivity: ActivityItem[] = (myFound.data || []).map((item) => ({
        id: item.id, type: 'found' as const, item_name: item.item_name,
        created_at: item.created_at, status: item.status,
      }));
      setMyActivity([...lostActivity, ...foundActivity]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4));

      const [recentLost, recentFound] = await Promise.all([
        supabase.from('lost_items').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
        supabase.from('found_items').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
      ]);
      const lostRecent: RecentItem[] = ((recentLost.data as LostItem[]) || []).map((item) => ({ id: item.id, type: 'lost' as const, item }));
      const foundRecent: RecentItem[] = ((recentFound.data as FoundItem[]) || []).map((item) => ({ id: item.id, type: 'found' as const, item }));
      setRecentItems([...lostRecent, ...foundRecent]
        .sort((a, b) => new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime())
        .slice(0, 6));

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [weekLost, weekFound] = await Promise.all([
        supabase.from('lost_items').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('found_items').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      ]);
      setWeekCount((weekLost.count || 0) + (weekFound.count || 0));

      setLoading(false);
    })();
  }, [user]);

  // Bento grid data
  const features: DashboardFeature[] = [
    { id: 0, title: 'Report Lost', desc: 'Report an item you lost on campus', icon: Search, stat: 'Quick form', to: '/report/lost' },
    { id: 1, title: 'Report Found', desc: 'Report an item you found on campus', icon: Package, stat: 'Help return', to: '/report/found' },
    { id: 2, title: 'Browse Items', desc: 'Search across all lost and found reports', icon: Search, stat: 'Discover', to: '/browse' },
    { id: 3, title: 'My Reports', desc: 'Track and manage your reports', icon: AlertCircle, stat: 'Manage', to: '/my-reports' },
  ];

  const metrics: DashboardMetric[] = [
    { label: 'Active Lost', value: stats.activeLost, trend: 'campus-wide', accent: 'red' },
    { label: 'Active Found', value: stats.activeFound, trend: 'campus-wide', accent: 'emerald' },
    { label: 'Resolved', value: stats.resolved, trend: 'returned', accent: 'blue' },
    { label: 'My Reports', value: stats.myReports, trend: 'total', accent: 'amber' },
  ];

  const bottomStats: DashboardStat[] = [
    { label: 'Active Lost Reports', value: stats.activeLost, icon: Search },
    { label: 'Active Found Reports', value: stats.activeFound, icon: Package },
    { label: 'Items Resolved', value: stats.resolved, icon: CheckCircle },
    { label: 'My Reports', value: stats.myReports, icon: AlertCircle },
  ];

  const recentItemsContent = recentItems.length === 0 ? (
    <p className="text-sm text-slate-400 text-center py-6">No recent reports yet.</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {recentItems.slice(0, 4).map((ri) => (
        <ItemCard key={`${ri.type}-${ri.id}`} item={ri.item} type={ri.type} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Welcome */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-600 to-blue-700 rounded-2xl p-6 sm:p-10 mb-6 animate-slide-up">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Lost something? Found something?
            </h1>
            <p className="text-teal-50 text-base sm:text-lg mb-1">
              Let's get it back to its owner.
            </p>
            <p className="text-teal-100/80 text-sm mb-6">
              BackToYou connects students with lost and found items across campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/report/lost"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-teal-700 font-semibold text-sm shadow-sm hover:bg-teal-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Report Lost Item
              </Link>
              <Link
                to="/report/found"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500/30 text-white font-semibold text-sm border border-teal-300/50 hover:bg-teal-500/40 transition-colors backdrop-blur-sm"
              >
                <Package className="w-4 h-4" />
                Report Found Item
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden sm:flex items-center justify-center opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]">
              <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" />
              <rect x="60" y="70" width="80" height="60" rx="4" fill="none" stroke="white" strokeWidth="2" />
              <path d="M100 50 L130 70 L100 90 L70 70 Z" fill="none" stroke="white" strokeWidth="2" />
              <line x1="100" y1="90" x2="100" y2="130" stroke="white" strokeWidth="2" />
              <line x1="70" y1="100" x2="130" y2="100" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Bento Grid Dashboard */}
        <FeaturesCard
          features={features}
          metrics={metrics}
          stats={bottomStats}
          recentItems={recentItemsContent}
          weekCount={weekCount}
          loading={loading}
        />

        {/* Recently Reported grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <h2 className="text-lg font-semibold text-slate-800">Recently Reported</h2>
            </div>
            <Link to="/browse" className="text-sm text-teal-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-400">No recent reports yet. Be the first to report an item!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recentItems.map((ri) => (
                <ItemCard key={`${ri.type}-${ri.id}`} item={ri.item} type={ri.type} />
              ))}
            </div>
          )}
        </div>

        {/* My Recent Activity */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">My Recent Activity</h2>
            <Link to="/my-reports" className="text-sm text-teal-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="px-6 py-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 mb-3">No activity yet. Start by reporting an item!</p>
              <div className="flex gap-2">
                <Link to="/report/lost" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors">
                  <PlusCircle className="w-3.5 h-3.5" /> Report Lost
                </Link>
                <Link to="/report/found" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
                  <PlusCircle className="w-3.5 h-3.5" /> Report Found
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {myActivity.map((activity) => (
                <Link
                  key={`${activity.type}-${activity.id}`}
                  to={`/item/${activity.type}/${activity.id}`}
                  className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'lost' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      {activity.type === 'lost' ? <Search className="w-4 h-4 text-red-500" /> : <Package className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{activity.item_name}</p>
                      <p className="text-xs text-slate-400">{activity.type === 'lost' ? 'Reported as lost' : 'Reported as found'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {daysAgo(activity.created_at)}
                    </div>
                  </div>
                  <div className="ml-9">
                    <StatusTracker status={activity.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
