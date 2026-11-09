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
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FFF0C5] text-[#193826] border-2.5 border-[#193826] ink-shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group relative"
        >
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-[#193826] group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF7B25] rounded-full border-2 border-white animate-pulse" />
        </button>
      </aside>

      {/* Slide-in / popover panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="FlavorBot Assistant"
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 rounded-2xl bg-[#FFFDF9] border-2 border-[#193826] ink-shadow-lg z-50 overflow-hidden no-print animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 bg-[#193826] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0C5] text-[#193826] flex items-center justify-center border border-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight flex items-center gap-1.5">
                  FlavorBot
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FF7B25] text-white">
                    Beta
                  </span>
                </h3>
                <span className="text-[10px] text-white/80">Aroma Matrix Specialist</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close FlavorBot"
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 bg-[#FAF7F2] space-y-3">
            <div className="p-3 rounded-xl bg-[#D8EFDF] border border-[#193826] text-xs text-[#193826] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7B25]" />
                <span>Assistant is Coming Soon!</span>
              </div>
              <p>
                FlavorBot is currently indexing our dataset of <strong>{PLATFORM_STATS.aromaMoleculesCount}</strong> and <strong>{PLATFORM_STATS.recipesCount}</strong>.
              </p>
              <p className="mt-1 text-[11px] text-[#193826]/80">
                Interactive real-time aroma substitution chat, custom pantry balancing, and regional spice maps will be available here soon.
              </p>
            </div>

            {/* Mock Chat Input */}
            <div className="pt-1">
              <label className="text-[10px] font-bold uppercase text-[#193826]/70 mb-1 block">
                Preview question
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="e.g. Can I use pumpkin seeds instead of cashews?"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#193826] bg-white focus:outline-none focus:ring-1 focus:ring-[#FF7B25]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDemoInput('');
                    alert('FlavorBot chat model is coming soon! Try the built-in recipe customizer in Step 2.');
                  }}
                  className="p-2 rounded-xl bg-[#FF7B25] text-white border border-[#193826] hover:bg-[#e0681b] cursor-pointer"
                  title="Send preview"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-[#FFFDF9] border-t border-[#193826]/10 text-[10px] text-[#193826]/60 text-center">
            {PLATFORM_STATS.medicalDisclaimer}
          </div>
        </div>
      )}
    </>
  );
};
