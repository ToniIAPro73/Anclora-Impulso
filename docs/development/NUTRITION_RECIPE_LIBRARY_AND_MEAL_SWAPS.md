# Nutrition Recipe Library and Meal Swaps

## Objetivo

Esta iteración convierte la nutrición de `Anclora-Impulso` en un sistema híbrido:

- plan semanal generado por IA
- biblioteca persistente de recetas en base de datos
- sustitución de una comida concreta sin regenerar todo el plan
- creación de recetas propias por parte del usuario

La fuente de verdad técnica de la librería inicial vive en:

- `backend/prisma/nutrition-library.ts`

## Cambios clave

- `Recipe` ahora distingue origen y propiedad:
  - `source`: `system | ai | user`
  - `userId`
  - `isPublic`
  - `isEditable`
  - `mealTypes`
  - `dietTypes`
  - `goalTypes`
- `Meal` añade `selectedRecipeId` como receta activa real del slot.
- `MealSwapHistory` registra sustituciones.
- Se añade:
  - listado de recetas filtrable
  - creación de receta propia
  - sustitución de receta en una comida del plan

## Catálogo inicial

### Mediterránea

#### Tostadas mediterráneas con tomate y huevo

- Tipo: `desayuno`
- Tiempo: `14 min`
- Ingredientes:
  - pan integral
  - tomate
  - huevo
  - aceite de oliva virgen extra
  - orégano

#### Yogur griego con avena, nueces y frutos rojos

- Tipo: `desayuno`, `snack`
- Tiempo: `5 min`
- Ingredientes:
  - yogur griego natural
  - avena
  - nueces
  - frutos rojos
  - canela

#### Ensalada de garbanzos, atún y pepino

- Tipo: `almuerzo`, `cena`
- Tiempo: `12 min`
- Ingredientes:
  - garbanzos cocidos
  - atún al natural
  - pepino
  - tomate
  - cebolla morada
  - aceite de oliva
  - limón

#### Salmón al horno con boniato y espárragos

- Tipo: `almuerzo`, `cena`
- Tiempo: `37 min`
- Ingredientes:
  - salmón
  - boniato
  - espárragos verdes
  - aceite de oliva virgen extra
  - limón
  - eneldo

#### Pasta integral con pollo, espinacas y aceitunas

- Tipo: `almuerzo`, `cena`
- Tiempo: `25 min`
- Ingredientes:
  - pasta integral
  - pechuga de pollo
  - espinacas
  - aceitunas
  - ajo
  - aceite de oliva

#### Crema de lentejas rojas con yogur y menta

- Tipo: `almuerzo`, `cena`
- Tiempo: `30 min`
- Ingredientes:
  - lenteja roja
  - cebolla
  - zanahoria
  - caldo de verduras bajo en sodio
  - yogur natural
  - menta fresca

### DASH

#### Avena cremosa con plátano y semillas

- Tipo: `desayuno`
- Tiempo: `11 min`
- Ingredientes:
  - avena
  - leche semidesnatada
  - plátano
  - semillas de chía
  - canela

#### Tortilla de claras con espinacas y champiñones

- Tipo: `desayuno`
- Tiempo: `15 min`
- Ingredientes:
  - claras de huevo
  - huevo
  - espinaca fresca
  - champiñón
  - aceite de oliva

#### Bowl DASH de arroz integral, pavo y brócoli

- Tipo: `almuerzo`, `cena`
- Tiempo: `32 min`
- Ingredientes:
  - arroz integral
  - pechuga de pavo
  - brócoli
  - tomate
  - aceite de oliva
  - limón

#### Merluza con puré de coliflor y judías verdes

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Ingredientes:
  - merluza
  - coliflor
  - judías verdes
  - yogur natural
  - ajo
  - aceite de oliva

#### Wrap integral de hummus, pollo y verduras

- Tipo: `almuerzo`
- Tiempo: `17 min`
- Ingredientes:
  - tortilla integral
  - hummus
  - pechuga de pollo
  - lechuga
  - pepino
  - zanahoria

#### Bowl de yogur con kiwi y almendras

