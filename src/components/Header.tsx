import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Sun, Moon } from 'lucide-react';
import { PLATFORM_STATS } from '../data/sampleData';
import { API_MODE } from '../config';

interface HeaderProps {
  currentStep: number; // 1, 2, 3
  onStepClick: (step: number) => void;
  savedCount?: number;
}

const FONT_SIZES = ['100%', '112%', '125%'] as const;
type FontSize = typeof FONT_SIZES[number];

export const Header: React.FC<HeaderProps> = ({ currentStep, onStepClick }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [fontSize, setFontSize] = useState<FontSize>('100%');

  useEffect(() => {
    // Initial check from localStorage
    try {
      const savedTheme = localStorage.getItem('flavor_bridge_theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // localStorage fallback
    }

    try {
      const savedSize = localStorage.getItem('flavor_bridge_font_size') as FontSize;
      if (savedSize && FONT_SIZES.includes(savedSize)) {
        setFontSize(savedSize);
        document.documentElement.style.fontSize = savedSize;
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

  const handleDecreaseFont = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex > 0) {
      const newSize = FONT_SIZES[currentIndex - 1];
      setFontSize(newSize);
      document.documentElement.style.fontSize = newSize;
      try {
        localStorage.setItem('flavor_bridge_font_size', newSize);
      } catch {}
    }
  };

  const handleIncreaseFont = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      const newSize = FONT_SIZES[currentIndex + 1];
      setFontSize(newSize);
      document.documentElement.style.fontSize = newSize;
      try {
        localStorage.setItem('flavor_bridge_font_size', newSize);
      } catch {}
    }
  };

  const steps = [
    { num: 1, title: 'Diet Profile' },
    { num: 2, title: 'Build Dish' },
    { num: 3, title: 'Rebuilt Recipe' },
  ];

  const currentFontIndex = FONT_SIZES.indexOf(fontSize);

  return (
    <header className="border-b-2 border-[#193826] dark:border-b-[1.5px] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#15211B] sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Top micro-banner highlighting pitch deck numbers */}
      <div className="bg-[#193826] dark:bg-[#0C1411] dark:border-b dark:border-[#3F6B57] text-[#FAF7F2] dark:text-[#BBCDC2] text-xs py-1.5 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#FF7B25] dark:text-[#FFB34D]" />
        <span>Powered by aroma science: {PLATFORM_STATS.aromaMoleculesCount} &amp; {PLATFORM_STATS.recipesCount}</span>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
        {/* Brand + Data status chip + Mobile Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => onStepClick(1)}
              className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer"
              aria-label="Flavor Bridge Home"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#FFF0C5] dark:bg-[#FFF0C5] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] flex items-center justify-center ink-shadow-sm p-1.5 group-hover:bg-[#FFE0CE] dark:group-hover:bg-[#FFF0C5] transition-colors shrink-0">
                <img src="/logo.png" alt="Flavor Bridge logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#193826] dark:text-[#F1F6F2] block leading-none">
                  Flavor Bridge
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#193826]/75 dark:text-[#8FA89A] uppercase tracking-wider hidden xs:block sm:block">
                  Aroma-Twin Culinary Rebuilder
                </span>
              </div>
            </button>

            {/* Feature 3: Data Status Chip in Header */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border shrink-0 ${
                API_MODE === 'live'
                  ? 'bg-[#D8EFDF] text-[#193826] border-[#193826] dark:bg-[#12281F] dark:text-[#5FD39A] dark:border-[#5FD39A]'
                  : 'bg-[#FFF0C5] text-[#193826] border-[#193826] dark:bg-[#1B2A23] dark:text-[#FFB34D] dark:border-[#3F6B57]'
              }`}
              title={`Data source: ${API_MODE === 'live' ? 'Live Foodoscope API' : 'Sample Dataset'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${API_MODE === 'live' ? 'bg-[#193826] dark:bg-[#5FD39A]' : 'bg-[#FF7B25] dark:bg-[#FFB34D]'}`} />
              <span>{API_MODE === 'live' ? 'Live data' : 'Sample data'}</span>
            </span>
          </div>

          {/* Right side controls on mobile (Text size, Step badge, Theme Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Feature 4: Text Size Control (A- and A+) on mobile & desktop */}
            <div
              className="flex items-center rounded-lg border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#1B2A23] p-0.5 shrink-0"
              role="group"
              aria-label="Text size controls"
            >
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={currentFontIndex === 0}
                aria-label="Decrease text size (A-)"
                title="Decrease text size (A-)"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-extrabold rounded-md hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors text-[#193826] dark:text-[#F1F6F2]"
              >
                A-
              </button>
              <span className="text-[10px] sm:text-xs font-bold px-1 text-[#193826]/75 dark:text-[#BBCDC2] select-none min-w-[28px] text-center">
                {fontSize}
              </span>
              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={currentFontIndex === FONT_SIZES.length - 1}
                aria-label="Increase text size (A+)"
                title="Increase text size (A+)"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-extrabold rounded-md hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors text-[#193826] dark:text-[#F1F6F2]"
              >
                A+
              </button>
            </div>

            {/* Mobile Step Pill */}
            <div className="flex md:hidden items-center gap-1 bg-[#D8EFDF] dark:bg-[#1B2A23] px-2 py-1 rounded-full border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] text-[11px] font-bold text-[#193826] dark:text-[#BBCDC2]">
              <span>{currentStep}/3</span>
            </div>

            {/* Theme Toggle Button (44px min tap target) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] rounded-full border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FFF0C5] dark:bg-[#15211B] text-[#193826] dark:text-[#FFB34D] flex items-center justify-center ink-shadow-sm hover:scale-105 active:scale-95 dark:hover:bg-[#1B2A23] dark:hover:border-[#5FA283] transition-all duration-150 cursor-pointer shrink-0"
            >
              {isDark ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB34D] transition-transform duration-200" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF7B25] transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop 3-step navigation */}
        <div className="hidden md:flex items-center justify-end gap-2">
          <nav aria-label="Workflow Steps" className="flex items-center gap-1 sm:gap-2">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isCompleted = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => onStepClick(s.num)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 dark:border-[1.5px] text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#FF7B25] text-white border-[#193826] dark:bg-[#FFB34D] dark:text-[#1A1200] dark:border-[#FFB34D] dark:hover:bg-[#FFC266] ink-shadow-sm translate-y-[-1px]'
                      : isCompleted
                      ? 'bg-[#D8EFDF] text-[#193826] border-[#193826] dark:bg-[#1B2A23] dark:text-[#5FD39A] dark:border-[#3F6B57] hover:bg-[#c2e4cc] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283]'
                      : 'bg-transparent text-[#193826]/60 dark:text-[#8FA89A] border-dashed border-[#193826]/30 dark:border-[#3F6B57] hover:border-[#193826] dark:hover:border-[#5FA283] dark:hover:text-[#F1F6F2]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#193826] dark:text-[#5FD39A]" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-[#193826] text-white dark:bg-[#1A1200] dark:text-[#FFB34D]'
                          : 'bg-[#193826]/10 text-[#193826] dark:bg-[#3F6B57]/40 dark:text-[#8FA89A]'
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
        </div>
      </div>
    </header>
  );
};
