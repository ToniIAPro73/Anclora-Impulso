export type ProfileSex = 'male' | 'female';

function isFortyPlus(age?: number | null) {
  return typeof age === 'number' && age >= 40;
}

export function buildWorkoutPersonalizationGuidance(age?: number | null, sex?: ProfileSex | null) {
  if (!isFortyPlus(age)) {
    return '';
  }

  const generic = [
    'AJUSTE 40+: prioriza entrenamiento de fuerza como base del plan para preservar o recuperar masa muscular.',
    'Incluye movilidad, calentamiento y recuperacion entre bloques. Evita volumen inutil y castigo articular excesivo.',
    'Si añades cardio, prioriza cardio moderado o intervalos controlados de bajo impacto. No conviertas el plan en cardio interminable.',
    'Distribuye la carga semanal para que el usuario pueda sostener 150-300 minutos semanales de actividad total sin comprometer la recuperacion.',
    'Para objetivos de perdida de grasa, protege el musculo y la adherencia antes que maximizar el agotamiento.'
  ];

  const sexSpecific =
    sex === 'female'
      ? [
          'Para mujeres 40+: contempla cambios de composicion corporal asociados a la perimenopausia/menopausia. Refuerza fuerza global, estabilidad central, tren inferior, espalda y salud osea.',
          'Prioriza ejercicios tecnicos, progresivos y sostenibles. Usa impacto solo si es coherente con el nivel del usuario.',
        ]
      : sex === 'male'
        ? [
            'Para hombres 40+: enfoca el plan en fuerza de grandes grupos musculares, gasto energetico sostenible y reduccion de grasa abdominal/visceral.',
            'Evita soluciones cosmeticas tipo "solo abdomen". Prioriza piernas, espalda, empujes, tracciones y trabajo de core util.',
          ]
        : [
            'Aplica ajustes generales de 40+: fuerza, recuperacion, movimiento diario y enfoque metabolico sostenible.',
          ];

  return [...generic, ...sexSpecific].map((line) => `- ${line}`).join('\n');
}

export function buildNutritionPersonalizationGuidance(input: {
  age?: number | null;
  sex?: ProfileSex | null;
  weightKg?: number | null;
  targetWeightKg?: number | null;
  trainingDaysPerWeek?: number | null;
}) {
  if (!isFortyPlus(input.age)) {
    return '';
  }

  const proteinMin = input.weightKg ? Math.round(input.weightKg * 1.3) : null;
  const proteinMax = input.weightKg ? Math.round(input.weightKg * 1.6) : null;
  const isFatLossGoal =
    typeof input.weightKg === 'number' &&
    typeof input.targetWeightKg === 'number' &&
    input.targetWeightKg < input.weightKg;

  const generic = [
    'AJUSTE 40+: construye un plan orientado a preservar masa muscular, saciedad, energia estable y adherencia real.',
    proteinMin && proteinMax
      ? `Asegura aproximadamente entre ${proteinMin} y ${proteinMax} g de proteina al dia, repartida entre comidas.`
      : 'Asegura proteina suficiente, idealmente en el rango 1,3-1,6 g/kg/dia, repartida entre comidas.',
    'Prioriza alimentos minimamente procesados, verduras, fruta, legumbres, grasas saludables y carbohidratos de buena calidad.',
    'Evita planteamientos extremos o demasiado agresivos. El deficit, si existe, debe proteger la masa muscular y la recuperacion.',
    'Ten en cuenta sueño, estres, apetito y facilidad de preparacion para favorecer consistencia.',
  ];

  if (isFatLossGoal) {
    generic.push('El objetivo es perder grasa sin sacrificar masa muscular ni energia diaria.');
  }

  if ((input.trainingDaysPerWeek ?? 0) >= 4) {
    generic.push('Incluye suficiente energia y proteina alrededor de los dias con mas carga de entrenamiento.');
  }

  const sexSpecific =
    input.sex === 'female'
      ? [
          'Para mujeres 40+: contempla la transicion hormonal propia de esta etapa. Favorece saciedad, proteina suficiente, calcio dietetico, omega-3 y densidad nutricional.',
          'Evita recomendaciones que dependan de restriccion severa o cardio excesivo.',
        ]
      : input.sex === 'male'
        ? [
            'Para hombres 40+: enfoca el plan en controlar hambre, mejorar sensibilidad a la insulina y reducir acumulacion abdominal.',
            'Limita ultraprocesados, alcohol frecuente y exceso de azucares liquidos.',
          ]
        : [
            'Aplica ajustes generales de 40+: proteina suficiente, control glucemico, saciedad y recuperacion.',
          ];

  return [...generic, ...sexSpecific].map((line) => `- ${line}`).join('\n');
}
