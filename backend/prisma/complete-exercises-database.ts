/**
 * Base de Datos Completa de Ejercicios - Anclora Impulso
 * Más de 100 ejercicios categorizados y detallados
 */

export interface ExerciseData {
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string[];
  imageFileName?: string;
  tips?: string[];
  commonMistakes?: string[];
  variations?: string[];
}

export const completeExercisesDatabase: ExerciseData[] = [
  // ==================== PECHO (15 ejercicios) ====================
  {
    name: 'Push-ups',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio fundamental para desarrollar pecho, hombros y tríceps usando el peso corporal.',
    instructions: [
      'Colócate en posición de plancha con las manos a la anchura de los hombros',
      'Mantén el cuerpo recto desde la cabeza hasta los talones',
      'Baja el cuerpo doblando los codos hasta que el pecho casi toque el suelo',
      'Empuja hacia arriba hasta la posición inicial',
      'Mantén el core activado durante todo el movimiento'
    ],
    imageFileName: 'push-ups.png',
    tips: [
      'No dejes que las caderas se hundan',
      'Mantén los codos a 45 grados del cuerpo',
      'Respira: inhala al bajar, exhala al subir'
    ],
    commonMistakes: [
      'Arquear la espalda baja',
      'Dejar caer las caderas',
      'No bajar lo suficiente'
    ],
    variations: ['Push-ups de rodillas', 'Push-ups diamante', 'Push-ups declinadas', 'Push-ups con palmada']
  },
  {
    name: 'Bench Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Ejercicio clásico de press de banca para desarrollar masa muscular en el pecho.',
    instructions: [
      'Acuéstate en el banco con los pies firmes en el suelo',
      'Agarra la barra con las manos ligeramente más anchas que los hombros',
      'Baja la barra de forma controlada hasta el pecho',
      'Empuja la barra hacia arriba hasta extender los brazos',
      'Mantén los omóplatos retraídos durante todo el movimiento'
    ],
    imageFileName: 'bench-press.png',
    tips: [
      'Mantén los pies plantados en el suelo',
      'Crea un arco natural en la espalda baja',
      'La barra debe tocar el pecho a la altura de los pezones'
    ],
    commonMistakes: [
      'Rebotar la barra en el pecho',
      'Levantar las caderas del banco',
      'Agarre demasiado ancho o estrecho'
    ],
    variations: ['Press inclinado', 'Press declinado', 'Press con mancuernas', 'Press cerrado']
  },
  {
    name: 'Dumbbell Flyes',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Ejercicio de aislamiento para estirar y contraer los músculos pectorales.',
    instructions: [
      'Acuéstate en un banco plano con una mancuerna en cada mano',
      'Extiende los brazos sobre el pecho con las palmas enfrentadas',
      'Baja las mancuernas en un arco amplio hasta sentir estiramiento en el pecho',
      'Mantén una ligera flexión en los codos',
      'Vuelve a la posición inicial apretando el pecho'
    ],
    tips: [
      'No bajes demasiado para evitar lesiones en el hombro',
      'Mantén el movimiento controlado',
      'Imagina que estás abrazando un árbol grande'
    ],
    commonMistakes: [
      'Bajar demasiado las mancuernas',
      'Doblar excesivamente los codos',
      'Usar peso excesivo'
    ],
    variations: ['Aperturas inclinadas', 'Aperturas con cable', 'Aperturas declinadas']
  },
  {
    name: 'Incline Bench Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Variante del press de banca que enfatiza la parte superior del pecho.',
    instructions: [
      'Ajusta el banco a 30-45 grados de inclinación',
      'Acuéstate con los pies firmes en el suelo',
      'Agarra la barra con las manos a la anchura de los hombros',
      'Baja la barra hasta la parte superior del pecho',
      'Empuja hacia arriba hasta extender los brazos'
    ],
    tips: [
      'El ángulo ideal es de 30-45 grados',
      'Mantén los omóplatos retraídos',
      'No uses un ángulo mayor a 45 grados'
    ],
    variations: ['Press inclinado con mancuernas', 'Press inclinado en Smith']
  },
  {
    name: 'Decline Bench Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Variante que enfatiza la parte inferior del pecho.',
    instructions: [
      'Ajusta el banco a 15-30 grados de declinación',
      'Asegura los pies en los soportes',
      'Agarra la barra y bájala hasta la parte inferior del pecho',
      'Empuja hacia arriba hasta extender los brazos'
    ],
    variations: ['Press declinado con mancuernas']
  },
  {
    name: 'Cable Crossover',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Cables',
    difficulty: 'Intermedio',
    description: 'Ejercicio de aislamiento con tensión constante en el pecho.',
    instructions: [
      'Colócate en el centro de una máquina de cables con poleas altas',
      'Agarra los mangos con las palmas hacia abajo',
      'Da un paso adelante con una pierna para estabilidad',
      'Lleva los mangos hacia abajo y adelante en un arco',
      'Cruza las manos frente al cuerpo',
      'Vuelve controladamente a la posición inicial'
    ],
    tips: [
      'Mantén una ligera flexión en los codos',
      'Inclínate ligeramente hacia adelante',
      'Aprieta el pecho al final del movimiento'
    ],
    variations: ['Cruces altos', 'Cruces medios', 'Cruces bajos']
  },
  {
    name: 'Chest Dips',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Barras paralelas',
    difficulty: 'Avanzado',
    description: 'Ejercicio avanzado que trabaja pecho, hombros y tríceps.',
    instructions: [
      'Agarra las barras paralelas y elévate',
      'Inclínate hacia adelante unos 30 grados',
      'Baja el cuerpo doblando los codos hasta 90 grados',
      'Empuja hacia arriba hasta extender los brazos',
      'Mantén los codos ligeramente hacia afuera'
    ],
    tips: [
      'Inclínate hacia adelante para enfatizar el pecho',
      'No bajes demasiado para proteger los hombros',
      'Usa lastre cuando sea necesario'
    ],
    variations: ['Fondos asistidos', 'Fondos con peso']
  },
  {
    name: 'Pec Deck Machine',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Máquina',
    difficulty: 'Principiante',
    description: 'Ejercicio de aislamiento en máquina para el pecho.',
    instructions: [
      'Ajusta el asiento para que los mangos estén a la altura del pecho',
      'Siéntate con la espalda contra el respaldo',
      'Agarra los mangos con los antebrazos paralelos al suelo',
      'Junta los mangos frente a tu pecho',
      'Vuelve controladamente a la posición inicial'
    ],
    tips: [
      'No uses impulso',
      'Mantén la espalda contra el respaldo',
      'Aprieta el pecho al final del movimiento'
    ]
  },
  {
    name: 'Diamond Push-ups',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Variante de flexiones que enfatiza tríceps y pecho interno.',
    instructions: [
      'Colócate en posición de flexión',
      'Junta las manos formando un diamante con los pulgares e índices',
      'Baja el cuerpo manteniendo los codos cerca del torso',
      'Empuja hacia arriba hasta la posición inicial'
    ],
    variations: ['Diamond push-ups en rodillas']
  },
  {
    name: 'Wide Grip Push-ups',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Flexiones con agarre amplio para enfatizar el pecho externo.',
    instructions: [
      'Colócate en posición de flexión',
      'Separa las manos más allá de la anchura de los hombros',
      'Baja el cuerpo hasta que el pecho casi toque el suelo',
      'Empuja hacia arriba hasta la posición inicial'
    ]
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Press inclinado con mancuernas para pecho superior.',
    instructions: [
      'Ajusta el banco a 30-45 grados',
      'Siéntate con una mancuerna en cada mano',
      'Empuja las mancuernas hacia arriba hasta extender los brazos',
      'Baja controladamente hasta que las mancuernas estén a la altura del pecho'
    ]
  },
  {
    name: 'Decline Dumbbell Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Press declinado con mancuernas para pecho inferior.',
    instructions: [
      'Ajusta el banco a 15-30 grados de declinación',
      'Acuéstate con una mancuerna en cada mano',
      'Empuja las mancuernas hacia arriba',
      'Baja controladamente'
    ]
  },
  {
    name: 'Chest Press Machine',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Máquina',
    difficulty: 'Principiante',
    description: 'Press de pecho en máquina guiada.',
    instructions: [
      'Ajusta el asiento para que los mangos estén a la altura del pecho',
      'Agarra los mangos y empuja hacia adelante',
      'Extiende los brazos completamente',
      'Vuelve controladamente'
    ]
  },
  {
    name: 'Svend Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Discos',
    difficulty: 'Intermedio',
    description: 'Ejercicio único que trabaja el pecho interno.',
    instructions: [
      'Sostén un disco de peso con ambas manos frente al pecho',
      'Aprieta el disco con las palmas',
      'Extiende los brazos hacia adelante',
      'Mantén la tensión y vuelve al pecho'
    ]
  },
  {
    name: 'Landmine Press',
    category: 'Fuerza',
    muscleGroup: 'Pecho',
    equipment: 'Barra landmine',
    difficulty: 'Intermedio',
    description: 'Press angular que trabaja pecho y hombros.',
    instructions: [
      'Coloca una barra en un landmine o esquina',
      'Agarra el extremo de la barra con ambas manos',
      'Empuja la barra hacia arriba en ángulo',
      'Baja controladamente'
    ]
  },

  // ==================== ESPALDA (15 ejercicios) ====================
  {
    name: 'Pull-ups',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra de dominadas',
    difficulty: 'Intermedio',
    description: 'Ejercicio compuesto fundamental para desarrollar la espalda superior.',
    instructions: [
      'Agarra la barra con las palmas hacia adelante, manos a la anchura de los hombros',
      'Cuelga con los brazos completamente extendidos',
      'Tira de tu cuerpo hacia arriba hasta que la barbilla supere la barra',
      'Baja controladamente hasta la posición inicial',
      'Mantén el core activado y evita balancearte'
    ],
    imageFileName: 'pull-ups.png',
    tips: [
      'Retrae los omóplatos antes de tirar',
      'Piensa en llevar los codos hacia abajo',
      'No uses impulso con las piernas'
    ],
    commonMistakes: [
      'Usar impulso para subir',
      'No bajar completamente',
      'Encorvar los hombros'
    ],
    variations: ['Dominadas asistidas', 'Dominadas con peso', 'Dominadas neutras', 'Dominadas supinas']
  },
  {
    name: 'Bent Over Rows',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Ejercicio compuesto para desarrollar grosor en la espalda media.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Inclínate hacia adelante desde las caderas manteniendo la espalda recta',
      'Agarra la barra con las manos a la anchura de los hombros',
      'Tira de la barra hacia el abdomen bajo',
      'Baja controladamente hasta extender los brazos'
    ],
    imageFileName: 'bent-over-rows.png',
    tips: [
      'Mantén la espalda recta, no redondeada',
      'Tira con los codos, no con las manos',
      'La barra debe tocar entre el ombligo y el esternón'
    ],
    commonMistakes: [
      'Redondear la espalda',
      'Usar demasiado peso',
      'Tirar con los brazos en lugar de la espalda'
    ],
    variations: ['Remo con mancuernas', 'Remo Pendlay', 'Remo con agarre supino']
  },
  {
    name: 'Deadlifts',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra',
    difficulty: 'Avanzado',
    description: 'El rey de los ejercicios compuestos, trabaja toda la cadena posterior.',
    instructions: [
      'Colócate con los pies debajo de la barra, a la anchura de las caderas',
      'Agarra la barra con las manos justo fuera de las piernas',
      'Mantén la espalda recta, pecho arriba, caderas bajas',
      'Empuja el suelo con los pies y extiende las caderas',
      'Mantén la barra cerca del cuerpo durante todo el movimiento',
      'Baja controladamente invirtiendo el movimiento'
    ],
    imageFileName: 'deadlifts.png',
    tips: [
      'La barra debe moverse en línea recta',
      'Mantén el core muy apretado',
      'No redondees la espalda baja',
      'Termina el movimiento con las caderas, no hiperextendiendo la espalda'
    ],
    commonMistakes: [
      'Redondear la espalda',
      'Empezar con las caderas demasiado altas o bajas',
      'Alejar la barra del cuerpo',
      'Hiperextender la espalda al final'
    ],
    variations: ['Peso muerto rumano', 'Peso muerto sumo', 'Peso muerto con barra hexagonal']
  },
  {
    name: 'Lat Pulldowns',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Máquina de cables',
    difficulty: 'Principiante',
    description: 'Ejercicio en máquina para desarrollar los dorsales.',
    instructions: [
      'Siéntate en la máquina con los muslos asegurados bajo las almohadillas',
      'Agarra la barra con las manos más anchas que los hombros',
      'Tira de la barra hacia el pecho superior',
      'Aprieta los omóplatos al final del movimiento',
      'Vuelve controladamente a la posición inicial'
    ],
    tips: [
      'No te inclines demasiado hacia atrás',
      'Piensa en llevar los codos hacia abajo y atrás',
      'Mantén el pecho elevado'
    ],
    variations: ['Jalón frontal agarre cerrado', 'Jalón con agarre neutro', 'Jalón tras nuca']
  },
  {
    name: 'Seated Cable Rows',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Máquina de cables',
    difficulty: 'Principiante',
    description: 'Ejercicio de remo sentado para la espalda media.',
    instructions: [
      'Siéntate en la máquina con los pies en los soportes',
      'Agarra el mango con ambas manos',
      'Tira del mango hacia el abdomen',
      'Aprieta los omóplatos juntos',
      'Extiende los brazos controladamente'
    ],
    tips: [
      'Mantén la espalda recta',
      'No uses impulso del torso',
      'Aprieta la espalda al final del movimiento'
    ],
    variations: ['Remo con agarre amplio', 'Remo con agarre cerrado', 'Remo unilateral']
  },
  {
    name: 'Single Arm Dumbbell Row',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    description: 'Remo unilateral con mancuerna para la espalda.',
    instructions: [
      'Apoya una rodilla y mano en un banco',
      'Sostén una mancuerna con la otra mano',
      'Tira de la mancuerna hacia la cadera',
      'Mantén el torso paralelo al suelo',
      'Baja controladamente'
    ],
    tips: [
      'No rotes el torso',
      'Tira con el codo, no con la mano',
      'Mantén el core activado'
    ]
  },
  {
    name: 'T-Bar Row',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra T',
    difficulty: 'Intermedio',
    description: 'Remo con barra T para grosor de espalda.',
    instructions: [
      'Colócate a horcajadas sobre la barra T',
      'Inclínate hacia adelante con la espalda recta',
      'Agarra los mangos',
      'Tira de la barra hacia el pecho',
      'Baja controladamente'
    ]
  },
  {
    name: 'Face Pulls',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Cables',
    difficulty: 'Principiante',
    description: 'Ejercicio para la espalda superior y hombros posteriores.',
    instructions: [
      'Ajusta la polea a la altura de la cara',
      'Agarra la cuerda con ambas manos',
      'Tira de la cuerda hacia la cara',
      'Separa las manos al final del movimiento',
      'Aprieta los omóplatos juntos'
    ],
    tips: [
      'Mantén los codos altos',
      'No uses peso excesivo',
      'Enfócate en la contracción'
    ]
  },
  {
    name: 'Inverted Rows',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra baja',
    difficulty: 'Principiante',
    description: 'Remo invertido con peso corporal.',
    instructions: [
      'Colócate debajo de una barra baja',
      'Agarra la barra con las manos a la anchura de los hombros',
      'Mantén el cuerpo recto',
      'Tira del pecho hacia la barra',
      'Baja controladamente'
    ]
  },
  {
    name: 'Hyperextensions',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Banco de hiperextensiones',
    difficulty: 'Principiante',
    description: 'Ejercicio para la espalda baja y glúteos.',
    instructions: [
      'Colócate en el banco de hiperextensiones',
      'Cruza los brazos sobre el pecho',
      'Baja el torso hacia el suelo',
      'Sube hasta que el cuerpo esté recto',
      'No hiperextendas la espalda'
    ]
  },
  {
    name: 'Chin-ups',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra de dominadas',
    difficulty: 'Intermedio',
    description: 'Dominadas con agarre supino que enfatizan bíceps.',
    instructions: [
      'Agarra la barra con las palmas hacia ti',
      'Cuelga con los brazos extendidos',
      'Tira hasta que la barbilla supere la barra',
      'Baja controladamente'
    ]
  },
  {
    name: 'Chest Supported Row',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Banco inclinado',
    difficulty: 'Intermedio',
    description: 'Remo con apoyo de pecho para aislar la espalda.',
    instructions: [
      'Acuéstate boca abajo en un banco inclinado',
      'Sostén mancuernas con los brazos colgando',
      'Tira de las mancuernas hacia las caderas',
      'Aprieta los omóplatos',
      'Baja controladamente'
    ]
  },
  {
    name: 'Meadows Row',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra',
    difficulty: 'Avanzado',
    description: 'Remo unilateral con barra para la espalda.',
    instructions: [
      'Coloca una barra en una esquina',
      'Párate perpendicular a la barra',
      'Agarra el extremo de la barra con una mano',
      'Tira de la barra hacia la cadera',
      'Mantén el torso estable'
    ]
  },
  {
    name: 'Straight Arm Pulldown',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Cables',
    difficulty: 'Intermedio',
    description: 'Ejercicio de aislamiento para los dorsales.',
    instructions: [
      'Párate frente a una polea alta',
      'Agarra la barra con los brazos extendidos',
      'Tira de la barra hacia los muslos',
      'Mantén los brazos rectos',
      'Vuelve controladamente'
    ]
  },
  {
    name: 'Rack Pulls',
    category: 'Fuerza',
    muscleGroup: 'Espalda',
    equipment: 'Barra',
    difficulty: 'Avanzado',
    description: 'Peso muerto parcial desde rack para la espalda superior.',
    instructions: [
      'Coloca la barra en un rack a la altura de las rodillas',
      'Agarra la barra como en un peso muerto',
      'Tira de la barra hacia arriba extendiendo las caderas',
      'Aprieta los omóplatos al final',
      'Baja controladamente'
    ]
  },

  // ==================== PIERNAS (20 ejercicios) ====================
  {
    name: 'Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'El rey de los ejercicios de piernas, trabaja cuádriceps, glúteos y core.',
    instructions: [
      'Coloca la barra en la parte superior de la espalda (trap bar)',
      'Párate con los pies a la anchura de los hombros',
      'Baja las caderas hacia atrás y abajo como si te sentaras',
      'Desciende hasta que los muslos estén paralelos al suelo',
      'Empuja a través de los talones para volver arriba',
      'Mantén el pecho elevado y la espalda recta'
    ],
    imageFileName: 'squats.png',
    tips: [
      'Las rodillas deben seguir la dirección de los pies',
      'Mantén el peso en los talones',
      'No dejes que las rodillas se colapsen hacia adentro',
      'Respira profundo antes de bajar'
    ],
    commonMistakes: [
      'Rodillas hacia adentro',
      'Levantar los talones del suelo',
      'Redondear la espalda',
      'No bajar lo suficiente'
    ],
    variations: ['Sentadilla frontal', 'Sentadilla búlgara', 'Sentadilla goblet', 'Sentadilla sumo']
  },
  {
    name: 'Lunges',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio unilateral para cuádriceps, glúteos y equilibrio.',
    instructions: [
      'Párate con los pies juntos',
      'Da un paso largo hacia adelante con una pierna',
      'Baja las caderas hasta que ambas rodillas estén a 90 grados',
      'La rodilla trasera debe casi tocar el suelo',
      'Empuja con el talón delantero para volver a la posición inicial',
      'Alterna las piernas'
    ],
    imageFileName: 'lunges.png',
    tips: [
      'Mantén el torso erguido',
      'La rodilla delantera no debe pasar los dedos del pie',
      'Mantén el core activado para el equilibrio'
    ],
    commonMistakes: [
      'Paso demasiado corto',
      'Rodilla delantera sobrepasando los dedos',
      'Inclinarse hacia adelante'
    ],
    variations: ['Zancadas caminando', 'Zancadas inversas', 'Zancadas laterales', 'Zancadas búlgaras']
  },
  {
    name: 'Leg Press',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Máquina',
    difficulty: 'Principiante',
    description: 'Ejercicio en máquina para cuádriceps y glúteos.',
    instructions: [
      'Siéntate en la máquina con la espalda contra el respaldo',
      'Coloca los pies en la plataforma a la anchura de los hombros',
      'Libera los seguros y baja la plataforma doblando las rodillas',
      'Desciende hasta que las rodillas estén a 90 grados',
      'Empuja la plataforma hacia arriba hasta casi extender las piernas'
    ],
    tips: [
      'No bloquees completamente las rodillas',
      'Mantén la espalda baja contra el respaldo',
      'Controla el descenso'
    ],
    commonMistakes: [
      'Levantar la espalda baja del respaldo',
      'Bloquear las rodillas',
      'Rango de movimiento limitado'
    ],
    variations: ['Leg press con pies altos', 'Leg press con pies bajos', 'Leg press unilateral']
  },
  {
    name: 'Leg Curls',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Máquina',
    difficulty: 'Principiante',
    description: 'Ejercicio de aislamiento para los isquiotibiales.',
    instructions: [
      'Acuéstate boca abajo en la máquina',
      'Ajusta el rodillo para que esté justo encima de los talones',
      'Agarra los mangos para estabilidad',
      'Flexiona las rodillas llevando los talones hacia los glúteos',
      'Baja controladamente hasta extender las piernas'
    ],
    tips: [
      'No levantes las caderas de la almohadilla',
      'Mantén los tobillos flexionados',
      'Controla el movimiento'
    ],
    variations: ['Curl femoral sentado', 'Curl femoral de pie']
  },
  {
    name: 'Romanian Deadlifts',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Variante de peso muerto que enfatiza los isquiotibiales.',
    instructions: [
      'Párate con los pies a la anchura de las caderas sosteniendo una barra',
      'Mantén las rodillas ligeramente flexionadas',
      'Inclínate hacia adelante desde las caderas bajando la barra',
      'Mantén la espalda recta y la barra cerca de las piernas',
      'Desciende hasta sentir estiramiento en los isquiotibiales',
      'Vuelve a la posición inicial extendiendo las caderas'
    ],
    tips: [
      'Mantén la espalda recta, no redondeada',
      'La barra debe rozar las piernas',
      'Empuja las caderas hacia atrás'
    ],
    variations: ['RDL con mancuernas', 'RDL unilateral']
  },
  {
    name: 'Leg Extensions',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Máquina',
    difficulty: 'Principiante',
    description: 'Ejercicio de aislamiento para los cuádriceps.',
    instructions: [
      'Siéntate en la máquina con la espalda contra el respaldo',
      'Ajusta el rodillo para que esté en la parte baja de las espinillas',
      'Agarra los mangos laterales',
      'Extiende las piernas hasta que estén rectas',
      'Baja controladamente'
    ],
    tips: [
      'No uses impulso',
      'Mantén la espalda contra el respaldo',
      'Contrae los cuádriceps al final'
    ]
  },
  {
    name: 'Bulgarian Split Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Banco',
    difficulty: 'Intermedio',
    description: 'Sentadilla unilateral elevada para piernas y glúteos.',
    instructions: [
      'Coloca un pie en un banco detrás de ti',
      'El otro pie adelante en posición de zancada',
      'Baja las caderas hasta que la rodilla delantera esté a 90 grados',
      'Empuja con el talón delantero para subir',
      'Completa todas las repeticiones antes de cambiar de pierna'
    ],
    tips: [
      'Mantén el torso erguido',
      'La mayor parte del peso debe estar en la pierna delantera',
      'Encuentra la distancia correcta del banco'
    ]
  },
  {
    name: 'Goblet Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Mancuerna',
    difficulty: 'Principiante',
    description: 'Sentadilla con mancuerna sostenida al pecho.',
    instructions: [
      'Sostén una mancuerna verticalmente contra el pecho',
      'Párate con los pies ligeramente más anchos que los hombros',
      'Baja en sentadilla manteniendo el pecho elevado',
      'Los codos deben pasar entre las rodillas',
      'Empuja hacia arriba'
    ],
    tips: [
      'Mantén la mancuerna cerca del cuerpo',
      'Usa los codos para empujar las rodillas hacia afuera',
      'Excelente para aprender la técnica de sentadilla'
    ]
  },
  {
    name: 'Front Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Barra',
    difficulty: 'Avanzado',
    description: 'Sentadilla con barra al frente que enfatiza cuádriceps.',
    instructions: [
      'Coloca la barra en la parte frontal de los hombros',
      'Cruza los brazos o usa agarre limpio',
      'Mantén los codos altos',
      'Baja en sentadilla manteniendo el torso erguido',
      'Empuja hacia arriba'
    ],
    tips: [
      'Mantén los codos altos durante todo el movimiento',
      'El torso debe estar más vertical que en sentadilla trasera',
      'Requiere buena movilidad de muñecas y hombros'
    ]
  },
  {
    name: 'Sumo Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Sentadilla con stance amplio que enfatiza aductores y glúteos.',
    instructions: [
      'Párate con los pies mucho más anchos que los hombros',
      'Apunta los dedos de los pies hacia afuera',
      'Baja las caderas manteniendo el torso erguido',
      'Desciende hasta que los muslos estén paralelos al suelo',
      'Empuja hacia arriba'
    ],
    tips: [
      'Las rodillas deben seguir la dirección de los pies',
      'Mantén el pecho elevado',
      'Aprieta los glúteos al subir'
    ]
  },
  {
    name: 'Walking Lunges',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Zancadas caminando para piernas y equilibrio.',
    instructions: [
      'Párate con los pies juntos',
      'Da un paso largo hacia adelante',
      'Baja hasta que ambas rodillas estén a 90 grados',
      'Empuja con el pie trasero para dar el siguiente paso',
      'Continúa caminando hacia adelante'
    ]
  },
  {
    name: 'Box Jumps',
    category: 'Pliométrico',
    muscleGroup: 'Piernas',
    equipment: 'Cajón pliométrico',
    difficulty: 'Intermedio',
    description: 'Ejercicio explosivo para potencia de piernas.',
    instructions: [
      'Párate frente a un cajón estable',
      'Flexiona ligeramente las rodillas',
      'Salta explosivamente sobre el cajón',
      'Aterriza suavemente con ambos pies',
      'Baja controladamente'
    ],
    tips: [
      'Empieza con un cajón bajo',
      'Aterriza suavemente, no con las piernas rígidas',
      'Enfócate en la técnica, no en la altura'
    ]
  },
  {
    name: 'Step-ups',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Banco',
    difficulty: 'Principiante',
    description: 'Ejercicio unilateral de subida a banco.',
    instructions: [
      'Párate frente a un banco o cajón',
      'Coloca un pie completamente en el banco',
      'Empuja con ese pie para subir',
      'Lleva el otro pie al banco',
      'Baja controladamente'
    ]
  },
  {
    name: 'Calf Raises',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio para desarrollar los gemelos.',
    instructions: [
      'Párate con los pies a la anchura de las caderas',
      'Eleva los talones del suelo',
      'Sube lo más alto posible sobre las puntas de los pies',
      'Mantén un segundo en la parte superior',
      'Baja controladamente'
    ],
    tips: [
      'Mantén las rodillas ligeramente flexionadas',
      'Sube lo más alto posible',
      'Controla el descenso'
    ],
    variations: ['Elevaciones de gemelos sentado', 'Elevaciones unilaterales']
  },
  {
    name: 'Glute Bridges',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio para glúteos e isquiotibiales.',
    instructions: [
      'Acuéstate boca arriba con las rodillas flexionadas',
      'Pies planos en el suelo a la anchura de las caderas',
      'Empuja a través de los talones para elevar las caderas',
      'Aprieta los glúteos en la parte superior',
      'Baja controladamente'
    ],
    tips: [
      'Aprieta los glúteos, no hiperextendas la espalda',
      'Mantén el core activado',
      'Los hombros deben permanecer en el suelo'
    ],
    variations: ['Puente de glúteos con barra', 'Puente unilateral']
  },
  {
    name: 'Hip Thrusts',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Banco',
    difficulty: 'Intermedio',
    description: 'Ejercicio avanzado para glúteos.',
    instructions: [
      'Siéntate en el suelo con la espalda superior contra un banco',
      'Coloca una barra sobre las caderas',
      'Flexiona las rodillas con los pies planos',
      'Empuja a través de los talones para elevar las caderas',
      'Aprieta los glúteos en la parte superior',
      'Baja controladamente'
    ],
    tips: [
      'La espalda superior debe estar en el banco',
      'Empuja las caderas hacia arriba, no hacia adelante',
      'Usa una almohadilla para la barra'
    ]
  },
  {
    name: 'Wall Sits',
    category: 'Isométrico',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio isométrico para resistencia de cuádriceps.',
    instructions: [
      'Apoya la espalda contra una pared',
      'Deslízate hacia abajo hasta que las rodillas estén a 90 grados',
      'Los muslos deben estar paralelos al suelo',
      'Mantén la posición el tiempo deseado',
      'Mantén la espalda plana contra la pared'
    ],
    tips: [
      'Las rodillas deben estar directamente sobre los tobillos',
      'Respira normalmente',
      'Empieza con 30 segundos y aumenta gradualmente'
    ]
  },
  {
    name: 'Sissy Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Avanzado',
    description: 'Ejercicio avanzado de aislamiento para cuádriceps.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Agárrate de algo para equilibrio',
      'Inclínate hacia atrás desde las rodillas',
      'Baja manteniendo el cuerpo en línea recta',
      'Empuja hacia arriba'
    ],
    tips: [
      'Mantén el core muy apretado',
      'No es para principiantes',
      'Requiere buena fuerza de rodilla'
    ]
  },
  {
    name: 'Nordic Curls',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Peso corporal',
    difficulty: 'Avanzado',
    description: 'Ejercicio excéntrico avanzado para isquiotibiales.',
    instructions: [
      'Arrodíllate con alguien sosteniendo tus tobillos',
      'Mantén el cuerpo recto desde las rodillas',
      'Baja lentamente hacia adelante',
      'Resiste la caída con los isquiotibiales',
      'Usa las manos para amortiguar al final'
    ],
    tips: [
      'Muy difícil, empieza con asistencia',
      'Enfócate en la fase excéntrica',
      'Excelente para prevención de lesiones'
    ]
  },
  {
    name: 'Hack Squats',
    category: 'Fuerza',
    muscleGroup: 'Piernas',
    equipment: 'Máquina',
    difficulty: 'Intermedio',
    description: 'Sentadilla en máquina hack squat.',
    instructions: [
      'Colócate en la máquina con la espalda contra el respaldo',
      'Pies en la plataforma a la anchura de los hombros',
      'Libera los seguros',
      'Baja doblando las rodillas',
      'Empuja hacia arriba'
    ]
  },

  // ==================== HOMBROS (12 ejercicios) ====================
  {
    name: 'Shoulder Press',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Press de hombros con mancuernas para deltoides.',
    instructions: [
      'Siéntate en un banco con respaldo vertical',
      'Sostén una mancuerna en cada mano a la altura de los hombros',
      'Las palmas deben mirar hacia adelante',
      'Empuja las mancuernas hacia arriba hasta extender los brazos',
      'Baja controladamente hasta la posición inicial'
    ],
    imageFileName: 'shoulder-press.png',
    tips: [
      'No arquees excesivamente la espalda',
      'Mantén el core activado',
      'No bloquees completamente los codos arriba'
    ],
    commonMistakes: [
      'Arquear demasiado la espalda',
      'Usar impulso',
      'Rango de movimiento limitado'
    ],
    variations: ['Press militar con barra', 'Press Arnold', 'Press de pie']
  },
  {
    name: 'Lateral Raises',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    description: 'Elevaciones laterales para el deltoides medio.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Sostén una mancuerna en cada mano a los lados',
      'Con los codos ligeramente flexionados, eleva los brazos lateralmente',
      'Sube hasta que los brazos estén paralelos al suelo',
      'Baja controladamente'
    ],
    imageFileName: 'lateral-raises.png',
    tips: [
      'No uses impulso',
      'Mantén los codos ligeramente flexionados',
      'Imagina que estás vertiendo agua de una jarra'
    ],
    commonMistakes: [
      'Usar peso excesivo',
      'Elevar los hombros (encogimiento)',
      'Balancear el cuerpo'
    ],
    variations: ['Elevaciones laterales con cables', 'Elevaciones laterales inclinado']
  },
  {
    name: 'Front Raises',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    description: 'Elevaciones frontales para el deltoides anterior.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Sostén una mancuerna en cada mano frente a los muslos',
      'Eleva una mancuerna hacia adelante',
      'Sube hasta la altura de los hombros',
      'Baja controladamente y alterna'
    ],
    tips: [
      'Mantén los brazos rectos o ligeramente flexionados',
      'No uses impulso',
      'Controla el descenso'
    ],
    variations: ['Elevaciones frontales con barra', 'Elevaciones frontales con disco']
  },
  {
    name: 'Rear Delt Flyes',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Aperturas para el deltoides posterior.',
    instructions: [
      'Inclínate hacia adelante con la espalda recta',
      'Sostén mancuernas con los brazos colgando',
      'Eleva los brazos lateralmente',
      'Aprieta los omóplatos juntos',
      'Baja controladamente'
    ],
    tips: [
      'Mantén la espalda recta',
      'No uses impulso',
      'Enfócate en el deltoides posterior'
    ],
    variations: ['Aperturas posteriores en máquina', 'Aperturas posteriores con cables']
  },
  {
    name: 'Upright Rows',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Remo vertical para hombros y trapecios.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Sostén una barra con agarre estrecho frente a los muslos',
      'Tira de la barra hacia arriba cerca del cuerpo',
      'Los codos deben subir más alto que las manos',
      'Baja controladamente'
    ],
    tips: [
      'No subas la barra más allá de la altura del pecho',
      'Mantén la barra cerca del cuerpo',
      'Si sientes dolor en los hombros, detente'
    ],
    variations: ['Remo vertical con mancuernas', 'Remo vertical con cables']
  },
  {
    name: 'Arnold Press',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Variante del press de hombros con rotación.',
    instructions: [
      'Siéntate con mancuernas a la altura del pecho',
      'Palmas mirando hacia ti',
      'Empuja las mancuernas hacia arriba mientras rotas las palmas hacia adelante',
      'Al final, las palmas deben mirar hacia adelante',
      'Invierte el movimiento al bajar'
    ],
    tips: [
      'El movimiento debe ser fluido',
      'Controla la rotación',
      'No uses peso excesivo'
    ]
  },
  {
    name: 'Military Press',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Press militar de pie con barra.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Sostén la barra a la altura de los hombros',
      'Empuja la barra hacia arriba en línea recta',
      'Mueve la cabeza ligeramente hacia atrás',
      'Baja controladamente'
    ],
    tips: [
      'Mantén el core muy apretado',
      'No arquees excesivamente la espalda',
      'La barra debe moverse en línea recta'
    ]
  },
  {
    name: 'Face Pulls',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Cables',
    difficulty: 'Principiante',
    description: 'Ejercicio para deltoides posterior y salud del hombro.',
    instructions: [
      'Ajusta la polea a la altura de la cara',
      'Agarra la cuerda con ambas manos',
      'Tira de la cuerda hacia la cara',
      'Separa las manos al final',
      'Aprieta los omóplatos'
    ],
    tips: [
      'Mantén los codos altos',
      'No uses peso excesivo',
      'Excelente para salud del hombro'
    ]
  },
  {
    name: 'Shrugs',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    description: 'Encogimientos para los trapecios.',
    instructions: [
      'Párate con una mancuerna en cada mano',
      'Brazos extendidos a los lados',
      'Eleva los hombros hacia las orejas',
      'Mantén un segundo arriba',
      'Baja controladamente'
    ],
    tips: [
      'No rotar los hombros',
      'Movimiento vertical puro',
      'Aprieta los trapecios arriba'
    ],
    variations: ['Encogimientos con barra', 'Encogimientos con barra por detrás']
  },
  {
    name: 'Pike Push-ups',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Flexiones en pica para hombros.',
    instructions: [
      'Colócate en posición de V invertida',
      'Manos y pies en el suelo, caderas arriba',
      'Baja la cabeza hacia el suelo',
      'Empuja hacia arriba',
      'Mantén las caderas altas'
    ],
    tips: [
      'Mantén las piernas lo más rectas posible',
      'Excelente progresión hacia handstand push-ups',
      'Eleva los pies para más dificultad'
    ]
  },
  {
    name: 'Overhead Press',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Press sobre la cabeza con barra.',
    instructions: [
      'Párate con la barra a la altura de los hombros',
      'Empuja la barra directamente hacia arriba',
      'Extiende completamente los brazos',
      'Baja controladamente'
    ]
  },
  {
    name: 'Cable Lateral Raises',
    category: 'Fuerza',
    muscleGroup: 'Hombros',
    equipment: 'Cables',
    difficulty: 'Principiante',
    description: 'Elevaciones laterales con cable.',
    instructions: [
      'Párate de lado a una polea baja',
      'Agarra el mango con la mano más alejada',
      'Eleva el brazo lateralmente',
      'Baja controladamente'
    ],
    tips: [
      'Tensión constante del cable',
      'Controla todo el movimiento',
      'No uses impulso'
    ]
  },

  // ==================== BRAZOS (15 ejercicios) ====================
  {
    name: 'Bicep Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    description: 'Curl de bíceps con mancuernas.',
    instructions: [
      'Párate con una mancuerna en cada mano',
      'Brazos extendidos a los lados, palmas hacia adelante',
      'Flexiona los codos llevando las mancuernas hacia los hombros',
      'Mantén los codos pegados al torso',
      'Baja controladamente'
    ],
    imageFileName: 'bicep-curls.png',
    tips: [
      'No balancees el cuerpo',
      'Mantén los codos fijos',
      'Controla el descenso'
    ],
    commonMistakes: [
      'Usar impulso',
      'Mover los codos',
      'No bajar completamente'
    ],
    variations: ['Curl con barra', 'Curl martillo', 'Curl concentrado', 'Curl predicador']
  },
  {
    name: 'Tricep Dips',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Barras paralelas',
    difficulty: 'Intermedio',
    description: 'Fondos para tríceps.',
    instructions: [
      'Agarra las barras paralelas',
      'Mantén el cuerpo vertical (no inclinado)',
      'Baja doblando los codos',
      'Desciende hasta que los codos estén a 90 grados',
      'Empuja hacia arriba'
    ],
    imageFileName: 'tricep-dips.png',
    tips: [
      'Mantén el cuerpo vertical para enfatizar tríceps',
      'No bajes demasiado',
      'Usa banda de asistencia si es necesario'
    ],
    commonMistakes: [
      'Inclinarse demasiado hacia adelante',
      'Bajar demasiado',
      'Usar impulso'
    ],
    variations: ['Fondos en banco', 'Fondos asistidos', 'Fondos con peso']
  },
  {
    name: 'Hammer Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    description: 'Curl con agarre neutro para bíceps y braquial.',
    instructions: [
      'Párate con una mancuerna en cada mano',
      'Palmas enfrentadas (agarre neutro)',
      'Flexiona los codos llevando las mancuernas hacia los hombros',
      'Mantén las palmas enfrentadas durante todo el movimiento',
      'Baja controladamente'
    ],
    tips: [
      'Mantén los codos fijos',
      'No rotar las muñecas',
      'Trabaja el braquial y braquiorradial'
    ],
    variations: ['Curl martillo cruzado', 'Curl martillo con cuerda']
  },
  {
    name: 'Tricep Pushdowns',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Cables',
    difficulty: 'Principiante',
    description: 'Extensiones de tríceps en polea alta.',
    instructions: [
      'Párate frente a una polea alta',
      'Agarra la barra con las manos a la anchura de los hombros',
      'Codos pegados al torso',
      'Empuja la barra hacia abajo hasta extender los brazos',
      'Vuelve controladamente'
    ],
    tips: [
      'Mantén los codos fijos',
      'Solo mueve los antebrazos',
      'Aprieta los tríceps al final'
    ],
    variations: ['Extensiones con cuerda', 'Extensiones con agarre inverso']
  },
  {
    name: 'Barbell Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Barra',
    difficulty: 'Principiante',
    description: 'Curl de bíceps con barra.',
    instructions: [
      'Párate con una barra sostenida con agarre supino',
      'Manos a la anchura de los hombros',
      'Flexiona los codos llevando la barra hacia los hombros',
      'Mantén los codos fijos',
      'Baja controladamente'
    ],
    tips: [
      'No balancees el cuerpo',
      'Mantén los codos pegados al torso',
      'Usa barra EZ si tienes molestias en las muñecas'
    ],
    variations: ['Curl con barra EZ', 'Curl con barra ancha', 'Curl con barra estrecha']
  },
  {
    name: 'Overhead Tricep Extension',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Mancuerna',
    difficulty: 'Principiante',
    description: 'Extensión de tríceps sobre la cabeza.',
    instructions: [
      'Siéntate o párate sosteniendo una mancuerna con ambas manos',
      'Eleva la mancuerna sobre la cabeza',
      'Baja la mancuerna detrás de la cabeza doblando los codos',
      'Mantén los codos apuntando hacia arriba',
      'Extiende los brazos para volver arriba'
    ],
    tips: [
      'Mantén los codos cerca de la cabeza',
      'No arquees la espalda',
      'Controla el descenso'
    ],
    variations: ['Extensión con barra', 'Extensión con cable']
  },
  {
    name: 'Preacher Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Banco predicador',
    difficulty: 'Intermedio',
    description: 'Curl de bíceps en banco predicador.',
    instructions: [
      'Siéntate en el banco predicador',
      'Coloca los brazos sobre la almohadilla',
      'Sostén una barra o mancuernas',
      'Flexiona los codos llevando el peso hacia arriba',
      'Baja controladamente'
    ],
    tips: [
      'Mantén los brazos en contacto con la almohadilla',
      'No uses impulso',
      'Excelente para aislar los bíceps'
    ]
  },
  {
    name: 'Close Grip Bench Press',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Press de banca con agarre cerrado para tríceps.',
    instructions: [
      'Acuéstate en un banco',
      'Agarra la barra con las manos a la anchura de los hombros',
      'Baja la barra al pecho',
      'Mantén los codos cerca del torso',
      'Empuja hacia arriba'
    ],
    tips: [
      'No uses agarre demasiado estrecho',
      'Mantén los codos pegados al cuerpo',
      'Excelente para masa de tríceps'
    ]
  },
  {
    name: 'Concentration Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Mancuerna',
    difficulty: 'Principiante',
    description: 'Curl concentrado para aislamiento de bíceps.',
    instructions: [
      'Siéntate en un banco con las piernas abiertas',
      'Sostén una mancuerna con un brazo',
      'Apoya el codo en la parte interna del muslo',
      'Flexiona el codo llevando la mancuerna hacia el hombro',
      'Baja controladamente'
    ],
    tips: [
      'Mantén el codo fijo',
      'Enfócate en la contracción',
      'Excelente para el pico del bíceps'
    ]
  },
  {
    name: 'Skull Crushers',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Barra',
    difficulty: 'Intermedio',
    description: 'Extensiones de tríceps acostado.',
    instructions: [
      'Acuéstate en un banco sosteniendo una barra',
      'Brazos extendidos sobre el pecho',
      'Baja la barra hacia la frente doblando solo los codos',
      'Mantén los codos apuntando hacia arriba',
      'Extiende los brazos'
    ],
    tips: [
      'Mantén los codos fijos',
      'No bajes la barra demasiado rápido',
      'Usa barra EZ para menos tensión en las muñecas'
    ]
  },
  {
    name: 'Cable Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Cables',
    difficulty: 'Principiante',
    description: 'Curl de bíceps con cable.',
    instructions: [
      'Párate frente a una polea baja',
      'Agarra la barra con agarre supino',
      'Flexiona los codos llevando la barra hacia arriba',
      'Mantén los codos fijos',
      'Baja controladamente'
    ],
    tips: [
      'Tensión constante del cable',
      'No uses impulso',
      'Excelente para el final del entrenamiento'
    ]
  },
  {
    name: 'Reverse Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Barra',
    difficulty: 'Principiante',
    description: 'Curl con agarre prono para antebrazos.',
    instructions: [
      'Párate sosteniendo una barra con agarre prono',
      'Palmas hacia abajo',
      'Flexiona los codos llevando la barra hacia arriba',
      'Mantén los codos fijos',
      'Baja controladamente'
    ],
    tips: [
      'Trabaja los antebrazos y braquiorradial',
      'Usa menos peso que en curls normales',
      'Mantén las muñecas rectas'
    ]
  },
  {
    name: 'Diamond Push-ups',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Flexiones con manos juntas para tríceps.',
    instructions: [
      'Colócate en posición de flexión',
      'Junta las manos formando un diamante',
      'Baja el cuerpo manteniendo los codos cerca',
      'Empuja hacia arriba'
    ],
    tips: [
      'Excelente para tríceps',
      'Mantén el core activado',
      'Más difícil que flexiones normales'
    ]
  },
  {
    name: 'Wrist Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Barra',
    difficulty: 'Principiante',
    description: 'Curl de muñecas para antebrazos.',
    instructions: [
      'Siéntate con los antebrazos apoyados en los muslos',
      'Sostén una barra con las palmas hacia arriba',
      'Muñecas colgando más allá de las rodillas',
      'Flexiona las muñecas hacia arriba',
      'Baja controladamente'
    ],
    tips: [
      'Solo mueve las muñecas',
      'Rango de movimiento completo',
      'Excelente para fuerza de agarre'
    ]
  },
  {
    name: 'Zottman Curls',
    category: 'Fuerza',
    muscleGroup: 'Brazos',
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    description: 'Curl con rotación para bíceps y antebrazos.',
    instructions: [
      'Párate con mancuernas con agarre supino',
      'Flexiona los codos llevando las mancuernas hacia arriba',
      'En la parte superior, rota las muñecas a agarre prono',
      'Baja con las palmas hacia abajo',
      'Rota de nuevo a supino abajo'
    ],
    tips: [
      'Trabaja bíceps en la subida, antebrazos en la bajada',
      'Movimiento controlado',
      'Excelente para desarrollo completo del brazo'
    ]
  },

  // ==================== CORE/ABDOMINALES (15 ejercicios) ====================
  {
    name: 'Plank',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio isométrico fundamental para el core.',
    instructions: [
      'Colócate en posición de plancha sobre los antebrazos',
      'Codos directamente bajo los hombros',
      'Cuerpo en línea recta desde la cabeza hasta los talones',
      'Mantén el core apretado y las caderas niveladas',
      'Mantén la posición el tiempo deseado'
    ],
    imageFileName: 'plank.png',
    tips: [
      'No dejes que las caderas se hundan',
      'Mantén el cuello neutral',
      'Respira normalmente',
      'Empieza con 30 segundos y aumenta gradualmente'
    ],
    commonMistakes: [
      'Caderas hundidas o elevadas',
      'Mirar hacia arriba',
      'Contener la respiración'
    ],
    variations: ['Plancha lateral', 'Plancha con elevación de pierna', 'Plancha RKC']
  },
  {
    name: 'Crunches',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio clásico para el recto abdominal.',
    instructions: [
      'Acuéstate boca arriba con las rodillas flexionadas',
      'Pies planos en el suelo',
      'Manos detrás de la cabeza o cruzadas en el pecho',
      'Eleva los hombros del suelo contrayendo el abdomen',
      'Baja controladamente'
    ],
    imageFileName: 'crunches.png',
    tips: [
      'No jales del cuello',
      'Enfócate en contraer el abdomen',
      'Movimiento corto y controlado'
    ],
    commonMistakes: [
      'Jalar del cuello',
      'Usar impulso',
      'No contraer el abdomen'
    ],
    variations: ['Crunches con piernas elevadas', 'Crunches en bicicleta', 'Crunches inversos']
  },
  {
    name: 'Russian Twists',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Ejercicio rotacional para oblicuos.',
    instructions: [
      'Siéntate en el suelo con las rodillas flexionadas',
      'Inclínate ligeramente hacia atrás',
      'Eleva los pies del suelo (opcional)',
      'Rota el torso de lado a lado',
      'Toca el suelo a cada lado'
    ],
    imageFileName: 'russian-twists.png',
    tips: [
      'Mantén la espalda recta',
      'El movimiento viene del torso, no de los brazos',
      'Controla la rotación'
    ],
    commonMistakes: [
      'Redondear la espalda',
      'Mover solo los brazos',
      'Ir demasiado rápido'
    ],
    variations: ['Russian twists con peso', 'Russian twists con pies elevados']
  },
  {
    name: 'Mountain Climbers',
    category: 'Cardio',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Ejercicio dinámico que combina core y cardio.',
    instructions: [
      'Colócate en posición de plancha alta',
      'Lleva una rodilla hacia el pecho',
      'Rápidamente cambia de pierna',
      'Alterna las piernas en un movimiento de carrera',
      'Mantén las caderas bajas'
    ],
    imageFileName: 'mountain-climbers.png',
    tips: [
      'Mantén el core apretado',
      'No dejes que las caderas suban',
      'Mantén las manos firmes en el suelo'
    ],
    commonMistakes: [
      'Caderas demasiado altas',
      'No llevar la rodilla lo suficientemente adelante',
      'Perder la forma de plancha'
    ],
    variations: ['Mountain climbers lentos', 'Mountain climbers cruzados']
  },
  {
    name: 'Bicycle Crunches',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Crunch con movimiento de bicicleta para abdominales y oblicuos.',
    instructions: [
      'Acuéstate boca arriba con las manos detrás de la cabeza',
      'Eleva los hombros del suelo',
      'Lleva el codo derecho hacia la rodilla izquierda',
      'Extiende la pierna derecha',
      'Alterna los lados en un movimiento de pedaleo'
    ],
    tips: [
      'No jales del cuello',
      'Enfócate en la rotación del torso',
      'Mantén los hombros elevados'
    ],
    variations: ['Bicicleta lenta y controlada']
  },
  {
    name: 'Leg Raises',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Elevaciones de piernas para el abdomen bajo.',
    instructions: [
      'Acuéstate boca arriba con las piernas extendidas',
      'Manos bajo los glúteos o a los lados',
      'Eleva las piernas hacia arriba manteniendo las rodillas rectas',
      'Sube hasta que las piernas estén perpendiculares al suelo',
      'Baja controladamente sin tocar el suelo'
    ],
    tips: [
      'Mantén la espalda baja pegada al suelo',
      'No uses impulso',
      'Controla el descenso'
    ],
    commonMistakes: [
      'Arquear la espalda baja',
      'Usar impulso',
      'Bajar demasiado rápido'
    ],
    variations: ['Elevaciones de piernas colgado', 'Elevaciones de piernas con flexión']
  },
  {
    name: 'Dead Bug',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio de anti-extensión para el core.',
    instructions: [
      'Acuéstate boca arriba con brazos extendidos hacia el techo',
      'Rodillas flexionadas a 90 grados',
      'Baja un brazo y la pierna opuesta hacia el suelo',
      'Mantén la espalda baja pegada al suelo',
      'Vuelve y alterna'
    ],
    tips: [
      'Mantén la espalda baja en contacto con el suelo',
      'Movimiento lento y controlado',
      'Exhala al extender'
    ]
  },
  {
    name: 'Side Plank',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Plancha lateral para oblicuos.',
    instructions: [
      'Acuéstate de lado apoyado en un antebrazo',
      'Codo directamente bajo el hombro',
      'Eleva las caderas del suelo',
      'Cuerpo en línea recta',
      'Mantén la posición'
    ],
    tips: [
      'No dejes que las caderas se hundan',
      'Mantén el core apretado',
      'Mira hacia adelante'
    ],
    variations: ['Plancha lateral con elevación de pierna', 'Plancha lateral con rotación']
  },
  {
    name: 'Hanging Knee Raises',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Barra de dominadas',
    difficulty: 'Intermedio',
    description: 'Elevaciones de rodillas colgado.',
    instructions: [
      'Cuelga de una barra con agarre prono',
      'Eleva las rodillas hacia el pecho',
      'Contrae el abdomen',
      'Baja controladamente'
    ],
    tips: [
      'No uses impulso',
      'Enfócate en contraer el abdomen',
      'Mantén el control'
    ],
    variations: ['Elevaciones de piernas colgado', 'Elevaciones con giro']
  },
  {
    name: 'Ab Wheel Rollouts',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Rueda abdominal',
    difficulty: 'Avanzado',
    description: 'Ejercicio avanzado con rueda abdominal.',
    instructions: [
      'Arrodíllate sosteniendo la rueda abdominal',
      'Rueda hacia adelante extendiendo el cuerpo',
      'Mantén el core apretado',
      'Vuelve a la posición inicial'
    ],
    tips: [
      'No arquees la espalda',
      'Mantén el core muy apretado',
      'Empieza con rango corto'
    ]
  },
  {
    name: 'Pallof Press',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Cables',
    difficulty: 'Intermedio',
    description: 'Ejercicio de anti-rotación para el core.',
    instructions: [
      'Párate de lado a una polea media',
      'Sostén el mango con ambas manos al pecho',
      'Empuja el mango hacia adelante',
      'Resiste la rotación',
      'Vuelve al pecho'
    ],
    tips: [
      'Mantén el torso estable',
      'No rotes',
      'Excelente para estabilidad del core'
    ]
  },
  {
    name: 'Reverse Crunches',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Crunch inverso para el abdomen bajo.',
    instructions: [
      'Acuéstate boca arriba con las rodillas flexionadas',
      'Eleva las rodillas hacia el pecho',
      'Levanta las caderas del suelo',
      'Baja controladamente'
    ],
    tips: [
      'Enfócate en contraer el abdomen bajo',
      'No uses impulso',
      'Movimiento controlado'
    ]
  },
  {
    name: 'V-Ups',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Avanzado',
    description: 'Ejercicio avanzado en forma de V.',
    instructions: [
      'Acuéstate boca arriba con brazos y piernas extendidos',
      'Simultáneamente eleva brazos y piernas',
      'Forma una V con el cuerpo',
      'Toca los pies con las manos',
      'Baja controladamente'
    ],
    tips: [
      'Mantén las piernas y brazos rectos',
      'Movimiento explosivo pero controlado',
      'Muy desafiante'
    ]
  },
  {
    name: 'Plank to Downward Dog',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Transición dinámica de plancha a perro boca abajo.',
    instructions: [
      'Empieza en posición de plancha',
      'Eleva las caderas hacia arriba',
      'Forma una V invertida',
      'Vuelve a la plancha',
      'Repite el movimiento'
    ],
    tips: [
      'Mantén las piernas lo más rectas posible',
      'Movimiento fluido',
      'Excelente para movilidad y core'
    ]
  },
  {
    name: 'Hollow Body Hold',
    category: 'Core',
    muscleGroup: 'Core',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Posición isométrica de gimnasia.',
    instructions: [
      'Acuéstate boca arriba',
      'Eleva hombros y piernas del suelo',
      'Brazos extendidos sobre la cabeza',
      'Forma una ligera curva con el cuerpo',
      'Mantén la espalda baja pegada al suelo'
    ],
    tips: [
      'Mantén la espalda baja en contacto con el suelo',
      'Cuanto más bajas las piernas, más difícil',
      'Fundamental en gimnasia'
    ]
  },

  // ==================== CARDIO (10 ejercicios) ====================
  {
    name: 'Jumping Jacks',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Ejercicio cardiovascular clásico de calentamiento.',
    instructions: [
      'Párate con los pies juntos y brazos a los lados',
      'Salta separando los pies y elevando los brazos sobre la cabeza',
      'Salta de nuevo juntando los pies y bajando los brazos',
      'Repite en un movimiento fluido'
    ],
    tips: [
      'Aterriza suavemente',
      'Mantén un ritmo constante',
      'Excelente para calentamiento'
    ]
  },
  {
    name: 'Burpees',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Peso corporal',
    difficulty: 'Intermedio',
    description: 'Ejercicio de cuerpo completo de alta intensidad.',
    instructions: [
      'Párate con los pies a la anchura de los hombros',
      'Agáchate y coloca las manos en el suelo',
      'Salta con los pies hacia atrás a posición de plancha',
      'Haz una flexión (opcional)',
      'Salta con los pies hacia adelante',
      'Salta explosivamente hacia arriba con los brazos sobre la cabeza'
    ],
    tips: [
      'Mantén el core apretado',
      'Aterriza suavemente',
      'Modifica eliminando el salto o la flexión si es necesario'
    ],
    variations: ['Burpees sin flexión', 'Burpees con salto al cajón']
  },
  {
    name: 'High Knees',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Peso corporal',
    difficulty: 'Principiante',
    description: 'Carrera en el lugar con rodillas altas.',
    instructions: [
      'Párate con los pies a la anchura de las caderas',
      'Corre en el lugar elevando las rodillas lo más alto posible',
      'Alterna rápidamente las piernas',
      'Balancea los brazos'
    ],
    tips: [
      'Mantén el torso erguido',
      'Aterriza en las puntas de los pies',
      'Mantén un ritmo rápido'
    ]
  },
  {
    name: 'Jump Rope',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Cuerda de saltar',
    difficulty: 'Principiante',
    description: 'Saltar la cuerda para cardio.',
    instructions: [
      'Sostén los mangos de la cuerda',
      'Gira la cuerda con las muñecas',
      'Salta cuando la cuerda pase bajo los pies',
      'Aterriza en las puntas de los pies'
    ],
    tips: [
      'Mantén los saltos pequeños',
      'Gira con las muñecas, no con los brazos',
      'Excelente para resistencia cardiovascular'
    ],
    variations: ['Saltos dobles', 'Saltos cruzados', 'Saltos alternados']
  },
  {
    name: 'Box Jumps',
    category: 'Pliométrico',
    muscleGroup: 'Piernas',
    equipment: 'Cajón pliométrico',
    difficulty: 'Intermedio',
    description: 'Saltos explosivos al cajón.',
    instructions: [
      'Párate frente a un cajón estable',
      'Flexiona ligeramente las rodillas',
      'Salta explosivamente sobre el cajón',
      'Aterriza suavemente con ambos pies',
      'Baja controladamente'
    ],
    tips: [
      'Empieza con un cajón bajo',
      'Aterriza suavemente',
      'Enfócate en la técnica'
    ]
  },
  {
    name: 'Battle Ropes',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Cuerdas de batalla',
    difficulty: 'Intermedio',
    description: 'Ejercicio con cuerdas para cardio y fuerza.',
    instructions: [
      'Sostén un extremo de cada cuerda',
      'Párate con los pies a la anchura de los hombros',
      'Crea ondas con las cuerdas',
      'Alterna los brazos o muévelos simultáneamente'
    ],
    tips: [
      'Mantén el core apretado',
      'Flexiona ligeramente las rodillas',
      'Mantén un ritmo constante'
    ],
    variations: ['Ondas alternas', 'Ondas simultáneas', 'Ondas laterales']
  },
  {
    name: 'Sprint Intervals',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Ninguno',
    difficulty: 'Intermedio',
    description: 'Sprints de alta intensidad.',
    instructions: [
      'Calienta con trote ligero',
      'Sprint a máxima velocidad por 20-30 segundos',
      'Recupera con trote o caminata por 1-2 minutos',
      'Repite el ciclo'
    ],
    tips: [
      'Calienta adecuadamente',
      'Sprint a máxima intensidad',
      'Recupera completamente entre sprints'
    ]
  },
  {
    name: 'Rowing Machine',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Máquina de remo',
    difficulty: 'Principiante',
    description: 'Remo en máquina para cardio de bajo impacto.',
    instructions: [
      'Siéntate en la máquina con los pies asegurados',
      'Agarra el mango',
      'Empuja con las piernas primero',
      'Luego inclínate hacia atrás',
      'Finalmente tira del mango hacia el pecho',
      'Invierte el movimiento para volver'
    ],
    tips: [
      'Piernas, core, brazos en ese orden',
      'Mantén la espalda recta',
      'Excelente cardio de bajo impacto'
    ]
  },
  {
    name: 'Stair Climbing',
    category: 'Cardio',
    muscleGroup: 'Piernas',
    equipment: 'Escaleras',
    difficulty: 'Principiante',
    description: 'Subir escaleras para cardio.',
    instructions: [
      'Sube escaleras a un ritmo constante',
      'Mantén el torso erguido',
      'Usa los brazos para impulso',
      'Baja caminando para recuperar'
    ],
    tips: [
      'Empieza con un ritmo moderado',
      'Aumenta la intensidad gradualmente',
      'Excelente para glúteos y cardio'
    ]
  },
  {
    name: 'Assault Bike',
    category: 'Cardio',
    muscleGroup: 'Cuerpo completo',
    equipment: 'Bicicleta de asalto',
    difficulty: 'Intermedio',
    description: 'Bicicleta de aire para cardio intenso.',
    instructions: [
      'Siéntate en la bicicleta',
      'Pedalea mientras empujas y jalas los mangos',
      'Mantén un ritmo constante o haz intervalos',
      'Cuanto más rápido, más resistencia'
    ],
    tips: [
      'Usa todo el cuerpo',
      'Excelente para HIIT',
      'Muy demandante'
    ]
  }
];

