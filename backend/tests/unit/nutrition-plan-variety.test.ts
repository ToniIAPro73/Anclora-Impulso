import { selectRecipesForWeeklyPlanFromCandidates } from '../../src/services/nutrition.service';

type TestRecipe = Parameters<typeof selectRecipesForWeeklyPlanFromCandidates>[0][number];

function recipe(
  id: string,
  name: string,
  mealType: 'desayuno' | 'almuerzo' | 'cena',
  ingredients: string[],
  tags: string[] = []
): TestRecipe {
  return {
    id,
    userId: null,
    name,
    nameEn: null,
    description: `${name} description`,
    instructions: [],
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    difficulty: 'facil',
    calories: 560,
    protein: 42,
    carbs: 55,
    fat: 18,
    fiber: 8,
    imageUrl: null,
    tags,
    source: 'system',
    isPublic: true,
    isEditable: false,
    mealTypes: [mealType],
    dietTypes: ['alta_proteina'],
    goalTypes: ['recomposicion'],
    editorialOverrideStatus: null,
    editorialNotes: null,
    editorialReviewedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ingredients: ingredients.map((ingredientName, index) => ({
      id: `${id}-ingredient-${index}`,
      recipeId: id,
      ingredientId: `${ingredientName}-id`,
      quantity: 100,
      ingredient: {
        id: `${ingredientName}-id`,
        name: ingredientName,
        nameEn: null,
        unit: 'g',
      },
    })),
  };
}

describe('selectRecipesForWeeklyPlanFromCandidates', () => {
  it('prioritizes meal family variety over repeating high-scoring variants on consecutive days', () => {
    const selections = selectRecipesForWeeklyPlanFromCandidates([
      recipe('breakfast-1', 'Desayuno yogur con avena', 'desayuno', ['yogur', 'avena'], ['lacteo']),
      recipe('breakfast-2', 'Desayuno tortilla con fruta', 'desayuno', ['huevo', 'manzana'], ['huevo']),
      recipe('lunch-1', 'Almuerzo pollo arroz bowl', 'almuerzo', ['pollo', 'arroz'], ['pollo', 'arroz']),
      recipe('lunch-2', 'Almuerzo pollo arroz ensalada', 'almuerzo', ['pollo', 'arroz'], ['pollo', 'arroz']),
      recipe('lunch-3', 'Almuerzo ternera patata', 'almuerzo', ['ternera', 'patata'], ['ternera']),
      recipe('lunch-4', 'Almuerzo salmon quinoa', 'almuerzo', ['salmon', 'quinoa'], ['pescado']),
      recipe('dinner-1', 'Cena merluza verduras', 'cena', ['merluza', 'brocoli'], ['pescado']),
      recipe('dinner-2', 'Cena pavo boniato', 'cena', ['pavo', 'boniato'], ['pavo']),
    ], {
      goal: 'recomposicion',
      dietType: 'alta_proteina',
      difficulty: 'facil',
    });

    const lunchSelections = selections.filter((selection) => selection.mealType === 'almuerzo');

    for (let index = 1; index < lunchSelections.length; index += 1) {
      expect(lunchSelections[index].recipe.id).not.toBe(lunchSelections[index - 1].recipe.id);
    }

    const firstThreeLunches = lunchSelections.slice(0, 3).map((selection) => selection.recipe.id);
    expect(firstThreeLunches).toContain('lunch-3');
    expect(firstThreeLunches).toContain('lunch-4');
    expect(firstThreeLunches.filter((id) => id.startsWith('lunch-1') || id.startsWith('lunch-2'))).toHaveLength(1);
  });

  it('still builds a complete week when a meal type has only one viable recipe', () => {
    const selections = selectRecipesForWeeklyPlanFromCandidates([
      recipe('breakfast-1', 'Desayuno yogur con avena', 'desayuno', ['yogur', 'avena']),
      recipe('lunch-1', 'Almuerzo pollo arroz bowl', 'almuerzo', ['pollo', 'arroz']),
      recipe('dinner-1', 'Cena merluza verduras', 'cena', ['merluza', 'brocoli']),
    ], {
      goal: 'recomposicion',
      dietType: 'alta_proteina',
      difficulty: 'facil',
    });

    expect(selections).toHaveLength(21);
    expect(selections.filter((selection) => selection.mealType === 'almuerzo')).toHaveLength(7);
  });
});
