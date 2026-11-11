import { RebuiltRecipeData } from '../data/sampleData';

export interface FlavorBotContext {
  dishId: string;
  dishName: string;
  diet: string;
  allergies: string[];
  rebuiltIngredients: string[];
  keptIngredients: string[];
  originalSodiumMg: number;
  rebuiltSodiumMg: number;
  limitSodiumMg: number;
  isSodiumOverLimit: boolean;
  originalSatFatG: number;
  rebuiltSatFatG: number;
  originalAddedSugarG: number;
  rebuiltAddedSugarG: number;
  costPerServing: number;
  difficulty: string;
  estimatedTimeMins: number;
  swaps: {
    originalIngredient: string;
    rebuiltIngredient: string;
    whyThisWorks: string;
  }[];
  cookingSteps: {
    stepNumber: number;
    timeMinutes: number;
    instruction: string;
  }[];
  shoppingListTotal?: number;
}

export interface FlavorBotResponse {
  text: string;
  source: 'rule' | 'gemini' | 'fallback';
  suggestChips?: boolean;
  debugError?: string;
}

export const SUGGESTED_QUESTION_CHIPS = [
  'Why this swap?',
  'Is this nut-free?',
  'How much sodium is left?',
  'Can I use pumpkin seeds instead of cashews?',
  'How hard is this dish?',
];

/**
 * Checks if input contains common Hinglish markers
 */
function isHinglishQuery(text: string): boolean {
  return /\b(kya|kaise|kitna|kitni|hai|hain|bhi|nahi|nahin|karna|kar|batao|hoga|hogi|chahiye|namak|cheeni|tel|kaju|swaad|mushkil|aasan)\b/i.test(
    text
  );
}

/**
 * Layer 1: Rule-based engine answering from the app's own data.
 * Returns null if no rule matches, triggering Layer 2.
 */
