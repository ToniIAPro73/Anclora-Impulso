# Nutrition Recipe Batch Prompt 07

## Lote

- `batchId`: `2026-03-batch-07`
- `numero de recetas`: `25`
- `enfoque`: `alta proteina para entrenamiento`

## Prompt

```text
Genera un archivo JSON de 25 recetas para la base nutricional de Anclora Impulso.

Devuelve exclusivamente JSON valido.
No escribas markdown.
No escribas comentarios.
No escribas explicaciones.
No escribas texto antes ni despues del JSON.

Usa el contrato `recipes-import-v1`.

Cada receta debe respetar:
- minimo 3 ingredientes
- minimo 3 instrucciones
- servings entre 1 y 20
- tags entre 3 y 12
- mealTypes validos
- dietTypes validos
- goalTypes validos
- unidades solo g, ml, unidad, rebanada, lata, cucharada, cucharadita

Valores permitidos:
- difficulty: facil, medio, dificil
- mealTypes: desayuno, almuerzo, cena, snack
- dietTypes: ninguna, mediterranea, dash, ayuno_intermitente, alta_proteina
- goalTypes: perdida_peso, ganancia_muscular, mantenimiento, recomposicion, salud_cardiometabolica

Objetivo de este lote:
- 25 recetas con foco claro en alta proteina
- utiles para recomposicion y ganancia_muscular
- incluir desayunos, almuerzos, cenas y snacks
- proteinas principales variadas: pollo, pavo, huevo, atun, salmon, ternera magra, yogur griego, queso fresco batido, tofu, legumbres

Restricciones de variedad:
- maximo 4 bowls
- incluir wraps, platos de horno, plancha, ensaladas completas, snacks de cuchara, desayunos salados y dulces
- al menos 8 snacks o desayunos altos en proteina
- al menos 6 recetas vegetarianas altas en proteina

Evita:
- repetir siempre arroz + pollo
- desayunos todos iguales de yogur
- cenas clonicas cambiando una sola verdura

No generes campos operativos ni ids de base de datos.
Devuelve exclusivamente JSON valido.
```
