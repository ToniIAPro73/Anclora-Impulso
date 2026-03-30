# Nutrition Recipe Batch Prompt 01

## Lote

- `batchId`: `2026-03-batch-01`
- `numero de recetas`: `25`
- `enfoque`: `almuerzos y cenas mediterraneas equilibradas`

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
  "batchId": "2026-03-batch-01",
  "generatedAt": "2026-03-30T18:30:00Z",
  "generator": {
    "provider": "openai",
    "model": "gpt-x",
    "notes": "lote mediterraneo equilibrado"
  },
  "recipes": []
}

Cada receta debe tener esta estructura:

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
- nombres reales, no plantillas
- tags utiles para busqueda
- macros plausibles
- nada de recetas clonicas
- no repetir muchas recetas tipo pollo + arroz + brocoli

Objetivo de este lote:
- 25 recetas
- foco en almuerzos y cenas mediterraneas equilibradas
- priorizar aceite de oliva, legumbres, pescado, pollo, verduras y cereales integrales
- combinar recetas de perdida_peso, mantenimiento y salud_cardiometabolica
- incluir algunas recetas de recomposicion y ganancia_muscular sin romper el enfoque mediterraneo

Restricciones de variedad:
- maximo 4 bowls
- incluir horno, plancha, ensalada completa, salteado, crema y plato de cuchara
- incluir pescado blanco, pescado azul, pollo, huevo, legumbre y al menos 2 recetas vegetarianas

Toma como referencia de calidad recetas del estilo:
- Merluza al horno con patata y judias verdes
- Bowl mediterraneo de pollo con quinoa y brocoli

No repitas esas recetas literalmente.
Devuelve exclusivamente JSON valido.
```