export function matchRuleBasedFlavorBot(
  query: string,
  ctx: FlavorBotContext
): FlavorBotResponse | null {
  const q = query.trim().toLowerCase();
  const isHinglish = isHinglishQuery(query);

  // Medical / health questions check
  if (/\b(bp|blood pressure|hypertension|heart|heart attack|kidney|cholesterol|diabetes|sugar patient|cure|doctor|dietitian|treatment|stroke)\b/i.test(q)) {
    return {
      text: isHinglish
        ? 'Flavor Bridge culinary suggestions provide karta hai, medical advice nahi. Apni personal health ya medical diet ke liye please apne doctor ya dietitian se consult karein.'
        : 'Flavor Bridge provides culinary suggestions, not medical advice. For personal health conditions or clinical diet plans, please consult your doctor or registered dietitian.',
      source: 'rule',
    };
  }

  // Available Dishes Inquiry: "which non-veg / vegetarian / vegan / dairy-free dishes do you have"
  const isDishListingQuery =
    q.includes('which dish') ||
    q.includes('which dishes') ||
    q.includes('what dish') ||
    q.includes('what dishes') ||
    q.includes('dishes do you have') ||
    q.includes('available dish') ||
    q.includes('available dishes') ||
    q.includes('list dishes') ||
    q.includes('show dishes') ||
    q.includes('menu') ||
    q.includes('kaun se dish') ||
    q.includes('kaun si dish') ||
    q.includes('kaun se dishes') ||
    q.includes('kaun kaun se dish') ||
    q.includes('kaun kaun se dishes') ||
    q.includes('kya kya dish') ||
    q.includes('kya kya dishes') ||
    q.includes('dishes hain') ||
    q.includes('dish batao') ||
    q.includes('dishes batao') ||
    ((q.includes('dish') || q.includes('dishes') || q.includes('options') || q.includes('recipes')) &&
      (q.includes('non-veg') ||
        q.includes('non veg') ||
        q.includes('vegetarian') ||
        q.includes('veg') ||
        q.includes('vegan') ||
        q.includes('dairy-free') ||
        q.includes('dairy free') ||
        q.includes('have') ||
        q.includes('available') ||
        q.includes('list')));

  if (isDishListingQuery) {
    const isNonVeg =
      q.includes('non-veg') ||
      q.includes('non veg') ||
      q.includes('chicken') ||
      q.includes('meat') ||
      q.includes('poultry');
    const isVegan = q.includes('vegan');
    const isDairyFree = q.includes('dairy-free') || q.includes('dairy free') || q.includes('lactose');
    const isVegetarian =
      (q.includes('vegetarian') || q.includes('shakahari') || (q.includes('veg') && !q.includes('non'))) &&
      !isVegan;

    if (isNonVeg) {
      return {
        text: isHinglish
          ? `Non-veg diet ke liye hamare paas Butter Chicken (Murgh Makhani) available hai! Saath hi aap hamare rebuilt vegetarian dishes bhi include kar sakte hain: Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, aur Aloo Gobi.`
          : `For Non-veg, we currently feature our signature rebuilt Butter Chicken (Murgh Makhani). You can also enjoy all our plant-based dishes: Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, and Aloo Gobi.`,
        source: 'rule',
      };
    }

    if (isVegan) {
      return {
        text: isHinglish
          ? `Vegan diet ke liye hamare paas 4 wholesome dishes hain: Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, aur Aloo Gobi. Yeh sabhi 100% plant-based oils aur cold-pressed tadka ke saath banaye gaye hain (zero dairy ya ghee).`
          : `For Vegan diets, we offer 4 fully plant-based rebuilt dishes: Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, and Aloo Gobi. All are crafted using cold-pressed oils and seed creams with zero dairy or ghee.`,
        source: 'rule',
      };
    }

    if (isDairyFree) {
      return {
        text: isHinglish
          ? `Dairy-free diet ke liye hamare paas sabhi 5 dishes available hain: Butter Chicken (cashew/seed cream ke saath rebuilt), Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, aur Aloo Gobi.`
          : `For Dairy-free diets, all 5 dishes are available: Butter Chicken (rebuilt with velvety seed/cashew cream), Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, and Aloo Gobi.`,
        source: 'rule',
      };
    }

    if (isVegetarian) {
      return {
        text: isHinglish
          ? `Vegetarian diet ke liye hamare paas 4 traditional rebuilt dishes hain: Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, aur Aloo Gobi.`
          : `For Vegetarian diets, we have 4 classic rebuilt dishes: Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, and Aloo Gobi.`,
        source: 'rule',
      };
    }

    // Default response listing dishes based on the user's selected diet profile
    const dietLabel = ctx.diet || 'your selected diet';
    return {
      text: isHinglish
        ? `Flavor Bridge mein abhi 5 rebuilt dishes hain: Butter Chicken (Non-veg), Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, aur Aloo Gobi. Aapka current profile ${dietLabel} par set hai.`
        : `Flavor Bridge currently features 5 rebuilt dishes: Butter Chicken (Non-veg), Dal Tadka & Chawal, Rajma Masala, Moong Dal Khichdi, and Aloo Gobi. Your current profile is set to ${dietLabel}.`,
      source: 'rule',
    };
  }

  // Chip 1: "Why this swap?" / general swap inquiry
  if (
    q.includes('why this swap') ||
    q.includes('why swap') ||
    q.includes('swap kyu') ||
    q.includes('badla kyu') ||
    q.includes('substitut') ||
    (q.includes('why') && q.includes('swap')) ||
    q === 'why this swap?'
  ) {
    if (ctx.swaps.length === 0) {
      return {
        text: isHinglish
          ? `Is dish (${ctx.dishName}) mein current customization ke mutabik sabhi traditional ingredients retain kiye gaye hain.`
          : `For ${ctx.dishName}, all traditional ingredients are currently retained.`,
        source: 'rule',
      };
    }
    const swapSummary = ctx.swaps
      .map((s) => `${s.originalIngredient} -> ${s.rebuiltIngredient}`)
      .join('; ');
    return {
      text: isHinglish
        ? `${ctx.dishName} mein swaps flavor balance aur health ke liye hain: ${swapSummary}. Isse sodium aur saturated fat kam hota hai par taste delicious rehta hai!`
        : `In ${ctx.dishName}, we swapped: ${swapSummary}. These aroma twins trigger savory and tart receptors so you get deep culinary satisfaction with far less sodium and saturated fat!`,
      source: 'rule',
    };
  }

  // Chip 4: "Can I use pumpkin seeds instead of cashews?"
  if (
    q.includes('pumpkin seed') ||
    q.includes('pumpkin seeds') ||
    q.includes('pepitas') ||
    q.includes('kaddu ke beej') ||
    (q.includes('instead of') && q.includes('cashew')) ||
    q === 'can i use pumpkin seeds instead of cashews?'
  ) {
    return {
      text: isHinglish
        ? 'Haan bilkul! Raw pumpkin seeds (kaddu ke beej) ko 20 minute gungune paani mein bhigo kar blend karein. Isse bina kisi dairy ya nut allergens ke bilkul wahi makhmali cream texture milta hai.'
        : 'Absolutely! Raw pumpkin seeds (pepitas) blend into an identical silky, rich cream with zero dairy and zero nut allergens. Soak raw pumpkin seeds in hot water for 20 minutes, then blend smooth with water.',
      source: 'rule',
    };
  }

  // Chip 2: "Is this nut-free?" / nut allergy inquiry
  if (
    q.includes('nut-free') ||
    q.includes('nut free') ||
    q.includes('contain nut') ||
    q.includes('contains nut') ||
    q.includes('nut allergy') ||
    q.includes('peanut') ||
    q.includes('tree nut') ||
    q === 'is this nut-free?' ||
    (q.includes('kaju') && !q.includes('kaddu')) ||
    (q.includes('cashew') && !q.includes('pumpkin') && !q.includes('seed'))
  ) {
    const hasNutAllergy = ctx.allergies.includes('Nuts');
    const usesCashews = ctx.swaps.some((s) =>
      s.rebuiltIngredient.toLowerCase().includes('cashew')
    );

    if (hasNutAllergy) {
      return {
        text: isHinglish
          ? `Haanji! Aapka "Nuts" allergy filter active hai, isliye humne cashew cream ki jagah pumpkin seed cream use ki hai. Yeh recipe 100% nut-free hai.`
          : `Yes, this recipe is 100% nut-free! Your "Nuts" allergy filter automatically substituted cashew cream with silky pumpkin seed cream (pepitas).`,
        source: 'rule',
      };
    }

    if (!usesCashews) {
      return {
        text: isHinglish
          ? `Haanji! ${ctx.dishName} naturally nut-free hai aur iske ingredients mein koi bhi tree nuts ya kaju use nahi hote.`
          : `Yes! ${ctx.dishName} is naturally nut-free and uses no tree nuts or peanuts in its rebuilt recipe.`,
        source: 'rule',
      };
    }

    return {
      text: isHinglish
        ? `Is rebuilt version mein cashew cream hai. Agar aapko nut allergy hai, toh Step 1 (Diet Profile) mein "Nuts" select karein, Flavor Bridge ise automatically pumpkin seed cream se replace kar dega!`
        : `This version currently uses cashew cream for silky mouthfeel. If you need it nut-free, select "Nuts" under Allergies in Step 1, and it will automatically rebuild using pumpkin seed cream!`,
      source: 'rule',
    };
  }

  // Chip 3: "How much sodium is left?" / sodium inquiry
  if (
    q.includes('how much sodium') ||
    q.includes('sodium left') ||
    q.includes('sodium content') ||
    q.includes('kitna sodium') ||
    q.includes('kitna namak') ||
    q === 'how much sodium is left?'
  ) {
    const safeRoom = ctx.limitSodiumMg - ctx.rebuiltSodiumMg;
    if (ctx.isSodiumOverLimit) {
      return {
        text: isHinglish
          ? `${ctx.dishName} mein abhi ${ctx.rebuiltSodiumMg} mg sodium hai (sample estimate), jo aapke ${ctx.limitSodiumMg} mg limit se zyada hai kyunki table salt kept hai. Limit ke andar rehne ke liye "Refined table salt" toggle ON karein.`
          : `${ctx.dishName} currently has ${ctx.rebuiltSodiumMg} mg sodium per serving (sample estimate), exceeding your ${ctx.limitSodiumMg} mg limit because original table salt was kept. Toggle "Refined table salt" back on in Step 2 to stay under limit.`,
        source: 'rule',
      };
    }
    return {
      text: isHinglish
        ? `${ctx.dishName} mein sirf ${ctx.rebuiltSodiumMg} mg sodium hai per serving! Aapka limit ${ctx.limitSodiumMg} mg hai, isliye aapke paas ${safeRoom} mg ka safe room bacha hai.`
        : `${ctx.dishName} has only ${ctx.rebuiltSodiumMg} mg sodium per serving (original traditional had ${ctx.originalSodiumMg} mg). Your limit is ${ctx.limitSodiumMg} mg, leaving you ${safeRoom} mg of safe room!`,
      source: 'rule',
    };
  }

  // Chip 5: "How hard is this dish?" / difficulty inquiry
  if (
    q.includes('how hard') ||
    q.includes('difficulty') ||
    q.includes('kitna mushkil') ||
    q.includes('aasan') ||
    q.includes('how difficult') ||
    q.includes('how easy') ||
    q.includes('time') ||
    q.includes('kitna time') ||
    q === 'how hard is this dish?'
  ) {
    return {
      text: isHinglish
        ? `${ctx.dishName} banana ${ctx.difficulty.toLowerCase()} hai! Yeh sirf ${ctx.estimatedTimeMins} minutes leti hai aur 3 simple steps mein ban jaati hai. Estimated cost lagbhag Rs ${ctx.costPerServing} per serving hai.`
        : `${ctx.dishName} is rated ${ctx.difficulty}! It takes approximately ${ctx.estimatedTimeMins} minutes across ${ctx.cookingSteps.length} simple steps, with an estimated cost of Rs ${ctx.costPerServing} per serving.`,
      source: 'rule',
    };
  }

  // Cooking steps inquiry
  if (
    q.includes('how to cook') ||
    q.includes('cooking steps') ||
    q.includes('recipe steps') ||
    q.includes('kaise banaye') ||
    q.includes('banane ka tarika')
  ) {
    const stepsSummary = ctx.cookingSteps
      .map((s) => `Step ${s.stepNumber} (${s.timeMinutes}m): ${s.instruction.slice(0, 75)}...`)
      .join(' ');
    return {
      text: isHinglish
        ? `${ctx.dishName} 3 steps mein banti hai: ${stepsSummary}`
        : `${ctx.dishName} has 3 easy steps: ${stepsSummary}`,
      source: 'rule',
    };
  }

  // Cost / Shopping inquiry
  if (q.includes('cost') || q.includes('price') || q.includes('kharcha') || q.includes('shopping')) {
    return {
      text: isHinglish
        ? `${ctx.dishName} ka estimated cost Rs ${ctx.costPerServing} per serving hai. Pura grocery basket lagbhag ₹${ctx.shoppingListTotal || 410} ka aata hai.`
        : `Estimated cost for ${ctx.dishName} is Rs ${ctx.costPerServing} per serving. The full grocery basket is estimated around ₹${ctx.shoppingListTotal || 410}.`,
      source: 'rule',
    };
  }

  // Saturated fat inquiry
  if (q.includes('fat') || q.includes('saturated') || q.includes('ghee') || q.includes('butter')) {
    return {
      text: isHinglish
        ? `Traditional ${ctx.dishName} mein ${ctx.originalSatFatG}g saturated fat tha, par rebuilt version mein sirf ${ctx.rebuiltSatFatG}g hai! Humne ghee aur cream ko light cold-pressed oil aur seed/nut cream se replace kiya hai.`
        : `Traditional ${ctx.dishName} has ${ctx.originalSatFatG}g saturated fat, whereas our rebuilt recipe has only ${ctx.rebuiltSatFatG}g! We swapped heavy ghee/cream for cold-pressed oil and seed or nut creams.`,
      source: 'rule',
    };
  }

  // Sugar inquiry
  if (q.includes('sugar') || q.includes('cheeni') || q.includes('sweet')) {
    return {
      text: isHinglish
        ? `${ctx.dishName} mein added sugar ko ${ctx.originalAddedSugarG}g se ghata kar ${ctx.rebuiltAddedSugarG}g kiya gaya hai, ripe tomatoes ki natural mithas use karke.`
        : `${ctx.dishName} added sugar is reduced from ${ctx.originalAddedSugarG}g down to ${ctx.rebuiltAddedSugarG}g by utilizing natural caramelization of vine tomatoes instead of refined sugar.`,
      source: 'rule',
    };
  }

  return null;
}

