import React, { useState } from 'react';
import { Bot, Sparkles, X, MessageSquare, Send } from 'lucide-react';
import { PLATFORM_STATS } from '../data/sampleData';

export const FlavorBotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [demoInput, setDemoInput] = useState('');

  return (
    <>
      {/* Floating button */}
      <aside aria-label="FlavorBot Assistant Trigger" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 no-print">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open FlavorBot Assistant"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FFF0C5] dark:bg-[#1B2A23] text-[#193826] dark:text-[#FFB34D] border-2.5 border-[#193826] dark:border-[#3F6B57] ink-shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group relative"
        >
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-[#193826] dark:text-[#FFB34D] group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF7B25] dark:bg-[#FFB34D] rounded-full border-2 border-white dark:border-[#0C1411] animate-pulse" />
        </button>
      </aside>

      {/* Slide-in / popover panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="FlavorBot Assistant"
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[#3F6B57] ink-shadow-lg z-50 overflow-hidden no-print animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 bg-[#193826] dark:bg-[#101A15] text-white flex items-center justify-between border-b dark:border-[#3F6B57]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0C5] dark:bg-[#22332A] text-[#193826] dark:text-[#8FE3B6] flex items-center justify-center border border-white/20 dark:border-[#3F6B57]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight flex items-center gap-1.5 dark:text-[#F1F6F2]">
                  FlavorBot
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200]">
                    Beta
                  </span>
                </h3>
                <span className="text-[10px] text-white/80 dark:text-[#8FA89A]">Aroma Matrix Specialist</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close FlavorBot"
              className="text-white/80 dark:text-[#BBCDC2] hover:text-white dark:hover:text-[#F1F6F2] p-1 rounded-md hover:bg-white/10 dark:hover:bg-[#1B2A23] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-[#15211B] space-y-3">
            <div className="p-3 rounded-xl bg-[#D8EFDF] dark:bg-[#1B2A23] border border-[#193826] dark:border-[#3F6B57] text-xs text-[#193826] dark:text-[#BBCDC2] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-[#193826] dark:text-[#5FD39A]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7B25] dark:text-[#FFB34D]" />
                <span>Assistant is Coming Soon!</span>
              </div>
              <p>
                FlavorBot is currently indexing our dataset of <strong>{PLATFORM_STATS.aromaMoleculesCount}</strong> and <strong>{PLATFORM_STATS.recipesCount}</strong>.
              </p>
              <p className="mt-1 text-[11px] text-[#193826]/80 dark:text-[#8FA89A]">
                Interactive real-time aroma substitution chat, custom pantry balancing, and regional spice maps will be available here soon.
              </p>
            </div>

            {/* Mock Chat Input */}
            <div className="pt-1">
              <label className="text-[10px] font-bold uppercase text-[#193826]/70 dark:text-[#8FA89A] mb-1 block">
                Preview question
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="e.g. Can I use pumpkin seeds instead of cashews?"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#193826] dark:border-[#3F6B57] bg-white dark:bg-[#101A15] dark:text-[#F1F6F2] dark:placeholder-[#8FA89A] focus:outline-none focus:ring-1 focus:ring-[#FF7B25] dark:focus:ring-[#FFB34D]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDemoInput('');
                    alert('FlavorBot chat model is coming soon! Try the built-in recipe customizer in Step 2.');
                  }}
                  className="p-2 rounded-xl bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] border border-[#193826] dark:border-[#3F6B57] hover:bg-[#e0681b] dark:hover:bg-[#ffa733] cursor-pointer"
                  title="Send preview"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-[#FFFDF9] dark:bg-[#101A15] border-t border-[#193826]/10 dark:border-[#3F6B57]/50 text-[10px] text-[#193826]/60 dark:text-[#8FA89A] text-center">
            {PLATFORM_STATS.medicalDisclaimer}
          </div>
        </div>
      )}
    </>
  );
};
