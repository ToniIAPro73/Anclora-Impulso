# Nutrition Recipe Batch Prompt 02

## Lote

- `batchId`: `2026-03-batch-02`
- `numero de recetas`: `25`
- `enfoque`: `100% vegetariano`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

La salida debe tener exactamente esta estructura raiz:

{
  "specVersion": "recipes-import-v1",
  "batchId": "2026-03-batch-02",
  "generatedAt": "2026-03-30T18:30:00Z",
  "generator": {
    "provider": "openai",
    "model": "gpt-x",
    "notes": "lote vegetariano"
  },
  "recipes": []
}

Cada receta debe tener esta estructura:

{
  "externalId": "batch02-receta-001",
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
  "tags": ["almuerzo", "legumbre", "horno", "alta_proteina"],
  "mealTypes": ["almuerzo"],
  "dietTypes": ["mediterranea", "alta_proteina"],
  "goalTypes": ["perdida_peso", "recomposicion"],
  "ingredients": [
    { "name": "garbanzos cocidos", "quantity": 180, "unit": "g" }
  ]
}

Enums obligatorios:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Unidades permitidas:
- g, ml, unidad, rebanada, lata, cucharada, cucharadita

No generes:
- id, userId, source, isPublic, isEditable, createdAt, updatedAt, editorialOverrideStatus, editorialNotes, editorialReviewedAt

Reglas obligatorias:
- minimo 3 ingredientes por receta
- minimo 3 instrucciones utiles por receta
- nada de pescado, marisco ni carne
- se permiten huevo y lacteos
- nombres reales, no plantillas
- macros plausibles
- variedad real

Objetivo de este lote:
- 25 recetas 100% vegetarianas
- usar legumbres, tofu, tempeh, huevo, yogur griego, queso fresco, avena, quinoa, arroz integral, verduras y frutos secos
- cubrir desayuno, almuerzo, cena y snack

Restricciones de variedad:
- maximo 3 bowls
- incluir ensaladas completas, cremas, salteados, tortillas, horno, platos de cuchara, wraps y desayunos salados
- al menos 8 recetas altas en proteina
- al menos 8 recetas con legumbre
- al menos 4 recetas con tofu o tempeh

No repitas recetas literalmente.
Devuelve exclusivamente JSON valido.
```
