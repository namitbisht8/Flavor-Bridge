import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  Printer,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Info,
  Check,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { CalculationModal } from './CalculationModal';
import { RebuiltRecipeData, PLATFORM_STATS } from '../data/sampleData';

interface RebuiltRecipeScreenProps {
  recipe: RebuiltRecipeData;
  diet: string;
  allergies: string[];
  rebuiltIngredients: string[];
  onBackToBuild: () => void;
  onBackToDiet: () => void;
}

type TabType = 'swaps' | 'steps' | 'shopping' | 'details';

export const RebuiltRecipeScreen: React.FC<RebuiltRecipeScreenProps> = ({
  recipe,
  allergies,
  onBackToBuild,
  onBackToDiet,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('swaps');
  const [expandedSwaps, setExpandedSwaps] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  // Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    recipe.swaps.forEach((s) => {
      initial[s.id] = true;
    });
    setExpandedSwaps(initial);
  }, [recipe.swaps]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`flavor_bridge_saved_${recipe.dishId}`);
      if (saved) setIsSaved(true);
    } catch {}

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [recipe.dishId]);

  const toggleSwapExpand = (swapId: string) => {
    setExpandedSwaps((prev) => ({
      ...prev,
      [swapId]: !prev[swapId],
    }));
  };

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveRecipe = () => {
    try {
      const nextState = !isSaved;
      setIsSaved(nextState);
      if (nextState) {
        localStorage.setItem(`flavor_bridge_saved_${recipe.dishId}`, 'true');
        showToast('Saved to your notebook!');
      } else {
        localStorage.removeItem(`flavor_bridge_saved_${recipe.dishId}`);
        showToast('Removed from saved.');
      }
    } catch {
      showToast('Bookmark updated.');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out rebuilt ${recipe.dishName} on Flavor Bridge! Sodium: ${recipe.rebuiltSodiumMg}mg (${recipe.flavorMatchLabel}).`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReadAloudToggle = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech not supported in browser.');
      return;
    }

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
      return;
    }

    synth.cancel();

    const fullScript = `${recipe.dishName} steps. ` +
      recipe.cookingSteps
        .map((s) => `Step ${s.stepNumber}, ${s.timeMinutes} minutes: ${s.instruction}`)
        .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const shoppingListTotal = recipe.shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 md:py-8 pb-24 sm:pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#193826] text-white dark:bg-[#1B2A23] dark:border dark:border-[#3F6B57] dark:text-[#F1F6F2] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce ink-shadow">
          <CheckCircle2 className="w-4 h-4 text-[#5FD39A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header: Top dish name & quick back buttons */}
      <div className="flex items-center justify-between gap-3 mb-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#193826] dark:text-[#F1F6F2] tracking-tight">
            {recipe.dishName} (Rebuilt)
          </h1>
          <p className="text-xs sm:text-sm text-[#193826]/75 dark:text-[#BBCDC2] mt-0.5">
            {recipe.tagline}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onBackToBuild}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#1B2A23] hover:bg-[#FFE0CE] dark:hover:bg-[#22332A] text-[#193826] dark:text-[#BBCDC2] cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
          <button
            onClick={onBackToDiet}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#1B2A23] hover:bg-[#D6E8F4] dark:hover:bg-[#22332A] text-[#193826] dark:text-[#BBCDC2] cursor-pointer"
          >
            Diet
          </button>
        </div>
      </div>

      {/* 1. ONE SUMMARY CARD */}
      <div className="mb-4 rounded-2xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#15211B] ink-shadow p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#193826]/10 dark:border-[#3F6B57]/40">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7B25] dark:text-[#FFB34D] block">
              Sodium Rebuild
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#193826] dark:text-[#F1F6F2]">
                {recipe.originalSodiumMg} mg to {recipe.rebuiltSodiumMg} mg
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#D8EFDF] text-[#193826] dark:bg-[#1B2A23] dark:text-[#5FD39A] border border-[#193826]/30 dark:border-[#3F6B57]">
              {recipe.flavorMatchLabel}
            </span>
          </div>
        </div>

        {/* Sodium Progress Bar */}
        <div className="mb-3">
          <div className="w-full h-3 rounded-full border border-[#193826]/30 dark:border-[#3F6B57] bg-emerald-100 dark:bg-[#17382B] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                recipe.isSodiumOverLimit ? 'bg-red-600 dark:bg-[#FF8A80]' : 'bg-emerald-500 dark:bg-[#5FD39A]'
              }`}
              style={{ width: `${Math.min(100, recipe.sodiumLimitPercentage)}%` }}
            />
          </div>

          {/* One-Line Verdict */}
          <div className="flex items-center justify-between text-xs mt-1 font-semibold">
            <span className={recipe.isSodiumOverLimit ? 'text-red-700 dark:text-[#FF8A80] font-bold' : 'text-emerald-800 dark:text-[#5FD39A]'}>
              {recipe.isSodiumOverLimit ? 'Over your 350 mg limit' : 'Within your 350 mg limit'}
            </span>
            <span className="text-[#193826]/70 dark:text-[#8FA89A]">
              {recipe.rebuiltSodiumMg} mg / {recipe.limitSodiumMg} mg target
            </span>
          </div>
        </div>

        {/* Saturated Fat & Added Sugar as two small numbers beside it */}
        <div className="flex items-center gap-4 pt-2 border-t border-[#193826]/10 dark:border-[#3F6B57]/30 text-xs text-[#193826]/80 dark:text-[#BBCDC2]">
          <div>
            <span className="font-semibold text-[#193826]/60 dark:text-[#8FA89A]">Sat fat: </span>
            <strong className="text-[#193826] dark:text-[#F1F6F2]">{recipe.originalSatFatG}g → {recipe.rebuiltSatFatG}g</strong>
            {recipe.satFatReductionPercent > 0 && (
              <span className="text-[10px] text-emerald-700 dark:text-[#5FD39A] font-bold ml-1">
                (-{recipe.satFatReductionPercent}%)
              </span>
            )}
          </div>
          <div>
            <span className="font-semibold text-[#193826]/60 dark:text-[#8FA89A]">Added sugar: </span>
            <strong className="text-[#193826] dark:text-[#F1F6F2]">{recipe.originalAddedSugarG.toFixed(1)}g → {recipe.rebuiltAddedSugarG.toFixed(1)}g</strong>
          </div>
        </div>
      </div>

      {/* 2. ONE ROW BELOW: Cost, Difficulty, Time as small inline items (not big cards) */}
      <div className="mb-5 p-3 rounded-xl border border-[#193826]/30 dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#1B2A23] flex items-center justify-between text-xs font-bold text-[#193826] dark:text-[#BBCDC2]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#193826]/60 dark:text-[#8FA89A]">Cost:</span>
          <span className="dark:text-[#F1F6F2]">Rs {recipe.costPerServing} / serving</span>
        </div>
        <span className="text-[#193826]/40 dark:text-[#3F6B57]">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#193826]/60 dark:text-[#8FA89A]">Difficulty:</span>
          <span className="dark:text-[#F1F6F2]">{recipe.difficulty}</span>
        </div>
        <span className="text-[#193826]/40 dark:text-[#3F6B57]">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#193826]/60 dark:text-[#8FA89A]">Time:</span>
          <span className="dark:text-[#F1F6F2]">{recipe.estimatedTimeMins} mins</span>
        </div>
      </div>

      {/* 3. FOUR TABS WITH ONLY FIRST OPEN (Swaps, Cooking steps, Shopping list, Details) */}
      <div className="mb-6 rounded-2xl border-2 border-[#193826] dark:border-[1.5px] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#15211B] ink-shadow overflow-hidden">
        {/* Tab Header Bar */}
        <div className="flex border-b-2 border-[#193826] dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#101A15]" role="tablist">
          {[
            { id: 'swaps', label: 'Swaps' },
            { id: 'steps', label: 'Cooking steps' },
            { id: 'shopping', label: 'Shopping list' },
            { id: 'details', label: 'Details' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-sm font-bold transition-colors cursor-pointer border-r border-[#193826]/20 dark:border-[#3F6B57] last:border-r-0 ${
                  isActive
                    ? 'bg-[#FF7B25] text-white dark:bg-[#FFB34D] dark:text-[#1A1200]'
                    : 'text-[#193826]/75 dark:text-[#BBCDC2] hover:bg-white/60 dark:hover:bg-[#1B2A23]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Swaps (Plain language: same smell, less salt and fat) */}
        {activeTab === 'swaps' && (
          <div className="p-4 sm:p-5 space-y-3">
            <p className="text-xs text-[#193826]/80 dark:text-[#BBCDC2] mb-2 font-medium">
              Natural swaps that give you the same smell, with less salt and fat.
            </p>
            {recipe.swaps.map((swap) => {
              const isExpanded = !!expandedSwaps[swap.id];
              return (
                <div
                  key={swap.id}
                  className="rounded-xl border border-[#193826]/30 dark:border-[#3F6B57] bg-[#FAF7F2] dark:bg-[#1B2A23] overflow-hidden"
                >
                  <div
                    onClick={() => toggleSwapExpand(swap.id)}
                    className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-bold text-[#193826] dark:text-[#F1F6F2]">
                      <span className="line-through text-red-700 dark:text-[#FF8A80]">
                        {swap.originalIngredient}
                      </span>
                      <span className="text-xs text-[#193826]/60 dark:text-[#8FA89A]">→</span>
                      <span className="text-emerald-800 dark:text-[#5FD39A]">
                        {swap.rebuiltIngredient}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="text-xs text-[#193826]/70 dark:text-[#BBCDC2] flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? 'Hide' : 'Why'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 text-xs text-[#193826]/85 dark:text-[#BBCDC2] leading-relaxed border-t border-[#193826]/10 dark:border-[#3F6B57]/40 bg-white dark:bg-[#15211B]">
                      {swap.whyThisWorks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Cooking Steps */}
        {activeTab === 'steps' && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#193826]/80 dark:text-[#BBCDC2]">
                Check items as you cook
              </span>
              <button
                type="button"
                onClick={handleReadAloudToggle}
                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#D6E8F4] dark:bg-[#1B2A23] text-[#193826] dark:text-[#7CC4F0] flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Read aloud'}</span>
              </button>
            </div>

            {recipe.cookingSteps.map((step) => {
              const isDone = !!completedSteps[step.stepNumber];
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => toggleStepCompleted(step.stepNumber)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-[#12281F] border-emerald-600 dark:border-[#5FD39A] opacity-80'
                      : 'bg-[#FAF7F2] dark:bg-[#1B2A23] border-[#193826]/30 dark:border-[#3F6B57]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-5 h-5 rounded border border-[#193826] dark:border-[#3F6B57] flex items-center justify-center shrink-0 mt-0.5 ${
                        isDone ? 'bg-[#193826] dark:bg-[#5FD39A] text-white dark:text-[#1A1200]' : 'bg-white dark:bg-[#101A15]'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <strong className="text-xs font-serif text-[#193826] dark:text-[#F1F6F2]">
                          Step {step.stepNumber}
                        </strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#193826] dark:text-[#FFB34D]">
                          {step.timeMinutes}m
                        </span>
                      </div>
                      <p className={`text-xs text-[#193826] dark:text-[#BBCDC2] leading-relaxed ${isDone ? 'line-through opacity-70' : ''}`}>
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Shopping List */}
        {activeTab === 'shopping' && (
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs text-[#193826]/75 dark:text-[#BBCDC2]">
                Total basket estimate:
              </span>
              <strong className="font-serif text-lg text-[#193826] dark:text-[#FFB34D]">
                ₹{shoppingListTotal}
              </strong>
            </div>

            <div className="divide-y divide-[#193826]/10 dark:divide-[#3F6B57]/40 border rounded-xl overflow-hidden bg-white dark:bg-[#101A15] border-[#193826]/20 dark:border-[#3F6B57]">
              {recipe.shoppingList.map((item) => (
                <div key={item.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#193826] dark:text-[#F1F6F2] block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#193826]/70 dark:text-[#BBCDC2]">
                      {item.quantity} • ₹{item.estimatedPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://www.amazon.in/s?k=${encodeURIComponent(item.searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded border border-[#193826]/40 dark:border-[#3F6B57] bg-[#FFF0C5] dark:bg-[#1B2A23] text-[10px] font-bold text-[#193826] dark:text-[#FFB34D] flex items-center gap-0.5"
                    >
                      <span>Amazon</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href={`https://www.flipkart.com/search?q=${encodeURIComponent(item.searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded border border-[#193826]/40 dark:border-[#3F6B57] bg-[#D6E8F4] dark:bg-[#1B2A23] text-[10px] font-bold text-[#193826] dark:text-[#7CC4F0] flex items-center gap-0.5"
                    >
                      <span>Flipkart</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Details */}
        {activeTab === 'details' && (
          <div className="p-4 sm:p-5 space-y-3.5 text-xs text-[#193826]/85 dark:text-[#BBCDC2]">
            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1B2A23] border border-[#193826]/20 dark:border-[#3F6B57]">
              <strong className="block text-sm font-serif text-[#193826] dark:text-[#F1F6F2] mb-1">
                Before vs. After Full Comparison
              </strong>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[#193826]/60 dark:text-[#8FA89A] block">Traditional</span>
                  <p>Sodium: {recipe.originalSodiumMg} mg</p>
                  <p>Sat fat: {recipe.originalSatFatG} g</p>
                  <p>Sugar: {recipe.originalAddedSugarG.toFixed(1)} g</p>
                </div>
                <div>
                  <span className="text-emerald-800 dark:text-[#5FD39A] block font-bold">Rebuilt</span>
                  <p>Sodium: {recipe.rebuiltSodiumMg} mg</p>
                  <p>Sat fat: {recipe.rebuiltSatFatG} g</p>
                  <p>Sugar: {recipe.rebuiltAddedSugarG.toFixed(1)} g</p>
                </div>
              </div>
            </div>

            <div>
              <strong className="block font-semibold mb-1 text-[#193826] dark:text-[#F1F6F2]">
                Traditional Ingredients:
              </strong>
              <p className="leading-relaxed">
                {recipe.originalIngredients.join(', ')}.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCalculationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#193826] dark:border-[#3F6B57] bg-[#FFF0C5] dark:bg-[#1B2A23] text-xs font-bold text-[#193826] dark:text-[#FFB34D] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#FF7B25] dark:text-[#FFB34D]" />
                <span>How we calculated this</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Actions Bar */}
      <div className="hidden sm:flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#FFE0CE]/50 dark:bg-[#15211B] border border-[#193826]/30 dark:border-[#3F6B57] mb-4 no-print">
        <span className="text-xs font-bold text-[#193826] dark:text-[#BBCDC2]">
          Actions:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-white dark:bg-[#1B2A23] text-xs font-bold text-[#193826] dark:text-[#5FD39A] hover:bg-[#D8EFDF] flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={handleSaveRecipe}
            className="px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-white dark:bg-[#1B2A23] text-xs font-bold text-[#193826] dark:text-[#FFB34D] hover:bg-[#FFF0C5] flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-[#193826] dark:border-[#3F6B57] bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (Share, Save, Read aloud) */}
      <div className="sticky bottom-0 z-20 bg-[#FFFDF9]/95 dark:bg-[#15211B]/95 backdrop-blur-md py-2 px-3 border-t-2 border-[#193826] dark:border-[#3F6B57] flex items-center justify-between gap-2 sm:hidden -mx-4 -mb-24 ink-shadow-sm">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="flex-1 py-2 px-2 rounded-xl bg-white dark:bg-[#1B2A23] border border-[#193826] dark:border-[#3F6B57] text-xs font-bold text-[#193826] dark:text-[#5FD39A] flex items-center justify-center gap-1 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={handleSaveRecipe}
          className="flex-1 py-2 px-2 rounded-xl bg-white dark:bg-[#1B2A23] border border-[#193826] dark:border-[#3F6B57] text-xs font-bold text-[#193826] dark:text-[#FFB34D] flex items-center justify-center gap-1 cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        <button
          type="button"
          onClick={handleReadAloudToggle}
          className="flex-1 py-2 px-2 rounded-xl bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Read'}</span>
        </button>
      </div>

      {/* How We Calculated This Modal */}
      <CalculationModal
        isOpen={showCalculationModal}
        onClose={() => setShowCalculationModal(false)}
      />
    </div>
  );
};
