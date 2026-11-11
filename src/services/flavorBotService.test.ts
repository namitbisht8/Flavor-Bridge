import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchRuleBasedFlavorBot,
  SUGGESTED_QUESTION_CHIPS,
  FlavorBotContext,
  getFlavorBotReply,
} from './flavorBotService';

const mockContext: FlavorBotContext = {
  dishId: 'dal-chawal',
  dishName: 'Dal Tadka & Chawal',
  diet: 'Vegetarian',
  allergies: ['None'],
  rebuiltIngredients: [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],
  keptIngredients: [],
  originalSodiumMg: 780,
  rebuiltSodiumMg: 290,
  limitSodiumMg: 350,
  isSodiumOverLimit: false,
  originalSatFatG: 6.0,
  rebuiltSatFatG: 2.2,
  originalAddedSugarG: 1.0,
  rebuiltAddedSugarG: 0.5,
  costPerServing: 45,
  difficulty: 'Easy',
  estimatedTimeMins: 35,
  swaps: [
    {
      originalIngredient: 'Table salt',
      rebuiltIngredient: 'Roasted cumin + amchur + lemon at serving',
      whyThisWorks: 'Sample explanation: Roasted cumin delivers warm savory depth...',
    },
    {
      originalIngredient: 'Ghee tadka',
      rebuiltIngredient: 'Cold-pressed oil + hing + toasted cumin + garlic',
      whyThisWorks: 'Sample explanation: Sliced garlic and whole cumin seeds...',
    },
  ],
  cookingSteps: [
    { stepNumber: 1, timeMinutes: 10, instruction: 'Rinse toor and moong dal...' },
    { stepNumber: 2, timeMinutes: 15, instruction: 'Simmer dal with tomatoes...' },
    { stepNumber: 3, timeMinutes: 10, instruction: 'Warm cold-pressed oil with cumin...' },
  ],
  shoppingListTotal: 410,
};

test('All 5 suggested question chips are defined and matched by Layer 1', () => {
  assert.equal(SUGGESTED_QUESTION_CHIPS.length, 5);

  // Chip 1: "Why this swap?"
  const r1 = matchRuleBasedFlavorBot('Why this swap?', mockContext);
  assert.ok(r1);
  assert.equal(r1.source, 'rule');
  assert.ok(r1.text.includes('Table salt -> Roasted cumin'));

  // Chip 2: "Is this nut-free?"
  const r2 = matchRuleBasedFlavorBot('Is this nut-free?', mockContext);
  assert.ok(r2);
  assert.equal(r2.source, 'rule');
  assert.ok(r2.text.includes('nut-free'));

  // Chip 3: "How much sodium is left?"
  const r3 = matchRuleBasedFlavorBot('How much sodium is left?', mockContext);
  assert.ok(r3);
  assert.equal(r3.source, 'rule');
  assert.ok(r3.text.includes('290 mg'));
  assert.ok(r3.text.includes('60 mg')); // 350 - 290

  // Chip 4: "Can I use pumpkin seeds instead of cashews?"
  const r4 = matchRuleBasedFlavorBot('Can I use pumpkin seeds instead of cashews?', mockContext);
  assert.ok(r4);
  assert.equal(r4.source, 'rule');
  assert.ok(r4.text.includes('pumpkin seed') || r4.text.includes('pepitas'));

  // Chip 5: "How hard is this dish?"
  const r5 = matchRuleBasedFlavorBot('How hard is this dish?', mockContext);
  assert.ok(r5);
  assert.equal(r5.source, 'rule');
  assert.ok(r5.text.includes('Easy'));
  assert.ok(r5.text.includes('35 minutes'));
});

test('Layer 1 responds in Hinglish when user writes in Hinglish', () => {
  const rHinglish1 = matchRuleBasedFlavorBot('Kitna sodium bacha hai?', mockContext);
  assert.ok(rHinglish1);
  assert.ok(rHinglish1.text.includes('safe room bacha hai') || rHinglish1.text.includes('sirf'));

  const rHinglish2 = matchRuleBasedFlavorBot('Yeh dish kitna mushkil hai?', mockContext);
  assert.ok(rHinglish2);
  assert.ok(rHinglish2.text.includes('banana'));
});

test('Medical questions trigger doctor/dietitian disclaimer', () => {
  const rMed = matchRuleBasedFlavorBot('Is this good for high BP and heart attack patients?', mockContext);
  assert.ok(rMed);
  assert.ok(rMed.text.includes('doctor or registered dietitian'));
});

test('Nut allergy swap is reflected in nut-free question', () => {
  const nutAllergyContext: FlavorBotContext = {
    ...mockContext,
    allergies: ['Nuts'],
  };
  const r = matchRuleBasedFlavorBot('Is this nut-free?', nutAllergyContext);
  assert.ok(r);
  assert.ok(r.text.includes('pumpkin seed cream'));
});

test('Available dishes inquiries return rule-based responses by diet', () => {
  // Non-veg inquiry
  const rNonVeg = matchRuleBasedFlavorBot('Which non-veg dishes do you have?', mockContext);
  assert.ok(rNonVeg);
  assert.equal(rNonVeg.source, 'rule');
  assert.ok(rNonVeg.text.includes('Butter Chicken'));

  // Vegetarian inquiry
  const rVeg = matchRuleBasedFlavorBot('Which vegetarian dishes do you have?', mockContext);
  assert.ok(rVeg);
  assert.equal(rVeg.source, 'rule');
  assert.ok(rVeg.text.includes('Dal Tadka & Chawal'));
  assert.ok(rVeg.text.includes('Rajma Masala'));

  // Vegan inquiry
  const rVegan = matchRuleBasedFlavorBot('Which vegan dishes do you have?', mockContext);
  assert.ok(rVegan);
  assert.equal(rVegan.source, 'rule');
  assert.ok(rVegan.text.includes('100% plant-based') || rVegan.text.includes('plant-based'));

  // Hinglish dish inquiry
  const rHinglish = matchRuleBasedFlavorBot('Non-veg dishes kaun se hain?', mockContext);
  assert.ok(rHinglish);
  assert.equal(rHinglish.source, 'rule');
  assert.ok(rHinglish.text.includes('Butter Chicken'));
});

test('Fallback triggers gracefully when query does not match any rule and API is not present', async () => {
  // Free-form query not matching any local rule
  const r = await getFlavorBotReply('Can you tell me about the astrological alignment of this curry?', mockContext);
  assert.ok(r);
  assert.ok(r.text.length > 0);
  // Either Gemini answers or fallback triggers, chat NEVER crashes
  if (r.source === 'fallback') {
    assert.ok(r.text.includes("I'm having trouble right now"));
    assert.equal(r.suggestChips, true);
    assert.ok(typeof r.debugError === 'string');
  }
});
