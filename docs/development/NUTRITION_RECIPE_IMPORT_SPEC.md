# Nutrition Recipe Import Spec

## Objetivo

Definir, sin ambiguedad operativa, el formato JSON que puede generar un modelo de lenguaje para ampliar la base nutricional de `anclora-impulso` y que despues pueda:

1. validarse de forma automatica
2. repararse si hace falta
3. importarse en la base de datos sin interpretacion manual

Este documento es la referencia maestra para cualquier generacion masiva de recetas.

## Alcance

Este spec cubre:

- formato del archivo JSON
- estructura raiz y estructura de receta
- tipos permitidos
- enums cerrados
- reglas de clasificacion
- reglas de plausibilidad nutricional
- reglas de calidad editorial
- reglas de variedad y no-duplicacion
- reglas de rechazo automatico
- ejemplos completos de recetas validas

Este spec no cubre todavia:

- el script de importacion a Neon
- el schema JSON formal de validacion
- la deduplicacion semantica avanzada entre lotes historicos
- la generacion automatica de imagenes

## Fuente real de verdad

Este spec esta alineado con:

- [`backend/prisma/schema.prisma`](C:/Users/antonio.ballesterosa/Desktop/Proyectos/anclora-impulso/backend/prisma/schema.prisma)
- [`backend/src/utils/validators.ts`](C:/Users/antonio.ballesterosa/Desktop/Proyectos/anclora-impulso/backend/src/utils/validators.ts)
- [`backend/prisma/nutrition-library.ts`](C:/Users/antonio.ballesterosa/Desktop/Proyectos/anclora-impulso/backend/prisma/nutrition-library.ts)

Si este documento contradice el schema real, manda el schema real. Si se quiere ampliar el contrato, primero hay que aprobar y versionar el cambio.

## Principio operativo

El modelo de lenguaje no debe generar SQL, Prisma, ni inserts directos.

Debe generar un JSON intermedio estable, contractual y validable.

Ese JSON sera la entrada del importador.

## Formato de archivo

El archivo de entrada debe ser:

- un archivo `.json`
- codificado en `UTF-8`
- con un unico objeto raiz
- sin comentarios
- sin texto fuera del JSON

Nombre recomendado de archivo:

- `recipes-batch-YYYY-MM-XX.raw.json`
- ejemplo: `recipes-batch-2026-03-01.raw.json`

## Estructura raiz requerida

```json
{
  "specVersion": "recipes-import-v1",
  "batchId": "2026-03-batch-01",
  "generatedAt": "2026-03-30T18:30:00Z",
  "generator": {
    "provider": "openai",
    "model": "gpt-x",
    "notes": "Lote mediterraneo de cenas y almuerzos"
  },
  "recipes": []
}
```

## Campos raiz

| Campo | Tipo | Obligatorio | Regla |
| --- | --- | --- | --- |
| `specVersion` | `string` | Si | Debe ser exactamente `recipes-import-v1` |
| `batchId` | `string` | Si | Identificador unico del lote |
| `generatedAt` | `string` | Si | Fecha ISO 8601 |
| `generator.provider` | `string` | Si | Proveedor o sistema generador |
| `generator.model` | `string` | Si | Modelo o pipeline usado |
| `generator.notes` | `string` | No | Contexto editorial del lote |
| `recipes` | `array` | Si | Lista de recetas |

## Campos que el LLM SI debe generar

Por receta:

- `externalId`
- `name`
- `nameEn`
- `description`
- `instructions`
- `prepTime`
- `cookTime`
- `servings`
- `difficulty`
- `calories`
- `protein`
- `carbs`
- `fat`
- `fiber`
- `imageUrl`
- `tags`
- `mealTypes`
- `dietTypes`
- `goalTypes`
- `ingredients`

## Campos que el LLM NO debe generar

Estos campos existen en la base real, pero no forman parte del contrato de importacion del LLM:

- `id`
- `userId`
- `source`
- `isPublic`
- `isEditable`
- `editorialOverrideStatus`
- `editorialNotes`
- `editorialReviewedAt`
- `createdAt`
- `updatedAt`

