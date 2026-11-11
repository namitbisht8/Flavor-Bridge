import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRebuiltRecipe,
  getAvailableDishesForDiet,
  toggleAllergySelection,
} from './recipeService';
import { TOGGLEABLE_INGREDIENTS } from '../data/sampleData';

test('Butter Chicken returns correct base values when all 4 chips are rebuilt', () => {
  const result = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.dishId, 'butter-chicken');
  assert.equal(r.originalSodiumMg, 890);
  assert.equal(r.rebuiltSodiumMg, 310);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.isSodiumOverLimit, false);
  assert.equal(r.sodiumWarning, undefined);
  assert.equal(r.originalSatFatG, 14.0);
  assert.equal(r.rebuiltSatFatG, 3.9);
  assert.equal(r.originalAddedSugarG, 4.0);
  assert.equal(r.rebuiltAddedSugarG, 1.0);
  assert.equal(r.costPerServing, 65);
  assert.equal(r.difficulty, 'Easy');
  assert.equal(r.estimatedTimeMins, 30);
  assert.equal(r.flavorMatchLabel, '94% Flavor Match (sample)');
  assert.equal(r.cookingSteps.length, 3);
});

test('Dal Tadka & Chawal returns correct specifications per user requirements', () => {
  const result = getRebuiltRecipe('dal-chawal', 'Vegetarian', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.dishName, 'Dal Tadka & Chawal');
  assert.equal(r.originalSodiumMg, 780);
  assert.equal(r.rebuiltSodiumMg, 290);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.originalSatFatG, 6.0);
  assert.equal(r.rebuiltSatFatG, 2.2);
  assert.equal(r.originalAddedSugarG, 1.0);
  assert.equal(r.rebuiltAddedSugarG, 0.5);
  assert.equal(r.costPerServing, 45);
  assert.equal(r.difficulty, 'Easy');
  assert.equal(r.estimatedTimeMins, 35);
  assert.equal(r.flavorMatchLabel, '92% Flavor Match (sample)');
  assert.equal(r.cookingSteps.length, 3);
  assert.ok(r.shoppingList.length >= 5);
});

test('Rajma Masala returns correct specifications per user requirements', () => {
  const result = getRebuiltRecipe('rajma', 'Vegetarian', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.dishName, 'Rajma Masala');
  assert.equal(r.originalSodiumMg, 820);
  assert.equal(r.rebuiltSodiumMg, 330);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.originalSatFatG, 7.0);
  assert.equal(r.rebuiltSatFatG, 2.5);
  assert.equal(r.originalAddedSugarG, 3.0);
  assert.equal(r.rebuiltAddedSugarG, 1.5);
  assert.equal(r.costPerServing, 55);
  assert.equal(r.difficulty, 'Medium');
  assert.equal(r.estimatedTimeMins, 45);
  assert.equal(r.flavorMatchLabel, '91% Flavor Match (sample)');
  assert.equal(r.cookingSteps.length, 3);
  assert.ok(r.shoppingList.length >= 5);
});

test('Moong Dal Khichdi returns correct specifications per user requirements', () => {
  const result = getRebuiltRecipe('khichdi', 'Vegetarian', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.dishName, 'Moong Dal Khichdi');
  assert.equal(r.originalSodiumMg, 700);
  assert.equal(r.rebuiltSodiumMg, 260);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.originalSatFatG, 5.0);
  assert.equal(r.rebuiltSatFatG, 1.8);
  assert.equal(r.originalAddedSugarG, 0.5);
  assert.equal(r.rebuiltAddedSugarG, 0.5);
  assert.equal(r.costPerServing, 35);
  assert.equal(r.difficulty, 'Easy');
  assert.equal(r.estimatedTimeMins, 30);
  assert.equal(r.flavorMatchLabel, '93% Flavor Match (sample)');
  assert.equal(r.cookingSteps.length, 3);
  assert.ok(r.shoppingList.length >= 5);
});

