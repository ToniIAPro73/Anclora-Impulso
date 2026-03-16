# Localization Contract

## Objetivo
Garantizar que la aplicación no mezcle idiomas en una misma experiencia y que toda funcionalidad nueva salga al menos en español e inglés.

## Reglas obligatorias
- Ningún texto visible al usuario debe quedar hardcodeado en componentes o páginas si pertenece al producto y no a una marca.
- Todo texto nuevo debe añadirse en `lib/translations/es.json` y `lib/translations/en.json`.
- Los componentes deben consumir textos desde `useLanguage()` u otra capa de traducción aprobada.
- No se permite entregar una feature con textos en un solo idioma.
- Si una clave no existe en ambos idiomas, la feature no está lista para cierre.

## Excepciones permitidas
- Nombres de marca y nombres propios.
- Valores técnicos o de terceros que no controle el producto.

## Checklist de entrega
- Añadir claves en `es.json`.
- Añadir claves equivalentes en `en.json`.
- Sustituir literales hardcodeados en componentes.
- Verificar cambio de idioma en los flujos afectados.

## Aplicación futura
Toda feature nueva debe incluir sus textos bilingües como parte del alcance mínimo.