## Politica del importador para campos no generados

Si no se define otra cosa en el importador:

- `source` debe asignarse desde el importador
  - recomendado: `ai` para lotes LLM
- `isPublic` debe asignarse a `true`
- `isEditable` debe asignarse a `false`
- `userId` debe quedar en `null`

Esto evita que el modelo invente flags operativos que no le corresponden.

## Estructura de receta

Cada elemento de `recipes` debe tener esta estructura:

```json
{
  "externalId": "batch01-receta-001",
  "name": "string",
  "nameEn": "string o null",
  "description": "string o null",
  "instructions": ["string", "string", "string"],
  "prepTime": 10,
  "cookTime": 15,
  "servings": 1,
  "difficulty": "facil",
  "calories": 520,
  "protein": 38,
  "carbs": 42,
  "fat": 18,
  "fiber": 9,
  "imageUrl": null,
  "tags": ["almuerzo", "pollo", "horno", "alta_proteina"],
  "mealTypes": ["almuerzo"],
  "dietTypes": ["mediterranea", "alta_proteina"],
  "goalTypes": ["perdida_peso", "recomposicion"],
  "ingredients": [
    { "name": "pollo", "quantity": 180, "unit": "g" }
  ]
}
```

## Campos por receta

| Campo | Tipo | Obligatorio | Regla |
| --- | --- | --- | --- |
| `externalId` | `string` | Si | Unico dentro del lote |
| `name` | `string` | Si | Nombre canonico en español |
| `nameEn` | `string \| null` | No | Nombre ingles si existe |
| `description` | `string \| null` | No | Resumen corto y util |
| `instructions` | `string[]` | Si | Minimo 3 pasos |
| `prepTime` | `number \| null` | No | Entero >= 0 |
| `cookTime` | `number \| null` | No | Entero >= 0 |
| `servings` | `number` | Si | Entero entre 1 y 20 |
| `difficulty` | `string \| null` | No | Enum cerrado |
| `calories` | `number \| null` | No | >= 0 |
| `protein` | `number \| null` | No | >= 0 |
| `carbs` | `number \| null` | No | >= 0 |
| `fat` | `number \| null` | No | >= 0 |
| `fiber` | `number \| null` | No | >= 0 |
| `imageUrl` | `string \| null` | No | URL valida o `null` |
| `tags` | `string[]` | Si | Entre 3 y 12 tags |
| `mealTypes` | `string[]` | Si | Minimo 1, enum cerrado |
| `dietTypes` | `string[]` | Si | Minimo 1, enum cerrado |
| `goalTypes` | `string[]` | Si | Minimo 1, conjunto normalizado |
| `ingredients` | `object[]` | Si | Minimo 3 ingredientes |

## Estructura de ingrediente

Cada ingrediente debe tener esta forma:

```json
{
  "name": "merluza",
  "quantity": 180,
  "unit": "g"
}
```

| Campo | Tipo | Obligatorio | Regla |
| --- | --- | --- | --- |
| `name` | `string` | Si | Nombre canonico del ingrediente |
| `quantity` | `number` | Si | Numero positivo |
| `unit` | `string` | Si | Unidad simple y normalizada |

## Enums cerrados

### `difficulty`

Valores permitidos:

- `facil`
- `medio`
- `dificil`

Valores rechazados aunque parezcan equivalentes:

- `facil ` con espacios
- `Fácil`
- `easy`
- `medium`
- `advanced`
- `intermedio`
- `alta`

### `mealTypes`

Valores permitidos:

- `desayuno`
- `almuerzo`
- `cena`
- `snack`

Reglas:

- cada receta debe tener al menos 1 `mealType`
- puede tener varios si aplica de verdad
- no usar los cuatro a la vez salvo caso excepcional y justificado

### `dietTypes`

Valores permitidos:

- `ninguna`
- `mediterranea`
- `dash`
- `ayuno_intermitente`
- `alta_proteina`

Reglas:

- cada receta debe tener al menos 1 `dietType`
- una receta puede tener varios `dietTypes`
- `ninguna` no debe usarse por defecto si la receta encaja claramente en otra dieta

## `goalTypes`