/**
 * Layer 2: Server-side Gemini API call with strict 8-second timeout and guardrails.
 * Proxied via /api/flavor-bot to keep model calls and keys safely on the server.
 */
export async function callGeminiFlavorBot(
  userQuery: string,
  ctx: FlavorBotContext
): Promise<FlavorBotResponse> {
  const contextData = {
    dish: ctx.dishName,
    diet: ctx.diet,
    allergies: ctx.allergies,
    rebuiltIngredients: ctx.rebuiltIngredients,
    keptIngredients: ctx.keptIngredients,
    nutritionPerServing: {
      originalSodiumMg: ctx.originalSodiumMg,
      rebuiltSodiumMg: ctx.rebuiltSodiumMg,
      limitSodiumMg: ctx.limitSodiumMg,
      isSodiumOverLimit: ctx.isSodiumOverLimit,
      originalSatFatG: ctx.originalSatFatG,
      rebuiltSatFatG: ctx.rebuiltSatFatG,
      originalAddedSugarG: ctx.originalAddedSugarG,
      rebuiltAddedSugarG: ctx.rebuiltAddedSugarG,
      costPerServing: ctx.costPerServing,
      difficulty: ctx.difficulty,
      estimatedTimeMins: ctx.estimatedTimeMins,
    },
    swaps: ctx.swaps,
    cookingSteps: ctx.cookingSteps,
  };

  try {
    const response = await fetch('/api/flavor-bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userQuery,
        context: contextData,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      let reason = `status ${response.status}`;
      try {
        const errData = await response.json();
        const shortReason = errData?.reason || errData?.message || errData?.error;
        if (shortReason) {
          reason += `: ${shortReason}`;
        }
      } catch {
        reason += `: network error`;
      }
      throw new Error(reason);
    }

    const data = await response.json();
    const text = data?.text?.trim();
    if (!text) {
      throw new Error('Empty response from model');
    }

    return {
      text,
      source: 'gemini',
    };
  } catch (err: any) {
    const debugError = err?.message || 'network error';
    // If backend Gemini call fails, is slow (> 8s) or is unavailable, return standard safe fallback with debug line
    return {
      text: "I'm having trouble right now. Try one of these questions:",
      source: 'fallback',
      suggestChips: true,
      debugError,
    };
  }
}

