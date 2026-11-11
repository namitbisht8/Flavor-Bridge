import React from 'react';
import {
  Drumstick,
  Leaf,
  Sprout,
  MilkOff,
  ArrowRight,
  Check,
  Info,
} from 'lucide-react';
import { ALLERGY_OPTIONS } from '../data/sampleData';
import { toggleAllergySelection } from '../services/recipeService';

interface DietProfileScreenProps {
  diet: string;
  setDiet: (diet: string) => void;
  allergies: string[];
  setAllergies: (allergies: string[]) => void;
  onContinue: () => void;
  onRunDemo?: () => void;
}

// 4 diet options with exactly 5-word descriptions
const DIET_CARDS = [
  {
    id: 'Non-veg',
    label: 'Non-veg',
    icon: Drumstick,
    shortDesc: 'Poultry, meat, and seafood dishes.',
    lightBg: 'bg-[#FFE0CE]',
  },
  {
    id: 'Vegetarian',
    label: 'Vegetarian',
    icon: Leaf,
    shortDesc: 'Plant dishes with dairy staples.',
    lightBg: 'bg-[#D8EFDF]',
  },
  {
    id: 'Vegan',
    label: 'Vegan',
    icon: Sprout,
    shortDesc: '100% plant dishes, no dairy.',
    lightBg: 'bg-[#FFF0C5]',
  },
  {
    id: 'Dairy-free',
    label: 'Dairy-free',
    icon: MilkOff,
    shortDesc: 'Rebuilt using rich plant creams.',
    lightBg: 'bg-[#D6E8F4]',
  },
];

export const DietProfileScreen: React.FC<DietProfileScreenProps> = ({
  diet,
  setDiet,
  allergies,
  setAllergies,
  onContinue,
  onRunDemo,
}) => {
  const handleAllergyToggle = (allergyId: string) => {
    const updated = toggleAllergySelection(allergies, allergyId);
    setAllergies(updated);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 md:py-8">
      {/* Simplified Intro */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#193826] dark:text-[#F1F6F2] mb-1.5 tracking-tight">
          What do you eat?
        </h1>
        <p className="text-sm md:text-base text-[#193826]/75 dark:text-[#BBCDC2] font-medium">
          Pick your diet and any allergies to get started.
        </p>
      </div>

      {/* 4 Diet Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIET_CARDS.map((item) => {
            const isSelected = diet === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDiet(item.id)}
                className={`text-left p-4 rounded-2xl border-2 border-[#193826] transition-all duration-150 cursor-pointer relative ${
                  isSelected
                    ? `${item.lightBg} dark:bg-[#15211B] ink-shadow ring-2 ring-[#FF7B25] dark:ring-0 dark:border-[2.5px] dark:border-[#FFB34D] dark:shadow-[0_0_0_4px_rgba(255,179,77,0.18),3px_3px_0_rgba(0,0,0,0.45)] translate-y-[-2px]`
                    : 'bg-[#FAF7F2] hover:bg-[#FFFDF9] dark:bg-[#15211B] dark:border-[1.5px] dark:border-[#3F6B57] shadow-xs hover:translate-y-[-1px] dark:hover:bg-[#1B2A23] dark:hover:border-[#5FA283]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-white dark:bg-[#22332A] text-[#193826] dark:text-[#8FE3B6] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 bg-[#193826] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] text-xs font-bold px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#193826] dark:text-[#F1F6F2] mb-0.5">
                  {item.label}
                </h3>
                <p className="text-xs text-[#193826]/75 dark:text-[#BBCDC2] font-medium line-clamp-2">
                  {item.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Allergies Section */}
      <div className="mb-8 p-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#193826] dark:text-[#F1F6F2] mb-3">
          Any allergies?
        </h2>

        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((allergy) => {
            const isSelected = allergies.includes(allergy.id);
            return (
              <button
                key={allergy.id}
                type="button"
                onClick={() => handleAllergyToggle(allergy.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 border-[#193826] dark:border-[1.5px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? allergy.id === 'None'
                      ? 'bg-[#D8EFDF] text-[#193826] dark:bg-[#FFB34D] dark:border-[#FFB34D] dark:text-[#1A1200] ink-shadow-sm'
                      : 'bg-[#FF7B25] text-white dark:bg-[#FFB34D] dark:border-[#FFB34D] dark:text-[#1A1200] ink-shadow-sm'
                    : 'bg-white dark:bg-[#1B2A23] text-[#193826] dark:text-[#EAF3EC] dark:border-[#3F6B57] hover:bg-[#FAF7F2] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{allergy.label}</span>
              </button>
            );
          })}
        </div>

        {/* Nut-Free rule banner ONLY visible if Nuts is selected */}
        {allergies.includes('Nuts') && (
          <div className="mt-3.5 p-3 rounded-xl bg-[#FFF0C5] dark:bg-[#1B2A23] border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] flex items-start gap-2 text-xs text-[#193826] dark:text-[#BBCDC2] font-medium animate-in fade-in duration-150">
            <Info className="w-4 h-4 text-[#FF7B25] dark:text-[#FFB34D] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#193826] dark:text-[#F1F6F2]">Nut-free active:</strong> Cashews will be replaced with pumpkin seed cream.
            </span>
          </div>
        )}
      </div>

      {/* ONE Primary Button (Saffron) + 1-Minute Demo Link */}
      <div className="sticky bottom-0 z-20 bg-[#FFFDF9]/95 dark:bg-[#15211B]/95 backdrop-blur-md pt-3 pb-3 sm:static sm:bg-transparent sm:pt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto min-w-[280px] py-3.5 px-8 rounded-xl bg-[#FF7B25] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] hover:bg-[#E86A18] dark:hover:bg-[#FFC266] text-base sm:text-lg font-bold ink-button flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-150"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {onRunDemo && (
          <button
            type="button"
            onClick={onRunDemo}
            className="text-xs font-bold text-[#FF7B25] dark:text-[#FFB34D] hover:underline cursor-pointer py-1"
          >
            Try the 1-minute demo
          </button>
        )}
      </div>
    </div>
  );
};
