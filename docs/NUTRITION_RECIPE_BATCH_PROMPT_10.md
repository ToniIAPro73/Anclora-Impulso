# Nutrition Recipe Batch Prompt 10

## Lote

- `batchId`: `2026-03-batch-10`
- `numero de recetas`: `25`
- `enfoque`: `sopas, cremas y platos de cuchara`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

La salida debe seguir el contrato `recipes-import-v1`.

Cada receta debe cumplir:
- minimo 3 ingredientes
- minimo 3 instrucciones
- servings entre 1 y 20
- tags entre 3 y 12
- mealTypes validos
- dietTypes validos
- goalTypes validos
- unidades validas
- macros plausibles

Objetivo de este lote:
- 25 recetas de sopas, cremas, purés, guisos y otros platos de cuchara
- utiles para almuerzo y cena
- con buena variedad de legumbre, verdura, pescado, pollo, huevo y opciones vegetarianas

Restricciones de variedad:
- incluir cremas suaves, sopas completas, legumbres guisadas, cuchara ligera y cuchara alta en saciedad
- al menos 8 recetas vegetarianas
- al menos 5 recetas con pescado o pollo
- al menos 8 recetas con legumbre
- maximo 3 recetas muy parecidas de la misma familia

Enums obligatorios:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

No generes id, source, isPublic, isEditable, createdAt, updatedAt ni otros campos operativos.
Devuelve exclusivamente JSON valido.
```
