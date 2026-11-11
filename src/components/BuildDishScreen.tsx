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
  DISH_CORE_INGREDIENTS,
  DISH_SAMPLE_PENALTIES,
  DISH_WHAT_WILL_CHANGE,
} from '../data/sampleData';
import { getAvailableDishesForDiet } from '../services/recipeService';

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

  const availableForDiet = getAvailableDishesForDiet(diet);

  // If current selected dish is not in availableForDiet, select the first available
  React.useEffect(() => {
    if (availableForDiet.length > 0 && !availableForDiet.some((d) => d.id === selectedDishId)) {
      setSelectedDishId(availableForDiet[0].id);
    }
  }, [availableForDiet, selectedDishId, setSelectedDishId]);

  // Available dishes filtered by search
  const filteredDishes = availableForDiet.filter((d) =>
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
      if (diet === 'Vegetarian' || diet === 'Vegan') {
        setSelectedDishId('dal-chawal');
      } else {
        setSelectedDishId('butter-chicken');
      }
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
  const currentDish = DISHES_CATALOG.find((d) => d.id === selectedDishId);
  const whatWillChange = DISH_WHAT_WILL_CHANGE[selectedDishId] || DISH_WHAT_WILL_CHANGE['butter-chicken'];
  const dishPenalties = DISH_SAMPLE_PENALTIES[selectedDishId] || SAMPLE_INGREDIENT_PENALTIES;
  const coreIngredients = DISH_CORE_INGREDIENTS[selectedDishId] || CORE_INGREDIENTS;

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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D8EFDF] dark:bg-[#1B2A23] border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] text-[#193826] dark:text-[#BBCDC2]">
              <CookingPot className="w-3.5 h-3.5 text-[#193826] dark:text-[#5FD39A]" />
              <span>Step 2: Build Dish</span>
            </span>
            <SampleBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#193826] dark:text-[#F1F6F2] tracking-tight">
            Select and customize your dish
          </h1>
          <p className="text-sm text-[#193826]/80 dark:text-[#BBCDC2] mt-1">
            Current diet: <strong className="text-[#193826] dark:text-[#F1F6F2] underline">{diet}</strong>
            {allergies.length > 0 && !allergies.includes('None') && (
              <span> • Allergies: {allergies.join(', ')}</span>
            )}
          </p>
        </div>

        <button
          onClick={onBackToDiet}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#1B2A23] hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] dark:hover:text-[#F1F6F2] text-[#193826] dark:text-[#BBCDC2] transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Change Profile</span>
        </button>
      </div>

      {/* Search Bar + Voice Mic + Photo Upload */}
      <div className="mb-6 p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#193826]/60 dark:text-[#8FA89A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian classics (e.g. Butter Chicken, Rajma)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-white dark:bg-[#101A15] text-sm text-[#193826] dark:text-[#F1F6F2] dark:placeholder-[#8FA89A] focus:outline-none focus:ring-2 focus:ring-[#FF7B25] dark:focus:ring-[#FFB34D] transition-colors duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#193826]/60 dark:text-[#8FA89A] hover:text-[#193826] dark:hover:text-[#F1F6F2] transition-colors duration-150"
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
              className="px-2.5 py-2.5 rounded-xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] text-xs font-bold bg-[#FFF0C5] dark:bg-[#1B2A23] text-[#193826] dark:text-[#BBCDC2] hover:bg-[#ffe6a4] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] dark:hover:text-[#F1F6F2] transition-colors duration-150 cursor-pointer shrink-0"
            >
              {speechLang === 'en-IN' ? 'EN (IN)' : 'HI (IN)'}
            </button>

            {/* Mic Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              title="Voice search dish"
              aria-label="Voice search dish"
              className={`p-2.5 rounded-xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] font-bold transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#D6E8F4] dark:bg-[#1B2A23] text-[#193826] dark:text-[#7CC4F0] hover:bg-[#bce0f8] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283]'
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
              className="px-3 py-2.5 rounded-xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] text-xs font-bold bg-[#FFE0CE] dark:bg-[#1B2A23] text-[#193826] dark:text-[#FFB34D] hover:bg-[#ffd1ba] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] transition-colors duration-150 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Camera className="w-4 h-4 text-[#193826] dark:text-[#FFB34D]" />
              <span className="hidden xs:inline">Snap photo</span>
            </button>
          </div>
        </div>

        {speechStatus && (
          <div className="mt-2.5 text-xs font-semibold text-[#193826] dark:text-[#BBCDC2] bg-[#FFF0C5] dark:bg-[#1B2A23] px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57]">
            {speechStatus}
          </div>
        )}

        {photoUploaded && (
          <div className="mt-2.5 text-xs font-semibold text-[#193826] dark:text-[#5FD39A] bg-[#D8EFDF] dark:bg-[#1B2A23] px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] flex items-center justify-between">
            <span>Photo captured: <strong className="text-[#193826] dark:text-[#F1F6F2]">{photoUploaded}</strong> (matched Butter Chicken flavor profile)</span>
            <button
              onClick={() => setPhotoUploaded(null)}
              className="text-[#193826] dark:text-[#BBCDC2] hover:text-red-700 dark:hover:text-[#FF8A80] ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* If no dishes are available for diet */}
      {availableForDiet.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#FFF0C5] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FFE0CE] dark:bg-[#22332A] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] flex items-center justify-center mx-auto mb-4 ink-shadow-sm">
            <AlertCircle className="w-7 h-7 text-[#FF7B25] dark:text-[#FFB34D]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#193826] dark:text-[#F1F6F2] mb-2">
            No sample dish for this diet
          </h2>
          <p className="text-sm md:text-base text-[#193826]/85 dark:text-[#BBCDC2] max-w-lg mx-auto mb-6 leading-relaxed">
            There is currently no sample dish configured for the <strong className="text-[#193826] dark:text-[#F1F6F2]">{diet}</strong> profile. Please select another diet profile to explore available dishes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setDiet('Non-veg')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FF7B25] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] dark:border-[1.5px] dark:border-[#3F6B57] font-bold ink-button cursor-pointer text-sm"
            >
              Switch to Non-veg
            </button>
            <button
              onClick={() => setDiet('Vegetarian')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#D6E8F4] dark:bg-[#1B2A23] text-[#193826] dark:text-[#F1F6F2] font-bold border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] hover:bg-[#bce0f8] dark:hover:border-[#5FD39A]/60 cursor-pointer text-sm"
            >
              Switch to Vegetarian
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dishes Selection Grid */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-[#193826] dark:text-[#F1F6F2] mb-3">
              Select Sample Dish to Rebuild
            </label>
            {filteredDishes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/70 dark:bg-[#15211B] border-2 border-[#193826] dark:border-[#3F6B57]">
                <p className="text-sm font-bold text-[#193826] dark:text-[#F1F6F2]">
                  No dishes match &quot;{searchQuery}&quot; for your current {diet} profile.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-[#FF7B25] dark:text-[#FFB34D] underline cursor-pointer"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredDishes.map((dish) => {
                  const isSelected = selectedDishId === dish.id;
                  return (
                    <div
                      key={dish.id}
                      onClick={() => setSelectedDishId(dish.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-150 relative cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFE0CE] dark:bg-[#15211B] border-[#193826] dark:border-[2.5px] dark:border-[#FFB34D] ink-shadow ring-2 ring-[#FF7B25] dark:ring-0 dark:shadow-[0_0_0_4px_rgba(255,179,77,0.18),3px_3px_0_rgba(0,0,0,0.45)] dark:hover:shadow-[0_0_0_4px_rgba(255,179,77,0.28),3px_3px_0_rgba(0,0,0,0.45)] translate-y-[-2px]'
                          : 'bg-[#FFFDF9] dark:bg-[#15211B] border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] hover:bg-[#FFF0C5] dark:hover:bg-[#1B2A23] dark:hover:border-[#5FA283] dark:hover:translate-y-[-2px] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-serif font-bold text-base text-[#193826] dark:text-[#F1F6F2]">
                          {dish.name}
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D8EFDF] dark:bg-[#1B2A23] border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] text-[#193826] dark:text-[#5FD39A]">
                          Available
                        </span>
                      </div>

                      <p className="text-xs text-[#193826]/75 dark:text-[#8FA89A] mb-2 line-clamp-2">
                        {dish.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#193826]/70 dark:text-[#8FA89A]">
                        <span>{dish.category}</span>
                        <span>{dish.servings} servings</span>
                      </div>

                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-[#193826]/20 dark:border-[#3F6B57]/40 flex items-center justify-end">
                          <span className="text-xs font-bold text-[#FF7B25] dark:text-[#FFB34D] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected for rebuild
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* "What will change" card */}
          <div className="p-6 rounded-2xl bg-[#D8EFDF] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#FF7B25] dark:text-[#FFB34D]" />
              <h2 className="font-serif text-xl font-bold text-[#193826] dark:text-[#F1F6F2]">
                What will change in your rebuilt dish
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#193826]/85 dark:text-[#BBCDC2] mb-4">
              Our aroma modeling reconstructs the sensory profile of {currentDish?.name || 'your dish'} by targeting key volatile scent compounds:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {whatWillChange.map((item) => {
                const desc = allergies.includes('Nuts')
                  ? item.description.replace(/cashew cream/gi, 'pumpkin seed cream')
                  : item.description;
                return (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-xl bg-white/90 dark:bg-[#1B2A23] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57]"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7B25] dark:text-[#FFB34D] block mb-1">
                      {item.title}
                    </span>
                    <p className="text-xs font-semibold text-[#193826] dark:text-[#BBCDC2]">
                      {desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#193826]/75 dark:text-[#8FA89A] mt-3 italic">
              * Exact nutritional targets and aroma twin percentages will calculate upon pressing &quot;Rebuild my dish&quot;.
            </p>
          </div>

          {/* CUSTOMIZE INGREDIENTS: ONLY 4 TOGGLEABLE CHIPS + LOCKED CORE INGREDIENTS */}
          <div className="p-6 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#193826] dark:text-[#F1F6F2]">
                  Customize Ingredients
                </h3>
                <p className="text-xs text-[#193826]/80 dark:text-[#BBCDC2] mt-0.5">
                  A toggled-on chip means &quot;rebuild this&quot;. If toggled off, the original ingredient stays (sample estimates apply).
                </p>
              </div>
              {keptCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllToRebuild}
                  className="text-xs font-bold text-[#FF7B25] dark:text-[#FFB34D] hover:underline self-start sm:self-auto cursor-pointer"
                >
                  Reset all to Rebuild ({keptCount} kept)
                </button>
              )}
            </div>

            {/* 1. Toggleable Chips (Only these 4 chips) */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#193826]/75 dark:text-[#8FA89A] mb-2">
                Rebuild Targets (Toggle to rebuild or keep original)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TOGGLEABLE_INGREDIENTS.map((ingredient) => {
                  const isRebuilding = rebuiltIngredients.includes(ingredient);
                  const penalty = dishPenalties[ingredient] || SAMPLE_INGREDIENT_PENALTIES[ingredient];
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => toggleRebuildIngredient(ingredient)}
                      className={`p-3 rounded-xl text-left border-2 transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 ${
                        isRebuilding
                          ? 'bg-[#D8EFDF] text-[#193826] border-[#193826] dark:bg-[#1B2A23] dark:text-[#F1F6F2] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow-sm hover:translate-y-[-1px] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283]'
                          : 'bg-[#FFE0CE]/60 text-red-950 border-red-400 dark:bg-[#241618] dark:text-[#FF8A80] dark:border-[#FF8A80] border-dashed hover:bg-[#FFE0CE] dark:hover:bg-[#2e191c] dark:hover:border-[#FF8A80]'
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
                            <span className="text-emerald-800 dark:text-[#5FD39A] font-semibold">
                              ✓ Rebuild this (sample swap active)
                            </span>
                          ) : (
                            <span className="text-red-700 dark:text-[#FF8A80] font-semibold">
                              Original kept: {penalty?.description}
                            </span>
                          )}
                        </span>
                      </div>

                      {isRebuilding ? (
                        <span
                          title="Click to keep original ingredient"
                          className="w-6 h-6 rounded-full bg-red-100 dark:bg-[#241618] text-red-700 dark:text-[#FF8A80] hover:bg-red-600 dark:hover:bg-[#FF8A80] hover:text-white dark:hover:text-[#1A1200] flex items-center justify-center text-xs transition-colors shrink-0 border border-red-300 dark:border-[#FF8A80]/40"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span
                          title="Click to rebuild this ingredient"
                          className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-[#5FD39A] text-white dark:text-[#1A1200] hover:bg-emerald-700 dark:hover:bg-[#7be2af] flex items-center justify-center text-xs transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Locked Core Ingredients */}
            <div className="pt-3 border-t border-[#193826]/15 dark:border-[#3F6B57]/30">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#193826]/75 dark:text-[#8FA89A] mb-2 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#193826]/60 dark:text-[#8FA89A]" />
                <span>Core Ingredients (Essential foundation, locked)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {coreIngredients.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 border-[#193826]/20 dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#101A15] text-[#193826]/75 dark:text-[#8FA89A] flex items-center gap-1.5 cursor-not-allowed select-none"
                  >
                    <Lock className="w-3 h-3 text-[#193826]/50 dark:text-[#8FA89A]" />
                    <span>{ingredient}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#193826]/10 dark:bg-[#1B2A23] text-[#193826]/70 dark:text-[#BBCDC2] ml-1">
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
              className={`w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-xl bg-[#FF7B25] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] dark:border-[1.5px] dark:border-[#3F6B57] hover:bg-[#E86A18] dark:hover:bg-[#FFC266] text-lg font-bold ink-button flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition-all duration-150 ${
                isAnalyzing ? 'opacity-85 pointer-events-none' : ''
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white dark:border-[#1A1200] border-t-transparent rounded-full animate-spin" />
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

            <p className="text-xs text-[#193826]/75 dark:text-[#8FA89A] text-center font-medium">
              {PLATFORM_STATS.scienceNotice} • {PLATFORM_STATS.medicalDisclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
