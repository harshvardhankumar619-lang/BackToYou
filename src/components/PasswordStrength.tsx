import { getPasswordStrength } from '@/lib/authUtils';

export default function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strength.barColor}`}
            style={{ width: `${(strength.score / 3) * 100}%` }}
          />
        </div>
        {strength.score > 0 && (
          <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
        )}
      </div>
      <p className="text-xs text-slate-400">
        Use 8+ characters with uppercase, lowercase, and a number
      </p>
    </div>
  );
}
