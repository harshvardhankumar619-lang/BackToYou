import { Link } from 'react-router-dom';
import { Search, Package, RotateCcw, ArrowRight, ShieldCheck, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ShinyButton } from '@/components/ui/shiny-button';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { FUIBentoGridDark } from '@/components/ui/bento';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with dark gradient background */}
      <DarkGradientBg className="min-h-[90vh]">
        <section className="relative">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-cyan-300 text-sm font-medium mb-6 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4" />
                CMRIT Campus Lost &amp; Found
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
                Report and recover lost items on{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  campus
                </span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-4">
                BackToYou connects students who've lost belongings with those who've found them.
                Report, search, and reclaim — all in one trusted platform built for CMRIT.
              </p>
              <p className="text-sm font-medium text-cyan-400 mb-10">Find it. Connect. Return.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={user ? '/report/lost' : '/register'}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal-500 text-white font-semibold shadow-lg shadow-teal-500/20 hover:bg-teal-400 hover:shadow-xl transition-all duration-200"
                >
                  Report Lost Item
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to={user ? '/report/found' : '/register'}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 backdrop-blur-sm shadow-sm hover:border-white/40 hover:bg-white/20 transition-all duration-200"
                >
                  Report Found Item
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </DarkGradientBg>

      {/* Bento feature section */}
      <FUIBentoGridDark />

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">How it works</h2>
            <p className="text-slate-500">Three simple steps to get your belongings back</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-200">
                <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-5">
                  <Search className="w-7 h-7 text-teal-600" />
                </div>
                <div className="text-sm font-bold text-teal-600 mb-2">STEP 1</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Report</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Lost something or found someone else's item? Create a report with details like
                  category, location, and date.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-200">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
                  <Package className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-blue-600 mb-2">STEP 2</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Search</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Browse through lost and found listings. Filter by category or location to find
                  items that match what you're looking for.
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-200">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <RotateCcw className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-emerald-600 mb-2">STEP 3</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Reclaim</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Found a match? Connect with the person who reported it and reclaim your
                  belongings quickly and safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / features band */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">Student-Only</p>
              <p className="text-sm text-slate-400">Built exclusively for CMRIT students</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">Location-Aware</p>
              <p className="text-sm text-slate-400">Pinpoint where items were lost or found</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">Real-Time</p>
              <p className="text-sm text-slate-400">Stay updated with the latest reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to find what you lost?</h2>
          <p className="text-slate-500 mb-8">
            Join BackToYou today and help build a more connected campus community.
          </p>
          {!user && (
            <ShinyButton
              label="Get Started"
              onClick={() => window.location.href = '/register'}
              fillColor="#0d9488"
              accentColor="#5eead4"
              accentSoftColor="#99f6e4"
              labelColor="#ffffff"
              cornerRadius={12}
              sweepDuration={4}
              className="!px-8 !py-3.5 !text-base"
            />
          )}
        </div>
      </section>
    </div>
  );
}
