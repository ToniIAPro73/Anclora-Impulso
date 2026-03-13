# Rule: Localization Consistency

## Norma general
Toda superficie de producto debe mantener consistencia lingüística completa dentro del idioma activo.

## Obligaciones
- No introducir literales de UI directamente en componentes si no son marca.
- Añadir cada texto nuevo en `lib/translations/es.json` y `lib/translations/en.json`.
- Verificar que el cambio de idioma impacta todos los textos de la feature.
- Rechazar cierres parciales con un idioma incompleto.

## Contrato aplicable
- `LOCALIZATION_CONTRACT.md`
