import { useState } from 'react';
import { Copy, Check, Hash } from 'lucide-react';

export default function ReferenceCode({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may not be available
    }
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-lg bg-slate-100 text-slate-600 font-mono font-medium hover:bg-slate-200 transition-colors`}
      title="Copy reference code"
    >
      <Hash className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{code}</span>
      {copied ? (
        <Check className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-500`} />
      ) : (
        <Copy className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-400`} />
      )}
      {copied && <span className="text-emerald-500 font-sans">Copied!</span>}
    </button>
  );
}
