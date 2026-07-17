-- Replace oven-based preparation text in existing system nutrition recipes.
-- The nutrition UI reads persisted recipes through Meal.selectedRecipeId, so seed changes alone
-- do not update already-created meal plans.

UPDATE "recipes"
SET
  "description" = 'Preparacion en sarten, cazuela baja o plancha, ajustada al tipo de proteina, base y verdura.',
  "instructions" = jsonb_build_array(
    CASE
      WHEN "name" ILIKE '%wrap integral%' THEN 'Calentar el wrap en una sartén seca unos segundos por cada lado para que quede flexible.'
      WHEN "name" ILIKE '%boniato%' THEN 'Cortar el boniato en dados pequeños y cocerlo o hacerlo al microondas hasta que esté tierno.'
      WHEN "name" ILIKE '%patata%' THEN 'Cortar la patata en dados pequeños y cocerla o hacerla al microondas hasta que esté tierna.'
      WHEN "name" ILIKE '%arroz de coliflor%' THEN 'Saltear el arroz de coliflor 3-4 minutos en sartén amplia hasta que pierda humedad y quede suelto.'
      WHEN "name" ILIKE '%quinoa%' THEN 'Calentar la quinoa cocida en cazo o sartén con una cucharada de agua para que quede suelta.'
      WHEN "name" ILIKE '%arroz integral%' THEN 'Calentar el arroz integral cocido en cazo o sartén con una cucharada de agua para que quede suelto.'
      WHEN "name" ILIKE '%arroz basmati%' THEN 'Calentar el arroz basmati cocido en cazo o sartén con una cucharada de agua para que quede suelto.'
      WHEN "name" ILIKE '%pasta integral%' THEN 'Calentar la pasta integral cocida en sartén con una cucharada de agua para que recupere textura.'
      ELSE 'Preparar la base en cazo o sartén hasta que quede caliente y suelta.'
    END,
    CASE
      WHEN "name" ILIKE '%pollo%' THEN 'Cortar el pollo en tiras, dorarlo en sartén antiadherente con poco aceite y cocinarlo hasta que no quede crudo en el centro.'
      WHEN "name" ILIKE '%pavo%' THEN 'Cortar el pavo en tiras, dorarlo en sartén antiadherente con poco aceite y cocinarlo hasta que no quede crudo en el centro.'
      WHEN "name" ILIKE '%ternera magra%' THEN 'Saltear la ternera magra en tiras a fuego medio-alto, solo hasta que quede dorada y jugosa.'
      WHEN "name" ILIKE '%salmon%' THEN 'Cocinar el salmon a fuego medio por el lado de la piel y terminar tapado 2-3 minutos para que quede jugoso.'
      WHEN "name" ILIKE '%merluza%' THEN 'Cocinar la merluza en sartén tapada a fuego medio-bajo con unas gotas de aceite para que no se rompa.'
      WHEN "name" ILIKE '%gambas%' THEN 'Saltear las gambas 2-3 minutos al final de la cocción, justo hasta que cambien de color.'
      WHEN "name" ILIKE '%atun%' THEN 'Escurrir el atun al natural y añadirlo al final, solo para templarlo sin resecarlo.'
      WHEN "name" ILIKE '%tofu%' THEN 'Secar el tofu, cortarlo en dados y dorarlo por varias caras en sartén antiadherente.'
      WHEN "name" ILIKE '%garbanzos%' THEN 'Enjuagar los garbanzos cocidos y calentarlos en cazuela baja con las especias hasta que tomen sabor.'
      WHEN "name" ILIKE '%lentejas%' THEN 'Enjuagar las lentejas cocidas y calentarlas en cazuela baja con las especias hasta que tomen sabor.'
      ELSE 'Cocinar la proteina principal en sartén antiadherente hasta que quede en su punto.'
    END,
    CASE
      WHEN "name" ILIKE '%berenjena%' THEN 'Añadir las verduras, tapar unos minutos para que la berenjena se ablande y terminar destapado para evaporar el líquido.'
      WHEN "name" ILIKE '%judias verdes%' THEN 'Añadir las verduras; si las judias están firmes, incorporar un chorrito de agua y tapar 4-5 minutos antes de saltear.'
      WHEN "name" ILIKE '%coliflor%' THEN 'Añadir las verduras y saltear a fuego medio hasta que el brocoli y la zanahoria queden tiernos pero no pasados.'
      ELSE 'Añadir las verduras y saltear a fuego medio, tapando brevemente si necesitan ablandarse.'
    END,
    CASE
      WHEN "name" ILIKE '%wrap integral%' THEN 'Rellenar el wrap con la mezcla caliente, doblarlo y marcarlo un minuto por cada lado antes de servir.'
      ELSE 'Servir la mezcla caliente sobre la base, reposar 3 minutos y ajustar con hierbas o limón al final.'
    END
  ),
  "prepTime" = 14,
  "cookTime" = 20,
  "tags" = CASE
    WHEN 'sarten' = ANY(array_remove("tags", 'horno')) THEN array_remove("tags", 'horno')
    ELSE array_append(array_remove("tags", 'horno'), 'sarten')
  END,
  "updatedAt" = NOW()
WHERE
  "source" = 'system'
  AND (
    "description" ILIKE '%horno%'
    OR "description" ILIKE '%bandeja%'
    OR 'horno' = ANY("tags")
  );

