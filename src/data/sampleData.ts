export interface DietOption {
  id: string;
  label: string;
  description: string;
  iconName: string;
}

export interface AllergyOption {
  id: string;
  label: string;
}

export interface DishSummary {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Non-veg' | 'Vegetarian' | 'Vegan' | 'Dairy-free';
  compatibleDiets: string[]; // e.g. ['Non-veg', 'Dairy-free']
  description: string;
  servings: number;
  available: boolean;
  tag?: string;
  image?: string;
}

export interface SmellTwinSwap {
  id: string;
  originalIngredient: string;
  rebuiltIngredient: string;
  rebuiltIngredientNutAllergy?: string;
  aromaNotes: string;
  whyThisWorks: string;
  whyThisWorksNutAllergy?: string;
  isRebuilt?: boolean;
}

export interface CookingStep {
  stepNumber: number;
  timeMinutes: number;
  instruction: string;
  instructionNutAllergy?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  searchQuery: string;
  quantity: string;
  estimatedPrice: number;
  replacedForNutAllergy?: {
    name: string;
    searchQuery: string;
    quantity: string;
    estimatedPrice: number;
  };
}

export interface RebuiltRecipeData {
  dishId: string;
  dishName: string;
  tagline: string;
  flavorMatchPercent: number;
  flavorMatchLabel: string; // "94% Flavor Match (sample)"
  costPerServing: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTimeMins: number;
  
  // Sodium & limits
  originalSodiumMg: number;
  rebuiltSodiumMg: number;
  baselineRebuiltSodiumMg?: number;
  saltPenaltyMg?: number;
  limitSodiumMg: number;
  sodiumLimitComparison: string; // "about 2.5x the limit"
  sodiumLimitPercentage: number; // 88%
  isSodiumOverLimit: boolean;
  sodiumWarning?: string; // "Over your 350 mg limit"

  // Saturated Fat
  originalSatFatG: number;
  rebuiltSatFatG: number;
  satFatReductionPercent: number; // -72%

  // Added Sugar
  originalAddedSugarG: number;
  rebuiltAddedSugarG: number;

  originalIngredients: string[];
  rebuiltIngredients: string[];
  keptIngredients: string[];
  swaps: SmellTwinSwap[];
  cookingSteps: CookingStep[];
  shoppingList: ShoppingListItem[];
  disclaimer: string;
}

export const PLATFORM_STATS = {
  aromaMoleculesCount: "25,595 aroma molecules",
  recipesCount: "118,171 recipes",
  scienceNotice: "Checked against the limit you set",
  medicalDisclaimer: "Food suggestions, not medical advice.",
};

export const CORE_INGREDIENTS = [
  'Bone-in or boneless chicken',
  'Tomato puree & whole tomatoes',
  'Kasuri methi (fenugreek)',
  'Ginger & garlic paste',
];

export const TOGGLEABLE_INGREDIENTS = [
  'Refined table salt',
  'Refined white sugar',
  'Salted table butter & ghee',
  'Heavy dairy cream',
];

export interface IngredientSamplePenalty {
  ingredient: string;
  keptSodiumPenaltyMg: number;
  keptSugarPenaltyG: number;
  keptSatFatPenaltyG: number;
  description: string;
}

/**
 * Sample estimates when an ingredient is toggled off (kept original)
 * Salt kept: +520 mg sodium
 * Sugar kept: +3 g sugar
 * Butter and ghee kept: +9 g saturated fat
 * Cream kept: +5 g saturated fat
 */
export const SAMPLE_INGREDIENT_PENALTIES: Record<string, IngredientSamplePenalty> = {
  'Refined table salt': {
    ingredient: 'Refined table salt',
    keptSodiumPenaltyMg: 520,
    keptSugarPenaltyG: 0,
    keptSatFatPenaltyG: 0,
    description: '+520 mg sodium (sample estimate)',
  },
  'Refined white sugar': {
    ingredient: 'Refined white sugar',
    keptSodiumPenaltyMg: 0,
    keptSugarPenaltyG: 3.0,
    keptSatFatPenaltyG: 0,
    description: '+3 g sugar (sample estimate)',
  },
  'Salted table butter & ghee': {
    ingredient: 'Salted table butter & ghee',
    keptSodiumPenaltyMg: 0,
    keptSugarPenaltyG: 0,
    keptSatFatPenaltyG: 9.0,
    description: '+9 g saturated fat (sample estimate)',
  },
  'Heavy dairy cream': {
    ingredient: 'Heavy dairy cream',
    keptSodiumPenaltyMg: 0,
    keptSugarPenaltyG: 0,
    keptSatFatPenaltyG: 5.0,
    description: '+5 g saturated fat (sample estimate)',
  },
};

