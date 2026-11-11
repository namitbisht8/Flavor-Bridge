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

export interface DishMatchResult {
  matchedDishes: DishSummary[];
  unmatchedIngredientsText: string;
  availableDishesForDiet: DishSummary[];
  dishGuess: string;
}

/**
 * Rule-based hybrid matcher mapping detected photo ingredients to supported dishes.
 * Rules:
 * - chicken + tomato or butter = Butter Chicken
 * - dal/lentil + rice = Dal Tadka & Chawal
 * - kidney beans/rajma = Rajma Masala
 * - moong + rice = Moong Dal Khichdi
 * - potato + cauliflower = Aloo Gobi
 *
 * Respects user's diet (hides non-veg matches for vegetarian/vegan users).
 */
export function matchDishesFromIngredients(
  ingredients: string[],
  dishGuess = '',
  diet = 'Non-veg'
): DishMatchResult {
  const available = getAvailableDishesForDiet(diet);
  const lowerIngredients = ingredients.map((i) => i.toLowerCase().trim());
  const lowerGuess = (dishGuess || '').toLowerCase().trim();

  const hasAny = (keywords: string[]) =>
    keywords.some(
      (kw) =>
        lowerIngredients.some((ing) => ing.includes(kw)) ||
        lowerGuess.includes(kw)
    );

  const matchedDishIds = new Set<string>();

  // Common base ingredients
  const hasRice = hasAny(['rice', 'chawal', 'cumin rice', 'jeera rice', 'steamed rice']);

  // 1. Butter Chicken: chicken + (tomato or butter)
  const hasChicken = hasAny(['chicken', 'murgh', 'poultry', 'meat']);
  const hasTomatoOrButter = hasAny(['tomato', 'butter', 'makhani', 'cream', 'gravy']);
  if ((hasChicken && hasTomatoOrButter) || lowerGuess.includes('butter chicken') || lowerGuess.includes('makhani')) {
    matchedDishIds.add('butter-chicken');
  }

  // 3. Rajma Masala: kidney beans/rajma
  const hasRajma = hasAny(['kidney bean', 'kidney beans', 'rajma', 'red beans']);
  if (hasRajma || lowerGuess.includes('rajma')) {
    matchedDishIds.add('rajma');
  }

  // 4. Moong Dal Khichdi: moong + rice
  const hasMoong = hasAny(['moong', 'mung', 'green gram', 'yellow moong']);
  if ((hasMoong && (hasRice || hasAny(['khichdi', 'kitchari']))) || lowerGuess.includes('khichdi') || lowerGuess.includes('kitchari')) {
    matchedDishIds.add('khichdi');
  }

  // 2. Dal Tadka & Chawal: dal/lentil + rice (when not specifically moong khichdi)
  const hasToorOrTadka = hasAny(['toor', 'tadka', 'yellow dal', 'arhar', 'chana dal']);
  const hasGeneralDal = hasAny(['dal', 'lentil', 'daal']);
  if ((!hasMoong && (hasToorOrTadka || (hasGeneralDal && hasRice))) || lowerGuess.includes('dal tadka') || lowerGuess.includes('dal chawal')) {
    matchedDishIds.add('dal-chawal');
  }

  // 5. Aloo Gobi: potato + cauliflower
  const hasPotato = hasAny(['potato', 'potatoes', 'aloo', 'alu']);
  const hasCauliflower = hasAny(['cauliflower', 'gobi', 'gobhi']);
  if ((hasPotato && hasCauliflower) || lowerGuess.includes('aloo gobi') || lowerGuess.includes('alu gobi')) {
    matchedDishIds.add('aloo-gobi');
  }

  // Fallback single strong keywords if no combo matched yet
  if (matchedDishIds.size === 0) {
    if (hasAny(['chicken', 'murgh'])) matchedDishIds.add('butter-chicken');
    else if (hasAny(['rajma'])) matchedDishIds.add('rajma');
    else if (hasAny(['khichdi', 'moong'])) matchedDishIds.add('khichdi');
    else if (hasAny(['cauliflower', 'gobi', 'gobhi'])) matchedDishIds.add('aloo-gobi');
    else if (hasAny(['dal', 'toor', 'tadka'])) matchedDishIds.add('dal-chawal');
  }

  // Filter matched dishes by diet (e.g. Vegetarian/Vegan users never get non-veg)
  const matchedDishes = available.filter((d) => matchedDishIds.has(d.id));

  return {
    matchedDishes,
    unmatchedIngredientsText: ingredients.join(', '),
    availableDishesForDiet: available,
    dishGuess,
  };
}

/**
 * Matches user voice transcript (English, Hindi, or Hinglish) to a catalog dish.
 */
export function matchDishFromSpeech(
  transcript: string,
  availableDishes: DishSummary[]
): DishSummary | undefined {
  if (!transcript) return undefined;
  const lower = transcript.toLowerCase().trim();

  // 1. Direct name or Hindi name inclusion
  for (const dish of availableDishes) {
    if (lower.includes(dish.name.toLowerCase())) return dish;
    if (dish.hindiName && lower.includes(dish.hindiName.toLowerCase())) return dish;
  }

  // 2. Hinglish and common colloquial alias mapping
  const aliasMap: Record<string, string[]> = {
    'butter-chicken': ['butter chicken', 'chicken', 'murg makhani', 'murgh makhani', 'makhan chicken'],
    'dal-chawal': ['dal tadka', 'dal chawal', 'daal chawal', 'daal', 'dal', 'tadka', 'peeli dal'],
    'rajma': ['rajma', 'rajma masala', 'rajma chawal', 'laal rajma'],
    'khichdi': ['khichdi', 'moong dal khichdi', 'moong khichdi', 'kitchari'],
    'aloo-gobi': ['aloo gobi', 'alu gobi', 'aloo gobhi', 'gobhi', 'gobi', 'gobi aloo'],
  };

  for (const [dishId, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((alias) => lower.includes(alias))) {
      const found = availableDishes.find((d) => d.id === dishId);
      if (found) return found;
    }
  }

  return undefined;
}