/**
 * Main dispatcher: Layer 1 (rule-based) -> Layer 2 (Gemini with 8s timeout) -> Fallback
 */
export async function getFlavorBotReply(
  userQuery: string,
  ctx: FlavorBotContext
): Promise<FlavorBotResponse> {
  // 1. Layer 1: Rule-based match (0ms latency, handles Hinglish & English)
  const ruleMatch = matchRuleBasedFlavorBot(userQuery, ctx);
  if (ruleMatch) {
    return ruleMatch;
  }

  // 2. Layer 2: Gemini fallback
  return await callGeminiFlavorBot(userQuery, ctx);
}

/**
 * Helper to build FlavorBotContext from RebuiltRecipeData & profile state
 */
export function buildFlavorBotContext(
  recipe: RebuiltRecipeData,
  diet: string,
  allergies: string[],
  rebuiltIngredients: string[],
  shoppingListTotal?: number
): FlavorBotContext {
  return {
    dishId: recipe.dishId,
    dishName: recipe.dishName,
    diet,
    allergies,
    rebuiltIngredients,
    keptIngredients: recipe.keptIngredients,
    originalSodiumMg: recipe.originalSodiumMg,
    rebuiltSodiumMg: recipe.rebuiltSodiumMg,
    limitSodiumMg: recipe.limitSodiumMg,
    isSodiumOverLimit: recipe.isSodiumOverLimit,
    originalSatFatG: recipe.originalSatFatG,
    rebuiltSatFatG: recipe.rebuiltSatFatG,
    originalAddedSugarG: recipe.originalAddedSugarG,
    rebuiltAddedSugarG: recipe.rebuiltAddedSugarG,
    costPerServing: recipe.costPerServing,
    difficulty: recipe.difficulty,
    estimatedTimeMins: recipe.estimatedTimeMins,
    swaps: recipe.swaps.map((s) => ({
      originalIngredient: s.originalIngredient,
      rebuiltIngredient: s.rebuiltIngredient,
      whyThisWorks: s.whyThisWorks,
    })),
    cookingSteps: recipe.cookingSteps.map((s) => ({
      stepNumber: s.stepNumber,
      timeMinutes: s.timeMinutes,
      instruction: s.instruction,
    })),
    shoppingListTotal,
  };
}
