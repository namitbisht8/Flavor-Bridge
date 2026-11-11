import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Sun, Moon, HelpCircle } from 'lucide-react';
import { API_MODE } from '../config';
import { CalculationModal } from './CalculationModal';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('flavor_bridge_theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } catch {}

    try {
      const savedSize = localStorage.getItem('flavor_bridge_font_size') as FontSize;
      if (savedSize && FONT_SIZES.includes(savedSize)) {
        setFontSize(savedSize);
        document.documentElement.style.fontSize = savedSize;
      }
    } catch {}
  }, []);

  // Close menu on click outside or Esc
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

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
    } catch {}
  };

  const currentFontIndex = FONT_SIZES.indexOf(fontSize);

  const handleDecreaseFont = () => {
    if (currentFontIndex > 0) {
      const newSize = FONT_SIZES[currentFontIndex - 1];
      setFontSize(newSize);
      document.documentElement.style.fontSize = newSize;
      try {
        localStorage.setItem('flavor_bridge_font_size', newSize);
      } catch {}
    }
  };

  const handleIncreaseFont = () => {
    if (currentFontIndex < FONT_SIZES.length - 1) {
      const newSize = FONT_SIZES[currentFontIndex + 1];
      setFontSize(newSize);
      document.documentElement.style.fontSize = newSize;
      try {
        localStorage.setItem('flavor_bridge_font_size', newSize);
      } catch {}
    }
  };

  return (
    <header className="border-b-2 border-[#193826] dark:border-b-[1.5px] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#15211B] sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Logo + Name + Sample Data Chip */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={() => onStepClick(1)}
            className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer shrink-0"
            aria-label="Flavor Bridge Home"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FFF0C5] dark:bg-[#FFF0C5] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] flex items-center justify-center ink-shadow-sm p-1 shrink-0">
              <img src="/logo.png" alt="Flavor Bridge logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-tight text-[#193826] dark:text-[#F1F6F2] block leading-none">
              Flavor Bridge
            </span>
          </button>

          {/* Single Header Data Status Chip */}
          <span
            className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border shrink-0 bg-[#FFF0C5] text-[#193826] border-[#193826] dark:bg-[#1B2A23] dark:text-[#FFB34D] dark:border-[#3F6B57]"
            title={`Data source: ${API_MODE === 'live' ? 'Live Foodoscope API' : 'Sample Dataset'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7B25] dark:bg-[#FFB34D]" />
            <span className="hidden xs:inline">{API_MODE === 'live' ? 'Live data' : 'Sample data'}</span>
            <span className="xs:hidden">{API_MODE === 'live' ? 'Live' : 'Sample'}</span>
          </span>
        </div>

        {/* Center: Simple "Step X of 3" Progress Line with 3 dots */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="hidden md:inline text-xs sm:text-sm font-bold text-[#193826] dark:text-[#BBCDC2]">
            Step {currentStep} of 3
          </span>
          <div className="flex items-center gap-1.5" role="navigation" aria-label="Step progress">
            {[1, 2, 3].map((stepNum) => {
              const isCurrent = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              return (
                <button
                  key={stepNum}
                  type="button"
                  disabled={!isPast}
                  onClick={() => onStepClick(stepNum)}
                  title={`Step ${stepNum}${isPast ? ' (Click to return)' : ''}`}
                  aria-label={`Step ${stepNum}${isPast ? ' (Click to return)' : isCurrent ? ' (Current)' : ''}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                    isCurrent
                      ? 'bg-[#FF7B25] dark:bg-[#FFB34D] scale-125 ring-2 ring-[#FF7B25]/40 dark:ring-[#FFB34D]/40'
                      : isPast
                      ? 'bg-[#193826] dark:bg-[#5FD39A] cursor-pointer hover:scale-125'
                      : 'bg-[#193826]/20 dark:bg-[#3F6B57]/50 cursor-default'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Only a small menu (three dots) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="App settings and calculations menu"
            aria-expanded={menuOpen}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FFF0C5] dark:bg-[#15211B] text-[#193826] dark:text-[#FFB34D] flex items-center justify-center ink-shadow-sm hover:scale-105 active:scale-95 dark:hover:bg-[#1B2A23] dark:hover:border-[#5FA283] transition-all cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-64 p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#193826]/15 dark:border-[#3F6B57]/40">
                <span className="text-xs font-bold text-[#193826] dark:text-[#F1F6F2]">
                  Theme
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#1B2A23] text-xs font-bold text-[#193826] dark:text-[#FFB34D] hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] cursor-pointer"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>

              {/* Text Size Control */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#193826]/15 dark:border-[#3F6B57]/40">
                <span className="text-xs font-bold text-[#193826] dark:text-[#F1F6F2]">
                  Text size
                </span>
                <div className="flex items-center rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#1B2A23] p-0.5">
                  <button
                    type="button"
                    onClick={handleDecreaseFont}
                    disabled={currentFontIndex === 0}
                    aria-label="Decrease text size"
                    className="w-7 h-7 flex items-center justify-center text-xs font-extrabold rounded hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] disabled:opacity-30 cursor-pointer text-[#193826] dark:text-[#F1F6F2]"
                  >
                    A-
                  </button>
                  <span className="text-xs font-bold px-1.5 text-[#193826]/80 dark:text-[#BBCDC2]">
                    {fontSize}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseFont}
                    disabled={currentFontIndex === FONT_SIZES.length - 1}
                    aria-label="Increase text size"
                    className="w-7 h-7 flex items-center justify-center text-xs font-extrabold rounded hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] disabled:opacity-30 cursor-pointer text-[#193826] dark:text-[#F1F6F2]"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* How we calculated this button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowHowCalculated(true);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold bg-[#D8EFDF]/50 dark:bg-[#1B2A23] border border-[#193826]/30 dark:border-[#3F6B57] hover:bg-[#D8EFDF] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] text-[#193826] dark:text-[#5FD39A] cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-[#193826] dark:text-[#5FD39A] shrink-0" />
                  <span>How we calculated this</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global How We Calculated This Modal */}
      <CalculationModal
        isOpen={showHowCalculated}
        onClose={() => setShowHowCalculated(false)}
      />
    </header>
  );
};