// Función helper para obtener ejercicios por categoría
export function getExercisesByCategory(category: string): ExerciseData[] {
  return completeExercisesDatabase.filter(ex => ex.category === category);
}

// Función helper para obtener ejercicios por grupo muscular
export function getExercisesByMuscleGroup(muscleGroup: string): ExerciseData[] {
  return completeExercisesDatabase.filter(ex => ex.muscleGroup === muscleGroup);
}

// Función helper para obtener ejercicios por equipo
export function getExercisesByEquipment(equipment: string): ExerciseData[] {
  return completeExercisesDatabase.filter(ex => ex.equipment === equipment);
}

// Función helper para obtener ejercicios por dificultad
export function getExercisesByDifficulty(difficulty: string): ExerciseData[] {
  return completeExercisesDatabase.filter(ex => ex.difficulty === difficulty);
}

// Estadísticas de la base de datos
export const databaseStats = {
  totalExercises: completeExercisesDatabase.length,
  byCategory: {
    Fuerza: completeExercisesDatabase.filter(ex => ex.category === 'Fuerza').length,
    Cardio: completeExercisesDatabase.filter(ex => ex.category === 'Cardio').length,
    Core: completeExercisesDatabase.filter(ex => ex.category === 'Core').length,
    Pliométrico: completeExercisesDatabase.filter(ex => ex.category === 'Pliométrico').length,
    Isométrico: completeExercisesDatabase.filter(ex => ex.category === 'Isométrico').length,
  },
  byMuscleGroup: {
    Pecho: completeExercisesDatabase.filter(ex => ex.muscleGroup === 'Pecho').length,
    Espalda: completeExercisesDatabase.filter(ex => ex.muscleGroup === 'Espalda').length,
    Piernas: completeExercisesDatabase.filter(ex => ex.muscleGroup === 'Piernas').length,
    Hombros: completeExercisesDatabase.filter(ex => ex.muscleGroup === 'Hombros').length,
    Brazos: completeExercisesDatabase.filter(ex => ex.muscleGroup === 'Brazos').length,
    Core: completeExercisesDatabase.filter(ex => ex.muscleGroup === 'Core').length,
  },
  byDifficulty: {
    Principiante: completeExercisesDatabase.filter(ex => ex.difficulty === 'Principiante').length,
    Intermedio: completeExercisesDatabase.filter(ex => ex.difficulty === 'Intermedio').length,
    Avanzado: completeExercisesDatabase.filter(ex => ex.difficulty === 'Avanzado').length,
  }
};
