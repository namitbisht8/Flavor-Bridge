import React, { useState, useRef } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Camera,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  X,
  Plus,
  Flame,
  Check,
  CookingPot,
  Lock,
} from 'lucide-react';
import { SampleBadge } from './SampleBadge';
import {
  DISHES_CATALOG,
  PLATFORM_STATS,
  CORE_INGREDIENTS,
  TOGGLEABLE_INGREDIENTS,
  SAMPLE_INGREDIENT_PENALTIES,
} from '../data/sampleData';

interface BuildDishScreenProps {
  diet: string;
  setDiet: (diet: string) => void;
  allergies: string[];
  selectedDishId: string;
  setSelectedDishId: (id: string) => void;
  rebuiltIngredients: string[];
  setRebuiltIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  onRebuild: () => void;
  onBackToDiet: () => void;
}

export const BuildDishScreen: React.FC<BuildDishScreenProps> = ({
  diet,
  setDiet,
  allergies,
  selectedDishId,
  setSelectedDishId,
  rebuiltIngredients,
  setRebuiltIngredients,
  onRebuild,
  onBackToDiet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [photoUploaded, setPhotoUploaded] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const isVegOrVegan = diet === 'Vegetarian' || diet === 'Vegan';

  // Available dishes filtered by search
  const filteredDishes = DISHES_CATALOG.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.hindiName && d.hindiName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle rebuild status for customizable chips (ON = rebuild this, OFF = keep original)
  const toggleRebuildIngredient = (ingredientName: string) => {
    setRebuiltIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((item) => item !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const resetAllToRebuild = () => {
    setRebuiltIngredients(TOGGLEABLE_INGREDIENTS);
  };

  // Browser speech recognition
  const handleMicToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechStatus('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechStatus(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setSpeechStatus(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatus(`Listening (${speechLang === 'en-IN' ? 'English - India' : 'Hindi'})... Speak dish name!`);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        setSpeechStatus(`Recognized: "${transcript}"`);
        setTimeout(() => setSpeechStatus(null), 3000);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechStatus(`Speech error: ${event.error || 'could not recognize'}`);
        setTimeout(() => setSpeechStatus(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechStatus('Microphone access was denied or unavailable.');
      setTimeout(() => setSpeechStatus(null), 3500);
    }
  };

  // Photo upload simulation
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoUploaded(file.name);
      setSelectedDishId('butter-chicken');
    }
  };

  // Trigger rebuild with animated loading step
  const handleRebuildClick = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onRebuild();
    }, 1100);
  };

  const keptCount = TOGGLEABLE_INGREDIENTS.length - rebuiltIngredients.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Screen Header with Sample Data Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D8EFDF] border border-[#193826] text-[#193826]">
              <CookingPot className="w-3.5 h-3.5 text-[#193826]" />
              <span>Step 2: Build Dish</span>
            </span>
            <SampleBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#193826] tracking-tight">
            Select and customize your dish
          </h1>
          <p className="text-sm text-[#193826]/80 mt-1">
            Current diet: <strong className="text-[#193826] underline">{diet}</strong>
            {allergies.length > 0 && !allergies.includes('None') && (
              <span> • Allergies: {allergies.join(', ')}</span>
            )}
          </p>
        </div>

        <button
          onClick={onBackToDiet}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#193826] bg-[#FFFDF9] hover:bg-[#FFE0CE] text-[#193826] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Change Profile</span>
        </button>
      </div>

      {/* Search Bar + Voice Mic + Photo Upload */}
      <div className="mb-6 p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#193826] ink-shadow">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#193826]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian classics (e.g. Butter Chicken, Rajma)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#193826] bg-white text-sm text-[#193826] focus:outline-none focus:ring-2 focus:ring-[#FF7B25]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#193826]/60 hover:text-[#193826]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Speech Lang Selector */}
            <button
              type="button"
              onClick={() => setSpeechLang((prev) => (prev === 'en-IN' ? 'hi-IN' : 'en-IN'))}
              title="Toggle speech language"
              className="px-2.5 py-2.5 rounded-xl border-2 border-[#193826] text-xs font-bold bg-[#FFF0C5] text-[#193826] hover:bg-[#ffe6a4] transition-colors cursor-pointer shrink-0"
            >
              {speechLang === 'en-IN' ? 'EN (IN)' : 'HI (IN)'}
            </button>

            {/* Mic Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              title="Voice search dish"
              aria-label="Voice search dish"
              className={`p-2.5 rounded-xl border-2 border-[#193826] font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#D6E8F4] text-[#193826] hover:bg-[#bce0f8]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Snap or upload dish photo"
              aria-label="Snap or upload dish photo"
              className="px-3 py-2.5 rounded-xl border-2 border-[#193826] text-xs font-bold bg-[#FFE0CE] text-[#193826] hover:bg-[#ffd1ba] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Camera className="w-4 h-4 text-[#193826]" />
              <span className="hidden xs:inline">Snap photo</span>
            </button>
          </div>
        </div>

        {speechStatus && (
          <div className="mt-2.5 text-xs font-semibold text-[#193826] bg-[#FFF0C5] px-3 py-1.5 rounded-lg border border-[#193826]">
            {speechStatus}
          </div>
        )}

        {photoUploaded && (
          <div className="mt-2.5 text-xs font-semibold text-[#193826] bg-[#D8EFDF] px-3 py-1.5 rounded-lg border border-[#193826] flex items-center justify-between">
            <span>Photo captured: <strong>{photoUploaded}</strong> (matched Butter Chicken flavor profile)</span>
            <button
              onClick={() => setPhotoUploaded(null)}
              className="text-[#193826] hover:text-red-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Case 1: Vegetarian or Vegan diet (Butter Chicken forbidden) */}
      {isVegOrVegan ? (
        <div className="p-8 rounded-2xl bg-[#FFF0C5] border-2 border-[#193826] ink-shadow text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FFE0CE] border-2 border-[#193826] flex items-center justify-center mx-auto mb-4 ink-shadow-sm">
            <AlertCircle className="w-7 h-7 text-[#FF7B25]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#193826] mb-2">
            No sample dish for this diet yet
          </h2>
          <p className="text-sm md:text-base text-[#193826]/85 max-w-lg mx-auto mb-6 leading-relaxed">
            You are currently on the <strong>{diet}</strong> profile. Butter Chicken contains poultry and cannot be selected. Rajma Masala, Dal Tadka, and Moong Dal Khichdi sample models are currently in training!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setDiet('Non-veg')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FF7B25] text-white font-bold ink-button cursor-pointer text-sm"
            >
              Switch to Non-veg (Explore Butter Chicken)
            </button>
            <button
              onClick={() => setDiet('Dairy-free')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#D6E8F4] text-[#193826] font-bold border-2 border-[#193826] hover:bg-[#bce0f8] cursor-pointer text-sm"
            >
              Switch to Dairy-free
            </button>
          </div>
        </div>
      ) : (
        /* Case 2: Non-veg or Dairy-free (Butter chicken available, others coming soon) */
        <div className="space-y-6">
          {/* Dishes Selection Grid */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-[#193826] mb-3">
              Select Sample Dish to Rebuild
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDishes.map((dish) => {
                const isSelected = selectedDishId === dish.id && dish.available;
                return (
                  <div
                    key={dish.id}
                    onClick={() => {
                      if (dish.available) {
                        setSelectedDishId(dish.id);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 border-[#193826] transition-all relative ${
                      dish.available
                        ? isSelected
                          ? 'bg-[#FFE0CE] ink-shadow ring-2 ring-[#FF7B25] cursor-pointer'
                          : 'bg-[#FFFDF9] hover:bg-[#FFF0C5] cursor-pointer shadow-xs'
                        : 'bg-[#FAF7F2] opacity-70 cursor-not-allowed border-dashed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-serif font-bold text-base text-[#193826]">
                        {dish.name}
                      </h3>
                      {dish.available ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D8EFDF] border border-[#193826] text-[#193826]">
                          Available
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#193826]/10 text-[#193826]">
                          {dish.tag || 'Coming soon'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#193826]/75 mb-2 line-clamp-2">
                      {dish.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#193826]/70">
                      <span>{dish.category}</span>
                      <span>{dish.servings} servings</span>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-[#193826]/20 flex items-center justify-end">
                        <span className="text-xs font-bold text-[#FF7B25] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Selected for rebuild
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* "What will change" card - NO final numbers here as per instructions! */}
          <div className="p-6 rounded-2xl bg-[#D8EFDF] border-2 border-[#193826] ink-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#FF7B25]" />
              <h2 className="font-serif text-xl font-bold text-[#193826]">
                What will change in your rebuilt dish
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#193826]/85 mb-4">
              Our aroma modeling reconstructs the sensory profile of Butter Chicken by targeting key volatile scent compounds:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#193826]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7B25] block mb-1">
                  Salt &amp; Sodium
                </span>
                <p className="text-xs font-semibold text-[#193826]">
                  Table salt replaced by roasted cumin &amp; tangy amchur (dry mango).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#193826]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7B25] block mb-1">
                  Saturated Fat
                </span>
                <p className="text-xs font-semibold text-[#193826]">
                  Heavy dairy butter &amp; cream swapped for silky {allergies.includes('Nuts') ? 'pumpkin seed cream' : 'cashew cream'} paired with bloomed kasuri methi.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#193826]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7B25] block mb-1">
                  Added Sugar
                </span>
                <p className="text-xs font-semibold text-[#193826]">
                  Refined white sugar reduced by caramelizing ripe vine tomatoes to harness natural fructose sweetness.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[#193826]/75 mt-3 italic">
              * Exact nutritional targets and aroma twin percentages will calculate upon pressing &quot;Rebuild my dish&quot;.
            </p>
          </div>

          {/* CUSTOMIZE INGREDIENTS: ONLY 4 TOGGLEABLE CHIPS + LOCKED CORE INGREDIENTS */}
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#193826] ink-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#193826]">
                  Customize Ingredients
                </h3>
                <p className="text-xs text-[#193826]/80 mt-0.5">
                  A toggled-on chip means &quot;rebuild this&quot;. If toggled off, the original ingredient stays (sample estimates apply).
                </p>
              </div>
              {keptCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllToRebuild}
                  className="text-xs font-bold text-[#FF7B25] hover:underline self-start sm:self-auto cursor-pointer"
                >
                  Reset all to Rebuild ({keptCount} kept)
                </button>
              )}
            </div>

            {/* 1. Toggleable Chips (Only these 4 chips) */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#193826]/75 mb-2">
                Rebuild Targets (Toggle to rebuild or keep original)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TOGGLEABLE_INGREDIENTS.map((ingredient) => {
                  const isRebuilding = rebuiltIngredients.includes(ingredient);
                  const penalty = SAMPLE_INGREDIENT_PENALTIES[ingredient];
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => toggleRebuildIngredient(ingredient)}
                      className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isRebuilding
                          ? 'bg-[#D8EFDF] text-[#193826] border-[#193826] ink-shadow-sm hover:translate-y-[-1px]'
                          : 'bg-[#FFE0CE]/60 text-red-950 border-red-400 border-dashed hover:bg-[#FFE0CE]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm">
                            {ingredient}
                          </span>
                        </div>
                        <span className="text-[11px] block mt-0.5 font-medium">
                          {isRebuilding ? (
                            <span className="text-emerald-800 font-semibold">
                              ✓ Rebuild this (sample swap active)
                            </span>
                          ) : (
                            <span className="text-red-700 font-semibold">
                              Original kept: {penalty?.description}
                            </span>
                          )}
                        </span>
                      </div>

                      {isRebuilding ? (
                        <span
                          title="Click to keep original ingredient"
                          className="w-6 h-6 rounded-full bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center text-xs transition-colors shrink-0 border border-red-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span
                          title="Click to rebuild this ingredient"
                          className="w-6 h-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center text-xs transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Locked Core Ingredients (Chicken, Tomato, Kasuri Methi, Ginger-Garlic) */}
            <div className="pt-3 border-t border-[#193826]/15">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#193826]/75 mb-2 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#193826]/60" />
                <span>Core Ingredients (Essential foundation, locked)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CORE_INGREDIENTS.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 border-[#193826]/20 bg-[#FAF7F2] text-[#193826]/75 flex items-center gap-1.5 cursor-not-allowed select-none"
                  >
                    <Lock className="w-3 h-3 text-[#193826]/50 shrink-0" />
                    <span>{ingredient}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#193826]/10 text-[#193826]/70 ml-1">
                      Core
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary CTA button with short loading state */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRebuildClick}
              className={`w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-xl bg-[#FF7B25] text-white text-lg font-bold ink-button flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                isAnalyzing ? 'opacity-85 pointer-events-none' : ''
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing 25,595 aroma molecules...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  <span>Rebuild my dish</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-xs text-[#193826]/75 text-center font-medium">
              {PLATFORM_STATS.scienceNotice} • {PLATFORM_STATS.medicalDisclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
