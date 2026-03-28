# Expanded Nutrition Meal Library

## Objetivo

Este documento deja visible la ampliación real de la librería de nutrición de `Anclora-Impulso`, alineada con el seed de recetas del sistema y pensada para tres usos:

- poblar Neon/PostgreSQL vía Prisma
- permitir sustitución manual de comidas en un `MealPlan`
- dar una base clara para futuras recetas IA y recetas creadas por usuario

La fuente de verdad estructurada vive en:

- `backend/prisma/nutrition-library.ts`

Este `.md` resume esa librería en formato editorial, agrupada por dieta.

## Resumen del catálogo inicial

- `mediterranea`: 9 recetas
- `dash`: 8 recetas
- `ayuno_intermitente`: 6 recetas
- `alta_proteina`: 10 recetas

## Dieta Mediterránea

### Tostadas mediterráneas con tomate y huevo

- Tipo: `desayuno`
- Tiempo: `14 min` (`prep 8` + `cook 6`)
- Dificultad: `facil`
- Raciones: `1`
- Ingredientes:
  - 2 rebanadas de pan integral
  - 120 g de tomate
  - 2 huevos
  - 10 ml de aceite de oliva virgen extra
  - 1 g de orégano
- Preparación:
  1. Tostar el pan integral hasta que quede dorado.
  2. Rallar el tomate y mezclarlo con aceite de oliva y una pizca de sal.
  3. Cocinar los huevos a la plancha o pochados.
  4. Montar las tostadas con tomate, huevo y orégano.

### Yogur griego con avena, nueces y frutos rojos

- Tipo: `desayuno`, `snack`
- Tiempo: `5 min`
- Dificultad: `facil`
- Raciones: `1`
- Ingredientes:
  - 220 g de yogur griego natural
  - 40 g de avena
  - 20 g de nueces
  - 80 g de frutos rojos
  - 1 g de canela
- Preparación:
  1. Servir el yogur en un bol.
  2. Añadir la avena y mezclar.
  3. Terminar con frutos rojos, nueces y canela.

### Ensalada de garbanzos, atún y pepino

- Tipo: `almuerzo`, `cena`
- Tiempo: `12 min`
- Dificultad: `facil`
- Raciones: `1`
- Ingredientes:
  - 180 g de garbanzos cocidos
  - 120 g de atún al natural
  - 100 g de pepino
  - 120 g de tomate
  - 40 g de cebolla morada
  - 12 ml de aceite de oliva virgen extra
  - 20 ml de limón
- Preparación:
  1. Lavar y escurrir los garbanzos.
  2. Trocear pepino, tomate y cebolla.
  3. Mezclar con el atún.
  4. Aliñar con aceite de oliva y limón.

### Salmón al horno con boniato y espárragos

- Tipo: `almuerzo`, `cena`
- Tiempo: `37 min`
- Dificultad: `medio`
- Raciones: `1`
- Ingredientes:
  - 180 g de salmón
  - 180 g de boniato
  - 120 g de espárragos verdes
  - 12 ml de aceite de oliva virgen extra
  - 20 ml de limón
  - 2 g de eneldo
- Preparación:
  1. Precalentar el horno a 200 grados.
  2. Hornear el boniato en cubos 15 minutos.
  3. Añadir salmón y espárragos.
  4. Hornear 12 minutos más y servir con limón y eneldo.

### Pasta integral con pollo, espinacas y aceitunas

- Tipo: `almuerzo`, `cena`
- Tiempo: `25 min`
- Dificultad: `medio`
- Raciones: `1`
- Ingredientes:
  - 85 g de pasta integral
  - 160 g de pechuga de pollo
  - 80 g de espinaca fresca
  - 30 g de aceitunas
  - 1 diente de ajo
  - 10 ml de aceite de oliva virgen extra
- Preparación:
  1. Cocer la pasta.
  2. Saltear el pollo con ajo y aceite.
  3. Añadir espinacas y aceitunas.
  4. Mezclar con la pasta y terminar con pimienta.

