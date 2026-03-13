# Dashboard Shell And Entry Test Plan v1

## Smoke checks
- Abrir `/` y verificar redirección a `/auth/login`.
- Abrir `/landing` y verificar que la landing sigue operativa.
- Iniciar sesión y validar presencia de sidebar y header.
- Contraer y expandir el sidebar; recargar y comprobar persistencia.
- Cambiar idioma a `en` y validar actualización del mensaje del header.
- Cambiar tema y verificar persistencia visual.
- Abrir menú de usuario y ejecutar cierre de sesión.

## Riesgos
- Desfase visual entre header y contenido en pantallas pequeñas.
- Persistencia local de tema, idioma y sidebar con estados incompatibles.