En la base actual `goalTypes` no es un enum de Prisma, pero para importacion debe tratarse como conjunto cerrado.

Valores permitidos:

- `perdida_peso`
- `ganancia_muscular`
- `mantenimiento`
- `recomposicion`
- `salud_cardiometabolica`

Valores no permitidos sin cambio contractual previo:

- `definicion`
- `volumen`
- `fitness`
- `salud`
- `antiinflamatoria`
- cualquier variante libre no aprobada

## Unidades permitidas

Unidades preferidas:

- `g`
- `ml`
- `unidad`

Unidades permitidas adicionalmente cuando sean necesarias:

- `rebanada`
- `lata`
- `cucharada`
- `cucharadita`

Unidades rechazadas:

- `al gusto`
- `puñado`
- `chorrito`
- `vaso`
- `taza` si no esta claramente medida y estandarizada

Regla:

- si hace falta una indicacion libre, debe ir en `instructions`, no en `ingredients`

## Reglas de normalizacion de texto

### Nombres de receta

- `name` debe estar en español
- `name` debe usar mayuscula normal de frase
- no usar nombres de plantilla como `Bol proteico 1`
- no usar secuencias artificiales tipo `Receta alta proteina 17`

### Nombres de ingrediente

- usar nombres canonicos y simples
- evitar duplicados por acentos o variantes triviales

Buenos ejemplos:

- `brocoli`
- `judias verdes`
- `aceite de oliva virgen extra`
- `pechuga de pollo`

Malos ejemplos:

- `Brócoli`
- `brocoli fresco`
- `pollo pechuga`
- `AOVE`

### Tags

- usar `snake_case` solo si tiene sentido o ya es consistente con el catalogo
- evitar tags narrativos o promocionales

## Reglas minimas de calidad

Cada receta valida debe cumplir todo esto:

1. `name` natural, especifico y util para busqueda
2. `instructions` con minimo 3 pasos accionables
3. `ingredients` con minimo 3 ingredientes
4. `tags` entre 3 y 12
5. `mealTypes`, `dietTypes` y `goalTypes` rellenos
6. `difficulty` dentro del enum
7. `servings` coherente y entre 1 y 20
8. macros plausibles
9. clasificacion coherente con el contenido real
10. la receta debe ser util para swaps y para generacion de planes

## Reglas de plausibilidad nutricional

La receta se considera sospechosa si:

- `protein`, `carbs`, `fat` o `fiber` son negativos
- `servings` es 0
- `calories` es incompatible con los macros declarados
- receta muy ligera con macros excesivos
- receta muy energetica con macros demasiado bajos

Control recomendado:

- `calories` debe estar razonablemente cerca de:
  - `protein * 4 + carbs * 4 + fat * 9`
- se tolera desviacion moderada
- si la desviacion es extrema, la receta se rechaza

No hace falta exactitud clinica perfecta, pero si plausibilidad culinaria.

## Reglas de naming

El nombre debe:

- estar en español
- sonar como receta real
- permitir busqueda util
- diferenciar claramente recetas entre si

Buenos ejemplos:

- `Merluza al horno con patata y judias verdes`
- `Bowl mediterraneo de pollo con quinoa y brocoli`
- `Yogur griego con avena, frutos rojos y nueces`

Malos ejemplos:

- `Comida saludable 1`
- `Bowl proteico 14`
- `Cena equilibrada`
- `Receta mediterranea`

## Reglas de descripcion

La `description` debe:

- resumir el plato en una sola frase util
- no repetir el nombre
- no ser marketing vacio

Ejemplo correcto:

`Plato ligero y completo con proteina magra, verdura y guarnicion simple.`

## Reglas de instrucciones

Las instrucciones deben:

- estar en infinitivo o imperativo consistente
- describir acciones reales
- evitar frases vagas
- ser suficientes para cocinar la receta sin adivinar demasiado

Ejemplo correcto:

1. `Precalentar el horno a 190 grados.`
2. `Hornear la merluza con aceite, sal y pimienta.`
3. `Cocer la patata y las judias verdes y servir junto al pescado.`

## Reglas de tags

