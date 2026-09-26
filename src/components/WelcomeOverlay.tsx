import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BackToYouIcon } from '@/components/Logo';

interface WelcomeOverlayProps {
  name: string;
  initials: string;
  onDone: () => void;
}

export default function WelcomeOverlay({ name, initials, onDone }: WelcomeOverlayProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="text-center px-6">
        {/* Logo pulse */}
        <div
          className={`w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-500 ${
            phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <BackToYouIcon size={48} />
        </div>

        {/* Avatar with initials */}
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
            phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <span className="text-lg font-bold text-teal-700">{initials}</span>
        </div>

        {/* Welcome text */}
        <h1
          className={`text-2xl font-bold text-white mb-2 transition-all duration-500 ${
            phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          Welcome to BackToYou
        </h1>
        <p
          className={`text-slate-400 mb-2 transition-all duration-500 delay-200 ${
            phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {name ? `Hi ${name.split(' ')[0]}!` : ''} Let's help you get your stuff back.
        </p>

        {/* Loading bar */}
        <div className="w-32 h-1 rounded-full bg-slate-700 overflow-hidden mx-auto mt-6">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-2000 ease-out"
            style={{ width: phase >= 2 ? '100%' : '30%' }}
          />
        </div>

        <p
          className={`text-xs text-slate-500 mt-4 transition-opacity duration-500 ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Taking you to your dashboard...
          <ArrowRight className="w-3 h-3 inline ml-1" />
        </p>
      </div>
    </div>
  );
}
