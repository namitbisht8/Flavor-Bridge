import React from 'react';
import { ChefHat } from 'lucide-react';
import { PLATFORM_STATS } from '../data/sampleData';

interface FooterProps {
  onStepClick: (step: number) => void;
}

export const Footer: React.FC<FooterProps> = ({ onStepClick }) => {
  return (
    <footer className="mt-12 border-t-2 border-[#193826] bg-[#FFFDF9] py-8 px-4 no-print">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D8EFDF] border border-[#193826] flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-[#193826]" />
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#193826]">
              Flavor Bridge
            </span>
            <p className="text-xs text-[#193826]/70">
              Aroma science powered by {PLATFORM_STATS.aromaMoleculesCount} &amp; {PLATFORM_STATS.recipesCount}
            </p>
          </div>
        </div>

        {/* 3 Nav Steps Only (No broken links, no clinical guidelines, no pantry) */}
        <nav aria-label="Footer Steps" className="flex items-center gap-3 text-xs font-bold text-[#193826]">
          <button
            onClick={() => onStepClick(1)}
            className="hover:underline cursor-pointer"
          >
            1. Diet Profile
          </button>
          <span>•</span>
          <button
            onClick={() => onStepClick(2)}
            className="hover:underline cursor-pointer"
          >
            2. Build Dish
          </button>
          <span>•</span>
          <button
            onClick={() => onStepClick(3)}
            className="hover:underline cursor-pointer"
          >
            3. Rebuilt Recipe
          </button>
        </nav>

        {/* Disclaimer */}
        <div className="text-xs text-[#193826]/75 max-w-xs md:text-right font-medium">
          <span className="font-bold block">{PLATFORM_STATS.scienceNotice}</span>
          <span>{PLATFORM_STATS.medicalDisclaimer}</span>
        </div>
      </div>
    </footer>
  );
};