Los `tags` son clave para busqueda interna y deben tener valor semantico real.

Pueden cubrir:

- contexto de comida
- ingrediente principal
- tecnica de coccion
- rasgo nutricional
- estilo dietetico
- formato del plato

Ejemplos de tags utiles:

- `pollo`
- `pescado_blanco`
- `horno`
- `ensalada`
- `alta_proteina`
- `ligera`
- `integral`
- `mediterranea`

Evitar tags inutiles:

- `rico`
- `saludable`
- `bueno`
- `plato`
- `receta`

## Reglas de clasificacion por dieta

### `mediterranea`

Usar cuando predominen patrones como:

- aceite de oliva
- pescado
- legumbres
- verduras
- yogur natural
- cereales integrales
- perfil culinario mediterraneo claro

### `dash`

Usar cuando la receta sea claramente compatible con:

- baja carga de ultraprocesado
- base vegetal relevante
- proteina magra
- grasa moderada
- enfoque cardiometabolico razonable

### `ayuno_intermitente`

Usar cuando la receta:

- sea apta para encajar en ventanas de alimentacion
- tenga buena densidad nutricional o saciedad

No significa que la receta sea "para ayunar", sino que es compatible con ese patron.

### `alta_proteina`

Usar cuando la receta tenga un perfil proteico claramente superior al estandar del tipo de comida.

### `ninguna`

Usar solo cuando la receta no encaje de forma clara en los patrones anteriores.

## Reglas de clasificacion por dificultad

### `facil`

Usar cuando:

- tecnica basica
- pocos pasos
- ingredientes comunes
- bajo riesgo de ejecucion

### `medio`

Usar cuando:

- requiere cierta coordinacion
- tiene mas pasos o tiempos solapados
- la ejecucion no es trivial, pero sigue siendo domestica

### `dificil`

Usar cuando:

- tecnica mas delicada
- varios componentes
- mayor precision o experiencia

Regla operativa:

- la mayoria del catalogo debe quedar en `facil` o `medio`
- `dificil` debe ser minoritario

## Reglas de clasificacion por objetivo

### `perdida_peso`

Usar cuando la receta:

- ofrezca buena saciedad relativa
- tenga densidad calorica razonable
- facilite adherencia

### `ganancia_muscular`

Usar cuando la receta:

- aporte energia suficiente
- tenga base proteica robusta
- sea util en contexto de entrenamiento o superavit

### `mantenimiento`

Usar cuando la receta:

- sea equilibrada
- no este claramente sesgada ni a recorte ni a superavit

### `recomposicion`

Usar cuando la receta:

- tenga proteina alta o moderadamente alta
- aporte energia controlada
- sea util para preservar o mejorar composicion corporal

### `salud_cardiometabolica`

Usar cuando la receta:

- sea rica en vegetales o legumbres
- tenga perfil graso razonable
- reduzca ultraprocesado
- encaje con enfoque DASH o mediterraneo

## Reglas de variedad por lote

Un lote no debe llenarse de recetas clonicas.

Hay que variar de forma real:

- proteina principal
- base principal
- vegetal principal
- formato del plato
- tecnica de coccion
- contexto de uso
- objetivo nutricional
- estilo dietetico

Patrones a evitar:

- `pollo + arroz + brocoli` repetido con nombres distintos
- `bowl` como formato dominante
- desayunos lacteos casi identicos
- cenas que solo cambian una verdura

## Regla de deduplicacion semantica

Dos recetas deben considerarse demasiado parecidas si comparten:

- misma proteina principal
- misma base principal
- misma tecnica
- mismo momento del dia
- mismo perfil nutricional

y solo cambian detalles menores.

## Reglas para el LLM

Cuando se use un modelo de lenguaje para generar el JSON:

1. debe devolver solo JSON valido
2. no debe incluir comentarios fuera del JSON
3. no debe inventar enums
4. no debe inventar unidades arbitrarias
5. no debe generar UUID reales
6. debe usar `externalId` estable por lote
7. debe priorizar recetas utiles y variadas, no combinatorias
8. no debe generar campos operativos que pertenecen al importador
9. no debe producir recetas "plantilla" con unicamente rotaciones de ingredientes

