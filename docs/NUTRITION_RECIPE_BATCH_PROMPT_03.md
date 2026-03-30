# Nutrition Recipe Batch Prompt 03

## Lote

- `batchId`: `2026-03-batch-03`
- `numero de recetas`: `25`
- `enfoque`: `pescado y marisco exclusivo`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Usa exactamente este formato raiz:

{
  "specVersion": "recipes-import-v1",
  "batchId": "2026-03-batch-03",
  "generatedAt": "2026-03-30T18:30:00Z",
  "generator": {
    "provider": "openai",
    "model": "gpt-x",
    "notes": "lote pescado y marisco"
  },
  "recipes": []
}

Cada receta debe respetar el contrato de Anclora Impulso:
- externalId, name, instructions, servings, tags, mealTypes, dietTypes, goalTypes, ingredients
- minimo 3 ingredientes
- minimo 3 instrucciones
- enums cerrados:
  - difficulty: facil, medio, dificil
  - mealTypes: desayuno, almuerzo, cena, snack
  - dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
  - goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica
- unidades permitidas: g, ml, unidad, rebanada, lata, cucharada, cucharadita
- no generes campos como id, source, isPublic, createdAt, updatedAt

Objetivo de este lote:
- 25 recetas donde la proteina principal sea siempre pescado o marisco
- usar merluza, bacalao, salmon, atun, sardina, caballa, gambas, mejillones o similares
- cubrir almuerzos, cenas y algunos snacks o desayunos salados cuando tenga sentido

Restricciones de variedad:
- incluir horno, plancha, papillote, guiso, ensalada, cuchara y frio transportable
- maximo 3 bowls
- al menos 5 recetas con pescado azul
- al menos 5 recetas con pescado blanco
- al menos 4 recetas con marisco
- combinar enfoques mediterranea, dash y alta_proteina

Reglas de calidad:
- no hacer variaciones clonicas cambiando solo una verdura
- no repetir mucho patata + pescado + judias
- nombres reales y utiles para busqueda
- macros plausibles

Devuelve exclusivamente JSON valido.
```
