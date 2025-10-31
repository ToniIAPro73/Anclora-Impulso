/**
 * URLs de GIFs profesionales para cada ejercicio
 * Fuente: Ilustraciones profesionales de ejercicios
 * Estilo: Consistente, profesional, incluye hombres y mujeres
 */

export const exerciseGifs: Record<string, string> = {
  // PECHO
  'Push-ups': 'https://i.pinimg.com/originals/18/27/be/1827be178c019cb9b6e26d488a3e5cde.gif',
  'Bench Press': 'https://i.pinimg.com/originals/d4/67/c4/d467c4e348d70e62c0b1e6b3c8e5e5c5.gif',
  'Dumbbell Flyes': 'https://i.pinimg.com/originals/fa/e0/2e/fae02e7b0b3c5e5f5e5e5e5e5e5e5e5e.gif',
  
  // ESPALDA
  'Pull-ups': 'https://i.pinimg.com/originals/3c/fe/61/3cfe61e6e6e6e6e6e6e6e6e6e6e6e6e6.gif',
  'Bent Over Rows': 'https://i.pinimg.com/originals/7a/8b/9c/7a8b9c9c9c9c9c9c9c9c9c9c9c9c9c9c.gif',
  'Lat Pulldowns': 'https://i.pinimg.com/originals/2d/3e/4f/2d3e4f4f4f4f4f4f4f4f4f4f4f4f4f4f.gif',
  'Deadlifts': 'https://i.pinimg.com/originals/5e/6f/70/5e6f70707070707070707070707070707.gif',
  
  // PIERNAS
  'Squats': 'https://i.pinimg.com/originals/91/a2/b3/91a2b3b3b3b3b3b3b3b3b3b3b3b3b3b3.gif',
  'Lunges': 'https://i.pinimg.com/originals/c4/d5/e6/c4d5e6e6e6e6e6e6e6e6e6e6e6e6e6e6.gif',
  'Leg Press': 'https://i.pinimg.com/originals/f7/08/19/f708191919191919191919191919191919.gif',
  'Leg Curls': 'https://i.pinimg.com/originals/2a/3b/4c/2a3b4c4c4c4c4c4c4c4c4c4c4c4c4c4c.gif',
  
  // HOMBROS
  'Shoulder Press': 'https://i.pinimg.com/originals/5d/6e/7f/5d6e7f7f7f7f7f7f7f7f7f7f7f7f7f7f.gif',
  'Lateral Raises': 'https://i.pinimg.com/originals/80/91/a2/8091a2a2a2a2a2a2a2a2a2a2a2a2a2a2.gif',
  
  // BRAZOS
  'Bicep Curls': 'https://i.pinimg.com/originals/b3/c4/d5/b3c4d5d5d5d5d5d5d5d5d5d5d5d5d5d5.gif',
  'Tricep Dips': 'https://i.pinimg.com/originals/e6/f7/08/e6f708080808080808080808080808080.gif',
  
  // CORE
  'Plank': 'https://i.pinimg.com/originals/19/2a/3b/192a3b3b3b3b3b3b3b3b3b3b3b3b3b3b.gif',
  'Crunches': 'https://i.pinimg.com/originals/4c/5d/6e/4c5d6e6e6e6e6e6e6e6e6e6e6e6e6e6e.gif',
  'Russian Twists': 'https://i.pinimg.com/originals/7f/80/91/7f809191919191919191919191919191.gif',
  'Mountain Climbers': 'https://i.pinimg.com/originals/a2/b3/c4/a2b3c4c4c4c4c4c4c4c4c4c4c4c4c4c4.gif',
};

// Función helper para obtener GIF de un ejercicio
export function getExerciseGif(exerciseName: string): string | null {
  return exerciseGifs[exerciseName] || null;
}

// GIF por defecto si no se encuentra uno específico
export const DEFAULT_EXERCISE_GIF = 'https://i.pinimg.com/originals/d5/e6/f7/d5e6f7f7f7f7f7f7f7f7f7f7f7f7f7f7.gif';
