'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface DockItem {
  id: string;
  name: string;
  icon: LucideIcon;
  iconColor?: string;
}

interface MacOSDockProps {
  items: DockItem[];
  activeId?: string | null;
  onItemClick: (id: string) => void;
  className?: string;
}

const MacOSDock: React.FC<MacOSDockProps> = ({
  items,
  activeId,
  onItemClick,
  className = '',
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [scales, setScales] = useState<number[]>(items.map(() => 1));
  const [positions, setPositions] = useState<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastMoveTime = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    const handler = () => { prefersReducedMotion.current = mq.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const getResponsiveConfig = useCallback(() => {
    if (typeof window === 'undefined') return { baseIconSize: 52, maxScale: 1.5, effectWidth: 200 };
    const w = window.innerWidth;
    if (w < 480) return { baseIconSize: 44, maxScale: 1.25, effectWidth: 140 };
    if (w < 768) return { baseIconSize: 48, maxScale: 1.35, effectWidth: 170 };
    if (w < 1024) return { baseIconSize: 52, maxScale: 1.5, effectWidth: 200 };
    return { baseIconSize: 56, maxScale: 1.6, effectWidth: 240 };
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig);
  const { baseIconSize, maxScale, effectWidth } = config;
  const minScale = 1.0;
  const baseSpacing = Math.max(4, baseIconSize * 0.08);

  useEffect(() => {
    const handleResize = () => setConfig(getResponsiveConfig());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getResponsiveConfig]);

  const calculateTargetScales = useCallback((mousePosition: number | null) => {
    if (mousePosition === null || prefersReducedMotion.current) return items.map(() => minScale);
    return items.map((_, index) => {
      const normalCenter = index * (baseIconSize + baseSpacing) + baseIconSize / 2;
      const minX = mousePosition - effectWidth / 2;
      const maxX = mousePosition + effectWidth / 2;
      if (normalCenter < minX || normalCenter > maxX) return minScale;
      const theta = ((normalCenter - minX) / effectWidth) * 2 * Math.PI;
      const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
      const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;
      return minScale + scaleFactor * (maxScale - minScale);
    });
  }, [items, baseIconSize, baseSpacing, effectWidth, maxScale]);

  const calculatePositions = useCallback((currentScales: number[]) => {
    let currentX = 0;
    return currentScales.map((scale) => {
      const scaledWidth = baseIconSize * scale;
      const centerX = currentX + scaledWidth / 2;
      currentX += scaledWidth + baseSpacing;
      return centerX;
    });
  }, [baseIconSize, baseSpacing]);

  useEffect(() => {
    const initialScales = items.map(() => minScale);
    setScales(initialScales);
    setPositions(calculatePositions(initialScales));
  }, [items, calculatePositions, config]);

  const animateToTarget = useCallback(() => {
    const targetScales = calculateTargetScales(mouseX);
    const targetPositions = calculatePositions(targetScales);
    const lerpFactor = mouseX !== null ? 0.2 : 0.12;

    let nextScales: number[] = [];
    let nextPositions: number[] = [];

    setScales(prev => {
      nextScales = prev.map((s, i) => s + (targetScales[i] - s) * lerpFactor);
      return nextScales;
    });
    setPositions(prev => {
      nextPositions = prev.map((p, i) => p + (targetPositions[i] - p) * lerpFactor);
      return nextPositions;
    });

    // Use a microtask to read the updated state values for the convergence check
    Promise.resolve().then(() => {
      const scalesConverged = nextScales.length > 0 && nextScales.every((s, i) => Math.abs(s - targetScales[i]) <= 0.002);
      const positionsConverged = nextPositions.length > 0 && nextPositions.every((p, i) => Math.abs(p - targetPositions[i]) <= 0.1);
      if (!scalesConverged || !positionsConverged || mouseX !== null) {
        animationRef.current = requestAnimationFrame(animateToTarget);
      }
    });
  }, [mouseX, calculateTargetScales, calculatePositions]);

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateToTarget);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [animateToTarget]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = performance.now();
    if (now - lastMoveTime.current < 16) return;
    lastMoveTime.current = now;
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      const padding = Math.max(8, baseIconSize * 0.12);
      setMouseX(e.clientX - rect.left - padding);
    }
  }, [baseIconSize]);

  // Touch devices: no hover magnification
  const handleTouchStart = useCallback(() => {
    setMouseX(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setHoveredIndex(null);
  }, []);

  const handleClick = (id: string, index: number) => {
    onItemClick(id);
  };

  const contentWidth = positions.length > 0
    ? Math.max(...positions.map((pos, i) => pos + (baseIconSize * scales[i]) / 2))
    : items.length * (baseIconSize + baseSpacing) - baseSpacing;

  const padding = Math.max(8, baseIconSize * 0.12);

  return (
    <div
      ref={dockRef}
      className={`backdrop-blur-xl ${className}`}
      style={{
        width: `${contentWidth + padding * 2}px`,
        background: 'rgba(255, 255, 255, 0.72)',
        borderRadius: `${Math.max(12, baseIconSize * 0.4)}px`,
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        padding: `${padding}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <div className="relative" style={{ height: `${baseIconSize}px`, width: '100%' }}>
        {items.map((item, index) => {
          const scale = scales[index] || 1;
          const position = positions[index] || 0;
          const scaledSize = baseIconSize * scale;
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.id}
              className="absolute flex flex-col items-center justify-end"
              style={{
                left: `${position - scaledSize / 2}px`,
                bottom: '0px',
                width: `${scaledSize}px`,
                height: `${scaledSize}px`,
                transformOrigin: 'bottom center',
                zIndex: Math.round(scale * 10),
              }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-medium whitespace-nowrap pointer-events-none animate-fade-in"
                  style={{ zIndex: 100 }}
                >
                  {item.name}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleClick(item.id, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={item.name}
                title={item.name}
                className="flex items-center justify-center rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                style={{
                  width: `${scaledSize}px`,
                  height: `${scaledSize}px`,
                  background: isActive ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
                }}
              >
                <Icon
                  className="transition-colors"
                  style={{
                    width: `${scaledSize * 0.55}px`,
                    height: `${scaledSize * 0.55}px`,
                    color: isActive ? (item.iconColor || '#0d9488') : '#475569',
                  }}
                  strokeWidth={2}
                />
              </button>

              {/* Active indicator dot */}
              {isActive && (
                <div
                  className="absolute"
                  style={{
                    bottom: `${Math.max(-4, -baseIconSize * 0.06)}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${Math.max(4, baseIconSize * 0.06)}px`,
                    height: `${Math.max(4, baseIconSize * 0.06)}px`,
                    borderRadius: '50%',
                    backgroundColor: '#0d9488',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MacOSDock;
