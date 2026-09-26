import { useState } from 'react';
import { Mail, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailBanner() {
  const { user, profile, resendVerificationEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!user || !profile || dismissed) return null;

  const emailVerified = user.email_confirmed_at != null;
  if (emailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    const { error } = await resendVerificationEmail();
    setSending(false);
    setMessage(error ? error : 'Verification email sent — check your inbox');
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>
              Please verify your email ({user.email}) to unlock all features.
              {message && <span className="font-medium ml-1">— {message}</span>}
            </span>
            <button
              onClick={handleResend}
              disabled={sending}
              className="ml-2 text-amber-700 font-medium underline hover:text-amber-800 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend'}
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