### Crema de lentejas rojas con yogur y menta

- Tipo: `almuerzo`, `cena`
- Tiempo: `30 min`
- Dificultad: `facil`
- Raciones: `2`
- Ingredientes:
  - 140 g de lenteja roja
  - 80 g de cebolla
  - 80 g de zanahoria
  - 700 ml de caldo de verduras bajo en sodio
  - 10 ml de aceite de oliva virgen extra
  - 40 g de yogur natural
  - 4 g de menta fresca
- Preparación:
  1. Sofreír cebolla y zanahoria.
  2. Añadir lentejas, caldo y especias.
  3. Cocer 18 minutos.
  4. Triturar y servir con yogur y menta.

## Dieta DASH

### Avena cremosa con plátano y semillas

- Tipo: `desayuno`
- Tiempo: `11 min`
- Dificultad: `facil`
- Ingredientes:
  - 55 g de avena
  - 220 ml de leche semidesnatada
  - 100 g de plátano
  - 10 g de semillas de chía
  - 1 g de canela

### Tortilla de claras con espinacas y champiñones

- Tipo: `desayuno`
- Tiempo: `15 min`
- Dificultad: `facil`
- Ingredientes:
  - 180 g de claras de huevo
  - 1 huevo
  - 60 g de espinaca fresca
  - 80 g de champiñón
  - 5 ml de aceite de oliva virgen extra

### Bowl DASH de arroz integral, pavo y brócoli

- Tipo: `almuerzo`, `cena`
- Tiempo: `32 min`
- Dificultad: `medio`
- Ingredientes:
  - 80 g de arroz integral
  - 170 g de pechuga de pavo
  - 140 g de brócoli
  - 100 g de tomate
  - 10 ml de aceite de oliva virgen extra
  - 15 ml de limón

### Merluza con puré de coliflor y judías verdes

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Dificultad: `medio`
- Ingredientes:
  - 180 g de merluza
  - 220 g de coliflor
  - 140 g de judías verdes
  - 40 g de yogur natural
  - 1 diente de ajo
  - 10 ml de aceite de oliva virgen extra

### Wrap integral de hummus, pollo y verduras

- Tipo: `almuerzo`
- Tiempo: `17 min`
- Dificultad: `facil`
- Ingredientes:
  - 1 tortilla integral
  - 45 g de hummus
  - 130 g de pechuga de pollo
  - 40 g de lechuga
  - 60 g de pepino
  - 50 g de zanahoria

### Bowl de yogur con kiwi y almendras

- Tipo: `desayuno`, `snack`
- Tiempo: `4 min`
- Dificultad: `facil`
- Ingredientes:
  - 170 g de yogur natural
  - 80 g de kiwi
  - 15 g de almendra
  - 10 g de copos de avena

## Ayuno Intermitente

### Ensalada potente de pollo, aguacate y huevo

- Tipo: `almuerzo`, `cena`
- Tiempo: `22 min`
- Dificultad: `facil`
- Ingredientes:
  - 180 g de pechuga de pollo
  - 90 g de aguacate
  - 1 huevo
  - 80 g de mezcla de hojas verdes
  - 100 g de tomate
  - 10 ml de aceite de oliva virgen extra

### Ternera salteada con verduras y arroz de coliflor

- Tipo: `almuerzo`, `cena`
- Tiempo: `26 min`
- Dificultad: `medio`
- Ingredientes:
  - 170 g de ternera magra
  - 220 g de coliflor
  - 80 g de pimiento rojo
  - 100 g de calabacín
  - 1 diente de ajo
  - 5 g de jengibre fresco
  - 10 ml de salsa de soja baja en sodio

### Salmón con quinoa y espinacas salteadas

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Dificultad: `medio`
- Ingredientes:
  - 180 g de salmón
  - 70 g de quinoa
  - 90 g de espinaca fresca
  - 1 diente de ajo
  - 10 ml de aceite de oliva virgen extra
  - 15 ml de limón

