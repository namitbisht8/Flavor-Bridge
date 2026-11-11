/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { DietProfileScreen } from './components/DietProfileScreen';
import { BuildDishScreen } from './components/BuildDishScreen';
import { RebuiltRecipeScreen } from './components/RebuiltRecipeScreen';
import { FlavorBotModal } from './components/FlavorBotModal';
import { Footer } from './components/Footer';
import { getRebuiltRecipe } from './services/recipeService';
import { TOGGLEABLE_INGREDIENTS } from './data/sampleData';

export default function App() {
  // 3-step flow: 1 = Diet Profile, 2 = Build Dish, 3 = Rebuilt Recipe
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User preferences state (default: Non-veg, None)
  const [diet, setDiet] = useState<string>('Non-veg');
  const [allergies, setAllergies] = useState<string[]>(['None']);

  // Selected dish & 4 toggleable ingredients (default: all 4 toggled ON to "rebuild this")
  const [selectedDishId, setSelectedDishId] = useState<string>('butter-chicken');
  const [rebuiltIngredients, setRebuiltIngredients] = useState<string[]>(TOGGLEABLE_INGREDIENTS);

  // Auto-switch to vegetarian dish if user switches to Vegetarian/Vegan while Butter Chicken is selected
  React.useEffect(() => {
    if ((diet === 'Vegetarian' || diet === 'Vegan') && selectedDishId === 'butter-chicken') {
      setSelectedDishId('dal-chawal');
    }
  }, [diet, selectedDishId]);

  // Compute rebuilt recipe via centralized service
  const recipeResult = useMemo(() => {
    return getRebuiltRecipe(selectedDishId, diet, allergies, rebuiltIngredients);
  }, [selectedDishId, diet, allergies, rebuiltIngredients]);

  const handleStepNavigation = (step: number) => {
    if (step === 3 && !recipeResult.isCompatible) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Feature 1: 1-minute demo trigger (Non-veg, None, Butter Chicken, all rebuilt ingredients, open Screen 3)
  const handleRunDemo = () => {
    setDiet('Non-veg');
    setAllergies(['None']);
    setSelectedDishId('butter-chicken');
    setRebuiltIngredients(TOGGLEABLE_INGREDIENTS);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Feature 1: Reset demo (clears all choices and returns to Screen 1)
  const handleResetDemo = () => {
    setDiet('Non-veg');
    setAllergies(['None']);
    setSelectedDishId('butter-chicken');
    setRebuiltIngredients(TOGGLEABLE_INGREDIENTS);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative text-[#193826] dark:text-[#F1F6F2] selection:bg-[#FFF0C5] selection:text-[#193826] dark:selection:bg-[#FFB34D] dark:selection:text-[#1A1200]">
      {/* Textured Dotted Sketchbook & Soft Watercolor Wash Layer */}
      <div className="sketchbook-bg" aria-hidden="true" />

      {/* 3-Step Header with aroma deck stats */}
      <Header
        currentStep={currentStep}
        onStepClick={handleStepNavigation}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-28">
        {currentStep === 1 && (
          <DietProfileScreen
            diet={diet}
            setDiet={(newDiet) => {
              setDiet(newDiet);
            }}
            allergies={allergies}
            setAllergies={setAllergies}
            onContinue={() => handleStepNavigation(2)}
            onRunDemo={handleRunDemo}
          />
        )}

        {currentStep === 2 && (
          <BuildDishScreen
            diet={diet}
            setDiet={setDiet}
            allergies={allergies}
            selectedDishId={selectedDishId}
            setSelectedDishId={setSelectedDishId}
            rebuiltIngredients={rebuiltIngredients}
            setRebuiltIngredients={setRebuiltIngredients}
            onRebuild={() => handleStepNavigation(3)}
            onBackToDiet={() => handleStepNavigation(1)}
          />
        )}

        {currentStep === 3 && (
          <>
            {recipeResult.isCompatible && recipeResult.recipe ? (
              <RebuiltRecipeScreen
                recipe={recipeResult.recipe}
                diet={diet}
                allergies={allergies}
                rebuiltIngredients={rebuiltIngredients}
                onBackToBuild={() => handleStepNavigation(2)}
                onBackToDiet={() => handleStepNavigation(1)}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="p-6 rounded-2xl bg-[#FFF0C5] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[#3F6B57] ink-shadow">
                  <h2 className="font-serif text-xl font-bold mb-2 dark:text-[#F1F6F2]">
                    {recipeResult.incompatibilityReason || 'Recipe not available for this configuration'}
                  </h2>
                  <button
                    onClick={() => handleStepNavigation(2)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] font-bold ink-button cursor-pointer"
                  >
                    Return to Build Dish
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating FlavorBot Assistant button on all screens */}
      <FlavorBotModal
        recipe={recipeResult.recipe}
        dishId={selectedDishId}
        diet={diet}
        allergies={allergies}
        rebuiltIngredients={rebuiltIngredients}
        shoppingListTotal={recipeResult.shoppingListTotal}
      />

      {/* Clean 3-step footer */}
      <Footer
        onStepClick={handleStepNavigation}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
