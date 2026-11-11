import React, { useState, useRef } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Camera,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  X,
  Check,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  DISHES_CATALOG,
  TOGGLEABLE_INGREDIENTS,
  DISH_CORE_INGREDIENTS,
  CORE_INGREDIENTS,
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

  // If selected dish is not available for current diet, switch to first available
  React.useEffect(() => {
    if (availableForDiet.length > 0 && !availableForDiet.some((d) => d.id === selectedDishId)) {
      setSelectedDishId(availableForDiet[0].id);
    }
  }, [availableForDiet, selectedDishId, setSelectedDishId]);

  const filteredDishes = availableForDiet.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.hindiName && d.hindiName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleRebuildIngredient = (ingredientName: string) => {
    setRebuiltIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((item) => item !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  // Browser speech recognition with tap-to-change language inside mic button
  const handleMicToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechStatus('Speech recognition not supported in this browser.');
      setTimeout(() => setSpeechStatus(null), 3000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
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
        setSpeechStatus(`Listening (${speechLang === 'en-IN' ? 'English' : 'Hindi'})...`);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        setSpeechStatus(`Recognized: "${transcript}"`);
        setTimeout(() => setSpeechStatus(null), 3000);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechStatus('Could not recognize voice query.');
        setTimeout(() => setSpeechStatus(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechStatus('Microphone access unavailable.');
      setTimeout(() => setSpeechStatus(null), 3000);
    }
  };

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

  const handleRebuildClick = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onRebuild();
    }, 800);
  };

  const coreIngredients = DISH_CORE_INGREDIENTS[selectedDishId] || CORE_INGREDIENTS;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 md:py-8">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Screen Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#193826] dark:text-[#F1F6F2] tracking-tight">
            Pick a dish
          </h1>
          <p className="text-xs sm:text-sm text-[#193826]/75 dark:text-[#BBCDC2] mt-0.5">
            Current diet: <strong className="text-[#193826] dark:text-[#F1F6F2]">{diet}</strong>
            {allergies.length > 0 && !allergies.includes('None') && (
              <span> • Allergies: {allergies.join(', ')}</span>
            )}
          </p>
        </div>

        <button
          onClick={onBackToDiet}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#1B2A23] hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] text-[#193826] dark:text-[#BBCDC2] cursor-pointer flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Change diet</span>
        </button>
      </div>

      {/* 1. DISH CARDS FIRST (Title, one line, time) */}
      <div className="mb-5">
        {filteredDishes.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-white/70 dark:bg-[#15211B] border-2 border-[#193826] dark:border-[#3F6B57]">
            <p className="text-sm font-bold text-[#193826] dark:text-[#F1F6F2]">
              No dishes match &quot;{searchQuery}&quot; for your current {diet} profile.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-[#FF7B25] dark:text-[#FFB34D] underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDishes.map((dish) => {
              const isSelected = selectedDishId === dish.id;
              return (
                <div
                  key={dish.id}
                  onClick={() => setSelectedDishId(dish.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all duration-150 relative cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE0CE] dark:bg-[#15211B] border-[#193826] dark:border-[2.5px] dark:border-[#FFB34D] ink-shadow ring-2 ring-[#FF7B25] dark:ring-0 translate-y-[-2px]'
                      : 'bg-[#FFFDF9] dark:bg-[#15211B] border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] hover:bg-[#FFF0C5] dark:hover:bg-[#1B2A23] dark:hover:border-[#5FA283]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <h3 className="font-serif font-bold text-base text-[#193826] dark:text-[#F1F6F2] leading-tight">
                      {dish.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#193826]/70 dark:text-[#8FA89A] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {dish.estimatedTimeMins}m
                    </span>
                  </div>

                  <p className="text-xs text-[#193826]/75 dark:text-[#BBCDC2] line-clamp-1 mb-2 font-medium">
                    {dish.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#193826]/70 dark:text-[#8FA89A] pt-1.5 border-t border-[#193826]/10 dark:border-[#3F6B57]/40">
                    <span>{dish.category}</span>
                    {isSelected ? (
                      <span className="text-xs font-bold text-[#FF7B25] dark:text-[#FFB34D] flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Selected
                      </span>
                    ) : (
                      <span>{dish.servings} servings</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Search bar with mic and camera only (language switch inside mic button) */}
      <div className="mb-5 p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#193826]/60 dark:text-[#8FA89A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Rajma, Butter Chicken)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#193826]/40 dark:border-[#3F6B57] bg-white dark:bg-[#101A15] text-xs sm:text-sm text-[#193826] dark:text-[#F1F6F2] focus:outline-none focus:ring-2 focus:ring-[#FF7B25] dark:focus:ring-[#FFB34D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#193826]/60 dark:text-[#8FA89A] hover:text-[#193826] dark:hover:text-[#F1F6F2]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mic Button with language switch integrated inside as tap-to-change */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={handleMicToggle}
              title={`Voice search (${speechLang === 'en-IN' ? 'English' : 'Hindi'}). Tap EN/HI to switch.`}
              aria-label="Voice search dish"
              className={`px-2.5 py-2 rounded-xl border border-[#193826] dark:border-[#3F6B57] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#D6E8F4] dark:bg-[#1B2A23] text-[#193826] dark:text-[#7CC4F0] hover:bg-[#bce0f8] dark:hover:bg-[#22332A]'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeechLang((prev) => (prev === 'en-IN' ? 'hi-IN' : 'en-IN'));
                }}
                className="text-[10px] font-extrabold uppercase px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20"
                title="Tap to switch voice language"
              >
                {speechLang === 'en-IN' ? 'EN' : 'HI'}
              </span>
            </button>
          </div>

          {/* Camera Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Snap or upload dish photo"
            aria-label="Snap photo"
            className="p-2 sm:px-2.5 rounded-xl border border-[#193826] dark:border-[#3F6B57] text-xs font-bold bg-[#FFE0CE] dark:bg-[#1B2A23] text-[#193826] dark:text-[#FFB34D] hover:bg-[#ffd1ba] dark:hover:bg-[#22332A] cursor-pointer flex items-center gap-1"
          >
            <Camera className="w-4 h-4 text-[#193826] dark:text-[#FFB34D]" />
            <span className="hidden sm:inline">Photo</span>
          </button>
        </div>

        {speechStatus && (
          <div className="mt-2 text-xs font-semibold text-[#193826] dark:text-[#BBCDC2] bg-[#FFF0C5] dark:bg-[#1B2A23] px-2.5 py-1 rounded-lg">
            {speechStatus}
          </div>
        )}

        {photoUploaded && (
          <div className="mt-2 text-xs font-semibold text-[#193826] dark:text-[#5FD39A] bg-[#D8EFDF] dark:bg-[#1B2A23] px-2.5 py-1 rounded-lg flex items-center justify-between">
            <span>Photo captured: <strong>{photoUploaded}</strong></span>
            <button
              onClick={() => setPhotoUploaded(null)}
              className="text-[#193826] dark:text-[#BBCDC2] hover:text-red-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Remove from this dish */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] ink-shadow">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#193826] dark:text-[#F1F6F2] mb-2.5">
          Remove from this dish
        </h2>

        {/* 4 Toggleable Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {TOGGLEABLE_INGREDIENTS.map((ingredient) => {
            const isRebuilding = rebuiltIngredients.includes(ingredient);
            return (
              <button
                key={ingredient}
                type="button"
                onClick={() => toggleRebuildIngredient(ingredient)}
                className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isRebuilding
                    ? 'bg-[#D8EFDF] text-[#193826] border-[#193826] dark:bg-[#1B2A23] dark:text-[#F1F6F2] dark:border-[#3F6B57]'
                    : 'bg-[#FFE0CE]/60 text-red-950 border-red-400 dark:bg-[#241618] dark:text-[#FF8A80] dark:border-[#FF8A80]'
                }`}
              >
                <span className="font-bold text-xs sm:text-sm">
                  {ingredient}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  isRebuilding
                    ? 'bg-[#193826] text-white dark:bg-[#5FD39A] dark:text-[#1A1200]'
                    : 'bg-red-200 text-red-900 dark:bg-[#34171A] dark:text-[#FF8A80]'
                }`}>
                  {isRebuilding ? 'Swapped' : 'Kept'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Replaced large panel with one small line */}
        <p className="text-xs text-[#193826]/75 dark:text-[#BBCDC2] font-medium pt-1">
          We will swap salt, sugar, butter and cream for natural alternatives.
        </p>

        {/* Core Ingredients with Lock Icon and no explanation text */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#193826]/15 dark:border-[#3F6B57]/30">
          {coreIngredients.map((ingredient) => (
            <span
              key={ingredient}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAF7F2] dark:bg-[#101A15] border border-[#193826]/20 dark:border-[#3F6B57] text-[#193826]/75 dark:text-[#8FA89A] flex items-center gap-1 select-none"
            >
              <Lock className="w-3 h-3 text-[#193826]/50 dark:text-[#8FA89A]" />
              <span>{ingredient}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ONE Primary Button: "Rebuild my dish" (Saffron, Sticky on phones) */}
      <div className="sticky bottom-0 z-20 bg-[#FFFDF9]/95 dark:bg-[#15211B]/95 backdrop-blur-md pt-3 pb-3 sm:static sm:bg-transparent sm:pt-4 flex flex-col items-center">
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleRebuildClick}
          className={`w-full sm:w-auto min-w-[280px] py-3.5 px-8 rounded-xl bg-[#FF7B25] text-white dark:bg-[#FFB34D] dark:text-[#1A1200] hover:bg-[#E86A18] dark:hover:bg-[#FFC266] text-base sm:text-lg font-bold ink-button flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
            isAnalyzing ? 'opacity-85 pointer-events-none' : ''
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white dark:border-[#1A1200] border-t-transparent rounded-full animate-spin" />
              <span>Rebuilding dish...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Rebuild my dish</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
