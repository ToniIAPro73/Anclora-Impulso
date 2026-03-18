# ComfyUI Pipeline

Esta carpeta contiene el pipeline de generación de imágenes de ejercicios con ComfyUI.

## Estructura

- `workflows/`
  Guarda aquí el `workflow_api.json` exportado desde ComfyUI.
- `references/athlete/`
  Referencias visuales del atleta por sexo y rango de edad.
- `references/environments/`
  Referencias visuales de entorno (`gym`, `home`, `outdoor`).
- `manifests/reference-config.json`
  Configuración activa de referencias.
- `manifests/workflow-bindings.json`
  Mapa entre variables del pipeline y los IDs de nodos del workflow.
- `manifests/generation-state.json`
  Estado incremental de generaciones.
- `manifests/jobs/`
  Payloads listos por ejercicio para inspección o envío.
- `outputs/`
  Salidas intermedias o descargadas del pipeline.

## Flujo previsto

1. Exportar tu flujo desde ComfyUI a `ai/comfy/workflows/workflow_api.json`.
2. Identificar los IDs de nodos que debes mutar y rellenar `workflow-bindings.json`.
3. Preparar trabajos:

```bash
node scripts/comfy/prepare-comfy-batch.mjs --limit 12
```

4. Rellenar los IDs reales de nodos en `manifests/workflow-bindings.json`.
5. Generar payloads mutados por ejercicio:

```bash
node scripts/comfy/build-comfy-payloads.mjs --limit 12
```

6. Inspeccionar:
   - jobs preparados en `ai/comfy/manifests/jobs/`
   - payloads listos en `ai/comfy/manifests/payloads/`
7. Conectar después esos payloads a la API cloud elegida.

## Contratos del pipeline

- La identidad del atleta se toma desde `reference-config.json`.
- El fondo se elige por `environment`.
- El prompt final sale de `data/prompts.json`; no se reescribe manualmente en el script salvo para inyectar referencias.
- El pipeline debe ser idempotente: si ya existe la imagen final, el job puede marcarse como `skip`.
- La salida canónica de cada ejercicio vive en `backend/public/exercises/<slug>/`.
- Si la subcarpeta del ejercicio todavía no existe, el paso final de generación/descarga debe crearla automáticamente antes de escribir el archivo.
- Antes de aceptar scroll o complejidad extra en el runner, el contrato es mantener el pipeline inspeccionable: `prompts -> jobs -> payloads -> envío`.

## Qué falta todavía

- Exportar el `workflow_api.json` real desde ComfyUI.
- Rellenar los node IDs de:
  - prompt positivo
  - prompt negativo
  - referencia de atleta
  - referencia de entorno
  - prefijo de salida
- Añadir un script final de envío para el proveedor cloud real.
