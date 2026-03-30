# Nutrition Recipe Batch Prompt 11

## Lote

- `batchId`: `2026-03-batch-11`
- `numero de recetas`: `25`
- `enfoque`: `comidas frias, ensaladas completas y formatos transportables`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Usa el contrato `recipes-import-v1`.

Cada receta debe incluir la estructura completa de Anclora:
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
- ingredients minimo 3

Objetivo de este lote:
- 25 recetas frias o facilmente transportables
- muy utiles para oficina, tupper frio, verano o montaje rapido
- priorizar ensaladas completas, wraps, platos frios, legumbre fria, pasta fria, arroz frio y montajes proteicos

Restricciones de variedad:
- maximo 5 ensaladas de hoja
- maximo 4 wraps
- incluir legumbres, pasta integral, arroz, quinoa, pescado, pollo, huevo, tofu y lacteos
- al menos 8 recetas vegetarianas
- al menos 8 recetas altas en proteina
- al menos 8 recetas de perdida_peso o mantenimiento

Reglas:
- nombres claros
- nada de recetas clonicas
- no basarlo todo en atun con ensalada
- tags utiles
- macros plausibles

No generes campos operativos de base de datos.
Devuelve exclusivamente JSON valido.
```
