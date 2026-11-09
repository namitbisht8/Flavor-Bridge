import {
  BUTTER_CHICKEN_BASE_DATA,
  DISHES_CATALOG,
  DishSummary,
  RebuiltRecipeData,
  ShoppingListItem,
  SmellTwinSwap,
  CookingStep,
  TOGGLEABLE_INGREDIENTS,
  SAMPLE_INGREDIENT_PENALTIES,
} from '../data/sampleData';

export interface RecipeResult {
  isCompatible: boolean;
  incompatibilityReason?: string;
  recipe?: RebuiltRecipeData;
  activeAllergies: string[];
  activeDiet: string;
  rebuiltIngredients: string[];
  keptIngredients: string[];
  shoppingListTotal: number;
}

/**
 * Returns rebuilt recipe data for a given dishId, taking into account
 * diet constraints, allergy rules (e.g. Nuts -> pumpkin seed cream),
 * and which customizable ingredients are toggled on ("rebuild this").
 * If an ingredient is toggled off, the original ingredient stays:
 * - salt kept: +520 mg sodium (total 830 mg) -> triggers "Over your 350 mg limit"
 * - sugar kept: +3 g sugar (total 4.0 g)
 * - butter and ghee kept: +9 g saturated fat
 * - cream kept: +5 g saturated fat
 */
