# Expanded Nutrition Meal Library

## Objetivo

Este documento resume la libreria ampliada de recetas del sistema para `Anclora-Impulso` y sustituye al resumen inicial, que ya se habia quedado pequeño.

La fuente de verdad estructurada vive en:

- `backend/prisma/nutrition-library.ts`

La libreria esta pensada para cuatro usos reales:

- poblar Neon/PostgreSQL via Prisma seed
- alimentar menus semanales generados por IA con una base persistente mas rica
- permitir sustitucion manual de comidas desde la biblioteca
- dar soporte a recetas del sistema, recetas IA guardadas y recetas creadas por usuario

## Como se ha ampliado

La nueva libreria parte del informe `deep-research-report.md`, pero no se limita a copiar recetas una a una. En su lugar, usa un catalogo generativo y mantenible que combina:

- patrones inspirados en NHS y Mayo Clinic
- ingredientes canonicos con unidades estables
- familias de recetas reutilizables por tipo de comida
- sesgo editorial hacia adherencia, saciedad y facilidad de ejecucion

Esto permite crecer sin meter cientos de objetos manuales y mantiene coherencia en macros, tags y estructura del seed.

## Cobertura actual

Conteos validados con `tsx` sobre `SYSTEM_RECIPE_STATS`:

- Total de recetas: `374`
- Dietas:
  - `alta_proteina`: `123`
  - `ayuno_intermitente`: `92`
  - `mediterranea`: `71`
  - `dash`: `58`
  - `ninguna`: `36`
- Dificultad:
  - `facil`: `249`
  - `medio`: `106`
  - `dificil`: `19`
- Objetivos:
  - `perdida_peso`: `336`
  - `recomposicion`: `256`
  - `ganancia_muscular`: `237`
  - `mantenimiento`: `190`
  - `salud_cardiometabolica`: `92`
- Tipos de comida:
  - `desayuno`: `109`
  - `almuerzo`: `238`
  - `cena`: `287`
  - `snack`: `85`

## Criterio editorial

Se ha priorizado justo lo que tiene mas sentido para el producto hoy:

- maxima densidad de recetas para `perdida_peso`
- gran cobertura para `ganancia_muscular` y `recomposicion`
- concentracion fuerte en `alta_proteina` y `ayuno_intermitente`
- predominio claro de recetas `facil` y `medio`
- pocas recetas `dificil`, solo como capa de profundidad editorial

## Familias incluidas

La libreria no es una lista plana. Esta organizada en familias de recetas que escalan bien:

- bowls de desayuno proteicos y equilibrados
- tostadas y desayunos salados
- bowls principales de proteina + base + verduras
- platos frios y ensaladas de alta adherencia
- bandejas y cenas de horno para batch cooking
- snacks funcionales para saciedad o recuperacion
- recetas inspiradas directamente en el informe de investigacion

## Ejemplos representativos

### Burritos de desayuno inspirados en NHS

- Tipo: `desayuno`
- Dietas: `ninguna`, `alta_proteina`
- Objetivos: `ganancia_muscular`, `mantenimiento`
- Dificultad: `medio`

### Bol mediterraneo de yogur griego con frutos rojos y chia

- Tipo: `desayuno`, `snack`
- Dieta principal: `mediterranea`
- Objetivos: `perdida_peso`, `mantenimiento`
- Dificultad: `facil`

### Comida 16:8 de pollo con arroz de coliflor y brocoli

- Tipo: `almuerzo`, `cena`
- Dieta principal: `ayuno_intermitente`
- Objetivos: `perdida_peso`, `recomposicion`
- Dificultad: `facil` o `medio` segun variante

### Bowl proteico de pavo con quinoa y verduras salteadas

- Tipo: `almuerzo`, `cena`
- Dieta principal: `alta_proteina`
- Objetivos: `ganancia_muscular`, `recomposicion`
- Dificultad: `facil` o `medio`

### Cena DASH de merluza con patata y judias verdes

- Tipo: `cena`
- Dieta principal: `dash`
- Objetivos: `salud_cardiometabolica`, `perdida_peso`
- Dificultad: `facil`

## Notas tecnicas importantes

- El seed identifica las recetas del sistema por `name + source`, asi que los nombres deben ser estables y unicos.
- Los ingredientes se crean con nombre canonico y unidad canonica; no conviene mezclar unidades distintas para el mismo ingrediente normalizado.
- La UI y las validaciones solo soportan estos `dietTypes`: `ninguna`, `mediterranea`, `dash`, `ayuno_intermitente`, `alta_proteina`.
- La UI y las validaciones solo soportan estos `mealTypes`: `desayuno`, `almuerzo`, `cena`, `snack`.

## Siguiente paso natural

Con esta base ya no hace falta seguir ampliando recetas a mano. El siguiente salto de producto es:

1. sembrar la libreria en Neon con `npm run prisma:seed`
2. revisar la experiencia de seleccion y reemplazo, porque con mas de 300 recetas la UI necesita mejor busqueda/paginacion
3. permitir guardar recetas generadas por IA como `source = ai` cuando merezca la pena conservarlas