- Tipo: `desayuno`, `snack`
- Tiempo: `4 min`
- Ingredientes:
  - yogur natural
  - kiwi
  - almendra
  - copos de avena

### Ayuno intermitente

#### Ensalada potente de pollo, aguacate y huevo

- Tipo: `almuerzo`, `cena`
- Tiempo: `22 min`
- Ingredientes:
  - pechuga de pollo
  - aguacate
  - huevo
  - hojas verdes
  - tomate
  - aceite de oliva

#### Ternera salteada con verduras y arroz de coliflor

- Tipo: `almuerzo`, `cena`
- Tiempo: `26 min`
- Ingredientes:
  - ternera magra
  - coliflor
  - pimiento rojo
  - calabacín
  - ajo
  - jengibre
  - salsa de soja baja en sodio

#### Salmón con quinoa y espinacas salteadas

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Ingredientes:
  - salmón
  - quinoa
  - espinacas
  - ajo
  - aceite de oliva
  - limón

#### Tortilla de patata ligera con ensalada crujiente

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Ingredientes:
  - patata
  - huevo
  - cebolla
  - hojas verdes
  - pepino
  - aceite de oliva

#### Pavo con hummus, crudités y pan pita integral

- Tipo: `almuerzo`
- Tiempo: `10 min`
- Ingredientes:
  - pechuga de pavo
  - hummus
  - zanahoria
  - pepino
  - pan pita integral

#### Pollo al curry suave con arroz basmati

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Ingredientes:
  - pechuga de pollo
  - arroz basmati
  - cebolla
  - yogur natural
  - curry suave
  - cilantro

### Alta en proteína

#### Porridge proteico de vainilla y frutos rojos

- Tipo: `desayuno`
- Tiempo: `11 min`
- Ingredientes:
  - avena
  - leche semidesnatada
  - proteína de vainilla
  - frutos rojos
  - semillas de chía

#### Tostada de requesón, salmón ahumado y pepino

- Tipo: `desayuno`, `snack`
- Tiempo: `8 min`
- Ingredientes:
  - pan integral
  - requesón
  - salmón ahumado
  - pepino
  - eneldo

#### Bowl de pollo, arroz jazmín y edamame

- Tipo: `almuerzo`, `cena`
- Tiempo: `30 min`
- Ingredientes:
  - pechuga de pollo
  - arroz jazmín
  - edamame
  - zanahoria
  - semillas de sésamo

#### Albóndigas de pavo con calabacín y tomate

- Tipo: `almuerzo`, `cena`
- Tiempo: `30 min`
- Ingredientes:
  - pavo picado
  - calabacín
  - tomate triturado
  - ajo
  - perejil
  - aceite de oliva

#### Tacos de ternera magra con yogur y col lombarda

- Tipo: `almuerzo`, `cena`
- Tiempo: `22 min`
- Ingredientes:
  - ternera magra
  - tortilla de maíz
  - col lombarda
  - yogur natural
  - cilantro

#### Skyr con cacao, plátano y crema de cacahuete

- Tipo: `snack`
- Tiempo: `4 min`
- Ingredientes:
  - skyr natural
  - cacao puro
  - plátano
  - crema de cacahuete

## Flujo de producto resultante

1. La IA genera un `MealPlan`.
2. Cada `Meal` guarda su receta activa en `selectedRecipeId`.
3. El usuario puede:
   - abrir el detalle del plan
   - pulsar `Cambiar comida`
   - elegir una receta de la biblioteca
   - o crear una receta propia y usarla en el acto
4. El sistema registra la sustitución en `MealSwapHistory`.

## Endpoints añadidos

- `GET /api/nutrition/recipes`
- `POST /api/nutrition/recipes`
- `POST /api/nutrition/meals/:mealId/replace`

## Notas de implementación

- La fuente de verdad activa de una comida es `Meal.selectedRecipeId`.
- `MealRecipe` se mantiene por compatibilidad con la estructura previa.
- Las recetas IA se guardan con:
  - `source = ai`
  - `userId = propietario del plan`
  - `isPublic = false`
  - `isEditable = true`
- Las recetas semilla del sistema se cargan con `pnpm prisma:seed`.
