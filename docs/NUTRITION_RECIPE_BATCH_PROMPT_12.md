# Nutrition Recipe Batch Prompt 12

## Lote

- `batchId`: `2026-03-batch-12`
- `numero de recetas`: `25`
- `enfoque`: `comfort food saludable y bandejas de horno`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Debe seguir exactamente el contrato `recipes-import-v1`.

Contrato obligatorio:
- externalId unico dentro del lote
- name en español
- instructions con minimo 3 pasos
- servings entre 1 y 20
- tags entre 3 y 12
- mealTypes validos
- dietTypes validos
- goalTypes validos
- ingredients con minimo 3 elementos
- units solo g, ml, unidad, rebanada, lata, cucharada, cucharadita

Enums validos:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Objetivo de este lote:
- 25 recetas de comfort food saludable
- reinterpretaciones domesticas y realistas
- foco en bandejas de horno, platos reconfortantes, gratinados ligeros, guisos suaves, tortillas completas, platos familiares y versiones equilibradas de clasicos

Restricciones de variedad:
- incluir carne blanca, ternera magra, pescado, huevo, legumbre y opciones vegetarianas
- maximo 5 bandejas muy parecidas
- incluir cuchara, horno, plancha, salteado y algun formato frio si encaja
- combinar mantenimiento, recomposicion y perdida_peso

Evita:
- recetas demasiado pesadas o grasientas
- etiquetas pobres
- clones con distinto nombre
- abuso de queso o salsas pesadas

No generes campos operativos como id, source, isPublic, createdAt o updatedAt.
Devuelve exclusivamente JSON valido.
```
