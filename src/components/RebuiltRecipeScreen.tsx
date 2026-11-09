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
  Clock,
  Gauge,
  Wallet,
  CheckCircle2,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { SampleBadge } from './SampleBadge';
import { RebuiltRecipeData, PLATFORM_STATS } from '../data/sampleData';

interface RebuiltRecipeScreenProps {
  recipe: RebuiltRecipeData;
  diet: string;
  allergies: string[];
  rebuiltIngredients: string[];
  onBackToBuild: () => void;
  onBackToDiet: () => void;
}

export const RebuiltRecipeScreen: React.FC<RebuiltRecipeScreenProps> = ({
  recipe,
  allergies,
  onBackToBuild,
  onBackToDiet,
}) => {
  const [expandedSwaps, setExpandedSwaps] = useState<Record<string, boolean>>({
    'swap-salt': true,
    'swap-butter-cream': true,
  });
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`flavor_bridge_saved_${recipe.dishId}`);
      if (saved) setIsSaved(true);
    } catch {
      // localStorage fallback
    }

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

  const handleSaveRecipe = () => {
    try {
      const nextState = !isSaved;
      setIsSaved(nextState);
      if (nextState) {
        localStorage.setItem(`flavor_bridge_saved_${recipe.dishId}`, 'true');
        showToast('Recipe saved to your browser notebook!');
      } else {
        localStorage.removeItem(`flavor_bridge_saved_${recipe.dishId}`);
        showToast('Recipe removed from saved notebook.');
      }
    } catch {
      showToast('Recipe bookmark updated!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this rebuilt ${recipe.dishName} recipe on Flavor Bridge! Sodium: ${recipe.rebuiltSodiumMg}mg (sample estimate) with ${recipe.flavorMatchLabel}!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Browser speech synthesis to read the actual Butter Chicken steps
  const handleReadAloudToggle = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported on this browser.');
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

    const fullScript = `Rebuilt ${recipe.dishName} cooking steps. ` +
      recipe.cookingSteps
        .map((s) => `Step ${s.stepNumber}, approximately ${s.timeMinutes} minutes: ${s.instruction}`)
        .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

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

  // Compute live shopping list total
  const shoppingListTotal = recipe.shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#193826] text-white px-4 py-2.5 rounded-xl border-2 border-[#FAF7F2] ink-shadow text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#D8EFDF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header with Sample Data Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D8EFDF] border border-[#193826] text-[#193826]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7B25]" />
              <span>Step 3: Rebuilt Recipe</span>
            </span>
            <SampleBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#193826] tracking-tight">
            {recipe.dishName} (Rebuilt)
          </h1>
          <p className="text-sm text-[#193826]/80 mt-1">
            {recipe.tagline}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onBackToBuild}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#193826] bg-[#FFFDF9] hover:bg-[#FFE0CE] text-[#193826] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
          <button
            onClick={onBackToDiet}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#193826] bg-[#FFFDF9] hover:bg-[#D6E8F4] text-[#193826] transition-colors cursor-pointer"
          >
            Diet Profile
          </button>
        </div>
      </div>

      {/* Print only Header */}
      <div className="hidden print:block mb-4 pb-2 border-b">
        <h1 className="text-2xl font-serif font-bold text-black">{recipe.dishName} — Flavor Bridge Recipe Guide</h1>
        <p className="text-xs text-gray-700">{recipe.disclaimer}</p>
      </div>

      {/* Red Sodium Limit Warning Banner if salt kept */}
      {recipe.isSodiumOverLimit && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-500 text-red-950 ink-shadow flex items-start gap-3 animate-in fade-in duration-200">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="font-serif font-bold text-base text-red-900">
                {recipe.sodiumWarning || 'Over your 350 mg limit'}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-200 text-red-900 border border-red-300">
                Sample estimate
              </span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              Because original refined table salt was kept (+520 mg sodium sample estimate), the total rebuilt sodium reaches <strong>{recipe.rebuiltSodiumMg} mg</strong> ({recipe.sodiumLimitPercentage}% of your {recipe.limitSodiumMg} mg limit). To stay under limit, toggle &quot;Refined table salt&quot; back on in Step 2.
            </p>
          </div>
        </div>
      )}

      {/* BEFORE VS AFTER CARD */}
      <div className="mb-6 rounded-2xl border-2 border-[#193826] bg-[#FFFDF9] ink-shadow overflow-hidden">
        <div className="p-4 sm:p-5 bg-[#193826] text-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#FF7B25] block">
              Aroma Match Rebuild
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              Before vs. After Profile
            </h2>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Requirement 4: Show "94% Flavor Match (sample)" until live data is connected */}
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#D8EFDF] text-[#193826] border border-white">
              {recipe.flavorMatchLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-[#193826]">
          {/* Before Column */}
          <div className="p-4 sm:p-5 bg-[#FFE0CE]/40">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-900 bg-red-100 px-2.5 py-0.5 rounded-md border border-red-300">
                Traditional Recipe
              </span>
              <span className="text-xs font-bold text-red-800">
                {recipe.sodiumLimitComparison}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#193826] mb-1">
                  <span>Sodium Content (Sample estimate)</span>
                  <span className="text-red-700 text-sm font-extrabold">{recipe.originalSodiumMg} mg</span>
                </div>
                <div className="w-full h-3 bg-red-100 rounded-full border border-red-300 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-[11px] text-red-700 font-medium mt-0.5 block">
                  Original recipe exceeds normal target limit ({recipe.limitSodiumMg} mg)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#193826]/10 text-xs">
                <div>
                  <span className="text-[#193826]/70 block font-semibold">Saturated Fat</span>
                  <span className="font-bold text-[#193826] text-sm">{recipe.originalSatFatG} g</span>
                </div>
                <div>
                  <span className="text-[#193826]/70 block font-semibold">Added Sugar</span>
                  <span className="font-bold text-[#193826] text-sm">{recipe.originalAddedSugarG.toFixed(1)} g</span>
                </div>
              </div>

              <div className="text-[11px] text-[#193826]/70 font-medium">
                Ingredients: Salted dairy butter, heavy cream, refined table salt, refined white sugar.
              </div>
            </div>
          </div>

          {/* After Column */}
          <div className="p-4 sm:p-5 bg-[#D8EFDF]/40">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 bg-[#D8EFDF] px-2.5 py-0.5 rounded-md border border-emerald-600">
                Flavor Bridge Rebuilt
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {PLATFORM_STATS.scienceNotice} (sample estimates)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#193826] mb-1">
                  <span>Sodium (Target Limit: {recipe.limitSodiumMg} mg)</span>
                  <span className={`text-sm font-extrabold flex items-center gap-1.5 ${
                    recipe.isSodiumOverLimit ? 'text-red-700' : 'text-emerald-800'
                  }`}>
                    {recipe.rebuiltSodiumMg} mg
                    <span className="text-xs font-semibold">({recipe.sodiumLimitPercentage}%)</span>
                  </span>
                </div>

                {/* Sodium bar strictly reflecting calculated sodium relative to 350 mg limit */}
                <div className={`relative w-full h-3 rounded-full border overflow-hidden ${
                  recipe.isSodiumOverLimit ? 'bg-red-100 border-red-400' : 'bg-emerald-100 border-emerald-400'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      recipe.isSodiumOverLimit ? 'bg-red-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, recipe.sodiumLimitPercentage)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-semibold mt-0.5">
                  <span className={recipe.isSodiumOverLimit ? 'text-red-800 font-bold' : 'text-emerald-800'}>
                    {recipe.rebuiltSodiumMg} mg / {recipe.limitSodiumMg} mg limit
                  </span>
                  {recipe.isSodiumOverLimit ? (
                    <span className="text-red-700 font-bold uppercase tracking-wider">
                      Over your 350 mg limit
                    </span>
                  ) : (
                    <span className="text-emerald-800">
                      Safe room: {recipe.limitSodiumMg - recipe.rebuiltSodiumMg} mg
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#193826]/10 text-xs">
                <div>
                  <span className="text-[#193826]/70 block font-semibold">Saturated Fat</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {recipe.rebuiltSatFatG} g{' '}
                    {recipe.satFatReductionPercent > 0 && (
                      <span className="text-[10px] text-emerald-700 font-extrabold">
                        (-{recipe.satFatReductionPercent}%)
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[#193826]/70 block font-semibold">Added Sugar</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {recipe.rebuiltAddedSugarG.toFixed(1)} g{' '}
                    {recipe.rebuiltAddedSugarG < recipe.originalAddedSugarG && (
                      <span className="text-[10px] text-emerald-700 font-extrabold">
                        (-{Math.round(((recipe.originalAddedSugarG - recipe.rebuiltAddedSugarG) / recipe.originalAddedSugarG) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#193826]/80 font-medium">
                {recipe.rebuiltIngredients.includes('Refined table salt')
                  ? 'Rebuilt with roasted cumin + amchur. '
                  : 'Table salt kept. '}
                {recipe.rebuiltIngredients.includes('Heavy dairy cream') || recipe.rebuiltIngredients.includes('Salted table butter & ghee')
                  ? `Rebuilt with ${allergies.includes('Nuts') ? 'pumpkin seed cream' : 'cashew cream'} & bloomed kasuri methi.`
                  : 'Dairy butter and cream kept.'}
              </div>
            </div>
          </div>
        </div>

        {recipe.keptIngredients.length > 0 && (
          <div className="p-3 bg-[#FFF0C5] border-t-2 border-[#193826] text-xs font-semibold text-[#193826] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FF7B25] shrink-0" />
            <span>
              <strong>Sample estimates applied for kept ingredients:</strong> {recipe.keptIngredients.join(', ')} retained original formulation.
            </span>
          </div>
        )}
      </div>

      {/* QUICK STATS ROW: ALL THREE CARDS CORRECT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Card 1: Estimated Cost */}
        <div className="p-4 rounded-xl border-2 border-[#193826] bg-[#FFF0C5] ink-shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#193826] flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-[#FF7B25]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193826]/70 block">
              Estimated Cost
            </span>
            <span className="font-serif text-lg font-bold text-[#193826] block leading-tight">
              Rs {recipe.costPerServing} / serving
            </span>
          </div>
        </div>

        {/* Card 2: Difficulty */}
        <div className="p-4 rounded-xl border-2 border-[#193826] bg-[#D8EFDF] ink-shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#193826] flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193826]/70 block">
              Difficulty
            </span>
            <span className="font-serif text-lg font-bold text-[#193826] block leading-tight">
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Card 3: Estimated Time */}
        <div className="p-4 rounded-xl border-2 border-[#193826] bg-[#D6E8F4] ink-shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#193826] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-sky-800" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193826]/70 block">
              Estimated Time
            </span>
            <span className="font-serif text-lg font-bold text-[#193826] block leading-tight">
              {recipe.estimatedTimeMins} mins
            </span>
          </div>
        </div>
      </div>

      {/* SMELL-TWIN SWAPS */}
      <div className="mb-6 p-5 sm:p-6 rounded-2xl border-2 border-[#193826] bg-[#FFFDF9] ink-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#FF7B25]" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#193826]">
            Smell-Twin Aroma Swaps
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#193826]/80 mb-4 font-medium">
          Culinary aroma science matches volatilized flavor twins so your palate experiences traditional indulgence without high sodium or saturated fat.
        </p>

        <div className="space-y-3.5">
          {recipe.swaps.map((swap) => {
            const isExpanded = !!expandedSwaps[swap.id];
            return (
              <div
                key={swap.id}
                className="rounded-xl border-2 border-[#193826] bg-[#FAF7F2] overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleSwapExpand(swap.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FFF0C5]/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#193826]">
                    <span className="line-through text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                      {swap.originalIngredient}
                    </span>
                    <span className="text-xs text-[#193826]/50">swapped with</span>
                    <span className={`px-2.5 py-0.5 rounded border ${
                      swap.isRebuilt !== false
                        ? 'text-emerald-800 bg-[#D8EFDF] border-emerald-600'
                        : 'text-amber-900 bg-[#FFF0C5] border-amber-600'
                    }`}>
                      {swap.rebuiltIngredient}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="self-end sm:self-center text-xs font-bold text-[#193826] flex items-center gap-1 hover:text-[#FF7B25]"
                  >
                    <span>{isExpanded ? 'Hide why this works' : 'Why this works'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-white border-t border-[#193826]/20">
                    <div className="p-3 rounded-lg bg-[#FFF0C5]/60 border border-[#193826]/30 text-xs text-[#193826] leading-relaxed">
                      {/* Requirement 3: Label each Aroma Twin Explanation as Sample explanation */}
                      <strong className="block text-[#FF7B25] mb-1 uppercase tracking-wider text-[10px] font-extrabold">
                        Sample explanation
                      </strong>
                      <p>{swap.whyThisWorks}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 COOKING STEPS WITH TIMES */}
      <div className="mb-6 p-5 sm:p-6 rounded-2xl border-2 border-[#193826] bg-[#FFFDF9] ink-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#193826]">
              Cooking Steps ({recipe.cookingSteps.length} Steps • {recipe.estimatedTimeMins} mins)
            </h2>
            <p className="text-xs text-[#193826]/75">
              Click checkboxes as you complete each phase.
            </p>
          </div>

          {/* Read aloud controls */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleReadAloudToggle}
              className={`px-3 py-1.5 rounded-lg border-2 border-[#193826] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSpeaking
                  ? isPaused
                    ? 'bg-[#FFF0C5] text-[#193826]'
                    : 'bg-[#FF7B25] text-white animate-pulse'
                  : 'bg-[#D6E8F4] text-[#193826] hover:bg-[#bce0f8]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? (isPaused ? 'Resume voice' : 'Pause voice') : 'Read aloud'}</span>
            </button>
            {isSpeaking && (
              <button
                onClick={handleStopSpeech}
                title="Stop reading aloud"
                className="p-1.5 rounded-lg border border-[#193826] bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {recipe.cookingSteps.map((step) => {
            const isDone = !!completedSteps[step.stepNumber];
            return (
              <div
                key={step.stepNumber}
                onClick={() => toggleStepCompleted(step.stepNumber)}
                className={`p-4 rounded-xl border-2 border-[#193826] transition-all cursor-pointer ${
                  isDone
                    ? 'bg-[#D8EFDF]/50 border-emerald-700 opacity-90'
                    : 'bg-[#FAF7F2] hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-md border-2 border-[#193826] flex items-center justify-center shrink-0 mt-0.5 ${
                      isDone ? 'bg-[#193826] text-white' : 'bg-white'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-sm font-bold text-[#193826]">
                        Step {step.stepNumber}
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFF0C5] border border-[#193826] text-[#193826]">
                        {step.timeMinutes} mins
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm text-[#193826] leading-relaxed ${isDone ? 'line-through opacity-75' : ''}`}>
                      {step.instruction}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SHOPPING LIST WITH LIVE ESTIMATED TOTAL AND AMAZON / FLIPKART LINKS */}
      <div className="mb-6 p-5 sm:p-6 rounded-2xl border-2 border-[#193826] bg-[#FFFDF9] ink-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#193826]">
              Rebuilt Shopping List
            </h2>
            <p className="text-xs text-[#193826]/75">
              Items tailored to aroma replacements (prices based on average grocery basket).
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF0C5] border-2 border-[#193826] text-right self-start sm:self-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193826]/70 block">
              Estimated price
            </span>
            <span className="font-serif text-xl font-bold text-[#193826]">
              ₹{shoppingListTotal}
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#193826]/20 border-2 border-[#193826] rounded-xl overflow-hidden bg-white">
          {recipe.shoppingList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] transition-colors"
            >
              <div>
                <span className="font-bold text-sm text-[#193826] block">
                  {item.name}
                </span>
                <span className="text-xs text-[#193826]/70">
                  {item.quantity} • Estimated ₹{item.estimatedPrice}
                </span>
              </div>

              {/* Amazon and Flipkart buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center no-print">
                <a
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(item.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg border border-[#193826] bg-[#FFF0C5] hover:bg-[#ffe394] text-xs font-bold text-[#193826] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Amazon</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={`https://www.flipkart.com/search?q=${encodeURIComponent(item.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg border border-[#193826] bg-[#D6E8F4] hover:bg-[#b5dbf7] text-xs font-bold text-[#193826] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Flipkart</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS ROW */}
      <div className="p-5 rounded-2xl bg-[#FFE0CE] border-2 border-[#193826] ink-shadow mb-8 no-print">
        <h3 className="font-serif text-lg font-bold text-[#193826] mb-3">
          Recipe Actions &amp; Sharing
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-3 rounded-xl bg-white border-2 border-[#193826] font-bold text-xs sm:text-sm text-[#193826] hover:bg-[#D8EFDF] transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-xs"
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleSaveRecipe}
            className={`p-3 rounded-xl border-2 border-[#193826] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-xs ${
              isSaved ? 'bg-[#D8EFDF] text-[#193826]' : 'bg-white text-[#193826] hover:bg-[#FFF0C5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-[#193826]' : 'text-[#FF7B25]'}`} />
            <span>{isSaved ? 'Recipe Saved!' : 'Save Recipe'}</span>
          </button>

          <button
            type="button"
            onClick={handleReadAloudToggle}
            className="p-3 rounded-xl bg-white border-2 border-[#193826] font-bold text-xs sm:text-sm text-[#193826] hover:bg-[#D6E8F4] transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-sky-800" />
            <span>{isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Read aloud'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-3 rounded-xl bg-[#FF7B25] text-white border-2 border-[#193826] font-bold text-xs sm:text-sm ink-button cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Recipe Guide</span>
          </button>
        </div>
      </div>

      {/* Mandatory Content & Medical Rules Disclaimer */}
      <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#193826]/40 text-center text-xs text-[#193826]/85 font-medium leading-relaxed">
        <p className="font-bold text-[#193826] mb-0.5">
          {PLATFORM_STATS.scienceNotice}
        </p>
        <p>
          {PLATFORM_STATS.medicalDisclaimer} Consult a certified nutritionist or healthcare professional for individualized dietary therapy.
        </p>
      </div>
    </div>
  );
};
