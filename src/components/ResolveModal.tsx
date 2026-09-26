import { useState } from 'react';
import { CheckCircle, Loader2, X, AlertCircle } from 'lucide-react';

interface ResolveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
}

export default function ResolveModal({ open, onClose, onConfirm, itemName }: ResolveModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    await onConfirm();
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Report marked as resolved</h2>
            <p className="text-sm text-slate-500">Thank you for helping keep campus organized.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800">Mark as Resolved?</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-1">
              You're about to mark this report as resolved:
            </p>
            <p className="text-sm font-medium text-slate-700 mb-4 bg-slate-50 rounded-lg px-3 py-2">{itemName}</p>
            <p className="text-xs text-slate-400 mb-6">
              Only do this if the item has been successfully returned or you no longer need the report.
            </p>
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark Resolved
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
