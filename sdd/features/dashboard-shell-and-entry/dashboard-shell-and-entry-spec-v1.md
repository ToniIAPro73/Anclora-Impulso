# Dashboard Shell And Entry Spec v1

## Problema
La aplicación arrancaba en una landing de marketing y el área autenticada no tenía un header global con controles de idioma, tema y usuario.

## Decisiones
- `/` redirige a `/auth/login`.
- La landing anterior se conserva en `/landing`.
- El shell autenticado incorpora:
  - sidebar contraíble persistente,
  - header compartido,
  - selector de idioma,
  - selector de tema,
  - menú de usuario.
- Los mensajes de bienvenida se muestran en el header y no se duplican en el dashboard principal.

## Criterios de aceptación
- Al abrir la app, la ruta raíz debe llevar al login.
- La landing debe seguir siendo accesible manualmente.
- El header debe aparecer en las pantallas que usan `DashboardLayout`.
- El idioma debe alternar entre `es` y `en`.
- El tema debe poder alternar entre `light`, `dark` y `system`.
- El menú de usuario debe permitir cerrar sesión.