export function getRebuiltRecipe(
  dishId: string,
  diet: string,
  allergies: string[] = [],
  rebuiltIngredients: string[] = TOGGLEABLE_INGREDIENTS
): RecipeResult {
  const dish = DISHES_CATALOG.find((d) => d.id === dishId);

  if (!dish) {
    return {
      isCompatible: false,
      incompatibilityReason: `Dish '${dishId}' was not found in catalog.`,
      activeAllergies: allergies,
      activeDiet: diet,
      rebuiltIngredients,
      keptIngredients: [],
      shoppingListTotal: 0,
    };
  }

  // Check diet compatibility
  const isDietCompatible =
    (diet === 'Non-veg' || diet === 'Dairy-free') && dish.id === 'butter-chicken';

  if (!isDietCompatible) {
    return {
      isCompatible: false,
      incompatibilityReason:
        diet === 'Vegetarian' || diet === 'Vegan'
          ? 'No sample dish for this diet yet. Try switching your diet profile to Non-veg or Dairy-free to preview Butter Chicken.'
          : `Dish is coming soon for ${diet} diet.`,
      activeAllergies: allergies,
      activeDiet: diet,
      rebuiltIngredients,
      keptIngredients: [],
      shoppingListTotal: 0,
    };
  }

  const hasNutAllergy = allergies.includes('Nuts');
  const base = BUTTER_CHICKEN_BASE_DATA;

  // Determine which of the 4 customizable ingredients are rebuilt vs kept
  const isSaltRebuilt = rebuiltIngredients.includes('Refined table salt');
  const isSugarRebuilt = rebuiltIngredients.includes('Refined white sugar');
  const isButterRebuilt = rebuiltIngredients.includes('Salted table butter & ghee');
  const isCreamRebuilt = rebuiltIngredients.includes('Heavy dairy cream');

  const keptIngredients = TOGGLEABLE_INGREDIENTS.filter(
    (item) => !rebuiltIngredients.includes(item)
  );

  // Recalculate numbers from sample estimates
  let recalculatedSodiumMg = base.rebuiltSodiumMg; // 310
  if (!isSaltRebuilt) {
    recalculatedSodiumMg += SAMPLE_INGREDIENT_PENALTIES['Refined table salt'].keptSodiumPenaltyMg; // +520 -> 830 mg
  }

  let recalculatedSugarG = base.rebuiltAddedSugarG; // 1.0
  if (!isSugarRebuilt) {
    recalculatedSugarG += SAMPLE_INGREDIENT_PENALTIES['Refined white sugar'].keptSugarPenaltyG; // +3.0 -> 4.0 g
  }

  let recalculatedSatFatG = base.rebuiltSatFatG; // 3.9
  if (!isButterRebuilt) {
    recalculatedSatFatG += SAMPLE_INGREDIENT_PENALTIES['Salted table butter & ghee'].keptSatFatPenaltyG; // +9.0
  }
  if (!isCreamRebuilt) {
    recalculatedSatFatG += SAMPLE_INGREDIENT_PENALTIES['Heavy dairy cream'].keptSatFatPenaltyG; // +5.0
  }

  const isSodiumOverLimit = recalculatedSodiumMg > base.limitSodiumMg;
  const sodiumWarning = isSodiumOverLimit ? 'Over your 350 mg limit' : undefined;
  const sodiumLimitPercentage = Math.round((recalculatedSodiumMg / base.limitSodiumMg) * 100);
  const satFatReductionPercent = Math.max(
    0,
    Math.round(((base.originalSatFatG - recalculatedSatFatG) / base.originalSatFatG) * 100)
  );

  // Process swaps
  const adjustedSwaps: SmellTwinSwap[] = base.swaps.map((swap) => {
    if (swap.id === 'swap-salt') {
      if (!isSaltRebuilt) {
        return {
          ...swap,
          isRebuilt: false,
          rebuiltIngredient: 'Original table salt kept (not rebuilt)',
          whyThisWorks: 'Original refined table salt retained per your customization (+520 mg sodium sample estimate). Rebuilding swaps table salt for roasted cumin and tangy amchur.',
        };
      }
      return { ...swap, isRebuilt: true };
    }

    if (swap.id === 'swap-butter-cream') {
      const isAnyDairyRebuilt = isButterRebuilt || isCreamRebuilt;
      if (!isAnyDairyRebuilt) {
        return {
          ...swap,
          isRebuilt: false,
          rebuiltIngredient: 'Original dairy butter & cream kept (not rebuilt)',
          whyThisWorks: 'Traditional heavy dairy cream, butter, and ghee retained per your customization (+14 g saturated fat sample estimate).',
        };
      }

      return {
        ...swap,
        isRebuilt: true,
        rebuiltIngredient: hasNutAllergy
          ? swap.rebuiltIngredientNutAllergy || 'Pumpkin seed cream + bloomed kasuri methi'
          : swap.rebuiltIngredient,
        whyThisWorks: hasNutAllergy
          ? swap.whyThisWorksNutAllergy || swap.whyThisWorks
          : swap.whyThisWorks,
      };
    }

    return { ...swap, isRebuilt: true };
  });

  // Process cooking steps
  const adjustedSteps: CookingStep[] = base.cookingSteps.map((step) => {
    if (hasNutAllergy && step.instructionNutAllergy) {
      return {
        ...step,
        instruction: step.instructionNutAllergy,
      };
    }
    return { ...step };
  });

  // Process shopping list items
  const adjustedShoppingList: ShoppingListItem[] = base.shoppingList.map((item) => {
    if (item.id === 'item-cashews' && hasNutAllergy && item.replacedForNutAllergy) {
      return {
        id: 'item-pumpkin-seeds',
        name: item.replacedForNutAllergy.name,
        searchQuery: item.replacedForNutAllergy.searchQuery,
        quantity: item.replacedForNutAllergy.quantity,
        estimatedPrice: item.replacedForNutAllergy.estimatedPrice,
      };
    }
    return { ...item };
  });

  const shoppingListTotal = adjustedShoppingList.reduce(
    (sum, item) => sum + item.estimatedPrice,
    0
  );

  const recipe: RebuiltRecipeData = {
    ...base,
    rebuiltSodiumMg: recalculatedSodiumMg,
    rebuiltAddedSugarG: recalculatedSugarG,
    rebuiltSatFatG: Number(recalculatedSatFatG.toFixed(1)),
    satFatReductionPercent,
    sodiumLimitPercentage,
    isSodiumOverLimit,
    sodiumWarning,
    flavorMatchLabel: '94% Flavor Match (sample)',
    rebuiltIngredients,
    keptIngredients,
    swaps: adjustedSwaps,
    cookingSteps: adjustedSteps,
    shoppingList: adjustedShoppingList,
  };

  return {
    isCompatible: true,
    recipe,
    activeAllergies: allergies,
    activeDiet: diet,
    rebuiltIngredients,
    keptIngredients,
    shoppingListTotal,
  };
}

export function getAvailableDishesForDiet(diet: string): DishSummary[] {
  return DISHES_CATALOG.filter((d) => d.compatibleDiets.includes(diet));
}

export function toggleAllergySelection(
  current: string[],
  toggledId: string
): string[] {
  if (toggledId === 'None') {
    return ['None'];
  }
  const withoutNone = current.filter((id) => id !== 'None');
  if (withoutNone.includes(toggledId)) {
    const next = withoutNone.filter((id) => id !== toggledId);
    return next.length === 0 ? ['None'] : next;
  } else {
    return [...withoutNone, toggledId];
  }
}
