import { useState } from 'react';
import { X, MessageSquare, Send, Phone, AlertCircle, Loader2, Info } from 'lucide-react';
import type { Profile, LostItem, FoundItem } from '@/types';
import Avatar from '@/components/Avatar';

interface ContactReporterModalProps {
  open: boolean;
  onClose: () => void;
  reporter: Profile | null;
  item: LostItem | FoundItem | null;
  isLost: boolean;
}

export default function ContactReporterModal({ open, onClose, reporter, item, isLost }: ContactReporterModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const showPhone = isLost && (item as LostItem)?.contact_preference === 'show_phone' && reporter?.phone;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    // Placeholder: no backend messaging yet. Simulate async for UX.
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
              <Send className="w-7 h-7 text-teal-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Message ready</h2>
            <p className="text-sm text-slate-500">
              This is a placeholder — full messaging arrives in a later phase. No message was actually delivered.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-bold text-slate-800">Contact Reporter</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reporter preview */}
            {reporter && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-4">
                <Avatar name={reporter.name} avatarUrl={reporter.avatar_url} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{reporter.name}</p>
                  <p className="text-xs text-slate-400">Trust Score: {reporter.trust_score}</p>
                </div>
              </div>
            )}

            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-4">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                This is a temporary contact flow. Full claim verification will be introduced in a later phase.
              </p>
            </div>

            {/* Phone (if permitted) */}
            {showPhone && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-4">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{reporter!.phone}</span>
              </div>
            )}

            {/* Message textarea */}
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
              placeholder={`Hi, I think this ${isLost ? 'is my lost item' : 'item belongs to me'}. Here's why...`}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