test('Aloo Gobi returns correct specifications per user requirements', () => {
  const result = getRebuiltRecipe('aloo-gobi', 'Vegetarian', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  assert.equal(r.dishName, 'Aloo Gobi');
  assert.equal(r.originalSodiumMg, 640);
  assert.equal(r.rebuiltSodiumMg, 240);
  assert.equal(r.limitSodiumMg, 350);
  assert.equal(r.originalSatFatG, 4.5);
  assert.equal(r.rebuiltSatFatG, 1.4);
  assert.equal(r.originalAddedSugarG, 1.5);
  assert.equal(r.rebuiltAddedSugarG, 1.0);
  assert.equal(r.costPerServing, 40);
  assert.equal(r.difficulty, 'Easy');
  assert.equal(r.estimatedTimeMins, 30);
  assert.equal(r.flavorMatchLabel, '92% Flavor Match (sample)');
  assert.equal(r.cookingSteps.length, 3);
  assert.ok(r.shoppingList.length >= 5);
});

test('Toggling off salt recalculates sodium and triggers Over your 350 mg limit warning', () => {
  const withoutSalt = TOGGLEABLE_INGREDIENTS.filter((i) => i !== 'Refined table salt');

  // Test on Dal Tadka: 290 + 490 = 780 mg
  const dalResult = getRebuiltRecipe('dal-chawal', 'Vegetarian', ['None'], withoutSalt);
  assert.ok(dalResult.recipe);
  assert.equal(dalResult.recipe.rebuiltSodiumMg, 780);
  assert.equal(dalResult.recipe.isSodiumOverLimit, true);
  assert.equal(dalResult.recipe.sodiumWarning, 'Over your 350 mg limit');

  // Test on Butter Chicken: 310 + 520 = 830 mg
  const bcResult = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], withoutSalt);
  assert.ok(bcResult.recipe);
  assert.equal(bcResult.recipe.rebuiltSodiumMg, 830);
  assert.equal(bcResult.recipe.isSodiumOverLimit, true);
  assert.equal(bcResult.recipe.sodiumWarning, 'Over your 350 mg limit');
});

test('Diet filtering correctly controls dish accessibility', () => {
  // Non-veg sees all 5 dishes
  const nonVegDishes = getAvailableDishesForDiet('Non-veg');
  assert.equal(nonVegDishes.length, 5);

  // Vegetarian sees 4 vegetarian dishes (Butter chicken excluded)
  const vegDishes = getAvailableDishesForDiet('Vegetarian');
  assert.equal(vegDishes.length, 4);
  assert.equal(vegDishes.some((d) => d.id === 'butter-chicken'), false);
  assert.ok(vegDishes.some((d) => d.id === 'dal-chawal'));
  assert.ok(vegDishes.some((d) => d.id === 'rajma'));
  assert.ok(vegDishes.some((d) => d.id === 'khichdi'));
  assert.ok(vegDishes.some((d) => d.id === 'aloo-gobi'));

  // Vegan sees only dishes whose rebuilt version is vegan (all 4 vegetarian dishes)
  const veganDishes = getAvailableDishesForDiet('Vegan');
  assert.equal(veganDishes.length, 4);
  assert.equal(veganDishes.some((d) => d.id === 'butter-chicken'), false);

  // Butter Chicken directly requested for Vegetarian/Vegan returns incompatible
  const vegBC = getRebuiltRecipe('butter-chicken', 'Vegetarian', ['None']);
  assert.equal(vegBC.isCompatible, false);
  assert.ok(vegBC.incompatibilityReason?.includes('contains poultry'));
});

test('Nuts allergy replaces cashew cream with pumpkin seed cream in Rajma Masala', () => {
  const result = getRebuiltRecipe('rajma', 'Vegetarian', ['Nuts'], TOGGLEABLE_INGREDIENTS);
  assert.equal(result.isCompatible, true);
  assert.ok(result.recipe);

  const r = result.recipe;
  const creamSwap = r.swaps.find((s) => s.id === 'swap-butter-cream');
  assert.ok(creamSwap?.rebuiltIngredient.toLowerCase().includes('pumpkin seed cream'));
  assert.equal(creamSwap?.rebuiltIngredient.toLowerCase().includes('cashew'), false);

  // Shopping list replacement
  const pumpkinSeedItem = r.shoppingList.find((i) => i.id === 'item-pumpkin-seeds');
  assert.ok(pumpkinSeedItem, 'Pumpkin seeds should replace cashews in shopping list');
  const cashewsItem = r.shoppingList.find((i) => i.id === 'item-cashews');
  assert.equal(cashewsItem, undefined);
});

test('toggleAllergySelection enforces exclusivity of None', () => {
  const res1 = toggleAllergySelection(['Nuts', 'Gluten'], 'None');
  assert.deepEqual(res1, ['None']);

  const res2 = toggleAllergySelection(['None'], 'Soy');
  assert.deepEqual(res2, ['Soy']);
});

test('API_MODE is defined and defaults to sample', async () => {
  const { API_MODE } = await import('../config');
  assert.ok(API_MODE === 'sample' || API_MODE === 'live');
  assert.equal(API_MODE, 'sample');
});

test('Demo configuration sets Non-veg, None, Butter Chicken, and all 4 rebuilt ingredients', () => {
  // Demo sets up: Non-veg, None, Butter Chicken
  const demoResult = getRebuiltRecipe('butter-chicken', 'Non-veg', ['None'], TOGGLEABLE_INGREDIENTS);
  assert.equal(demoResult.isCompatible, true);
  assert.ok(demoResult.recipe);
  assert.equal(demoResult.recipe.dishId, 'butter-chicken');
  assert.equal(demoResult.recipe.rebuiltSodiumMg, 310);
  assert.equal(demoResult.recipe.isSodiumOverLimit, false);
});

