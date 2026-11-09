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
  costPerServing: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTimeMins: number;
  
  // Sodium & limits
  originalSodiumMg: number;
  rebuiltSodiumMg: number;
  limitSodiumMg: number;
  sodiumLimitComparison: string; // "about 2.5x the limit"
  sodiumLimitPercentage: number; // 88%

  // Saturated Fat
  originalSatFatG: number;
  rebuiltSatFatG: number;
  satFatReductionPercent: number; // -72%

  // Added Sugar
  originalAddedSugarG: number;
  rebuiltAddedSugarG: number;

  originalIngredients: string[];
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
    id: 'rajma',
    name: 'Rajma Masala',
    hindiName: 'राजमा मसाला',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Slow-cooked kidney beans simmered in spiced onion-tomato reduction.',
    servings: 4,
    available: false,
    tag: 'Coming soon',
  },
  {
    id: 'khichdi',
    name: 'Moong Dal Khichdi',
    hindiName: 'मूंग दाल खिचड़ी',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Comforting one-pot moong dal and basmati rice with cumin tempering.',
    servings: 2,
    available: false,
    tag: 'Coming soon',
  },
  {
    id: 'aloo-gobi',
    name: 'Aloo Gobi',
    hindiName: 'आलू गोभी',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Crisp florets of cauliflower and potatoes tossed with turmeric and ginger.',
    servings: 4,
    available: false,
    tag: 'Coming soon',
  },
  {
    id: 'dal-chawal',
    name: 'Dal Tadka & Chawal',
    hindiName: 'दाल तड़का चावल',
    category: 'Vegetarian',
    compatibleDiets: ['Vegetarian', 'Vegan', 'Dairy-free', 'Non-veg'],
    description: 'Golden yellow lentils topped with garlic-cumin tadka over steamed rice.',
    servings: 3,
    available: false,
    tag: 'Coming soon',
  },
];

export const BUTTER_CHICKEN_BASE_DATA: RebuiltRecipeData = {
  dishId: 'butter-chicken',
  dishName: 'Butter Chicken',
  tagline: 'Rebuilt for lower sodium & saturated fat while keeping rich restaurant aroma.',
  flavorMatchPercent: 94,
  costPerServing: 65,
  difficulty: 'Easy',
  estimatedTimeMins: 30,

  // Values strictly matching requirements
  originalSodiumMg: 890,
  rebuiltSodiumMg: 310,
  limitSodiumMg: 350,
  sodiumLimitComparison: 'about 2.5x the limit', // 890 mg vs 350 mg is ~2.5x
  sodiumLimitPercentage: 88, // 310/350 is ~88.5%

  originalSatFatG: 14.0,
  rebuiltSatFatG: 3.9,
  satFatReductionPercent: 72, // -72%

  originalAddedSugarG: 4.0,
  rebuiltAddedSugarG: 1.0,

  originalIngredients: [
    'Bone-in or boneless chicken',
    'Heavy dairy cream',
    'Salted table butter & ghee',
    'Refined table salt',
    'Tomato puree & whole tomatoes',
    'Refined white sugar',
    'Kasuri methi (fenugreek)',
    'Ginger & garlic paste',
  ],

  swaps: [
    {
      id: 'swap-salt',
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Roasted cumin + amchur',
      aromaNotes: 'Earthy, tangy punch activating salivary tang receptors',
      whyThisWorks: 'Roasted cumin provides a deep savory baseline while raw mango powder (amchur) lends natural acidity that mimics salty sharpness on your tongue.',
    },
    {
      id: 'swap-butter-cream',
      originalIngredient: 'Butter, ghee and cream',
      rebuiltIngredient: 'Cashew cream + bloomed kasuri methi',
      rebuiltIngredientNutAllergy: 'Pumpkin seed cream + bloomed kasuri methi',
      aromaNotes: 'Silky mouthfeel & rich lactone-like nutty sweetness',
      whyThisWorks: 'Blended soaked cashews replicate the velvet emulsified body of heavy cream, while warm-bloomed kasuri methi shares a similar aroma to clarified butter.',
      whyThisWorksNutAllergy: 'Blended toasted pumpkin seeds provide an identical silky, emulsion-rich texture free of tree nuts, pairing with bloomed kasuri methi to deliver rich buttery depth.',
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
