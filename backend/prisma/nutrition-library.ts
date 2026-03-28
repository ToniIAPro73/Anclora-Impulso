export interface SeedRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface SeedRecipe {
  name: string;
  description: string;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  tags: string[];
  mealTypes: string[];
  dietTypes: string[];
  goalTypes: string[];
  ingredients: SeedRecipeIngredient[];
}

type Difficulty = 'facil' | 'medio' | 'dificil';
type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack';
type DietType = 'ninguna' | 'mediterranea' | 'dash' | 'ayuno_intermitente' | 'alta_proteina';
type GoalType = 'perdida_peso' | 'ganancia_muscular' | 'mantenimiento' | 'recomposicion' | 'salud_cardiometabolica';

type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

type IngredientComponent = SeedRecipeIngredient & MacroTotals;

type Choice = {
  label: string;
  item: IngredientComponent;
  tags?: string[];
  extraDietTypes?: DietType[];
  extraGoals?: GoalType[];
};

type MixChoice = {
  label: string;
  items: IngredientComponent[];
  tags?: string[];
  extraDietTypes?: DietType[];
  extraGoals?: GoalType[];
};

const round1 = (value: number) => Math.round(value * 10) / 10;

function per100(name: string, quantity: number, unit: string, macrosPer100: MacroTotals): IngredientComponent {
  const factor = quantity / 100;
  return {
    name,
    quantity,
    unit,
    calories: round1(macrosPer100.calories * factor),
    protein: round1(macrosPer100.protein * factor),
    carbs: round1(macrosPer100.carbs * factor),
    fat: round1(macrosPer100.fat * factor),
    fiber: round1(macrosPer100.fiber * factor),
  };
}

function perUnit(name: string, quantity: number, unit: string, macrosPerUnit: MacroTotals): IngredientComponent {
  return {
    name,
    quantity,
    unit,
    calories: round1(macrosPerUnit.calories * quantity),
    protein: round1(macrosPerUnit.protein * quantity),
    carbs: round1(macrosPerUnit.carbs * quantity),
    fat: round1(macrosPerUnit.fat * quantity),
    fiber: round1(macrosPerUnit.fiber * quantity),
  };
}

function cloneIngredient(item: IngredientComponent): IngredientComponent {
  return { ...item };
}

