import { CheckCircle, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import type { ItemStatus } from '@/types';

const STAGES = [
  { key: 'reported', label: 'Reported', icon: CheckCircle },
  { key: 'active', label: 'Active', icon: Clock },
  { key: 'matched', label: 'Matched', icon: PackageCheck },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle },
];

const EXPIRED_STAGES = [
  { key: 'reported', label: 'Reported', icon: CheckCircle },
  { key: 'active', label: 'Active', icon: Clock },
  { key: 'expired', label: 'Expired', icon: AlertCircle },
];

function getStageIndex(status: string): number {
  switch (status) {
    case 'active': return 1;
    case 'matched': return 2;
    case 'resolved': return 3;
    case 'expired': return 2;
    default: return 0;
  }
}

export default function StatusTracker({ status }: { status: string }) {
  const isExpired = status === 'expired';
  const stages = isExpired ? EXPIRED_STAGES : STAGES;
  const currentIndex = getStageIndex(status);

  return (
    <div className="flex items-center w-full">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent && !isExpired
                    ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                    : isCurrent && isExpired
                    ? 'bg-slate-300 text-slate-500'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-xs font-medium ${
                  isDone ? 'text-emerald-600' : isCurrent && !isExpired ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 mb-5 transition-all ${
                  i < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
    active: { label: 'Active', icon: Clock, className: 'bg-amber-100 text-amber-700' },
    matched: { label: 'Matched', icon: PackageCheck, className: 'bg-blue-100 text-blue-700' },
    resolved: { label: 'Resolved', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700' },
    expired: { label: 'Expired', icon: AlertCircle, className: 'bg-slate-100 text-slate-500' },
  };
  const c = config[status] || config.active;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.className}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export type { ItemStatus };
