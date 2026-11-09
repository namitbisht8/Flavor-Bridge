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

export default function App() {
  // 3-step flow: 1 = Diet Profile, 2 = Build Dish, 3 = Rebuilt Recipe
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User preferences state (default: Non-veg, None)
  const [diet, setDiet] = useState<string>('Non-veg');
  const [allergies, setAllergies] = useState<string[]>(['None']);

  // Selected dish & custom removed ingredient chips
  const [selectedDishId, setSelectedDishId] = useState<string>('butter-chicken');
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  // Compute rebuilt recipe via centralized service
  const recipeResult = useMemo(() => {
    return getRebuiltRecipe(selectedDishId, diet, allergies, removedItems);
  }, [selectedDishId, diet, allergies, removedItems]);

  const handleStepNavigation = (step: number) => {
    // If navigating to step 3 directly without recipe compatibility, guide to step 2
    if (step === 3 && !recipeResult.isCompatible) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#193826] selection:bg-[#FFF0C5] selection:text-[#193826]">
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
          />
        )}

        {currentStep === 2 && (
          <BuildDishScreen
            diet={diet}
            setDiet={setDiet}
            allergies={allergies}
            selectedDishId={selectedDishId}
            setSelectedDishId={setSelectedDishId}
            removedItems={removedItems}
            setRemovedItems={setRemovedItems}
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
                removedItems={removedItems}
                onBackToBuild={() => handleStepNavigation(2)}
                onBackToDiet={() => handleStepNavigation(1)}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="p-6 rounded-2xl bg-[#FFF0C5] border-2 border-[#193826] ink-shadow">
                  <h2 className="font-serif text-xl font-bold mb-2">
                    {recipeResult.incompatibilityReason || 'Recipe not available for this configuration'}
                  </h2>
                  <button
                    onClick={() => handleStepNavigation(2)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#FF7B25] text-white font-bold ink-button cursor-pointer"
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
      <FlavorBotModal />

      {/* Clean 3-step footer */}
      <Footer onStepClick={handleStepNavigation} />
    </div>
  );
}
