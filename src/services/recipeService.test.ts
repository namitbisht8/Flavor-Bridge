import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRebuiltRecipe,
  getAvailableDishesForDiet,
  toggleAllergySelection,
} from './recipeService';

test('getRebuiltRecipe returns correct values for Butter Chicken default Non-veg', () => {
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], []);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.dishName, 'Butter Chicken');
  assert.equal(r.originalSodiumMg, 890);
  assert.equal(r.rebuiltSodiumMg, 310);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.sodiumLimitComparison, 'about 2.5x the limit');
  assert.equal(r.sodiumLimitPercentage, 88);

  assert.equal(r.originalSatFatG, 14.0);
  assert.equal(r.rebuiltSatFatG, 3.9);
  assert.equal(r.satFatReductionPercent, 72);

  assert.equal(r.originalAddedSugarG, 4.0);
  assert.equal(r.rebuiltAddedSugarG, 1.0);

  assert.equal(r.flavorMatchPercent, 94);
  assert.equal(r.costPerServing, 65);
  assert.equal(r.difficulty, 'Easy');
  assert.equal(r.estimatedTimeMins, 30);

  // Check 3 cooking steps with times: 5, 15, 10
  assert.equal(r.cookingSteps.length, 3);
  assert.deepEqual(
    r.cookingSteps.map((s) => s.timeMinutes),
    [5, 15, 10]
  );

  // Normal nut swap has cashews
  const creamSwap = r.swaps.find((s) => s.id === 'swap-butter-cream');
  assert.ok(creamSwap?.rebuiltIngredient.includes('Cashew cream'));

  const cashewsInShopping = r.shoppingList.some((item) =>
    item.name.toLowerCase().includes('cashew')
  );
  assert.equal(cashewsInShopping, true);
});

test('getRebuiltRecipe applies Nuts allergy rule correctly everywhere', () => {
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['Nuts'], []);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  // Swaps must use pumpkin seed cream
  const creamSwap = r.swaps.find((s) => s.id === 'swap-butter-cream');
  assert.ok(
    creamSwap?.rebuiltIngredient.toLowerCase().includes('pumpkin seed cream'),
    'Cream swap should specify pumpkin seed cream'
  );
  assert.equal(creamSwap?.rebuiltIngredient.includes('Cashew'), false);

  // Shopping list must replace cashews with pumpkin seeds
  const hasCashews = r.shoppingList.some((item) =>
    item.name.toLowerCase().includes('cashew')
  );
  assert.equal(hasCashews, false, 'Cashews should not be in shopping list');

  const hasPumpkinSeeds = r.shoppingList.some((item) =>
    item.name.toLowerCase().includes('pumpkin seeds')
  );
  assert.equal(hasPumpkinSeeds, true, 'Pumpkin seeds must be in shopping list');

  // Step 2 must instruct pumpkin seed cream
  assert.ok(
    r.cookingSteps[1].instruction.toLowerCase().includes('pumpkin seed cream'),
    'Step 2 instruction should mention pumpkin seed cream'
  );
});

test('Vegetarian and Vegan diets are rejected for Butter Chicken with friendly notice', () => {
  const vegResult = getRebuiltRecipe('butter-chicken', 'Vegetarian', ['None'], []);
  assert.equal(vegResult.isCompatible, false);
  assert.ok(
    vegResult.incompatibilityReason?.includes('No sample dish for this diet yet')
  );

  const veganResult = getRebuiltRecipe('butter-chicken', 'Vegan', ['None'], []);
  assert.equal(veganResult.isCompatible, false);
});

test('toggleAllergySelection enforces exclusivity of None', () => {
  // If None is toggled when others are selected, only None remains
  const res1 = toggleAllergySelection(['Nuts', 'Gluten'], 'None');
  assert.deepEqual(res1, ['None']);

  // If another allergy is added when None is active, None is dropped
  const res2 = toggleAllergySelection(['None'], 'Soy');
  assert.deepEqual(res2, ['Soy']);

  // Adding multiple
  const res3 = toggleAllergySelection(['Soy'], 'Eggs');
  assert.deepEqual(res3.sort(), ['Eggs', 'Soy'].sort());

  // Deselecting all leaves None
  const res4 = toggleAllergySelection(['Soy'], 'Soy');
  assert.deepEqual(res4, ['None']);
});