export const DIET_OPTIONS: DietOption[] = [
  {
    id: 'Non-veg',
    label: 'Non-veg',
    description: 'Includes poultry, meats, and seafood with aromatic Indian gravies.',
    iconName: 'drumstick',
  },
  {
    id: 'Vegetarian',
    label: 'Vegetarian',
    description: 'Plant-based with wholesome pulses, vegetables, and dairy staples.',
    iconName: 'leaf',
  },
  {
    id: 'Vegan',
    label: 'Vegan',
    description: '100% plant-rich with zero animal products, dairy, or honey.',
    iconName: 'sprout',
  },
  {
    id: 'Dairy-free',
    label: 'Dairy-free',
    description: 'Rich gravies rebuilt using seed and nut creams instead of butter & cream.',
    iconName: 'milk-off',
  },
];

export const ALLERGY_OPTIONS: AllergyOption[] = [
  { id: 'Nuts', label: 'Nuts' },
  { id: 'Gluten', label: 'Gluten' },
  { id: 'Soy', label: 'Soy' },
  { id: 'Eggs', label: 'Eggs' },
  { id: 'Shellfish', label: 'Shellfish' },
  { id: 'None', label: 'None' },
];

export const DISHES_CATALOG: DishSummary[] = [
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    hindiName: 'Murgh Makhani',
    category: 'Non-veg',
    compatibleDiets: ['Non-veg', 'Dairy-free'],
    description: 'Classic velvety tomato gravy, tender chicken, and fragrant fenugreek leaves.',
    servings: 4,
    available: true,
  },
  {
    id: 'dal-chawal',
    name: 'Dal Tadka & Chawal',
    hindiName: 'दाल तड़का चावल',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Golden yellow lentils topped with garlic-cumin tadka over steamed rice.',
    servings: 3,
    available: true,
  },
  {
    id: 'rajma',
    name: 'Rajma Masala',
    hindiName: 'राजमा मसाला',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Slow-cooked kidney beans simmered in spiced onion-tomato reduction.',
    servings: 4,
    available: true,
  },
  {
    id: 'khichdi',
    name: 'Moong Dal Khichdi',
    hindiName: 'मूंग दाल खिचड़ी',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Comforting one-pot moong dal and basmati rice with cumin tempering.',
    servings: 2,
    available: true,
  },
  {
    id: 'aloo-gobi',
    name: 'Aloo Gobi',
    hindiName: 'आलू गोभी',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Crisp florets of cauliflower and potatoes tossed with turmeric and ginger.',
    servings: 4,
    available: true,
  },
];

