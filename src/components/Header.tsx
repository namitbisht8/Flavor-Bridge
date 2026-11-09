import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Sun, Moon } from 'lucide-react';
import { PLATFORM_STATS } from '../data/sampleData';

interface HeaderProps {
  currentStep: number; // 1, 2, 3
  onStepClick: (step: number) => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, onStepClick }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    // Initial check from localStorage or prefers-color-scheme
    try {
      const saved = localStorage.getItem('flavor_bridge_theme');
      if (saved === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else if (saved === 'light') {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('flavor_bridge_theme', next ? 'dark' : 'light');
    } catch {
      // localStorage fallback
    }
  };

  const steps = [
    { num: 1, title: 'Diet Profile' },
    { num: 2, title: 'Build Dish' },
    { num: 3, title: 'Rebuilt Recipe' },
  ];

  return (
    <header className="border-b-2 border-[#193826] bg-[#FFFDF9] sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Top micro-banner highlighting pitch deck numbers */}
      <div className="bg-[#193826] text-[#FAF7F2] text-xs py-1.5 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#FF7B25]" />
        <span>Powered by aroma science: {PLATFORM_STATS.aromaMoleculesCount} &amp; {PLATFORM_STATS.recipesCount}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand + Mobile Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onStepClick(1)}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
            aria-label="Flavor Bridge Home"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#FFF0C5] dark:bg-[#FFF0C5] border-2 border-[#193826] dark:border-[#7FB59A] flex items-center justify-center ink-shadow-sm p-1.5 group-hover:bg-[#FFE0CE] dark:group-hover:bg-[#FFE0CE] transition-colors shrink-0">
              <img src="/logo.png" alt="Flavor Bridge logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#193826] block leading-none">
                Flavor Bridge
              </span>
              <span className="text-[11px] font-semibold text-[#193826]/75 uppercase tracking-wider">
                Aroma-Twin Culinary Rebuilder
              </span>
            </div>
          </button>

          {/* Mobile Right Bar: Step Pill + Theme Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center gap-1.5 bg-[#D8EFDF] px-2.5 py-1 rounded-full border border-[#193826] text-xs font-bold">
              <span>Step {currentStep} of 3</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-[#193826] bg-[#FFF0C5] text-[#193826] flex items-center justify-center ink-shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
            >
              {isDark ? (
                <Moon className="w-5 h-5 text-[#FFB34D] transition-transform duration-200" />
              ) : (
                <Sun className="w-5 h-5 text-[#FF7B25] transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop 3-step navigation + Theme Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-2">
          <nav aria-label="Workflow Steps" className="flex items-center gap-1 sm:gap-2 flex-1 md:flex-initial justify-between md:justify-end">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isCompleted = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => onStepClick(s.num)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF7B25] text-white border-[#193826] ink-shadow-sm translate-y-[-1px]'
                      : isCompleted
                      ? 'bg-[#D8EFDF] text-[#193826] border-[#193826] hover:bg-[#c2e4cc]'
                      : 'bg-transparent text-[#193826]/60 border-dashed border-[#193826]/30 hover:border-[#193826]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#193826]" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        isActive ? 'bg-[#193826] text-white' : 'bg-[#193826]/10 text-[#193826]'
                      }`}
                    >
                      {s.num}
                    </span>
                  )}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Theme Toggle Button (44px min tap target) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="hidden md:flex w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-[#193826] bg-[#FFF0C5] text-[#193826] items-center justify-center ink-shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 ml-1"
          >
            {isDark ? (
              <Moon className="w-5 h-5 text-[#FFB34D] transition-transform duration-200" />
            ) : (
              <Sun className="w-5 h-5 text-[#FF7B25] transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
