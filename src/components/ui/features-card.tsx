'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Package,
  CheckCircle,
  TrendingUp,
  Users,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  Clock,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardFeature {
  id: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  stat: string | number;
  to: string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  trend: string;
  accent: 'teal' | 'emerald' | 'red' | 'blue' | 'amber';
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

interface FeaturesCardProps {
  features: DashboardFeature[];
  metrics: DashboardMetric[];
  stats: DashboardStat[];
  recentItems: React.ReactNode;
  weekCount: number;
  loading: boolean;
}

const accentMap: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-500',
  blue: 'bg-blue-50 text-blue-500',
  amber: 'bg-amber-50 text-amber-600',
};

export function FeaturesCard({
  features,
  metrics,
  stats,
  recentItems,
  weekCount,
  loading,
}: FeaturesCardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState(0);
  const activeFeature = features[activeTab] || features[0];

  return (
    <section className="w-full py-6 px-0 text-slate-800 antialiased">
      <div className="flex flex-col gap-4">
        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[260px]">
          {/* Large Hero Card - Interactive Features */}
          <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                <Lightbulb className="w-3.5 h-3.5 text-teal-500" />
                Quick Actions
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1 text-slate-800">BackToYou</h3>
              <p className="text-sm text-slate-500">Tap a card to explore what you can do</p>
            </div>

            {/* Feature Selector Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isActive = activeTab === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className={cn(
                      'group/card relative overflow-hidden rounded-xl p-4 border transition-all duration-300 flex flex-col text-left',
                      isActive
                        ? 'bg-teal-50 border-teal-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mb-2 transition-colors',
                        isActive ? 'text-teal-600' : 'text-slate-400'
                      )}
                    />
                    <span className="text-xs font-bold text-slate-800">{feature.title}</span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{feature.stat}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Area */}
            <div className="relative z-10 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-mono text-slate-400 mb-1">Selected:</p>
              <p className="text-lg font-bold text-slate-800">{activeFeature?.title}</p>
              <p className="text-xs text-slate-500 mt-1">{activeFeature?.desc}</p>
              <a
                href={activeFeature?.to}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Go <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Metrics Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md">
            <div className="relative z-10 flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-semibold">
                  Live
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex-shrink-0">Overview</h3>
              <p className="text-xs text-slate-400 mb-3 flex-shrink-0">Real-time campus stats</p>

              <div className="space-y-2 overflow-y-auto flex-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
                {metrics.map((metric, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMetric(idx)}
                    className={cn(
                      'w-full text-left p-2 rounded-lg transition-all duration-200 border',
                      selectedMetric === idx
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    )}
                  >
                    <p className="text-[10px] text-slate-400">{metric.label}</p>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-sm font-bold text-slate-800">
                        {loading ? '...' : metric.value}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{metric.trend}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trust / Profile Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md">
            <div className="relative z-10">
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg w-fit mb-3">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Trust &amp; Safety</h3>
              <p className="text-xs text-slate-400 mb-4">Your community standing</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Award className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[10px] text-slate-400">Trust Score</p>
                    <p className="text-sm font-bold text-slate-800">{loading ? '...' : stats[0]?.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-slate-400">Total Reports</p>
                    <p className="text-sm font-bold text-slate-800">{loading ? '...' : stats[1]?.value}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md">
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Recently Reported</h3>
                <span className="ml-auto text-xs text-slate-400">
                  {loading ? '...' : `${weekCount} this week`}
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 overflow-auto max-h-48">
                  {recentItems}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
              >
                <Icon className="w-4 h-4 text-slate-500 mb-3 relative z-10" />
                <p className="text-xs text-slate-400 relative z-10">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-1 relative z-10">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesCard;