export const BUTTER_CHICKEN_BASE_DATA: RebuiltRecipeData = {
  dishId: 'butter-chicken',
  dishName: 'Butter Chicken',
  tagline: 'Rebuilt for lower sodium & saturated fat while keeping rich restaurant aroma.',
  flavorMatchPercent: 94,
  flavorMatchLabel: '94% Flavor Match (sample)',
  costPerServing: 65,
  difficulty: 'Easy',
  estimatedTimeMins: 30,

  // Base rebuilt values strictly matching requirements
  originalSodiumMg: 890,
  rebuiltSodiumMg: 310,
  limitSodiumMg: 350,
  sodiumLimitComparison: 'about 2.5x the limit', // 890 mg vs 350 mg is ~2.5x
  sodiumLimitPercentage: 88, // 310/350 is ~88.5%
  isSodiumOverLimit: false,

  originalSatFatG: 14.0,
  rebuiltSatFatG: 3.9,
  satFatReductionPercent: 72, // -72%

  originalAddedSugarG: 4.0,
  rebuiltAddedSugarG: 1.0,

  originalIngredients: [
    'Bone-in or boneless chicken',
    'Tomato puree & whole tomatoes',
    'Kasuri methi (fenugreek)',
    'Ginger & garlic paste',
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  rebuiltIngredients: [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  keptIngredients: [],

  swaps: [
    {
      id: 'swap-salt',
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Roasted cumin + amchur',
      aromaNotes: 'Earthy, tangy punch replicating salty contrast',
      whyThisWorks: 'Roasted cumin provides a deep savory baseline while raw mango powder (amchur) lends natural acidity that mimics salty sharpness on your tongue.',
    },
    {
      id: 'swap-butter-cream',
      originalIngredient: 'Butter, ghee and cream',
      rebuiltIngredient: 'Cashew cream + bloomed kasuri methi',
      rebuiltIngredientNutAllergy: 'Pumpkin seed cream + bloomed kasuri methi',
      aromaNotes: 'Silky mouthfeel & rich lactone-like nutty sweetness',
      whyThisWorks: 'Blended soaked cashews replicate the velvet emulsified body of heavy cream, while warm-bloomed kasuri methi shares a similar aroma to clarified butter.',
      whyThisWorksNutAllergy: 'Blended toasted pumpkin seeds provide a similar silky, emulsion-rich texture free of tree nuts, pairing with bloomed kasuri methi to deliver rich buttery depth.',
    },
  ],

  cookingSteps: [
    {
      stepNumber: 1,
      timeMinutes: 5,
      instruction: 'Marinate chicken pieces with fresh ginger-garlic paste, a squeeze of lemon, and tangy amchur instead of table salt for a punchy foundation.',
      instructionNutAllergy: 'Marinate chicken pieces with fresh ginger-garlic paste, a squeeze of lemon, and tangy amchur instead of table salt for a punchy foundation.',
    },
    {
      stepNumber: 2,
      timeMinutes: 15,
      instruction: 'Simmer fresh tomato puree with a pinch of hing and toasted cumin; stir in the velvety cashew cream and simmer on low heat until glossy and rich.',
      instructionNutAllergy: 'Simmer fresh tomato puree with a pinch of hing and toasted cumin; stir in the velvety pumpkin seed cream and simmer on low heat until glossy and rich.',
    },
    {
      stepNumber: 3,
      timeMinutes: 10,
      instruction: 'Fold in the seared chicken pieces, finish with hand-crushed bloomed kasuri methi for signature restaurant aroma, and let rest covered before serving.',
      instructionNutAllergy: 'Fold in the seared chicken pieces, finish with hand-crushed bloomed kasuri methi for signature restaurant aroma, and let rest covered before serving.',
    },
  ],

  shoppingList: [
    {
      id: 'item-cumin',
      name: 'Roasted Cumin (Jeera)',
      searchQuery: 'whole cumin seeds 200g',
      quantity: '100g pack',
      estimatedPrice: 45,
    },
    {
      id: 'item-amchur',
      name: 'Amchur (Dry Mango Powder)',
      searchQuery: 'amchur dry mango powder 100g',
      quantity: '100g pack',
      estimatedPrice: 55,
    },
    {
      id: 'item-kasuri-methi',
      name: 'Kasuri Methi (Fenugreek leaves)',
      searchQuery: 'kasuri methi 50g',
      quantity: '50g box',
      estimatedPrice: 35,
    },
    {
      id: 'item-cashews',
      name: 'Raw Cashews (for velvet cream)',
      searchQuery: 'raw whole cashews 200g',
      quantity: '150g pack',
      estimatedPrice: 120,
      replacedForNutAllergy: {
        name: 'Pumpkin Seeds (Pepitas, nut-free cream)',
        searchQuery: 'raw pumpkin seeds pepitas 200g',
        quantity: '150g pack',
        estimatedPrice: 85,
      },
    },
    {
      id: 'item-tomatoes',
      name: 'Fresh Ripe Tomatoes',
      searchQuery: 'fresh ripe tomatoes 500g',
      quantity: '500g fresh',
      estimatedPrice: 25,
    },
    {
      id: 'item-ginger',
      name: 'Fresh Ginger Root',
      searchQuery: 'fresh ginger root 100g',
      quantity: '100g',
      estimatedPrice: 15,
    },
    {
      id: 'item-hing',
      name: 'Asafoetida (Hing)',
      searchQuery: 'asafoetida hing powder',
      quantity: '25g container',
      estimatedPrice: 40,
    },
    {
      id: 'item-oil',
      name: 'Cold-pressed Cooking Oil',
      searchQuery: 'cold pressed cooking oil 500ml',
      quantity: '250ml',
      estimatedPrice: 60,
    },
  ],

  disclaimer: 'Checked against the limit you set. Food suggestions, not medical advice.',
};

export const DAL_CHAWAL_BASE_DATA: RebuiltRecipeData = {
  dishId: 'dal-chawal',
  dishName: 'Dal Tadka & Chawal',
  tagline: 'Rebuilt for lower sodium & sat fat with aromatic cumin-garlic tadka and steamed rice.',
  flavorMatchPercent: 92,
  flavorMatchLabel: '92% Flavor Match (sample)',
  costPerServing: 45,
  difficulty: 'Easy',
  estimatedTimeMins: 35,

  originalSodiumMg: 780,
  rebuiltSodiumMg: 290,
  limitSodiumMg: 350,
  sodiumLimitComparison: 'about 2.2x the limit',
  sodiumLimitPercentage: 83,
  isSodiumOverLimit: false,

  originalSatFatG: 6.0,
  rebuiltSatFatG: 2.2,
  satFatReductionPercent: 63,

  originalAddedSugarG: 1.0,
  rebuiltAddedSugarG: 0.5,

  originalIngredients: [
    'Yellow lentils (Toor & Moong dal)',
    'Fragrant Basmati rice',
    'Fresh garlic & ginger',
    'Vine tomatoes & turmeric',
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  rebuiltIngredients: [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  keptIngredients: [],

  swaps: [
    {
      id: 'swap-salt',
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Roasted cumin + amchur + lemon at serving',
      aromaNotes: 'Earthy, tangy acidity mimicking sodium',
      whyThisWorks: 'Sample explanation: Roasted cumin delivers warm savory depth, while dry mango powder (amchur) and fresh lemon juice trigger tart salivary responses that mirror salty sharpness on the palate.',
    },
    {
      id: 'swap-butter-cream',
      originalIngredient: 'Ghee tadka (clarified butter)',
      rebuiltIngredient: 'Small amount of cold-pressed oil + hing + toasted cumin + garlic',
      aromaNotes: 'Nutty, bloomed allium aroma replacing ghee',
      whyThisWorks: 'Sample explanation: Sliced garlic and whole cumin seeds gently bloomed in cold-pressed oil with a touch of asafoetida (hing) create the warm, nutty aroma of ghee without the saturated dairy fat.',
    },
  ],

  cookingSteps: [
    {
      stepNumber: 1,
      timeMinutes: 10,
      instruction: 'Rinse toor and moong dal thoroughly, then simmer or pressure-cook with water, turmeric, and minced ginger until completely tender and creamy.',
    },
    {
      stepNumber: 2,
      timeMinutes: 15,
      instruction: 'Simmer the cooked dal with diced fresh tomatoes and amchur; simultaneously steam basmati rice in a covered pot until fluffy and aromatic.',
    },
    {
      stepNumber: 3,
      timeMinutes: 10,
      instruction: 'In a small tadka pan, warm cold-pressed oil with whole cumin seeds, sliced garlic, and hing; pour the sizzling tadka over dal, finish with fresh lemon, and serve with rice.',
    },
  ],

  shoppingList: [
    {
      id: 'item-dal-lentils',
      name: 'Toor & Moong Lentils',
      searchQuery: 'toor moong dal 500g',
      quantity: '500g pack',
      estimatedPrice: 85,
    },
    {
      id: 'item-basmati-rice',
      name: 'Basmati Rice',
      searchQuery: 'basmati rice 1kg',
      quantity: '1kg pack',
      estimatedPrice: 95,
    },
    {
      id: 'item-cumin',
      name: 'Roasted Cumin (Jeera)',
      searchQuery: 'whole cumin seeds 200g',
      quantity: '100g pack',
      estimatedPrice: 45,
    },
    {
      id: 'item-amchur',
      name: 'Amchur (Dry Mango Powder)',
      searchQuery: 'amchur dry mango powder 100g',
      quantity: '100g pack',
      estimatedPrice: 55,
    },
    {
      id: 'item-garlic-lemon',
      name: 'Fresh Garlic, Ginger & Lemon',
      searchQuery: 'fresh garlic ginger lemon',
      quantity: '200g pack',
      estimatedPrice: 30,
    },
    {
      id: 'item-hing',
      name: 'Asafoetida (Hing)',
      searchQuery: 'asafoetida hing powder',
      quantity: '25g container',
      estimatedPrice: 40,
    },
    {
      id: 'item-oil',
      name: 'Cold-pressed Cooking Oil',
      searchQuery: 'cold pressed cooking oil 500ml',
      quantity: '250ml',
      estimatedPrice: 60,
    },
  ],

  disclaimer: 'Checked against the limit you set. Food suggestions, not medical advice.',
};

export const RAJMA_BASE_DATA: RebuiltRecipeData = {
  dishId: 'rajma',
  dishName: 'Rajma Masala',
  tagline: 'Rebuilt for heart-healthy indulgence with velvet nut cream, roasted cumin, and black cardamom.',
  flavorMatchPercent: 91,
  flavorMatchLabel: '91% Flavor Match (sample)',
  costPerServing: 55,
  difficulty: 'Medium',
  estimatedTimeMins: 45,

  originalSodiumMg: 820,
  rebuiltSodiumMg: 330,
  limitSodiumMg: 350,
  sodiumLimitComparison: 'about 2.3x the limit',
  sodiumLimitPercentage: 94,
  isSodiumOverLimit: false,

  originalSatFatG: 7.0,
  rebuiltSatFatG: 2.5,
  satFatReductionPercent: 64,

  originalAddedSugarG: 3.0,
  rebuiltAddedSugarG: 1.5,

  originalIngredients: [
    'Red kidney beans (Rajma)',
    'Slow-cooked onion-tomato reduction',
    'Ginger & garlic paste',
    'Black cardamom & whole spices',
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  rebuiltIngredients: [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  keptIngredients: [],

  swaps: [
    {
      id: 'swap-salt',
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Amchur + roasted cumin + lemon',
      aromaNotes: 'Tangy, mineral-rich brightness balancing heavy beans',
      whyThisWorks: 'Sample explanation: Tangy dry mango powder (amchur) and roasted cumin elevate earthy bean flavors, while a touch of fresh lemon replicates the savory punch of salt.',
    },
    {
      id: 'swap-butter-cream',
      originalIngredient: 'Butter and cream',
      rebuiltIngredient: 'Cashew cream + kasuri methi + black cardamom',
      rebuiltIngredientNutAllergy: 'Pumpkin seed cream + kasuri methi + black cardamom',
      aromaNotes: 'Velvety emulsion with smoky, sweet herbal finish',
      whyThisWorks: 'Sample explanation: Blended soaked cashews replicate the velvet body of dairy cream, while warm-bloomed kasuri methi and crushed black cardamom deliver comforting restaurant richness.',
      whyThisWorksNutAllergy: 'Sample explanation: Blended raw pumpkin seeds provide a silky, nut-free emulsified richness, pairing with black cardamom and kasuri methi for deep restaurant body.',
    },
  ],

  cookingSteps: [
    {
      stepNumber: 1,
      timeMinutes: 15,
      instruction: 'Pressure-cook pre-soaked red kidney beans (rajma) with whole black cardamom and bay leaf until completely soft and creamy.',
      instructionNutAllergy: 'Pressure-cook pre-soaked red kidney beans (rajma) with whole black cardamom and bay leaf until completely soft and creamy.',
    },
    {
      stepNumber: 2,
      timeMinutes: 20,
      instruction: 'Saute pureed onions, ginger, and garlic in cold-pressed oil; stir in pureed vine tomatoes, roasted cumin, amchur, and simmer with the tender kidney beans.',
      instructionNutAllergy: 'Saute pureed onions, ginger, and garlic in cold-pressed oil; stir in pureed vine tomatoes, roasted cumin, amchur, and simmer with the tender kidney beans.',
    },
    {
      stepNumber: 3,
      timeMinutes: 10,
      instruction: 'Stir in velvety cashew cream, fold in hand-crushed kasuri methi, gently mash one ladleful of beans for natural thickness, and finish with fresh lemon.',
      instructionNutAllergy: 'Stir in velvety pumpkin seed cream, fold in hand-crushed kasuri methi, gently mash one ladleful of beans for natural thickness, and finish with fresh lemon.',
    },
  ],

  shoppingList: [
    {
      id: 'item-rajma-beans',
      name: 'Red Kidney Beans (Rajma)',
      searchQuery: 'red kidney beans rajma 500g',
      quantity: '500g pack',
      estimatedPrice: 90,
    },
    {
      id: 'item-cashews',
      name: 'Raw Cashews (for velvet cream)',
      searchQuery: 'raw whole cashews 200g',
      quantity: '150g pack',
      estimatedPrice: 120,
      replacedForNutAllergy: {
        name: 'Pumpkin Seeds (Pepitas, nut-free cream)',
        searchQuery: 'raw pumpkin seeds pepitas 200g',
        quantity: '150g pack',
        estimatedPrice: 85,
      },
    },
    {
      id: 'item-tomatoes-onions',
      name: 'Fresh Tomatoes & Red Onions',
      searchQuery: 'fresh tomatoes onions',
      quantity: '500g fresh',
      estimatedPrice: 40,
    },
    {
      id: 'item-amchur',
      name: 'Amchur (Dry Mango Powder)',
      searchQuery: 'amchur dry mango powder 100g',
      quantity: '100g pack',
      estimatedPrice: 55,
    },
    {
      id: 'item-cumin',
      name: 'Roasted Cumin (Jeera)',
      searchQuery: 'whole cumin seeds 200g',
      quantity: '100g pack',
      estimatedPrice: 45,
    },
    {
      id: 'item-cardamom-methi',
      name: 'Black Cardamom & Kasuri Methi',
      searchQuery: 'black cardamom kasuri methi',
      quantity: '50g pack',
      estimatedPrice: 40,
    },
    {
      id: 'item-oil',
      name: 'Cold-pressed Cooking Oil',
      searchQuery: 'cold pressed cooking oil 500ml',
      quantity: '250ml',
      estimatedPrice: 60,
    },
  ],

  disclaimer: 'Checked against the limit you set. Food suggestions, not medical advice.',
};

export const KHICHDI_BASE_DATA: RebuiltRecipeData = {
  dishId: 'khichdi',
  dishName: 'Moong Dal Khichdi',
  tagline: 'Rebuilt for soothing comfort with ginger, crushed pepper, and starch emulsion instead of heavy ghee.',
  flavorMatchPercent: 93,
  flavorMatchLabel: '93% Flavor Match (sample)',
  costPerServing: 35,
  difficulty: 'Easy',
  estimatedTimeMins: 30,

  originalSodiumMg: 700,
  rebuiltSodiumMg: 260,
  limitSodiumMg: 350,
  sodiumLimitComparison: 'about 2.0x the limit',
  sodiumLimitPercentage: 74,
  isSodiumOverLimit: false,

  originalSatFatG: 5.0,
  rebuiltSatFatG: 1.8,
  satFatReductionPercent: 64,

  originalAddedSugarG: 0.5,
  rebuiltAddedSugarG: 0.5,

  originalIngredients: [
    'Split yellow moong dal (dhuli moong)',
    'Short-grain khichdi rice',
    'Fresh grated ginger & black pepper',
    'Ground turmeric',
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  rebuiltIngredients: [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  keptIngredients: [],

  swaps: [
    {
      id: 'swap-salt',
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Roasted cumin + ginger + black pepper + lemon',
      aromaNotes: 'Warm gingerol spice and piquant citrus stimulating receptors',
      whyThisWorks: 'Sample explanation: Pungent fresh ginger and freshly cracked black pepper heighten the palate sensitivity, while lemon juice provides the tart snap usually delivered by sodium.',
    },
    {
      id: 'swap-butter-cream',
      originalIngredient: 'Desi ghee (clarified butter)',
      rebuiltIngredient: 'A little cold-pressed oil + hing + mashed rice for creaminess',
      aromaNotes: 'Savory roasted allium aroma in light starch emulsion',
      whyThisWorks: 'Sample explanation: Whisking a portion of the cooked starchy rice and dal creates a natural silky emulsion, while hing and cumin in cold-pressed oil mimic the nutty comfort of traditional ghee.',
    },
  ],

  cookingSteps: [
    {
      stepNumber: 1,
      timeMinutes: 5,
      instruction: 'Wash equal measures of yellow moong dal and rice until water runs clear; toss lightly in the pot with grated ginger and ground turmeric.',
    },
    {
      stepNumber: 2,
      timeMinutes: 15,
      instruction: 'Add four cups of water and cook on medium-low until the grains are very soft; stir vigorously against the side of the pot to release natural starches for creamy body.',
    },
    {
      stepNumber: 3,
      timeMinutes: 10,
      instruction: 'Warm cold-pressed oil in a small pan with cumin seeds, cracked black pepper, and hing; pour the fragrant tadka into the steaming khichdi and finish with fresh lemon.',
    },
  ],

  shoppingList: [
    {
      id: 'item-moong-dal',
      name: 'Split Yellow Moong Dal',
      searchQuery: 'split yellow moong dal 500g',
      quantity: '500g pack',
      estimatedPrice: 75,
    },
    {
      id: 'item-rice',
      name: 'Short-grain Khichdi Rice',
      searchQuery: 'short grain rice 1kg',
      quantity: '1kg pack',
      estimatedPrice: 65,
    },
    {
      id: 'item-ginger-lemon',
      name: 'Fresh Ginger Root & Lemon',
      searchQuery: 'fresh ginger root lemon',
      quantity: '200g',
      estimatedPrice: 25,
    },
    {
      id: 'item-cumin-pepper',
      name: 'Whole Cumin Seeds & Black Pepper',
      searchQuery: 'whole cumin seeds black pepper',
      quantity: '100g pack',
      estimatedPrice: 50,
    },
    {
      id: 'item-hing',
      name: 'Asafoetida (Hing)',
      searchQuery: 'asafoetida hing powder',
      quantity: '25g container',
      estimatedPrice: 40,
    },
    {
      id: 'item-oil',
      name: 'Cold-pressed Cooking Oil',
      searchQuery: 'cold pressed cooking oil 500ml',
      quantity: '250ml',
      estimatedPrice: 60,
    },
  ],

  disclaimer: 'Checked against the limit you set. Food suggestions, not medical advice.',
};

export const ALOO_GOBI_BASE_DATA: RebuiltRecipeData = {
  dishId: 'aloo-gobi',
  dishName: 'Aloo Gobi',
  tagline: 'Rebuilt for crisp golden edges and rich flavor with dry-roasted coriander, amchur, and cumin blooming.',
  flavorMatchPercent: 92,
  flavorMatchLabel: '92% Flavor Match (sample)',
  costPerServing: 40,
  difficulty: 'Easy',
  estimatedTimeMins: 30,

  originalSodiumMg: 640,
  rebuiltSodiumMg: 240,
  limitSodiumMg: 350,
  sodiumLimitComparison: 'about 1.8x the limit',
  sodiumLimitPercentage: 69,
  isSodiumOverLimit: false,

  originalSatFatG: 4.5,
  rebuiltSatFatG: 1.4,
  satFatReductionPercent: 69,

  originalAddedSugarG: 1.5,
  rebuiltAddedSugarG: 1.0,

  originalIngredients: [
    'Fresh cauliflower florets',
    'Diced golden potatoes',
    'Minced ginger & green chilies',
    'Turmeric & fresh cilantro',
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  rebuiltIngredients: [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],

  keptIngredients: [],

  swaps: [
    {
      id: 'swap-salt',
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Amchur + dry-roasted coriander + lemon',
      aromaNotes: 'Floral citrus linalool and fruit acids cutting through starch',
      whyThisWorks: 'Sample explanation: Coarsely ground dry-roasted coriander releases floral citrus notes that balance tangy amchur, creating satisfying savory depth on potatoes without salt crystals.',
    },
    {
      id: 'swap-butter-cream',
      originalIngredient: 'Butter and ghee',
      rebuiltIngredient: 'Cold-pressed oil + roasted cumin + hing',
      aromaNotes: 'Warm nutty earthy seed roast coating vegetables',
      whyThisWorks: 'Sample explanation: Blooming roasted cumin and hing in a modest measure of cold-pressed oil evenly coats the potatoes and cauliflower florets with rich roasted aroma and crisp caramelization without dairy fat.',
    },
  ],

  cookingSteps: [
    {
      stepNumber: 1,
      timeMinutes: 8,
      instruction: 'Chop cauliflower into medium florets and peel potatoes into cubes; par-steam or boil for 3 minutes so they cook tenderly without absorbing excess oil.',
    },
    {
      stepNumber: 2,
      timeMinutes: 14,
      instruction: 'Heat cold-pressed oil in a wide heavy-bottom pan; bloom cumin seeds, minced ginger, and hing, then add potatoes and cauliflower with turmeric, covering until tender.',
    },
    {
      stepNumber: 3,
      timeMinutes: 8,
      instruction: 'Uncover, sprinkle dry-roasted coriander and tangy amchur, saute on high heat until the florets develop crisp golden edges, and garnish with fresh cilantro and lemon.',
    },
  ],

  shoppingList: [
    {
      id: 'item-cauliflower',
      name: 'Fresh Cauliflower',
      searchQuery: 'fresh cauliflower head',
      quantity: '1 head (~600g)',
      estimatedPrice: 35,
    },
    {
      id: 'item-potatoes',
      name: 'Baby Potatoes',
      searchQuery: 'potatoes 500g',
      quantity: '500g fresh',
      estimatedPrice: 25,
    },
    {
      id: 'item-coriander-seeds',
      name: 'Coriander Seeds (Dhania)',
      searchQuery: 'coriander seeds dhania 100g',
      quantity: '100g pack',
      estimatedPrice: 40,
    },
    {
      id: 'item-amchur',
      name: 'Amchur (Dry Mango Powder)',
      searchQuery: 'amchur dry mango powder 100g',
      quantity: '100g pack',
      estimatedPrice: 55,
    },
    {
      id: 'item-cumin-hing',
      name: 'Cumin Seeds & Asafoetida (Hing)',
      searchQuery: 'cumin seeds hing powder',
      quantity: '100g pack',
      estimatedPrice: 55,
    },
    {
      id: 'item-ginger-cilantro',
      name: 'Fresh Ginger, Chili & Cilantro',
      searchQuery: 'fresh ginger green chili cilantro',
      quantity: '150g fresh',
      estimatedPrice: 25,
    },
    {
      id: 'item-oil',
      name: 'Cold-pressed Cooking Oil',
      searchQuery: 'cold pressed cooking oil 500ml',
      quantity: '250ml',
      estimatedPrice: 60,
    },
  ],

  disclaimer: 'Checked against the limit you set. Food suggestions, not medical advice.',
};

export const REBUILT_RECIPES_DATABASE: Record<string, RebuiltRecipeData> = {
  'butter-chicken': BUTTER_CHICKEN_BASE_DATA,
  'dal-chawal': DAL_CHAWAL_BASE_DATA,
  'rajma': RAJMA_BASE_DATA,
  'khichdi': KHICHDI_BASE_DATA,
  'aloo-gobi': ALOO_GOBI_BASE_DATA,
};

export const DISH_CORE_INGREDIENTS: Record<string, string[]> = {
  'butter-chicken': [
    'Bone-in or boneless chicken',
    'Tomato puree & whole tomatoes',
    'Kasuri methi (fenugreek)',
    'Ginger & garlic paste',
  ],
  'dal-chawal': [
    'Yellow lentils (Toor & Moong dal)',
    'Fragrant Basmati rice',
    'Fresh garlic & ginger',
    'Vine tomatoes & turmeric',
  ],
  'rajma': [
    'Red kidney beans (Chitra Rajma)',
    'Slow-cooked onion-tomato reduction',
    'Fresh ginger-garlic paste',
    'Whole black cardamom & bay leaf',
  ],
  'khichdi': [
    'Split yellow moong dal (dhuli moong)',
    'Short-grain khichdi rice',
    'Fresh grated ginger & black pepper',
    'Ground turmeric',
  ],
  'aloo-gobi': [
    'Fresh cauliflower florets',
    'Diced golden potatoes',
    'Minced ginger & green chilies',
    'Turmeric & fresh cilantro',
  ],
};

export const DISH_SAMPLE_PENALTIES: Record<string, Record<string, IngredientSamplePenalty>> = {
  'butter-chicken': {
    'Refined table salt': {
      ingredient: 'Refined table salt',
      keptSodiumPenaltyMg: 520,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0,
      description: '+520 mg sodium (sample estimate)',
    },
    'Refined white sugar': {
      ingredient: 'Refined white sugar',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 3.0,
      keptSatFatPenaltyG: 0,
      description: '+3 g sugar (sample estimate)',
    },
    'Salted table butter & ghee': {
      ingredient: 'Salted table butter & ghee',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 9.0,
      description: '+9 g saturated fat (sample estimate)',
    },
    'Heavy dairy cream': {
      ingredient: 'Heavy dairy cream',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 5.0,
      description: '+5 g saturated fat (sample estimate)',
    },
  },
  'dal-chawal': {
    'Refined table salt': {
      ingredient: 'Refined table salt',
      keptSodiumPenaltyMg: 490,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0,
      description: '+490 mg sodium (sample estimate)',
    },
    'Refined white sugar': {
      ingredient: 'Refined white sugar',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0.5,
      keptSatFatPenaltyG: 0,
      description: '+0.5 g sugar (sample estimate)',
    },
    'Salted table butter & ghee': {
      ingredient: 'Salted table butter & ghee',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 3.8,
      description: '+3.8 g saturated fat (sample estimate)',
    },
    'Heavy dairy cream': {
      ingredient: 'Heavy dairy cream',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0.0,
      description: '+0 g saturated fat (dish uses ghee tadka)',
    },
  },
  'rajma': {
    'Refined table salt': {
      ingredient: 'Refined table salt',
      keptSodiumPenaltyMg: 490,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0,
      description: '+490 mg sodium (sample estimate)',
    },
    'Refined white sugar': {
      ingredient: 'Refined white sugar',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 1.5,
      keptSatFatPenaltyG: 0,
      description: '+1.5 g sugar (sample estimate)',
    },
    'Salted table butter & ghee': {
      ingredient: 'Salted table butter & ghee',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 2.5,
      description: '+2.5 g saturated fat (sample estimate)',
    },
    'Heavy dairy cream': {
      ingredient: 'Heavy dairy cream',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 2.0,
      description: '+2.0 g saturated fat (sample estimate)',
    },
  },
  'khichdi': {
    'Refined table salt': {
      ingredient: 'Refined table salt',
      keptSodiumPenaltyMg: 440,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0,
      description: '+440 mg sodium (sample estimate)',
    },
    'Refined white sugar': {
      ingredient: 'Refined white sugar',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0.0,
      keptSatFatPenaltyG: 0,
      description: '+0 g sugar (sample estimate)',
    },
    'Salted table butter & ghee': {
      ingredient: 'Salted table butter & ghee',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 3.2,
      description: '+3.2 g saturated fat (sample estimate)',
    },
    'Heavy dairy cream': {
      ingredient: 'Heavy dairy cream',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0.0,
      description: '+0 g saturated fat (dish uses ghee, not cream)',
    },
  },
  'aloo-gobi': {
    'Refined table salt': {
      ingredient: 'Refined table salt',
      keptSodiumPenaltyMg: 400,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0,
      description: '+400 mg sodium (sample estimate)',
    },
    'Refined white sugar': {
      ingredient: 'Refined white sugar',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0.5,
      keptSatFatPenaltyG: 0,
      description: '+0.5 g sugar (sample estimate)',
    },
    'Salted table butter & ghee': {
      ingredient: 'Salted table butter & ghee',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 3.1,
      description: '+3.1 g saturated fat (sample estimate)',
    },
    'Heavy dairy cream': {
      ingredient: 'Heavy dairy cream',
      keptSodiumPenaltyMg: 0,
      keptSugarPenaltyG: 0,
      keptSatFatPenaltyG: 0.0,
      description: '+0 g saturated fat (dish is cream-free)',
    },
  },
};

export const DISH_WHAT_WILL_CHANGE: Record<string, Array<{ title: string; description: string }>> = {
  'butter-chicken': [
    {
      title: 'Salt & Sodium',
      description: 'Table salt replaced by roasted cumin & tangy amchur (dry mango).',
    },
    {
      title: 'Saturated Fat',
      description: 'Heavy dairy butter & cream swapped for silky cashew cream (or pumpkin seed cream) paired with bloomed kasuri methi.',
    },
    {
      title: 'Added Sugar',
      description: 'Refined white sugar reduced by caramelizing ripe vine tomatoes to harness natural fructose sweetness.',
    },
  ],
  'dal-chawal': [
    {
      title: 'Salt & Sodium',
      description: 'Table salt replaced by roasted cumin, amchur, and a fresh squeeze of lemon at serving.',
    },
    {
      title: 'Saturated Fat',
      description: 'Ghee tadka swapped for a small amount of cold-pressed oil with hing, toasted cumin, and aromatic garlic.',
    },
    {
      title: 'Added Sugar',
      description: 'Refined sugar reduced to 0.5g with natural tomato savoriness and sweet basmati rice.',
    },
  ],
  'rajma': [
    {
      title: 'Salt & Sodium',
      description: 'Table salt replaced by tangy amchur, roasted cumin, and fresh lemon.',
    },
    {
      title: 'Saturated Fat',
      description: 'Butter and cream swapped for cashew cream (pumpkin seed cream if nut-free) + kasuri methi + black cardamom.',
    },
    {
      title: 'Added Sugar',
      description: 'Refined sugar reduced from 3.0g to 1.5g by caramelizing slow-simmered onion-tomato reduction.',
    },
  ],
  'khichdi': [
    {
      title: 'Salt & Sodium',
      description: 'Table salt replaced by roasted cumin, fresh ginger, cracked black pepper, and lemon.',
    },
    {
      title: 'Saturated Fat',
      description: 'Desi ghee swapped for cold-pressed oil, hing, and a natural starchy rice mash for velvet creaminess.',
    },
    {
      title: 'Added Sugar',
      description: 'Zero refined sugars added, preserving 0.5g wholesome natural baseline.',
    },
  ],
  'aloo-gobi': [
    {
      title: 'Salt & Sodium',
      description: 'Table salt replaced by amchur, dry-roasted coriander, and fresh lemon.',
    },
    {
      title: 'Saturated Fat',
      description: 'Butter and ghee swapped for cold-pressed oil + roasted cumin + hing.',
    },
    {
      title: 'Added Sugar',
      description: 'Refined sugar reduced from 1.5g to 1.0g via natural vegetable caramelization.',
    },
  ],
};

