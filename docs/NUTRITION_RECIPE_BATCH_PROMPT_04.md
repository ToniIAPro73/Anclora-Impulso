# Nutrition Recipe Batch Prompt 04

## Lote

- `batchId`: `2026-03-batch-04`
- `numero de recetas`: `25`
- `enfoque`: `batch cooking y tupper`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Formato raiz obligatorio:

{
  "specVersion": "recipes-import-v1",
  "batchId": "2026-03-batch-04",
  "generatedAt": "2026-03-30T18:30:00Z",
  "generator": {
    "provider": "openai",
    "model": "gpt-x",
    "notes": "lote batch cooking"
  },
  "recipes": []
}

Contrato obligatorio por receta:
- externalId
- name
- nameEn o null
- description o null
- instructions con minimo 3 pasos
- prepTime y cookTime enteros >= 0 o null
- servings entero 1..20
- difficulty: facil, medio, dificil
- calories, protein, carbs, fat, fiber >= 0 o null
- imageUrl null o URL valida
- tags 3..12
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica
- ingredients con minimo 3 elementos y unidades solo g, ml, unidad, rebanada, lata, cucharada, cucharadita

No generes campos operativos como id, userId, source, isPublic, isEditable, createdAt o updatedAt.

Objetivo de este lote:
- 25 recetas pensadas para cocinar en lote y guardar
- recetas buenas para tupper, nevera, recalentado o montaje parcial
- utiles para almuerzo y cena principalmente

Restricciones de variedad:
- incluir bandejas de horno, guisos, legumbres, salteados, cremas, ensaladas de tupper y bowls realmente distintos
- al menos 8 recetas que aguanten bien 2 o 3 dias
- al menos 5 recetas vegetarianas
- al menos 5 recetas con pescado o marisco
- al menos 5 recetas altas en proteina

Evita:
- recetas delicadas que se estropeen al recalentar
- recetas demasiado gourmet
- clonicos de arroz + pollo + brocoli

Devuelve exclusivamente JSON valido.
```
