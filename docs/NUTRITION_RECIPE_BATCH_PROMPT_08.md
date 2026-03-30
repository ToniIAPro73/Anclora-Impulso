# Nutrition Recipe Batch Prompt 08

## Lote

- `batchId`: `2026-03-batch-08`
- `numero de recetas`: `25`
- `enfoque`: `desayunos variados`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Debe seguir exactamente el contrato `recipes-import-v1`.

Cada receta debe incluir:
- externalId
- name
- instructions minimo 3
- servings
- tags
- mealTypes
- dietTypes
- goalTypes
- ingredients minimo 3

Valores obligatorios:
- mealTypes solo con desayuno, almuerzo, cena, snack
- dietTypes solo con ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- difficulty solo con facil, medio, dificil
- goalTypes solo con perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Objetivo de este lote:
- 25 desayunos variados y utiles para el mundo real
- casi todas las recetas deben incluir `desayuno` en `mealTypes`
- algunas pueden incluir tambien `snack` si tiene sentido

Restricciones de variedad:
- incluir desayunos dulces, salados, frios, calientes, de cuchara, de tostada, de tortilla, de avena y transportables
- maximo 4 yogures con toppings
- maximo 4 gachas o porridge
- al menos 6 desayunos salados
- al menos 6 desayunos altos en proteina
- al menos 5 desayunos mediterraneos o dash

Evita:
- repetir la misma base con toppings distintos
- nombres genericos
- recetas pobres

No generes campos como id, source, isPublic, createdAt o updatedAt.
Devuelve exclusivamente JSON valido.
```