## Ejemplo completo 1

```json
{
  "externalId": "batch01-receta-001",
  "name": "Merluza al horno con patata y judias verdes",
  "nameEn": "Baked hake with potato and green beans",
  "description": "Plato ligero y completo con proteina magra, verdura y guarnicion simple.",
  "instructions": [
    "Precalentar el horno a 190 grados.",
    "Hornear la merluza con aceite, sal y pimienta hasta que quede en su punto.",
    "Cocer la patata y las judias verdes y servir junto al pescado."
  ],
  "prepTime": 10,
  "cookTime": 20,
  "servings": 1,
  "difficulty": "facil",
  "calories": 430,
  "protein": 36,
  "carbs": 34,
  "fat": 14,
  "fiber": 7,
  "imageUrl": null,
  "tags": ["cena", "pescado_blanco", "horno", "ligera", "dash"],
  "mealTypes": ["almuerzo", "cena"],
  "dietTypes": ["dash", "mediterranea"],
  "goalTypes": ["perdida_peso", "mantenimiento", "salud_cardiometabolica"],
  "ingredients": [
    { "name": "merluza", "quantity": 180, "unit": "g" },
    { "name": "patata", "quantity": 180, "unit": "g" },
    { "name": "judias verdes", "quantity": 140, "unit": "g" },
    { "name": "aceite de oliva virgen extra", "quantity": 10, "unit": "ml" }
  ]
}
```

## Ejemplo completo 2

```json
{
  "externalId": "batch01-receta-002",
  "name": "Bowl mediterraneo de pollo con quinoa y brocoli",
  "nameEn": "Mediterranean chicken bowl with quinoa and broccoli",
  "description": "Plato completo con proteina magra, base funcional y volumen vegetal.",
  "instructions": [
    "Cocer la quinoa hasta que quede suelta.",
    "Cocinar el pollo a la plancha con aceite, limon y especias.",
    "Cocer o saltear el brocoli y montar el bowl con todos los ingredientes."
  ],
  "prepTime": 14,
  "cookTime": 18,
  "servings": 1,
  "difficulty": "facil",
  "calories": 683,
  "protein": 65.2,
  "carbs": 60.9,
  "fat": 20.4,
  "fiber": 8.5,
  "imageUrl": null,
  "tags": ["almuerzo", "pollo", "quinoa", "brocoli", "alta_proteina", "mediterranea"],
  "mealTypes": ["almuerzo", "cena"],
  "dietTypes": ["mediterranea", "alta_proteina"],
  "goalTypes": ["recomposicion", "ganancia_muscular", "mantenimiento"],
  "ingredients": [
    { "name": "pechuga de pollo", "quantity": 180, "unit": "g" },
    { "name": "quinoa cocida", "quantity": 180, "unit": "g" },
    { "name": "brocoli", "quantity": 140, "unit": "g" },
    { "name": "aceite de oliva virgen extra", "quantity": 10, "unit": "ml" },
    { "name": "limon", "quantity": 20, "unit": "ml" }
  ]
}
```

## Ejemplo de lote valido

