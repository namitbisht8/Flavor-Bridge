import {
  BUTTER_CHICKEN_BASE_DATA,
  REBUILT_RECIPES_DATABASE,
  DISH_SAMPLE_PENALTIES,
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
 * - salt kept: triggers "Over your 350 mg limit" when sodium exceeds limit
 * - sugar kept: adds sugar penalty
 * - butter/ghee/cream kept: adds saturated fat penalty
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

  // Check diet compatibility:
  // - Non-veg: All dishes
  // - Vegetarian: All vegetarian dishes (Butter Chicken is non-veg)
  // - Vegan: All dishes whose rebuilt version is vegan (all four vegetarian dishes, not Butter Chicken)
  // - Dairy-free: All rebuilt dishes are dairy-free
  const isVegetarianOrVegan = diet === 'Vegetarian' || diet === 'Vegan';
  if (isVegetarianOrVegan && dish.category === 'Non-veg') {
    return {
      isCompatible: false,
      incompatibilityReason: `${dish.name} contains poultry and cannot be selected for a ${diet} diet. Please choose one of our rebuilt vegetarian dishes like Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, or Aloo Gobi.`,
      activeAllergies: allergies,
      activeDiet: diet,
      rebuiltIngredients,
      keptIngredients: [],
      shoppingListTotal: 0,
    };
  }

  const base: RebuiltRecipeData = REBUILT_RECIPES_DATABASE[dishId] || BUTTER_CHICKEN_BASE_DATA;
  const penalties = DISH_SAMPLE_PENALTIES[dishId] || SAMPLE_INGREDIENT_PENALTIES;

  const hasNutAllergy = allergies.includes('Nuts');

  // Determine which of the 4 customizable ingredients are rebuilt vs kept
  const isSaltRebuilt = rebuiltIngredients.includes('Refined table salt');
  const isSugarRebuilt = rebuiltIngredients.includes('Refined white sugar');
  const isButterRebuilt = rebuiltIngredients.includes('Salted table butter & ghee');
  const isCreamRebuilt = rebuiltIngredients.includes('Heavy dairy cream');

  const keptIngredients = TOGGLEABLE_INGREDIENTS.filter(
    (item) => !rebuiltIngredients.includes(item)
  );

  // Recalculate numbers from sample estimates for this dish
  let recalculatedSodiumMg = base.rebuiltSodiumMg;
  const saltPenalty = penalties['Refined table salt']?.keptSodiumPenaltyMg ?? 520;
  if (!isSaltRebuilt) {
    recalculatedSodiumMg += saltPenalty;
  }

  let recalculatedSugarG = base.rebuiltAddedSugarG;
  const sugarPenalty = penalties['Refined white sugar']?.keptSugarPenaltyG ?? 3.0;
  if (!isSugarRebuilt) {
    recalculatedSugarG += sugarPenalty;
  }

  let recalculatedSatFatG = base.rebuiltSatFatG;
  const butterPenalty = penalties['Salted table butter & ghee']?.keptSatFatPenaltyG ?? 9.0;
  const creamPenalty = penalties['Heavy dairy cream']?.keptSatFatPenaltyG ?? 5.0;
  if (!isButterRebuilt) {
    recalculatedSatFatG += butterPenalty;
  }
  if (!isCreamRebuilt) {
    recalculatedSatFatG += creamPenalty;
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
          whyThisWorks: `Sample explanation: Original refined table salt retained per your customization (+${saltPenalty} mg sodium sample estimate).`,
        };
      }
      return { ...swap, isRebuilt: true };
    }

    if (swap.id === 'swap-butter-cream') {
      const isAnyFatRebuilt = isButterRebuilt || isCreamRebuilt;
      if (!isAnyFatRebuilt) {
        return {
          ...swap,
          isRebuilt: false,
          rebuiltIngredient: 'Original fat kept (not rebuilt)',
          whyThisWorks: `Sample explanation: Traditional fat (butter/ghee/cream) retained per your customization (+${(butterPenalty + creamPenalty).toFixed(1)} g saturated fat sample estimate).`,
        };
      }

      return {
        ...swap,
        isRebuilt: true,
        rebuiltIngredient: hasNutAllergy
          ? swap.rebuiltIngredientNutAllergy || swap.rebuiltIngredient
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

  // Process shopping list items (including Nut allergy swap for cashew cream)
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
    baselineRebuiltSodiumMg: base.rebuiltSodiumMg,
    saltPenaltyMg: saltPenalty,
    rebuiltAddedSugarG: Number(recalculatedSugarG.toFixed(1)),
    rebuiltSatFatG: Number(recalculatedSatFatG.toFixed(1)),
    satFatReductionPercent,
    sodiumLimitPercentage,
    isSodiumOverLimit,
    sodiumWarning,
    flavorMatchLabel: `${base.flavorMatchPercent}% Flavor Match (sample)`,
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
  if (diet === 'Vegetarian') {
    return DISHES_CATALOG.filter((d) => d.category !== 'Non-veg');
  }
  if (diet === 'Vegan') {
    return DISHES_CATALOG.filter((d) => d.category !== 'Non-veg');
  }
  return DISHES_CATALOG;
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