### Tortilla de patata ligera con ensalada crujiente

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Dificultad: `medio`
- Ingredientes:
  - 180 g de patata
  - 3 huevos
  - 70 g de cebolla
  - 60 g de mezcla de hojas verdes
  - 60 g de pepino
  - 12 ml de aceite de oliva virgen extra

### Pavo con hummus, crudités y pan pita integral

- Tipo: `almuerzo`
- Tiempo: `10 min`
- Dificultad: `facil`
- Ingredientes:
  - 150 g de pechuga de pavo
  - 50 g de hummus
  - 70 g de zanahoria
  - 70 g de pepino
  - 1 pan pita integral

### Pollo al curry suave con arroz basmati

- Tipo: `almuerzo`, `cena`
- Tiempo: `28 min`
- Dificultad: `medio`
- Ingredientes:
  - 180 g de pechuga de pollo
  - 80 g de arroz basmati
  - 60 g de cebolla
  - 60 g de yogur natural
  - 4 g de curry suave
  - 3 g de cilantro fresco

## Alta en proteína

### Porridge proteico de vainilla y frutos rojos

- Tipo: `desayuno`
- Tiempo: `11 min`
- Dificultad: `facil`
- Ingredientes:
  - 50 g de avena
  - 220 ml de leche semidesnatada
  - 30 g de proteína de vainilla
  - 70 g de frutos rojos
  - 10 g de semillas de chía

### Tostada de requesón, salmón ahumado y pepino

- Tipo: `desayuno`, `snack`
- Tiempo: `8 min`
- Dificultad: `facil`
- Ingredientes:
  - 2 rebanadas de pan integral
  - 80 g de requesón
  - 60 g de salmón ahumado
  - 50 g de pepino
  - 2 g de eneldo

### Bowl de pollo, arroz jazmín y edamame

- Tipo: `almuerzo`, `cena`
- Tiempo: `30 min`
- Dificultad: `medio`
- Ingredientes:
  - 190 g de pechuga de pollo
  - 80 g de arroz jazmín
  - 90 g de edamame
  - 60 g de zanahoria
  - 6 g de semillas de sésamo

### Albóndigas de pavo con calabacín y tomate

- Tipo: `almuerzo`, `cena`
- Tiempo: `30 min`
- Dificultad: `medio`
- Ingredientes:
  - 180 g de pavo picado
  - 180 g de calabacín
  - 160 g de tomate triturado
  - 1 diente de ajo
  - 4 g de perejil
  - 8 ml de aceite de oliva virgen extra

### Tacos de ternera magra con yogur y col lombarda

- Tipo: `almuerzo`, `cena`
- Tiempo: `22 min`
- Dificultad: `facil`
- Ingredientes:
  - 180 g de ternera magra
  - 4 tortillas de maíz
  - 80 g de col lombarda
  - 60 g de yogur natural
  - 3 g de cilantro fresco

### Skyr con cacao, plátano y crema de cacahuete

- Tipo: `snack`
- Tiempo: `4 min`
- Dificultad: `facil`
- Ingredientes:
  - 180 g de skyr natural
  - 5 g de cacao puro
  - 70 g de plátano
  - 12 g de crema de cacahuete

## Notas de producto

- `Meal.selectedRecipeId` es la receta activa real.
- `MealSwapHistory` deja trazabilidad de cambios.
- Las recetas IA se guardan como `source = ai`.
- Las recetas creadas por usuario se guardan como `source = user`.
- Las recetas sembradas desde seed se guardan como `source = system`.

## Siguiente iteración recomendada

Para seguir aumentando variedad sin tocar manualmente demasiadas pantallas, la siguiente ampliación lógica es:

- subir la librería a `40+` recetas del sistema
- añadir filtros por calorías objetivo y tiempo máximo
- permitir duplicar una receta base del sistema antes de editarla como receta privada del usuario
