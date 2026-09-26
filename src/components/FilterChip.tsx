import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200 animate-fade-in">
      {label}
      <button onClick={onRemove} className="hover:text-teal-900 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