UPDATE "recipes"
SET
  "instructions" = '[
    "Cocer o vaporizar las alcachofas hasta que queden tiernas.",
    "Saltearlas en sartén con aceite de oliva y hierbas.",
    "Terminar con limón y perejil."
  ]'::jsonb,
  "updatedAt" = NOW()
WHERE
  "source" = 'system'
  AND "name" = 'Alcachofas a la romana inspiradas en Mayo Clinic';

UPDATE "recipes"
SET
  "instructions" = jsonb_build_array(
    CASE
      WHEN "name" ILIKE '%wrap integral%' THEN 'Calentar el wrap en una sartén seca unos segundos por cada lado para que quede flexible.'
      WHEN "name" ILIKE '%boniato%' THEN 'Cortar el boniato en dados pequeños y cocerlo o hacerlo al microondas hasta que esté tierno.'
      WHEN "name" ILIKE '%patata%' THEN 'Cortar la patata en dados pequeños y cocerla o hacerla al microondas hasta que esté tierna.'
      WHEN "name" ILIKE '%arroz de coliflor%' THEN 'Saltear el arroz de coliflor 3-4 minutos en sartén amplia hasta que pierda humedad y quede suelto.'
      WHEN "name" ILIKE '%quinoa%' THEN 'Calentar la quinoa cocida en cazo o sartén con una cucharada de agua para que quede suelta.'
      WHEN "name" ILIKE '%arroz integral%' THEN 'Calentar el arroz integral cocido en cazo o sartén con una cucharada de agua para que quede suelto.'
      WHEN "name" ILIKE '%arroz basmati%' THEN 'Calentar el arroz basmati cocido en cazo o sartén con una cucharada de agua para que quede suelto.'
      WHEN "name" ILIKE '%pasta integral%' THEN 'Calentar la pasta integral cocida en sartén con una cucharada de agua para que recupere textura.'
      ELSE 'Preparar la base en cazo o sartén hasta que quede caliente y suelta.'
    END,
    CASE
      WHEN "name" ILIKE '%pollo%' THEN 'Cortar el pollo en tiras, dorarlo en sartén antiadherente con poco aceite y cocinarlo hasta que no quede crudo en el centro.'
      WHEN "name" ILIKE '%pavo%' THEN 'Cortar el pavo en tiras, dorarlo en sartén antiadherente con poco aceite y cocinarlo hasta que no quede crudo en el centro.'
      WHEN "name" ILIKE '%ternera magra%' THEN 'Saltear la ternera magra en tiras a fuego medio-alto, solo hasta que quede dorada y jugosa.'
      WHEN "name" ILIKE '%salmon%' THEN 'Cocinar el salmon a fuego medio por el lado de la piel y terminar tapado 2-3 minutos para que quede jugoso.'
      WHEN "name" ILIKE '%merluza%' THEN 'Cocinar la merluza en sartén tapada a fuego medio-bajo con unas gotas de aceite para que no se rompa.'
      WHEN "name" ILIKE '%gambas%' THEN 'Saltear las gambas 2-3 minutos al final de la cocción, justo hasta que cambien de color.'
      WHEN "name" ILIKE '%atun%' THEN 'Escurrir el atun al natural y añadirlo al final, solo para templarlo sin resecarlo.'
      WHEN "name" ILIKE '%tofu%' THEN 'Secar el tofu, cortarlo en dados y dorarlo por varias caras en sartén antiadherente.'
      WHEN "name" ILIKE '%garbanzos%' THEN 'Enjuagar los garbanzos cocidos y calentarlos en cazuela baja con las especias hasta que tomen sabor.'
      WHEN "name" ILIKE '%lentejas%' THEN 'Enjuagar las lentejas cocidas y calentarlas en cazuela baja con las especias hasta que tomen sabor.'
      ELSE 'Cocinar la proteina principal en sartén antiadherente hasta que quede en su punto.'
    END,
    CASE
      WHEN "name" ILIKE '%berenjena%' THEN 'Añadir las verduras, tapar unos minutos para que la berenjena se ablande y terminar destapado para evaporar el líquido.'
      WHEN "name" ILIKE '%judias verdes%' THEN 'Añadir las verduras; si las judias están firmes, incorporar un chorrito de agua y tapar 4-5 minutos antes de saltear.'
      WHEN "name" ILIKE '%coliflor%' THEN 'Añadir las verduras y saltear a fuego medio hasta que el brocoli y la zanahoria queden tiernos pero no pasados.'
      ELSE 'Añadir las verduras y saltear a fuego medio, tapando brevemente si necesitan ablandarse.'
    END,
    CASE
      WHEN "name" ILIKE '%wrap integral%' THEN 'Rellenar el wrap con la mezcla caliente, doblarlo y marcarlo un minuto por cada lado antes de servir.'
      ELSE 'Servir la mezcla caliente sobre la base, reposar 3 minutos y ajustar con hierbas o limón al final.'
    END
  ),
  "updatedAt" = NOW()
WHERE
  "source" = 'system'
  AND "instructions"::text ILIKE '%al horno o al vapor%';

UPDATE "recipes"
SET
  "tags" = CASE
    WHEN 'plancha' = ANY(array_remove("tags", 'asado')) THEN array_remove("tags", 'asado')
    ELSE array_append(array_remove("tags", 'asado'), 'plancha')
  END,
  "updatedAt" = NOW()
WHERE
  "source" = 'system'
  AND 'asado' = ANY("tags");
