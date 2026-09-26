import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  accent: 'red' | 'emerald' | 'blue' | 'amber';
  loading?: boolean;
  to?: string;
}

const accentMap = {
  red: { bg: 'bg-red-50', text: 'text-red-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-500' },
};

export default function StatCard({ icon: Icon, value, label, accent, loading, to }: StatCardProps) {
  const colors = accentMap[accent];
  const content = (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      )}
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );

  if (to) {
    return <a href={to} className="block">{content}</a>;
  }
  return content;
}
