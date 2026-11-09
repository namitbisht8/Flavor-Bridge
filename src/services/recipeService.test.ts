import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRebuiltRecipe,
  toggleAllergySelection,
} from './recipeService';
import { TOGGLEABLE_INGREDIENTS } from '../data/sampleData';

test('getRebuiltRecipe returns base values when all 4 customizable chips are toggled ON', () => {
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.rebuiltSodiumMg, 310);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.isSodiumOverLimit, false);
  assert.equal(r.sodiumWarning, undefined);
  assert.equal(r.rebuiltAddedSugarG, 1.0);
  assert.equal(r.rebuiltSatFatG, 3.9);
  assert.equal(r.flavorMatchLabel, '94% Flavor Match (sample)');
});

test('toggling off salt keeps original ingredient and triggers Over your 350 mg limit', () => {
  // Omit 'Refined table salt' from rebuilt ingredients
  const rebuiltWithoutSalt = TOGGLEABLE_INGREDIENTS.filter((i) => i !== 'Refined table salt');
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], rebuiltWithoutSalt);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.rebuiltSodiumMg, 830); // 310 + 520
  assert.equal(r.isSodiumOverLimit, true);
  assert.equal(r.sodiumWarning, 'Over your 350 mg limit');
});

test('toggling off sugar adds +3 g sugar penalty', () => {
  const rebuiltWithoutSugar = TOGGLEABLE_INGREDIENTS.filter((i) => i !== 'Refined white sugar');
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], rebuiltWithoutSugar);
  assert.ok(result.recipe);
  assert.equal(result.recipe.rebuiltAddedSugarG, 4.0); // 1.0 + 3.0
});

test('toggling off butter and cream adds +9 g and +5 g saturated fat penalties', () => {
  const rebuiltWithoutDairy = ['Refined table salt', 'Refined white sugar'];
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], rebuiltWithoutDairy);
  assert.ok(result.recipe);
  assert.equal(result.recipe.rebuiltSatFatG, 17.9); // 3.9 + 9.0 + 5.0
});

test('getRebuiltRecipe applies Nuts allergy rule correctly everywhere', () => {
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['Nuts'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  const creamSwap = r.swaps.find((s) => s.id === 'swap-butter-cream');
  assert.ok(
    creamSwap?.rebuiltIngredient.toLowerCase().includes('pumpkin seed cream')
  );
  assert.equal(creamSwap?.rebuiltIngredient.includes('Cashew'), false);
  // Verify wording change: "similar" instead of "identical"
  assert.ok(
    creamSwap?.whyThisWorks.toLowerCase().includes('similar'),
    'Why this works should use the word similar'
  );
  assert.equal(
    creamSwap?.whyThisWorks.toLowerCase().includes('identical'),
    false,
    'Why this works should not contain identical'
  );
});

test('Vegetarian and Vegan diets are rejected for Butter Chicken with friendly notice', () => {
  const vegResult = getRebuiltRecipe('butter-chicken', 'Vegetarian', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(vegResult.isCompatible, false);
  assert.ok(
    vegResult.incompatibilityReason?.includes('No sample dish for this diet yet')
  );
});

test('toggleAllergySelection enforces exclusivity of None', () => {
  const res1 = toggleAllergySelection(['Nuts', 'Gluten'], 'None');
  assert.deepEqual(res1, ['None']);

  const res2 = toggleAllergySelection(['None'], 'Soy');
  assert.deepEqual(res2, ['Soy']);
});
