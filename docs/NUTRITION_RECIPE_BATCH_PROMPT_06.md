# Nutrition Recipe Batch Prompt 06

## Lote

- `batchId`: `2026-03-batch-06`
- `numero de recetas`: `25`
- `enfoque`: `dash y salud cardiometabolica`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Debe cumplir el contrato `recipes-import-v1`.

Cada receta debe incluir estructura completa:
- externalId
- name
- nameEn
- description
- instructions minimo 3
- prepTime
- cookTime
- servings 1..20
- difficulty
- calories
- protein
- carbs
- fat
- fiber
- imageUrl
- tags 3..12
- mealTypes
- dietTypes
- goalTypes
- ingredients minimo 3

Enums:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Objetivo de este lote:
- 25 recetas con enfoque dash y salud cardiometabolica
- priorizar verdura, legumbre, pescado, pollo, cereales integrales, lacteos sencillos, grasas moderadas y bajo ultraprocesado
- muchas recetas deben incluir `dash` y/o `salud_cardiometabolica`

Restricciones de variedad:
- incluir desayunos, almuerzos, cenas y snacks
- incluir platos frios, calientes, cuchara, horno y ensaladas completas
- maximo 4 bowls
- al menos 8 recetas con legumbre o cereal integral
- al menos 6 recetas con pescado o pollo
- al menos 6 recetas vegetarianas

Evita:
- recetas grasientas
- nombres pobres
- recetas clonicas
- abuso de pollo + arroz

No generes id, source, isPublic, isEditable, createdAt, updatedAt.
Devuelve exclusivamente JSON valido.
```
