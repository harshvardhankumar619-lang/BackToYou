import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, IdCard, Phone, Edit2, Save, X, Search, Package, Loader2, ShieldCheck, Calendar, Award, TrendingUp, Camera, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Avatar from '@/components/Avatar';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/EmptyState';
import StatusTracker from '@/components/StatusTracker';
import type { LostItem, FoundItem } from '@/types';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [studentId, setStudentId] = useState(profile?.student_id || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setStudentId(profile.student_id || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [lostRes, foundRes] = await Promise.all([
        supabase.from('lost_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('found_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setLostItems((lostRes.data as LostItem[]) || []);
      setFoundItems((foundRes.data as FoundItem[]) || []);
      setLoadingItems(false);
    })();
  }, [user]);

  const totalItems = lostItems.length + foundItems.length;
  const isContributor = totalItems >= 3;
  const isVerified = user?.email_confirmed_at != null;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name, student_id: studentId || null, phone: phone || null, avatar_url: avatarUrl || null })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      console.error('Update error:', error.message);
    } else {
      await refreshProfile();
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name || '');
    setStudentId(profile?.student_id || '');
    setPhone(profile?.phone || '');
    setAvatarUrl(profile?.avatar_url || '');
    setEditing(false);
  };

  const handleResolve = async (item: LostItem | FoundItem, type: 'lost' | 'found') => {
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const { error } = await supabase.from(table).update({ status: 'resolved' }).eq('id', item.id);
    if (!error) {
      if (type === 'lost') {
        setLostItems(lostItems.map((i) => i.id === item.id ? { ...i, status: 'resolved' } : i));
      } else {
        setFoundItems(foundItems.map((i) => i.id === item.id ? { ...i, status: 'resolved' } : i));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="h-24 bg-gradient-to-r from-teal-500 to-blue-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <Avatar name={profile?.name || 'U'} avatarUrl={profile?.avatar_url} size="lg" />
                  {editing && (
                    <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm hover:bg-teal-700 transition-colors" title="Avatar upload coming soon">
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="mb-1">
                  <h2 className="text-lg font-bold text-slate-800">{profile?.name || '—'}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-xs font-medium text-emerald-600">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {isContributor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-xs font-medium text-amber-600">
                        <Award className="w-3 h-3" /> Campus Contributor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-all disabled:opacity-60">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                  </button>
                  <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Name</label>
                {editing ? (
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                ) : (
                  <p className="text-sm font-medium text-slate-700">{profile?.name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email</label>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />{user?.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Student ID</label>
                {editing ? (
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                ) : (
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" />{profile?.student_id || '—'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Phone</label>
                {editing ? (
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                ) : (
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />{profile?.phone || '—'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Joined</label>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Verification</label>
                <p className="text-sm font-medium flex items-center gap-2">
                  {isVerified ? (
                    <span className="text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Email Verified</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Pending Verification</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Trust Score</label>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.trust_score != null ? String(profile.trust_score) : '—'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Account Activity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-1.5">
                    <Search className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xl font-bold text-slate-800">{lostItems.length}</p>
                  <p className="text-xs text-slate-400">Lost Reports</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-1.5">
                    <Package className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-slate-800">{foundItems.length}</p>
                  <p className="text-xs text-slate-400">Found Reports</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-1.5">
                    <Award className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold text-slate-800">{totalItems}</p>
                  <p className="text-xs text-slate-400">Total Reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My reported items */}
        <div className="space-y-6">
          {/* Lost items */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Search className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">My Lost Reports</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500">{lostItems.length}</span>
            </div>
            {loadingItems ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
            ) : lostItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200">
                <EmptyState title="No lost items reported" message="You haven't reported any lost items yet." action={<Link to="/report/lost" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">Report Lost Item</Link>} />
              </div>
            ) : (
              <div className="space-y-4">
                {lostItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-start gap-4">
                      <ItemCard item={item} type="lost" />
                      <div className="flex-1 hidden sm:block">
                        <StatusTracker status={item.status} />
                        {item.status === 'active' && (
                          <button
                            onClick={() => handleResolve(item, 'lost')}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="sm:hidden mt-3">
                      <StatusTracker status={item.status} />
                      {item.status === 'active' && (
                        <button
                          onClick={() => handleResolve(item, 'lost')}
                          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Found items */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">My Found Reports</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500">{foundItems.length}</span>
            </div>
            {loadingItems ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
            ) : foundItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200">
                <EmptyState title="No found items reported" message="You haven't reported any found items yet." action={<Link to="/report/found" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">Report Found Item</Link>} />
              </div>
            ) : (
              <div className="space-y-4">
                {foundItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-start gap-4">
                      <ItemCard item={item} type="found" />
                      <div className="flex-1 hidden sm:block">
                        <StatusTracker status={item.status} />
                        {item.status === 'active' && (
                          <button
                            onClick={() => handleResolve(item, 'found')}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="sm:hidden mt-3">
                      <StatusTracker status={item.status} />
                      {item.status === 'active' && (
                        <button
                          onClick={() => handleResolve(item, 'found')}
                          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
