import React from 'react';
import {
  Drumstick,
  Leaf,
  Sprout,
  MilkOff,
  ArrowRight,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { DIET_OPTIONS, ALLERGY_OPTIONS, PLATFORM_STATS } from '../data/sampleData';
import { toggleAllergySelection } from '../services/recipeService';

interface DietProfileScreenProps {
  diet: string;
  setDiet: (diet: string) => void;
  allergies: string[];
  setAllergies: (allergies: string[]) => void;
  onContinue: () => void;
}

export const DietProfileScreen: React.FC<DietProfileScreenProps> = ({
  diet,
  setDiet,
  allergies,
  setAllergies,
  onContinue,
}) => {
  const getDietIcon = (iconName: string) => {
    switch (iconName) {
      case 'drumstick':
        return <Drumstick className="w-6 h-6" />;
      case 'leaf':
        return <Leaf className="w-6 h-6" />;
      case 'sprout':
        return <Sprout className="w-6 h-6" />;
      case 'milk-off':
        return <MilkOff className="w-6 h-6" />;
      default:
        return <Leaf className="w-6 h-6" />;
    }
  };

  const getDietBgColor = (dietId: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-[#FAF7F2] hover:bg-[#FFFDF9]';
    switch (dietId) {
      case 'Non-veg':
        return 'bg-[#FFE0CE]'; // peach
      case 'Vegetarian':
        return 'bg-[#D8EFDF]'; // mint
      case 'Vegan':
        return 'bg-[#FFF0C5]'; // butter
      case 'Dairy-free':
        return 'bg-[#D6E8F4]'; // sky
      default:
        return 'bg-[#FFF0C5]';
    }
  };

  const handleAllergyToggle = (allergyId: string) => {
    const updated = toggleAllergySelection(allergies, allergyId);
    setAllergies(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Intro Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#D8EFDF] border border-[#193826] text-[#193826] mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#193826]" />
          <span>Step 1: Set Your Profile</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#193826] mb-3 tracking-tight">
          What are you cooking for today?
        </h1>
        <p className="text-base md:text-lg text-[#193826]/80 max-w-xl mx-auto font-medium">
          Choose your diet and allergy preferences. Flavor Bridge reconstructs dishes by matching aroma molecules without sacrificing flavor.
        </p>
      </div>

      {/* 4 Diet Cards */}
      <div className="mb-10">
        <label className="block text-sm font-bold uppercase tracking-wider text-[#193826] mb-3 flex items-center justify-between">
          <span>1. Select Your Diet</span>
          <span className="text-xs font-normal text-[#193826]/70">Required</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIET_OPTIONS.map((item) => {
            const isSelected = diet === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDiet(item.id)}
                className={`text-left p-5 rounded-2xl border-2 border-[#193826] transition-all cursor-pointer relative ${getDietBgColor(
                  item.id,
                  isSelected
                )} ${
                  isSelected
                    ? 'ink-shadow ring-2 ring-[#FF7B25] translate-y-[-2px]'
                    : 'shadow-xs hover:translate-y-[-1px]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div
                    className={`w-12 h-12 rounded-xl border-2 border-[#193826] flex items-center justify-center ${
                      isSelected ? 'bg-white' : 'bg-white/80'
                    }`}
                  >
                    {getDietIcon(item.iconName)}
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 bg-[#193826] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      <Check className="w-3 h-3 text-[#FF7B25]" />
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-[#193826] mb-1">
                  {item.label}
                </h3>
                <p className="text-xs sm:text-sm text-[#193826]/80 leading-relaxed font-normal">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Allergy Chips */}
      <div className="mb-10 p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#193826] ink-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="block text-sm font-bold uppercase tracking-wider text-[#193826]">
            2. Allergies &amp; Sensitivities
          </label>
          <span className="text-xs text-[#193826]/70 font-medium">
            &quot;None&quot; is exclusive. Multiple allergies can be chosen.
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {ALLERGY_OPTIONS.map((allergy) => {
            const isSelected = allergies.includes(allergy.id);
            return (
              <button
                key={allergy.id}
                type="button"
                onClick={() => handleAllergyToggle(allergy.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#193826] transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? allergy.id === 'None'
                      ? 'bg-[#D8EFDF] text-[#193826] ink-shadow-sm translate-y-[-1px]'
                      : 'bg-[#FF7B25] text-white ink-shadow-sm translate-y-[-1px]'
                    : 'bg-white text-[#193826] hover:bg-[#FAF7F2]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{allergy.label}</span>
              </button>
            );
          })}
        </div>

        {allergies.includes('Nuts') && (
          <div className="mt-4 p-3 rounded-xl bg-[#FFF0C5] border border-[#193826] flex items-start gap-2.5 text-xs text-[#193826] font-medium">
            <Info className="w-4 h-4 text-[#FF7B25] shrink-0 mt-0.5" />
            <span>
              <strong>Nut-Free Active Rule:</strong> Cashew cream swaps will automatically be replaced with cold-blended <strong>pumpkin seed cream</strong> to ensure safe, dairy-free velvety richness without tree nuts.
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto min-w-[260px] py-3.5 px-8 rounded-xl bg-[#FF7B25] text-white text-base sm:text-lg font-bold ink-button flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Continue to Build Dish</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Disclaimer rule */}
        <p className="text-xs text-[#193826]/75 text-center mt-2 font-medium">
          {PLATFORM_STATS.scienceNotice} • {PLATFORM_STATS.medicalDisclaimer}
        </p>
      </div>
    </div>
  );
};