function sumMacros(items: IngredientComponent[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (acc, item) => ({
      calories: round1(acc.calories + item.calories),
      protein: round1(acc.protein + item.protein),
      carbs: round1(acc.carbs + item.carbs),
      fat: round1(acc.fat + item.fat),
      fiber: round1(acc.fiber + item.fiber),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function recipeFromParts(args: {
  name: string;
  description: string;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  tags: string[];
  mealTypes: MealType[];
  dietTypes: DietType[];
  goalTypes: GoalType[];
  items: IngredientComponent[];
}): SeedRecipe {
  const totals = sumMacros(args.items);
  return {
    name: args.name,
    description: args.description,
    instructions: args.instructions,
    prepTime: args.prepTime,
    cookTime: args.cookTime,
    servings: args.servings,
    difficulty: args.difficulty,
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    fiber: totals.fiber,
    tags: uniqueStrings(args.tags),
    mealTypes: uniqueStrings(args.mealTypes),
    dietTypes: uniqueStrings(args.dietTypes),
    goalTypes: uniqueStrings(args.goalTypes),
    ingredients: args.items.map(({ name, quantity, unit }) => ({ name, quantity, unit })),
  };
}

function tripleAt<A, B, C>(first: A[], second: B[], third: C[], index: number): [A, B, C] {
  const firstIndex = index % first.length;
  const secondIndex = Math.floor(index / first.length) % second.length;
  const thirdIndex = Math.floor(index / (first.length * second.length)) % third.length;
  return [first[firstIndex], second[secondIndex], third[thirdIndex]];
}

function pairAt<A, B>(first: A[], second: B[], index: number): [A, B] {
  const firstIndex = index % first.length;
  const secondIndex = Math.floor(index / first.length) % second.length;
  return [first[firstIndex], second[secondIndex]];
}

function buildSeries(count: number, factory: (index: number) => SeedRecipe): SeedRecipe[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

function indexedDifficulty(index: number, mediumEvery = 3, hardEvery = 13): Difficulty {
  if ((index + 1) % hardEvery === 0) return 'dificil';
  if ((index + 1) % mediumEvery === 0) return 'medio';
  return 'facil';
}

const HERBS = {
  cinnamon: per100('canela', 1, 'g', { calories: 247, protein: 4, carbs: 81, fat: 1.2, fiber: 53 }),
  oregano: per100('oregano', 1, 'g', { calories: 265, protein: 9, carbs: 69, fat: 4.3, fiber: 43 }),
  parsley: per100('perejil', 6, 'g', { calories: 36, protein: 3, carbs: 6, fat: 0.8, fiber: 3.3 }),
  basil: per100('albahaca', 6, 'g', { calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6, fiber: 1.6 }),
  dill: per100('eneldo', 4, 'g', { calories: 43, protein: 3.5, carbs: 7, fat: 1.1, fiber: 2.1 }),
  pepper: per100('pimienta negra', 1, 'g', { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 26.5 }),
  lemon: per100('limon', 20, 'ml', { calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 }),
};

const ING = {
  greekYogurt: per100('yogur griego natural', 220, 'g', { calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 }),
  skyr: per100('skyr natural', 200, 'g', { calories: 63, protein: 11, carbs: 4, fat: 0.2, fiber: 0 }),
  cottage: per100('queso cottage', 180, 'g', { calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0 }),
  kefir: per100('kefir natural', 250, 'ml', { calories: 55, protein: 3.5, carbs: 4.8, fat: 2.2, fiber: 0 }),
  oats: per100('avena', 55, 'g', { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 }),
  chia: per100('semillas de chia', 12, 'g', { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4 }),
  almonds: per100('almendras', 18, 'g', { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 }),
  walnuts: per100('nueces', 18, 'g', { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 }),
  peanutButter: per100('crema de cacahuete', 18, 'g', { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 }),
  berries: per100('frutos rojos', 90, 'g', { calories: 52, protein: 1, carbs: 12, fat: 0.4, fiber: 6 }),
  banana: per100('platano', 120, 'g', { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }),
  apple: per100('manzana', 150, 'g', { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }),
  pear: per100('pera', 160, 'g', { calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1 }),
  kiwi: per100('kiwi', 130, 'g', { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3 }),
  mango: per100('mango', 140, 'g', { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 }),
  wholeBread: per100('pan integral', 80, 'g', { calories: 252, protein: 12, carbs: 43, fat: 4.2, fiber: 7 }),
  wrap: perUnit('wrap integral', 1, 'unidad', { calories: 190, protein: 6, carbs: 30, fat: 5, fiber: 5 }),
  eggs: perUnit('huevo', 2, 'unidad', { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 }),
  eggWhites: per100('claras de huevo', 180, 'g', { calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 }),
  turkey: per100('pechuga de pavo', 160, 'g', { calories: 135, protein: 29, carbs: 0, fat: 1.3, fiber: 0 }),
  chicken: per100('pechuga de pollo', 170, 'g', { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }),
  leanBeef: per100('ternera magra', 170, 'g', { calories: 176, protein: 26, carbs: 0, fat: 8, fiber: 0 }),
  salmon: per100('salmon', 170, 'g', { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }),
  tuna: per100('atun al natural', 130, 'g', { calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 }),
  hake: per100('merluza', 180, 'g', { calories: 90, protein: 19, carbs: 0, fat: 1.2, fiber: 0 }),
  shrimp: per100('gambas', 180, 'g', { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 }),
  tofu: per100('tofu firme', 180, 'g', { calories: 144, protein: 17.3, carbs: 3, fat: 8.7, fiber: 2.3 }),
  chickpeas: per100('garbanzos cocidos', 180, 'g', { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 }),
  lentils: per100('lentejas cocidas', 190, 'g', { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 }),
  quinoa: per100('quinoa cocida', 180, 'g', { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 }),
  brownRice: per100('arroz integral cocido', 190, 'g', { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 }),
  basmati: per100('arroz basmati cocido', 180, 'g', { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 }),
  wholePasta: per100('pasta integral cocida', 180, 'g', { calories: 149, protein: 5.8, carbs: 30.9, fat: 1.1, fiber: 4.5 }),
  sweetPotato: per100('boniato', 220, 'g', { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3 }),
  potato: per100('patata', 220, 'g', { calories: 77, protein: 2, carbs: 17.6, fat: 0.1, fiber: 2.2 }),
  cauliflowerRice: per100('arroz de coliflor', 220, 'g', { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 }),
  spinach: per100('espinaca fresca', 80, 'g', { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }),
  broccoli: per100('brocoli', 140, 'g', { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 }),
  zucchini: per100('calabacin', 160, 'g', { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 }),
  mushrooms: per100('champiñon', 120, 'g', { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 }),
  carrots: per100('zanahoria', 100, 'g', { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 }),
  peppers: per100('pimiento rojo', 120, 'g', { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 }),
  tomato: per100('tomate', 150, 'g', { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }),
  cucumber: per100('pepino', 120, 'g', { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 }),
  lettuce: per100('lechuga romana', 90, 'g', { calories: 17, protein: 1.2, carbs: 3.3, fat: 0.3, fiber: 2.1 }),
  kale: per100('kale', 70, 'g', { calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, fiber: 3.6 }),
  greenBeans: per100('judias verdes', 140, 'g', { calories: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 3.4 }),
  eggplant: per100('berenjena', 150, 'g', { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 }),
  avocado: per100('aguacate', 80, 'g', { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 }),
  hummus: per100('hummus', 45, 'g', { calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6 }),
  oliveOil: per100('aceite de oliva virgen extra', 10, 'ml', { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }),
  tomatoSauce: per100('tomate triturado', 120, 'g', { calories: 29, protein: 1.4, carbs: 6.3, fat: 0.2, fiber: 1.6 }),
};
const DAIRY_BASES: Choice[] = [
  { label: 'yogur griego', item: ING.greekYogurt, tags: ['cremoso'], extraDietTypes: ['mediterranea', 'alta_proteina'], extraGoals: ['ganancia_muscular'] },
  { label: 'skyr', item: ING.skyr, tags: ['alto_en_proteina'], extraDietTypes: ['alta_proteina'], extraGoals: ['ganancia_muscular', 'recomposicion'] },
  { label: 'queso cottage', item: ING.cottage, tags: ['salado', 'alto_en_proteina'], extraDietTypes: ['alta_proteina'], extraGoals: ['ganancia_muscular', 'recomposicion'] },
  { label: 'kefir', item: ING.kefir, tags: ['probiotico'], extraDietTypes: ['dash', 'mediterranea'], extraGoals: ['mantenimiento', 'salud_cardiometabolica'] },
];

const FRUITS: Choice[] = [
  { label: 'frutos rojos', item: ING.berries, tags: ['antioxidantes'], extraGoals: ['perdida_peso'] },
  { label: 'platano', item: ING.banana, tags: ['energia'], extraGoals: ['ganancia_muscular'] },
  { label: 'manzana', item: ING.apple, tags: ['fibra'], extraGoals: ['perdida_peso'] },
  { label: 'pera', item: ING.pear, tags: ['saciante'], extraGoals: ['perdida_peso'] },
  { label: 'kiwi', item: ING.kiwi, tags: ['vitamina_c'], extraGoals: ['mantenimiento'] },
  { label: 'mango', item: ING.mango, tags: ['tropical'], extraGoals: ['ganancia_muscular', 'mantenimiento'] },
];

const TOPPERS: Choice[] = [
  { label: 'chia', item: ING.chia, tags: ['fibra', 'omega3'], extraDietTypes: ['dash', 'mediterranea'] },
  { label: 'almendras', item: ING.almonds, tags: ['crujiente'], extraDietTypes: ['dash', 'mediterranea'] },
  { label: 'nueces', item: ING.walnuts, tags: ['grasas_saludables'], extraDietTypes: ['mediterranea', 'dash'] },
  { label: 'crema de cacahuete', item: ING.peanutButter, tags: ['energetico'], extraDietTypes: ['alta_proteina'], extraGoals: ['ganancia_muscular'] },
  { label: 'avena', item: ING.oats, tags: ['integral'], extraGoals: ['mantenimiento', 'ganancia_muscular'] },
];

const SAVOURY_SPREADS: Choice[] = [
  { label: 'hummus', item: ING.hummus, tags: ['untable'], extraDietTypes: ['mediterranea', 'dash'] },
  { label: 'aguacate', item: ING.avocado, tags: ['grasas_saludables'], extraDietTypes: ['mediterranea'] },
  { label: 'tomate rallado', item: ING.tomato, tags: ['fresco'], extraDietTypes: ['mediterranea', 'dash'] },
  { label: 'queso cottage', item: ING.cottage, tags: ['cremoso'], extraDietTypes: ['alta_proteina'] },
];

const BREAKFAST_PROTEINS: Choice[] = [
  { label: 'huevo', item: ING.eggs, tags: ['saciante'], extraGoals: ['mantenimiento'] },
  { label: 'claras', item: ING.eggWhites, tags: ['magro'], extraDietTypes: ['alta_proteina'], extraGoals: ['ganancia_muscular', 'recomposicion'] },
  { label: 'pavo', item: ING.turkey, tags: ['magro'], extraDietTypes: ['alta_proteina'] },
  { label: 'atun', item: ING.tuna, tags: ['rapido'], extraDietTypes: ['alta_proteina', 'mediterranea'] },
  { label: 'tofu', item: ING.tofu, tags: ['vegetal'], extraGoals: ['mantenimiento', 'recomposicion'] },
];

const LEAN_PROTEINS: Choice[] = [
  { label: 'pollo', item: ING.chicken, tags: ['magro'], extraDietTypes: ['alta_proteina'], extraGoals: ['ganancia_muscular', 'perdida_peso'] },
  { label: 'pavo', item: ING.turkey, tags: ['magro'], extraDietTypes: ['alta_proteina', 'dash'], extraGoals: ['ganancia_muscular', 'perdida_peso'] },
  { label: 'ternera magra', item: ING.leanBeef, tags: ['hierro'], extraDietTypes: ['alta_proteina'], extraGoals: ['ganancia_muscular'] },
  { label: 'salmon', item: ING.salmon, tags: ['omega3'], extraDietTypes: ['mediterranea', 'alta_proteina'], extraGoals: ['mantenimiento'] },
  { label: 'atun', item: ING.tuna, tags: ['rapido'], extraDietTypes: ['mediterranea', 'alta_proteina'], extraGoals: ['recomposicion'] },
  { label: 'merluza', item: ING.hake, tags: ['ligero'], extraDietTypes: ['mediterranea', 'dash'], extraGoals: ['perdida_peso'] },
  { label: 'gambas', item: ING.shrimp, tags: ['marino'], extraDietTypes: ['mediterranea', 'alta_proteina'], extraGoals: ['perdida_peso', 'recomposicion'] },
  { label: 'tofu', item: ING.tofu, tags: ['vegetal'], extraDietTypes: ['dash', 'mediterranea'], extraGoals: ['mantenimiento', 'recomposicion'] },
  { label: 'garbanzos', item: ING.chickpeas, tags: ['legumbre'], extraDietTypes: ['mediterranea', 'dash'], extraGoals: ['perdida_peso', 'mantenimiento'] },
  { label: 'lentejas', item: ING.lentils, tags: ['legumbre'], extraDietTypes: ['dash', 'mediterranea'], extraGoals: ['salud_cardiometabolica', 'perdida_peso'] },
];

const GRAIN_BASES: Choice[] = [
  { label: 'quinoa', item: ING.quinoa, tags: ['integral'], extraDietTypes: ['mediterranea', 'dash'] },
  { label: 'arroz integral', item: ING.brownRice, tags: ['integral'], extraDietTypes: ['dash'] },
  { label: 'arroz basmati', item: ING.basmati, tags: ['digestivo'], extraGoals: ['ganancia_muscular'] },
  { label: 'pasta integral', item: ING.wholePasta, tags: ['pasta'], extraDietTypes: ['mediterranea'] },
  { label: 'boniato', item: ING.sweetPotato, tags: ['tuberculo'], extraGoals: ['ganancia_muscular', 'mantenimiento'] },
  { label: 'patata', item: ING.potato, tags: ['clasico'], extraGoals: ['mantenimiento'] },
  { label: 'arroz de coliflor', item: ING.cauliflowerRice, tags: ['bajo_en_carbos'], extraDietTypes: ['ayuno_intermitente', 'alta_proteina'], extraGoals: ['perdida_peso'] },
  { label: 'wrap integral', item: ING.wrap, tags: ['portatil'], extraDietTypes: ['ninguna'] },
];

const FRESH_SALAD_MIXES: MixChoice[] = [
  { label: 'pepino y tomate', items: [ING.cucumber, ING.tomato, HERBS.parsley], tags: ['fresco'], extraDietTypes: ['mediterranea', 'dash'], extraGoals: ['perdida_peso'] },
  { label: 'lechuga, tomate y cebolla', items: [ING.lettuce, ING.tomato, per100('cebolla morada', 35, 'g', { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }), HERBS.parsley], tags: ['clasico'], extraGoals: ['mantenimiento'] },
  { label: 'espinaca y zanahoria', items: [ING.spinach, ING.carrots, HERBS.lemon], tags: ['verde'], extraDietTypes: ['dash'], extraGoals: ['salud_cardiometabolica'] },
  { label: 'kale y pepino', items: [ING.kale, ING.cucumber, HERBS.lemon], tags: ['fibra'], extraDietTypes: ['dash', 'alta_proteina'], extraGoals: ['perdida_peso'] },
  { label: 'tomate y albahaca', items: [ING.tomato, HERBS.basil], tags: ['caprese_sin_lacteo'], extraDietTypes: ['mediterranea'] },
  { label: 'pepino y hojas verdes', items: [ING.cucumber, ING.lettuce, ING.spinach], tags: ['ligero'], extraGoals: ['perdida_peso'] },
];

const HOT_VEG_MIXES: MixChoice[] = [
  { label: 'brocoli y zanahoria', items: [ING.broccoli, ING.carrots, HERBS.pepper], tags: ['cruciferas'], extraDietTypes: ['dash', 'alta_proteina'], extraGoals: ['perdida_peso'] },
  { label: 'calabacin y champiñon', items: [ING.zucchini, ING.mushrooms, HERBS.oregano], tags: ['salteado'], extraGoals: ['mantenimiento'] },
  { label: 'judias verdes y tomate', items: [ING.greenBeans, ING.tomato, HERBS.basil], tags: ['ligero'], extraDietTypes: ['dash'] },
  { label: 'berenjena y pimiento', items: [ING.eggplant, ING.peppers, HERBS.oregano], tags: ['asado'], extraDietTypes: ['mediterranea'] },
  { label: 'espinaca y tomate', items: [ING.spinach, ING.tomato, HERBS.parsley], tags: ['rapido'], extraGoals: ['recomposicion'] },
  { label: 'brocoli y pimiento', items: [ING.broccoli, ING.peppers, HERBS.dill], tags: ['colorido'], extraGoals: ['ganancia_muscular'] },
];

const ROASTED_VEG_MIXES: MixChoice[] = [
  { label: 'brocoli, zanahoria y pimiento', items: [ING.broccoli, ING.carrots, ING.peppers, cloneIngredient(ING.oliveOil)], tags: ['horno'], extraDietTypes: ['dash', 'mediterranea'] },
  { label: 'berenjena, calabacin y tomate', items: [ING.eggplant, ING.zucchini, ING.tomato, cloneIngredient(ING.oliveOil)], tags: ['mediterraneo'], extraDietTypes: ['mediterranea'] },
  { label: 'judias verdes y tomate asado', items: [ING.greenBeans, ING.tomato, cloneIngredient(ING.oliveOil)], tags: ['simple'], extraDietTypes: ['dash'] },
  { label: 'coliflor, brocoli y zanahoria', items: [ING.cauliflowerRice, ING.broccoli, ING.carrots, cloneIngredient(ING.oliveOil)], tags: ['volumen'], extraGoals: ['perdida_peso'] },
];

const SNACK_BASES: Choice[] = [
  { label: 'skyr', item: ING.skyr, tags: ['alto_en_proteina'], extraDietTypes: ['alta_proteina'] },
  { label: 'yogur griego', item: per100('yogur griego natural', 170, 'g', { calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 }), tags: ['cremoso'], extraDietTypes: ['mediterranea', 'alta_proteina'] },
  { label: 'queso cottage', item: per100('queso cottage', 150, 'g', { calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0 }), tags: ['salado'], extraDietTypes: ['alta_proteina'] },
  { label: 'hummus', item: per100('hummus', 60, 'g', { calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6 }), tags: ['vegetal'], extraDietTypes: ['mediterranea', 'dash'] },
  { label: 'kefir', item: ING.kefir, tags: ['probiotico'], extraDietTypes: ['dash'] },
];

const SNACK_CRUNCH: Choice[] = [
  { label: 'almendras', item: per100('almendras', 15, 'g', { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 }), tags: ['crujiente'] },
  { label: 'nueces', item: per100('nueces', 15, 'g', { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 }), tags: ['omega3'] },
  { label: 'chia', item: per100('semillas de chia', 10, 'g', { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4 }), tags: ['fibra'] },
  { label: 'crema de cacahuete', item: per100('crema de cacahuete', 15, 'g', { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 }), tags: ['energetico'], extraGoals: ['ganancia_muscular'] },
];

function makeBreakfastBowl(index: number, dietTypes: DietType[], goalTypes: GoalType[], titlePrefix: string): SeedRecipe {
  const [base, fruit, topper] = tripleAt(DAIRY_BASES, FRUITS, TOPPERS, index);
  const items = [cloneIngredient(base.item), cloneIngredient(fruit.item), cloneIngredient(topper.item), cloneIngredient(HERBS.cinnamon)];
  return recipeFromParts({
    name: `${titlePrefix} de ${base.label} con ${fruit.label} y ${topper.label}`,
    description: `Bol rapido y saciante pensado para ${dietTypes.join(', ')} con foco en ${goalTypes.join(', ')}.`,
    instructions: ['Servir la base lactea en un bol amplio.', 'Añadir la fruta troceada o entera segun convenga.', 'Terminar con el topping y una pizca de canela.', 'Consumir al momento o refrigerar 10 minutos para una textura mas densa.'],
    prepTime: 7,
    cookTime: 0,
    servings: 1,
    difficulty: indexedDifficulty(index, 4, 11),
    tags: uniqueStrings(['desayuno', 'bol', ...(base.tags ?? []), ...(fruit.tags ?? []), ...(topper.tags ?? [])]),
    mealTypes: ['desayuno', 'snack'],
    dietTypes: uniqueStrings([...dietTypes]),
    goalTypes: uniqueStrings([...goalTypes, ...(fruit.extraGoals ?? []), ...(topper.extraGoals ?? [])]),
    items,
  });
}

function makeSavouryToast(index: number, dietTypes: DietType[], goalTypes: GoalType[], titlePrefix: string): SeedRecipe {
  const [spread, protein] = pairAt(SAVOURY_SPREADS, BREAKFAST_PROTEINS, index);
  const veg = HOT_VEG_MIXES[index % HOT_VEG_MIXES.length];
  const items = [cloneIngredient(ING.wholeBread), cloneIngredient(spread.item), cloneIngredient(protein.item), ...veg.items.map(cloneIngredient)];
  return recipeFromParts({
    name: `${titlePrefix} con ${spread.label}, ${protein.label} y ${veg.label}`,
    description: 'Tostada o base integral de perfil saciante para desayunos salados o cenas ligeras.',
    instructions: ['Tostar el pan o calentar la base integral.', 'Extender la crema o base elegida.', 'Cocinar la proteina elegida si hace falta y colocarla encima.', 'Terminar con las verduras y servir caliente.'],
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    difficulty: indexedDifficulty(index, 3, 12),
    tags: uniqueStrings(['desayuno', 'salado', ...(spread.tags ?? []), ...(protein.tags ?? []), ...(veg.tags ?? [])]),
    mealTypes: ['desayuno', 'cena'],
    dietTypes: uniqueStrings([...dietTypes]),
    goalTypes: uniqueStrings([...goalTypes, ...(protein.extraGoals ?? []), ...(veg.extraGoals ?? [])]),
    items,
  });
}
function makeMainBowl(index: number, dietTypes: DietType[], goalTypes: GoalType[], titlePrefix: string): SeedRecipe {
  const [protein, base, veg] = tripleAt(LEAN_PROTEINS, GRAIN_BASES, HOT_VEG_MIXES, index);
  const items = [cloneIngredient(protein.item), cloneIngredient(base.item), ...veg.items.map(cloneIngredient), cloneIngredient(ING.oliveOil), cloneIngredient(HERBS.lemon)];
  return recipeFromParts({
    name: `${titlePrefix} de ${protein.label} con ${base.label} y ${veg.label}`,
    description: 'Plato completo con carbohidrato funcional, proteina principal y volumen vegetal.',
    instructions: ['Preparar la base elegida hasta dejarla en su punto.', 'Cocinar la proteina a la plancha, al horno o al vapor segun corresponda.', 'Saltear o cocer las verduras hasta que queden tiernas.', 'Montar el plato y terminar con aceite de oliva y zumo de limon.'],
    prepTime: 14,
    cookTime: 18,
    servings: 1,
    difficulty: indexedDifficulty(index, 3, 14),
    tags: uniqueStrings(['almuerzo', 'bowl', ...(protein.tags ?? []), ...(base.tags ?? []), ...(veg.tags ?? [])]),
    mealTypes: ['almuerzo', 'cena'],
    dietTypes: uniqueStrings([...dietTypes]),
    goalTypes: uniqueStrings([...goalTypes, ...(protein.extraGoals ?? []), ...(base.extraGoals ?? []), ...(veg.extraGoals ?? [])]),
    items,
  });
}

function makeFreshPlate(index: number, dietTypes: DietType[], goalTypes: GoalType[], titlePrefix: string): SeedRecipe {
  const [protein, base, veg] = tripleAt(LEAN_PROTEINS, GRAIN_BASES, FRESH_SALAD_MIXES, index);
  const items = [cloneIngredient(protein.item), cloneIngredient(base.item), ...veg.items.map(cloneIngredient), cloneIngredient(ING.oliveOil), cloneIngredient(HERBS.lemon)];
  return recipeFromParts({
    name: `${titlePrefix} de ${protein.label} con ${base.label} y ${veg.label}`,
    description: 'Plato frio de alta adherencia pensado para rotacion semanal y sustituciones sencillas.',
    instructions: ['Preparar la base integral o cocida con antelacion y enfriarla si hace falta.', 'Mezclar las verduras frescas con la proteina elegida.', 'Aliñar con aceite de oliva y limon justo antes de servir.', 'Ajustar sal y especias segun el perfil del usuario.'],
    prepTime: 13,
    cookTime: 12,
    servings: 1,
    difficulty: indexedDifficulty(index, 4, 15),
    tags: uniqueStrings(['almuerzo', 'ensalada', ...(protein.tags ?? []), ...(base.tags ?? []), ...(veg.tags ?? [])]),
    mealTypes: ['almuerzo', 'cena'],
    dietTypes: uniqueStrings([...dietTypes]),
    goalTypes: uniqueStrings([...goalTypes, ...(protein.extraGoals ?? []), ...(base.extraGoals ?? []), ...(veg.extraGoals ?? [])]),
    items,
  });
}

function makeTrayBake(index: number, dietTypes: DietType[], goalTypes: GoalType[], titlePrefix: string): SeedRecipe {
  const [protein, base, veg] = tripleAt(LEAN_PROTEINS, GRAIN_BASES, ROASTED_VEG_MIXES, index);
  const items = [cloneIngredient(protein.item), cloneIngredient(base.item), ...veg.items.map(cloneIngredient), cloneIngredient(HERBS.oregano)];
  return recipeFromParts({
    name: `${titlePrefix} de ${protein.label} con ${base.label} y ${veg.label}`,
    description: 'Preparacion al horno o en bandeja pensada para batch cooking y rotacion de menus semanales.',
    instructions: ['Precalentar el horno y colocar la base si necesita mas tiempo de coccion.', 'Añadir la proteina y las verduras aliñadas en la bandeja.', 'Hornear hasta que la proteina quede hecha y las verduras tiernas.', 'Reposar 3 minutos antes de emplatar.'],
    prepTime: 16,
    cookTime: 26,
    servings: 1,
    difficulty: indexedDifficulty(index, 3, 10),
    tags: uniqueStrings(['cena', 'horno', ...(protein.tags ?? []), ...(base.tags ?? []), ...(veg.tags ?? [])]),
    mealTypes: ['cena', 'almuerzo'],
    dietTypes: uniqueStrings([...dietTypes]),
    goalTypes: uniqueStrings([...goalTypes, ...(protein.extraGoals ?? []), ...(base.extraGoals ?? []), ...(veg.extraGoals ?? [])]),
    items,
  });
}

function makeSnack(index: number, dietTypes: DietType[], goalTypes: GoalType[], titlePrefix: string): SeedRecipe {
  const [base, fruit, crunch] = tripleAt(SNACK_BASES, FRUITS, SNACK_CRUNCH, index);
  const items = [cloneIngredient(base.item), cloneIngredient(fruit.item), cloneIngredient(crunch.item)];
  return recipeFromParts({
    name: `${titlePrefix} de ${base.label} con ${fruit.label} y ${crunch.label}`,
    description: 'Snack funcional para mantener adherencia, saciedad o recuperacion segun el objetivo.',
    instructions: ['Preparar la base principal en bol o tarro.', 'Añadir la fruta troceada.', 'Terminar con el topping crujiente o energetico.', 'Consumir al momento o llevar en recipiente hermetico.'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: indexedDifficulty(index, 5, 17),
    tags: uniqueStrings(['snack', ...(base.tags ?? []), ...(fruit.tags ?? []), ...(crunch.tags ?? [])]),
    mealTypes: ['snack'],
    dietTypes: uniqueStrings([...dietTypes]),
    goalTypes: uniqueStrings([...goalTypes, ...(fruit.extraGoals ?? []), ...(crunch.extraGoals ?? [])]),
    items,
  });
}

const RESEARCH_INSPIRED_RECIPES: SeedRecipe[] = [
  recipeFromParts({
    name: 'Burritos de desayuno inspirados en NHS',
    description: 'Version estructurada para Anclora Impulso a partir del patron de burrito proteico del informe adjunto.',
    instructions: ['Batir huevos y cocinarlos con tomate y pimiento.', 'Rellenar el wrap integral con la mezcla y pavo.', 'Doblar, marcar en la plancha y servir.'],
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    difficulty: 'medio',
    tags: ['desayuno', 'research_inspired', 'wrap'],
    mealTypes: ['desayuno'],
    dietTypes: ['ninguna', 'alta_proteina'],
    goalTypes: ['ganancia_muscular', 'mantenimiento'],
    items: [cloneIngredient(ING.wrap), cloneIngredient(ING.eggs), cloneIngredient(ING.tomato), cloneIngredient(ING.peppers), cloneIngredient(ING.turkey)],
  }),
  recipeFromParts({
    name: 'Bagel dulce de platano y albaricoque inspirado en NHS',
    description: 'Desayuno portable con perfil de energia sostenida y preparacion rapida.',
    instructions: ['Tostar el pan integral hasta dorar.', 'Añadir crema de cacahuete, platano y fruta deshidratada.', 'Servir con canela.'],
    prepTime: 7,
    cookTime: 2,
    servings: 1,
    difficulty: 'facil',
    tags: ['desayuno', 'research_inspired', 'portable'],
    mealTypes: ['desayuno'],
    dietTypes: ['ninguna', 'alta_proteina'],
    goalTypes: ['ganancia_muscular', 'mantenimiento'],
    items: [cloneIngredient(ING.wholeBread), cloneIngredient(ING.banana), cloneIngredient(ING.peanutButter), cloneIngredient(HERBS.cinnamon)],
  }),
  recipeFromParts({
    name: 'Avena con yogur y frutos rojos inspirada en NHS',
    description: 'Bol frio con base de avena y yogur, muy util para perdida de peso y adherencia.',
    instructions: ['Mezclar yogur y avena.', 'Añadir frutos rojos y canela.', 'Reposar unos minutos antes de consumir.'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'facil',
    tags: ['research_inspired', 'desayuno'],
    mealTypes: ['desayuno', 'snack'],
    dietTypes: ['mediterranea', 'dash'],
    goalTypes: ['perdida_peso', 'mantenimiento'],
    items: [cloneIngredient(ING.greekYogurt), cloneIngredient(ING.oats), cloneIngredient(ING.berries), cloneIngredient(HERBS.cinnamon)],
  }),
  recipeFromParts({
    name: 'Ensalada caribeña de pollo inspirada en NHS',
    description: 'Lectura adaptada del informe con base de pollo, arroz, fruta y hojas verdes.',
    instructions: ['Cocer la base elegida.', 'Mezclar con pollo, fruta y hojas verdes.', 'Aliñar y servir fria.'],
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    difficulty: 'facil',
    tags: ['research_inspired', 'almuerzo'],
    mealTypes: ['almuerzo', 'cena'],
    dietTypes: ['ninguna', 'mediterranea'],
    goalTypes: ['perdida_peso', 'mantenimiento'],
    items: [cloneIngredient(ING.chicken), cloneIngredient(ING.brownRice), cloneIngredient(ING.mango), cloneIngredient(ING.lettuce), cloneIngredient(HERBS.lemon)],
  }),
  recipeFromParts({
    name: 'Curry suave de ternera inspirado en NHS',
    description: 'Version domestica y equilibrada de curry con ternera magra y arroz.',
    instructions: ['Dorar la ternera con especias suaves.', 'Añadir tomate triturado y verduras.', 'Servir sobre arroz basmati.'],
    prepTime: 18,
    cookTime: 35,
    servings: 1,
    difficulty: 'medio',
    tags: ['research_inspired', 'cena'],
    mealTypes: ['almuerzo', 'cena'],
    dietTypes: ['ninguna', 'alta_proteina'],
    goalTypes: ['ganancia_muscular', 'mantenimiento'],
    items: [cloneIngredient(ING.leanBeef), cloneIngredient(ING.basmati), cloneIngredient(ING.tomatoSauce), cloneIngredient(ING.carrots), cloneIngredient(ING.peppers)],
  }),
  recipeFromParts({
    name: 'Alcachofas a la romana inspiradas en Mayo Clinic',
    description: 'Inspiracion mediterranea y DASH para una cena vegetal con aceite de oliva y hierbas.',
    instructions: ['Preparar las verduras con hierbas y aceite.', 'Hornear hasta que queden tiernas.', 'Terminar con limon y perejil.'],
    prepTime: 15,
    cookTime: 35,
    servings: 1,
    difficulty: 'medio',
    tags: ['research_inspired', 'cena', 'vegetal'],
    mealTypes: ['cena'],
    dietTypes: ['mediterranea', 'dash'],
    goalTypes: ['salud_cardiometabolica', 'perdida_peso'],
    items: [per100('alcachofa', 220, 'g', { calories: 47, protein: 3.3, carbs: 11, fat: 0.2, fiber: 5.4 }), cloneIngredient(ING.oliveOil), cloneIngredient(HERBS.parsley), cloneIngredient(HERBS.lemon)],
  }),
];
const BALANCED_BREAKFASTS = buildSeries(10, (index) => makeBreakfastBowl(index, ['ninguna'], ['mantenimiento', 'perdida_peso'], 'Bol equilibrado'));
const BALANCED_TOASTS = buildSeries(8, (index) => makeSavouryToast(index, ['ninguna'], ['mantenimiento', 'recomposicion'], 'Tostada equilibrada'));
const BALANCED_MAINS = buildSeries(8, (index) => makeMainBowl(index, ['ninguna'], ['mantenimiento', 'ganancia_muscular'], 'Plato equilibrado'));
const BALANCED_SNACKS = buildSeries(6, (index) => makeSnack(index, ['ninguna'], ['mantenimiento', 'perdida_peso'], 'Snack equilibrado'));

const MEDITERRANEAN_BREAKFASTS = buildSeries(16, (index) => makeBreakfastBowl(index, ['mediterranea'], ['perdida_peso', 'mantenimiento'], 'Bol mediterraneo'));
const MEDITERRANEAN_TOASTS = buildSeries(12, (index) => makeSavouryToast(index, ['mediterranea'], ['perdida_peso', 'mantenimiento'], 'Tostada mediterranea'));
const MEDITERRANEAN_MAINS = buildSeries(20, (index) => makeMainBowl(index, ['mediterranea'], ['perdida_peso', 'mantenimiento', 'salud_cardiometabolica'], 'Bowl mediterraneo'));
const MEDITERRANEAN_DINNERS = buildSeries(20, (index) => makeTrayBake(index, ['mediterranea'], ['perdida_peso', 'mantenimiento'], 'Bandeja mediterranea'));

const DASH_BREAKFASTS = buildSeries(12, (index) => makeBreakfastBowl(index, ['dash'], ['perdida_peso', 'salud_cardiometabolica'], 'Bol DASH'));
const DASH_TOASTS = buildSeries(8, (index) => makeSavouryToast(index, ['dash'], ['salud_cardiometabolica', 'perdida_peso'], 'Tostada DASH'));
const DASH_MAINS = buildSeries(18, (index) => makeMainBowl(index, ['dash'], ['salud_cardiometabolica', 'perdida_peso', 'mantenimiento'], 'Plato DASH'));
const DASH_DINNERS = buildSeries(18, (index) => makeTrayBake(index, ['dash'], ['salud_cardiometabolica', 'perdida_peso'], 'Cena DASH'));

const IF_MAINS = buildSeries(36, (index) => makeMainBowl(index, ['ayuno_intermitente'], ['perdida_peso', 'recomposicion'], 'Comida 16:8'));
const IF_PLATES = buildSeries(32, (index) => makeFreshPlate(index, ['ayuno_intermitente'], ['perdida_peso', 'recomposicion'], 'Plato 16:8'));
const IF_DINNERS = buildSeries(16, (index) => makeTrayBake(index, ['ayuno_intermitente'], ['perdida_peso', 'recomposicion', 'ganancia_muscular'], 'Cena 16:8'));
const IF_SNACKS = buildSeries(8, (index) => makeSnack(index, ['ayuno_intermitente'], ['perdida_peso', 'recomposicion'], 'Snack 16:8'));

const HIGH_PROTEIN_BREAKFASTS = buildSeries(20, (index) => makeBreakfastBowl(index, ['alta_proteina'], ['ganancia_muscular', 'recomposicion'], 'Bol proteico'));
const HIGH_PROTEIN_TOASTS = buildSeries(20, (index) => makeSavouryToast(index, ['alta_proteina'], ['ganancia_muscular', 'recomposicion'], 'Desayuno proteico'));
const HIGH_PROTEIN_MAINS = buildSeries(40, (index) => makeMainBowl(index, ['alta_proteina'], ['ganancia_muscular', 'recomposicion', 'perdida_peso'], 'Bowl proteico'));
const HIGH_PROTEIN_DINNERS = buildSeries(28, (index) => makeTrayBake(index, ['alta_proteina'], ['ganancia_muscular', 'recomposicion', 'perdida_peso'], 'Cena proteica'));
const HIGH_PROTEIN_SNACKS = buildSeries(12, (index) => makeSnack(index, ['alta_proteina'], ['ganancia_muscular', 'recomposicion'], 'Snack proteico'));

function dedupeRecipes(recipes: SeedRecipe[]): SeedRecipe[] {
  const seen = new Set<string>();
  return recipes.filter((recipe) => {
    const key = recipe.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const SYSTEM_RECIPES: SeedRecipe[] = dedupeRecipes([
  ...RESEARCH_INSPIRED_RECIPES,
  ...BALANCED_BREAKFASTS,
  ...BALANCED_TOASTS,
  ...BALANCED_MAINS,
  ...BALANCED_SNACKS,
  ...MEDITERRANEAN_BREAKFASTS,
  ...MEDITERRANEAN_TOASTS,
  ...MEDITERRANEAN_MAINS,
  ...MEDITERRANEAN_DINNERS,
  ...DASH_BREAKFASTS,
  ...DASH_TOASTS,
  ...DASH_MAINS,
  ...DASH_DINNERS,
  ...IF_MAINS,
  ...IF_PLATES,
  ...IF_DINNERS,
  ...IF_SNACKS,
  ...HIGH_PROTEIN_BREAKFASTS,
  ...HIGH_PROTEIN_TOASTS,
  ...HIGH_PROTEIN_MAINS,
  ...HIGH_PROTEIN_DINNERS,
  ...HIGH_PROTEIN_SNACKS,
]);

function buildStats() {
  const byDiet: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byGoal: Record<string, number> = {};
  const byMealType: Record<string, number> = {};

  for (const recipe of SYSTEM_RECIPES) {
    byDifficulty[recipe.difficulty] = (byDifficulty[recipe.difficulty] ?? 0) + 1;
    for (const dietType of recipe.dietTypes) byDiet[dietType] = (byDiet[dietType] ?? 0) + 1;
    for (const goalType of recipe.goalTypes) byGoal[goalType] = (byGoal[goalType] ?? 0) + 1;
    for (const mealType of recipe.mealTypes) byMealType[mealType] = (byMealType[mealType] ?? 0) + 1;
  }

  return { total: SYSTEM_RECIPES.length, byDiet, byDifficulty, byGoal, byMealType };
}

export const SYSTEM_RECIPE_STATS = buildStats();
