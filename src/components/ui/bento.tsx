import type React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Search, Package, Handshake, Users, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BentoCardProps {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ('top' | 'bottom')[];
}

export function BentoCard({
  dark = false,
  className,
  eyebrow,
  title,
  description,
  graphic,
  fade = ['bottom'],
}: BentoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl border',
        dark
          ? 'border-white/10 bg-slate-900/80'
          : 'border-slate-200 bg-white',
        className
      )}
    >
      {/* Graphic layer */}
      {graphic && (
        <div className="absolute inset-0 z-0">
          {graphic}
          {fade.includes('top') && (
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
          )}
          {fade.includes('bottom') && (
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          )}
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6">
        <p
          className={clsx(
            'mb-2 text-xs font-semibold uppercase tracking-wider',
            dark ? 'text-cyan-400' : 'text-teal-600'
          )}
        >
          {eyebrow}
        </p>
        <h3
          className={clsx(
            'mb-2 text-lg font-bold tracking-tight',
            dark ? 'text-white' : 'text-slate-800'
          )}
        >
          {title}
        </h3>
        <p
          className={clsx(
            'text-sm leading-relaxed',
            dark ? 'text-slate-300' : 'text-slate-500'
          )}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

interface FeatureCardData {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  colSpan: string;
  rowSpan: string;
  minHeight: string;
}

const features: FeatureCardData[] = [
  {
    eyebrow: 'Report',
    title: 'Report a lost item',
    description:
      'Add important details and an image so others can recognize and help return your belongings.',
    icon: Search,
    colSpan: 'md:col-span-2',
    rowSpan: 'md:row-span-2',
    minHeight: 'min-h-[280px] md:min-h-[420px]',
  },
  {
    eyebrow: 'Discover',
    title: 'Browse found items',
    description:
      'Explore reported found belongings and look for items that match what you have lost.',
    icon: Package,
    colSpan: 'md:col-span-2',
    rowSpan: '',
    minHeight: 'min-h-[200px]',
  },
  {
    eyebrow: 'Match',
    title: 'Find meaningful matches',
    description:
      'Use item details, categories, locations, and images to narrow down potential matches.',
    icon: MapPin,
    colSpan: 'md:col-span-2',
    rowSpan: '',
    minHeight: 'min-h-[200px]',
  },
  {
    eyebrow: 'Connect',
    title: 'Reconnect with your belongings',
    description:
      'When a potential match is found, use the platform to help connect the right people.',
    icon: Handshake,
    colSpan: 'md:col-span-3',
    rowSpan: '',
    minHeight: 'min-h-[200px]',
  },
  {
    eyebrow: 'Community',
    title: 'Help someone get it back',
    description:
      'A found item reported by one person can become the missing piece someone else is looking for.',
    icon: Users,
    colSpan: 'md:col-span-3',
    rowSpan: '',
    minHeight: 'min-h-[200px]',
  },
];

export function FUIBentoGridDark() {
  return (
    <section className="relative bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            BackToYou
          </p>
          <h2 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Helping lost belongings find their way back home.
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            A simple platform to report, discover, and reconnect people with their lost belongings.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(0,auto)]">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <BentoCard
                key={idx}
                dark
                className={clsx(feature.colSpan, feature.rowSpan, feature.minHeight)}
                eyebrow={feature.eyebrow}
                title={feature.title}
                description={feature.description}
                graphic={
                  <div className="flex h-full w-full items-center justify-center opacity-10">
                    <Icon className="h-32 w-32 text-cyan-400" strokeWidth={1.2} />
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FUIBentoGridDark;
