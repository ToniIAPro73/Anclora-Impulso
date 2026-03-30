# Nutrition Recipe Batch Prompt 09

## Lote

- `batchId`: `2026-03-batch-09`
- `numero de recetas`: `25`
- `enfoque`: `snacks saciantes y portables`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Sigue el contrato `recipes-import-v1`.

Estructura obligatoria por receta:
- externalId
- name
- nameEn o null
- description o null
- instructions minimo 3
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

Enums validos:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Objetivo de este lote:
- 25 snacks saciantes y faciles de llevar
- casi todas las recetas deben incluir `snack`
- algunas pueden incluir tambien `desayuno`
- priorizar adherencia, practicidad y saciedad

Restricciones de variedad:
- incluir snacks de cuchara, portables, salados, dulces, frios y algun horneado simple
- maximo 5 snacks de yogur
- maximo 4 tostadas
- maximo 4 wraps
- incluir huevo, lacteos, frutos secos, fruta, avena, legumbre, tofu y algun pescado cuando encaje

Evita:
- snacks que sean practicamente postres sin valor
- snacks todos iguales
- etiquetas vacias

No generes campos operativos de base de datos.
Devuelve exclusivamente JSON valido.
```
