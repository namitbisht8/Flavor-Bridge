import {
  BUTTER_CHICKEN_BASE_DATA,
  DISHES_CATALOG,
  DishSummary,
  RebuiltRecipeData,
  ShoppingListItem,
  SmellTwinSwap,
  CookingStep,
} from '../data/sampleData';

export interface RecipeResult {
  isCompatible: boolean;
  incompatibilityReason?: string;
  recipe?: RebuiltRecipeData;
  activeAllergies: string[];
  activeDiet: string;
  removedItems: string[];
  shoppingListTotal: number;
}

/**
 * Returns rebuilt recipe data for a given dishId, taking into account
 * diet constraints, allergy rules (e.g. Nuts -> pumpkin seed cream),
 * and removed ingredient chips.
 */
export function getRebuiltRecipe(
  dishId: string,
  diet: string,
  allergies: string[] = [],
  removedItems: string[] = []
): RecipeResult {
  const dish = DISHES_CATALOG.find((d) => d.id === dishId);

  if (!dish) {
    return {
      isCompatible: false,
      incompatibilityReason: `Dish '${dishId}' was not found in catalog.`,
      activeAllergies: allergies,
      activeDiet: diet,
      removedItems,
      shoppingListTotal: 0,
    };
  }

  // Check diet compatibility:
  // Butter chicken is non-veg; Vegetarian and Vegan diets cannot view or build it
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
      removedItems,
      shoppingListTotal: 0,
    };
  }

  const hasNutAllergy = allergies.includes('Nuts');

  // Clone base data
  const base = BUTTER_CHICKEN_BASE_DATA;

  // Process swaps based on allergy rule
  const adjustedSwaps: SmellTwinSwap[] = base.swaps.map((swap) => {
    if (swap.id === 'swap-butter-cream' && hasNutAllergy) {
      return {
        ...swap,
        rebuiltIngredient: swap.rebuiltIngredientNutAllergy || 'Pumpkin seed cream + bloomed kasuri methi',
        whyThisWorks: swap.whyThisWorksNutAllergy || swap.whyThisWorks,
      };
    }
    return { ...swap };
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

  // Calculate live total for shopping list
  const shoppingListTotal = adjustedShoppingList.reduce(
    (sum, item) => sum + item.estimatedPrice,
    0
  );

  const recipe: RebuiltRecipeData = {
    ...base,
    swaps: adjustedSwaps,
    cookingSteps: adjustedSteps,
    shoppingList: adjustedShoppingList,
  };

  return {
    isCompatible: true,
    recipe,
    activeAllergies: allergies,
    activeDiet: diet,
    removedItems,
    shoppingListTotal,
  };
}

/**
 * Helper to get available dishes for a chosen diet
 */
export function getAvailableDishesForDiet(diet: string): DishSummary[] {
  return DISHES_CATALOG.filter((d) => d.compatibleDiets.includes(diet));
}

/**
 * Helper to validate allergy selection (ensures 'None' exclusivity)
 */
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
