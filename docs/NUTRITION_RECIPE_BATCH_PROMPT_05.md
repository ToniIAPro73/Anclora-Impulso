# Nutrition Recipe Batch Prompt 05

## Lote

- `batchId`: `2026-03-batch-05`
- `numero de recetas`: `25`
- `enfoque`: `ultra-rapidas en 15 minutos o menos`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

La salida debe seguir exactamente el contrato `recipes-import-v1` con objeto raiz y array `recipes`.

Cada receta debe incluir:
- externalId
- name
- nameEn o null
- description o null
- instructions con minimo 3 pasos
- prepTime
- cookTime
- servings
- difficulty
- calories
- protein
- carbs
- fat
- fiber
- imageUrl
- tags
- mealTypes
- dietTypes
- goalTypes
- ingredients

Enums obligatorios:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Unidades permitidas:
- g, ml, unidad, rebanada, lata, cucharada, cucharadita

Objetivo de este lote:
- 25 recetas ultra-rapidas
- tiempo total recomendado por receta: prepTime + cookTime <= 15
- utiles para dias de poca energia o poca disponibilidad

Restricciones de variedad:
- incluir desayunos, almuerzos, cenas y snacks
- incluir frio rapido, plancha rapida, microondas cuando encaje, montaje sin coccion y salteado muy breve
- maximo 3 yogures con toppings
- maximo 3 wraps
- maximo 3 bowls

Reglas de calidad:
- recetas reales y utiles
- nada de recetas vacias o absurdas
- buena adherencia
- nombres claros
- macros plausibles

No generes campos como id, source, isPublic, createdAt, updatedAt.
Devuelve exclusivamente JSON valido.
```