```json
{
  "specVersion": "recipes-import-v1",
  "batchId": "2026-03-batch-01",
  "generatedAt": "2026-03-30T18:30:00Z",
  "generator": {
    "provider": "openai",
    "model": "gpt-x",
    "notes": "Lote mixto con cenas ligeras, almuerzos mediterraneos y desayunos de alta proteina"
  },
  "recipes": [
    {
      "externalId": "batch01-receta-001",
      "name": "Merluza al horno con patata y judias verdes",
      "nameEn": "Baked hake with potato and green beans",
      "description": "Plato ligero y completo con proteina magra, verdura y guarnicion simple.",
      "instructions": [
        "Precalentar el horno a 190 grados.",
        "Hornear la merluza con aceite, sal y pimienta hasta que quede en su punto.",
        "Cocer la patata y las judias verdes y servir junto al pescado."
      ],
      "prepTime": 10,
      "cookTime": 20,
      "servings": 1,
      "difficulty": "facil",
      "calories": 430,
      "protein": 36,
      "carbs": 34,
      "fat": 14,
      "fiber": 7,
      "imageUrl": null,
      "tags": ["cena", "pescado_blanco", "horno", "ligera", "dash"],
      "mealTypes": ["almuerzo", "cena"],
      "dietTypes": ["dash", "mediterranea"],
      "goalTypes": ["perdida_peso", "mantenimiento", "salud_cardiometabolica"],
      "ingredients": [
        { "name": "merluza", "quantity": 180, "unit": "g" },
        { "name": "patata", "quantity": 180, "unit": "g" },
        { "name": "judias verdes", "quantity": 140, "unit": "g" },
        { "name": "aceite de oliva virgen extra", "quantity": 10, "unit": "ml" }
      ]
    },
    {
      "externalId": "batch01-receta-002",
      "name": "Bowl mediterraneo de pollo con quinoa y brocoli",
      "nameEn": "Mediterranean chicken bowl with quinoa and broccoli",
      "description": "Plato completo con proteina magra, base funcional y volumen vegetal.",
      "instructions": [
        "Cocer la quinoa hasta que quede suelta.",
        "Cocinar el pollo a la plancha con aceite, limon y especias.",
        "Cocer o saltear el brocoli y montar el bowl con todos los ingredientes."
      ],
      "prepTime": 14,
      "cookTime": 18,
      "servings": 1,
      "difficulty": "facil",
      "calories": 683,
      "protein": 65.2,
      "carbs": 60.9,
      "fat": 20.4,
      "fiber": 8.5,
      "imageUrl": null,
      "tags": ["almuerzo", "pollo", "quinoa", "brocoli", "alta_proteina", "mediterranea"],
      "mealTypes": ["almuerzo", "cena"],
      "dietTypes": ["mediterranea", "alta_proteina"],
      "goalTypes": ["recomposicion", "ganancia_muscular", "mantenimiento"],
      "ingredients": [
        { "name": "pechuga de pollo", "quantity": 180, "unit": "g" },
        { "name": "quinoa cocida", "quantity": 180, "unit": "g" },
        { "name": "brocoli", "quantity": 140, "unit": "g" },
        { "name": "aceite de oliva virgen extra", "quantity": 10, "unit": "ml" },
        { "name": "limon", "quantity": 20, "unit": "ml" }
      ]
    }
  ]
}
```

## Reglas de rechazo automatico recomendadas

El importador o validador debe rechazar cualquier receta que:

- no tenga `name`
- no tenga `instructions`
- no tenga `ingredients`
- tenga menos de 3 ingredientes
- tenga menos de 3 pasos
- tenga `difficulty` fuera de enum
- tenga `mealTypes` fuera de enum
- tenga `dietTypes` fuera de enum
- tenga `goalTypes` fuera del conjunto aprobado
- tenga `tags` vacios o absurdos
- tenga unidades no permitidas
- tenga macros negativas
- sea claramente duplicada de otra del lote
- intente incluir campos que no le pertenecen al LLM

## Recomendacion de pipeline

1. generar `batch.raw.json`
2. validar contra este spec
3. producir:
   - `batch.valid.json`
   - `batch.rejected.json`
4. reparar rechazadas si hace falta
5. importar solo `batch.valid.json`

## Comandos operativos disponibles

En el backend ya existe un importador base en:

- [`backend/scripts/nutrition/import-recipes.ts`](C:/Users/antonio.ballesterosa/Desktop/Proyectos/anclora-impulso/backend/scripts/nutrition/import-recipes.ts)

Comandos:

```bash
cd backend
npm run nutrition:validate -- --file ../ruta/al/lote.json
npm run nutrition:import -- --file ../ruta/al/lote.json --source ai --visibility public
```

Opciones relevantes:

- `--validate-only`
- `--source ai|system`
- `--visibility public|private`
- `--editable`

## Regla final

Ningun lote generado por LLM debe insertarse directamente en Neon sin pasar antes por:

1. validacion estructural
2. validacion semantica
3. revision de duplicados
4. comprobacion de variedad del lote
5. asignacion controlada de campos operativos por parte del importador
