import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Tag, MapPin, Calendar, FileText, Camera, X, AlertCircle, Loader2, CheckCircle, Heart, Phone, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, HOLDER_OPTIONS } from '@/types';

interface ReportItemPageProps {
  type: 'lost' | 'found';
}

export default function ReportItemPage({ type }: ReportItemPageProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isLost = type === 'lost';

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [contactPref, setContactPref] = useState('in_app');
  const [holderNote, setHolderNote] = useState('');
  const [goodFaith, setGoodFaith] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ refCode: string } | null>(null);

  const table = isLost ? 'lost_items' : 'found_items';
  const dateLabel = isLost ? 'Date Lost' : 'Date Found';
  const locationLabel = isLost ? 'Location Lost' : 'Location Found';

  const showCustomLocation = location === 'Other (specify)';
  const showCustomHolder = holderNote === 'Other (specify)';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    if (imageUrls.length >= 3) return;

    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files).slice(0, 3 - imageUrls.length)) {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(fileName, file);
      if (error) {
        console.error('Upload error:', error.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(data.path);
      newUrls.push(urlData.publicUrl);
    }
    setImageUrls([...imageUrls, ...newUrls]);
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!location) {
      setError('Please select a location');
      return;
    }
    if (!date) {
      setError(`Please select the ${isLost ? 'date lost' : 'date found'}`);
      return;
    }
    if (!isLost && !goodFaith) {
      setError('Please confirm the good faith declaration');
      return;
    }

    const finalLocation = showCustomLocation ? customLocation : location;
    if (!finalLocation) {
      setError('Please specify the location');
      return;
    }

    setSubmitting(true);

    const baseData: Record<string, unknown> = {
      user_id: user!.id,
      item_name: itemName,
      category,
      description,
      image_urls: imageUrls,
      image_url: imageUrls[0] || null,
      status: 'active',
    };

    if (isLost) {
      baseData.date_lost = date;
      baseData.location_lost = finalLocation;
      baseData.contact_preference = contactPref;
    } else {
      baseData.date_found = date;
      baseData.location_found = finalLocation;
      baseData.current_holder_note = showCustomHolder ? customLocation : holderNote;
      baseData.good_faith_confirmed = goodFaith;
    }

    const { data, error: insertError } = await supabase
      .from(table)
      .insert(baseData)
      .select('reference_code')
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess({ refCode: (data as { reference_code: string }).reference_code });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Your report is live.</h1>
          <p className="text-sm text-slate-500 mb-5">Help us get it back to its owner.</p>

          <div className="bg-slate-50 rounded-lg py-3 px-4 mb-2">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Reference</p>
            <p className="text-2xl font-bold text-teal-600 tracking-wider font-mono">{success.refCode}</p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg mb-6 text-left">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Save this code — you'll need it to track your report.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/item/${type}/${success.refCode}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
            >
              View Report <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/my-reports')}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Go to My Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = isLost ? 'Report a Lost Item' : 'Report a Found Item';
  const subtitle = isLost
    ? 'Tell us what you lost so others can help you find it'
    : 'Report an item you found to help return it to its owner';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLost ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {isLost ? <Search className="w-5 h-5 text-red-500" /> : <Package className="w-5 h-5 text-emerald-500" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Item name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="e.g. Black Dell laptop charger"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a category</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Description <span className="text-slate-400 font-normal">(min 20 characters)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                minLength={20}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
                placeholder="Describe the item in detail — color, brand, distinguishing features, etc."
                maxLength={500}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{description.length} / 500 characters (min 20)</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">{dateLabel}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>
          </div>

          {/* Location picker */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              {locationLabel} <span className="text-slate-400 font-normal">— select campus zone</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a location</option>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {showCustomLocation && (
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Specify the location"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
              />
            )}
          </div>

          {/* Found-only: current holder */}
          {!isLost && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Where is the item currently kept?
              </label>
              <select
                value={holderNote}
                onChange={(e) => setHolderNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">Select where it's kept</option>
                {HOLDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {showCustomHolder && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Specify where it's kept"
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              )}
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Photos <span className="text-slate-400 font-normal">(up to 3)</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imageUrls.length < 3 && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-1">Add</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Contact preference (lost only) */}
          {isLost && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Contact Preference</label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${contactPref === 'in_app' ? 'border-teal-400 bg-teal-50' : 'border-slate-200'}`}>
                  <input type="radio" name="contactPref" value="in_app" checked={contactPref === 'in_app'} onChange={(e) => setContactPref(e.target.value)} className="hidden" />
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">In-app only</span>
                </label>
                <label className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${contactPref === 'show_phone' ? 'border-teal-400 bg-teal-50' : 'border-slate-200'}`}>
                  <input type="radio" name="contactPref" value="show_phone" checked={contactPref === 'show_phone'} onChange={(e) => setContactPref(e.target.value)} className="hidden" />
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Show phone</span>
                </label>
              </div>
            </div>
          )}

          {/* Good faith (found only) */}
          {!isLost && (
            <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={goodFaith}
                  onChange={(e) => setGoodFaith(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Good Faith Declaration</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    I found this item and am reporting it in good faith to help return it to its owner.
                    Successful returns contribute to your trust score.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm shadow-sm hover:bg-teal-700 disabled:opacity-60 transition-all"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <>{isLost ? 'Submit Lost Report' : 'Submit Found Report'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
