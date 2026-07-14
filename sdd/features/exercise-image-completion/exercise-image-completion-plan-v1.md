# Exercise Image Completion Plan v1

## Implementation Strategy

1. Add a script module that builds a missing-image manifest from `data/prompts.json`.
2. Validate model and environment references through `reference-config.json`.
3. Extend Comfy job preparation to consume the missing manifest.
4. Fix package scripts that currently reference missing files.
5. Add Node tests for manifest behavior.

## Validation

- `node --test scripts/comfy/*.test.mjs`
- `node scripts/comfy/build-exercise-image-manifest.mjs --dry-run`
- `node scripts/comfy/prepare-comfy-batch.mjs --missing-only --limit 3 --dry-run`
