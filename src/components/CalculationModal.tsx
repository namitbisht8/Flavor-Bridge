import React, { useEffect } from 'react';
import { X, CheckCircle, Database, AlertCircle, Sparkles } from 'lucide-react';
import { API_MODE } from '../config';

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculationModal: React.FC<CalculationModalProps> = ({ isOpen, onClose }) => {
  // Close on Esc key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] rounded-2xl ink-shadow p-5 sm:p-6 text-[#193826] dark:text-[#F1F6F2] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#193826]/20 dark:border-[#3F6B57]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF7B25] dark:text-[#FFB34D]" />
            <h2 id="calc-modal-title" className="font-serif text-xl sm:text-2xl font-bold">
              How We Calculated This
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculation modal"
            className="w-8 h-8 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#1B2A23] hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#193826] dark:text-[#F1F6F2]" />
          </button>
        </div>

        {/* Section A: 3 Plain-Language Steps */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF7B25] dark:text-[#FFB34D] mb-2.5">
            3-Step Rebuilding Process
          </h3>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1B2A23] border border-[#193826]/30 dark:border-[#3F6B57] flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#193826] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="block text-sm font-serif">Cut what the diet restricts</strong>
                <p className="text-xs text-[#193826]/80 dark:text-[#BBCDC2] mt-0.5">
                  We remove ingredients prohibited by your chosen diet or active allergies (like dairy, meat, gluten, or nuts).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1B2A23] border border-[#193826]/30 dark:border-[#3F6B57] flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#193826] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="block text-sm font-serif">Find smell-twin swaps from FlavorDB</strong>
                <p className="text-xs text-[#193826]/80 dark:text-[#BBCDC2] mt-0.5">
                  We match aroma molecules from FlavorDB to find botanical substitutes that preserve traditional depth and aroma.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1B2A23] border border-[#193826]/30 dark:border-[#3F6B57] flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#193826] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="block text-sm font-serif">Check against the limit</strong>
                <p className="text-xs text-[#193826]/80 dark:text-[#BBCDC2] mt-0.5">
                  We calculate total sodium, saturated fat, and sugar to verify the rebuilt dish stays strictly under your target limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Data Sources */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#D8EFDF]/50 dark:bg-[#1B2A23] border border-[#193826]/30 dark:border-[#3F6B57]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Database className="w-4 h-4 text-[#193826] dark:text-[#5FD39A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#193826] dark:text-[#5FD39A]">
              Scientific Data Sources
            </h3>
          </div>
          <p className="text-xs text-[#193826]/85 dark:text-[#BBCDC2] leading-relaxed">
            Formulations use <strong>RecipeDB</strong> for recipes and nutritional baselines, and <strong>FlavorDB</strong> for aroma profiles and volatile chemical pairings, accessible via the <strong>Foodoscope APIs</strong>.
          </p>
        </div>

        {/* Section C: Data Status & Estimates Box */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#FFF0C5] dark:bg-[#22332A] border-2 border-[#193826] dark:border-[#3F6B57]">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider border ${
              API_MODE === 'live'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-[#12281F] dark:text-[#5FD39A] dark:border-[#5FD39A]'
                : 'bg-[#FF7B25] text-white border-[#193826] dark:bg-[#FFB34D] dark:text-[#1A1200] dark:border-[#FFB34D]'
            }`}>
              Currently showing: {API_MODE === 'live' ? 'Live data' : 'Sample data'}
            </span>
          </div>
          <p className="text-xs text-[#193826]/90 dark:text-[#BBCDC2] leading-relaxed mt-1">
            Values displayed on screen are <strong>{API_MODE === 'live' ? 'live Foodoscope API calculations' : 'curated sample estimates'}</strong>. Cost per serving and preparation difficulty are estimates based on standard regional market ingredients.
          </p>
        </div>

        {/* Section D: Limits */}
        <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#101A15] border border-[#193826]/20 dark:border-[#3F6B57] flex items-start gap-2.5 text-xs text-[#193826]/75 dark:text-[#8FA89A]">
          <AlertCircle className="w-4 h-4 text-[#FF7B25] dark:text-[#FFB34D] shrink-0 mt-0.5" />
          <p>
            <strong>Important Limits:</strong> Only a few classic Indian dishes are supported so far. This platform provides culinary flavor rebuilding and educational suggestions, not personalized medical or dietetic advice.
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#193826] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] font-bold text-sm cursor-pointer hover:bg-[#224831] dark:hover:bg-[#FFC266] transition-colors"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
