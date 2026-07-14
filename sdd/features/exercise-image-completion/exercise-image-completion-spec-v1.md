# Exercise Image Completion Spec v1

## Problem

Most exercises still do not have final illustrations. The repository already contains a ComfyUI pipeline and reference assets, but the executable manifest flow is incomplete and package scripts point to removed files.

## Goal

Create a deterministic exercise image manifest workflow that identifies missing exercise illustrations and prepares ComfyUI jobs using the 31-40 male athlete model and the matching environment background.

## Acceptance Criteria

- The manifest flags exercises whose target output image is missing.
- Existing final images are excluded from missing generation by default.
- Every missing job uses the active 31-40 athlete reference from `reference-config.json`.
- Every missing job resolves environment references for `gym`, `home`, and `outdoor`.
- Target paths point to `backend/public/exercises/<slug>/<file>`.
- Package scripts use existing Comfy pipeline files.
- The workflow remains blocked from actual generation until a real Comfy workflow export and node bindings are supplied.

## Non-goals

- Do not fabricate final exercise images without the configured generator workflow.
- Do not change exercise database schema.
- Do not upload assets to external services.
- Do not perform PR promotions.
