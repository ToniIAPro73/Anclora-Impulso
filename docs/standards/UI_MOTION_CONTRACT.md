# UI Motion Contract

## Objetivo
Este contrato define el comportamiento visual base de superficies interactivas en Anclora Impulso para mantener una experiencia coherente, ágil y moderna.

## Superficies soportadas
- `ui-motion-card`: para tarjetas, widgets y bloques de contenido principales.
- `ui-motion-button`: para botones primarios, secundarios, icon buttons y CTA.
- `ui-motion-frame`: para filas, accesos rápidos, items de navegación y contenedores secundarios.

## Comportamiento obligatorio
- Elevación en `hover` y `focus-visible`.
- Sombra inferior perceptible al elevarse.
- Borde visible al activarse la elevación.
- Transiciones rápidas y homogéneas.
- Respeto a `prefers-reduced-motion: reduce`.

## Diferenciación por tipo
- `card`: elevación más profunda y sombra amplia.
- `button`: elevación corta, respuesta más rápida y sensación táctil.
- `frame`: elevación intermedia para navegación y filas informativas.

## Regla de incorporación
- Nuevas tarjetas deben usar `Card` desde `components/ui/card` o incluir `ui-motion-card`.
- Nuevos botones deben usar `Button` desde `components/ui/button` o incluir `ui-motion-button`.
- Nuevos contenedores interactivos que no sean `Card` ni `Button` deben incluir `ui-motion-frame`.
- No se deben inventar animaciones locales por pantalla si el patrón encaja en uno de los tres tipos anteriores.

## Contrato de campos editables
- En tema oscuro, los campos editables no pueden mostrar superficies claras por defecto, autofill o estilos nativos del navegador.
- `input`, `textarea` y controles equivalentes deben respetar `color-scheme: dark` cuando la app esté en `.dark`.
- El fondo y el color del texto de los campos editables en oscuro deben integrarse con la misma superficie oscura usada por selects y controles vecinos.
- Cualquier override local de un campo editable debe preservar ese contrato visual y no reintroducir fondos blancos o texto oscuro en tema oscuro.

## Contrato de modales
- Los modales deben dimensionarse según el contenido y el viewport real, no a partir de un ancho compacto fijo heredado por defecto.
- La primera estrategia debe ser ampliar superficie utilizable y reorganizar columnas, no introducir `scroll` vertical u horizontal.
- Un modal puede ocupar casi todo el viewport si eso evita scrolls y mejora la edición o lectura.
- Sólo se permite `scroll` interno cuando, tras adaptar layout y tamaño, siga siendo imposible mostrar la información completa de forma usable.
- En modales con mucha información, las columnas laterales deben colapsar o apilarse antes de comprimir el contenido principal.

## Extensión del contrato
Si aparece un nuevo tipo de superficie, debe añadirse en:
- `lib/ui-motion.ts` para declarar el identificador reutilizable.
- `app/globals.css` para definir la mecánica visual.
- Este documento para registrar intención, reglas y casos de uso.
