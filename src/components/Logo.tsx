interface LogoProps {
  size?: number;
  className?: string;
}

export function BackToYouIcon({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bty-grad" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Location pin */}
      <path
        d="M24 4C16.27 4 10 10.27 10 18c0 9.5 10.5 20 14 26 3.5-6 14-16.5 14-26 0-7.73-6.27-14-14-14z"
        fill="url(#bty-grad)"
      />
      {/* Inner circle */}
      <circle cx="24" cy="18" r="6" fill="white" fillOpacity="0.9" />
      <circle cx="24" cy="18" r="3" fill="#2563eb" />
      {/* Network nodes */}
      <circle cx="8" cy="34" r="3" fill="#06b6d4" />
      <circle cx="40" cy="34" r="3" fill="#14b8a6" />
      <circle cx="24" cy="44" r="2.5" fill="#2563eb" />
      {/* Connection lines */}
      <line x1="24" y1="30" x2="8" y2="34" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="30" x2="40" y2="34" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="8" y1="34" x2="24" y2="44" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="40" y1="34" x2="24" y2="44" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function BackToYouLogo({ size = 36, showText = true, className = '' }: LogoProps & { showText?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BackToYouIcon size={size} />
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-slate-800" style={{ fontWeight: 600 }}>
          <span className="text-slate-900">Back</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">ToYou</span>
        </span>
      )}
    </span>
  );
}

export default BackToYouLogo;
