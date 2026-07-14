# Exercise Image Completion Spec v1

## Problem

Most exercises still do not have final illustrations. The repository already contains a ComfyUI pipeline and reference assets, but the executable manifest flow is incomplete and package scripts point to removed files.

## Goal

Create a deterministic exercise image prompt workflow that identifies missing exercise illustrations and exports prompts for a generic image-generation LLM using the 31-40 male athlete model and the matching environment background.

## Acceptance Criteria

- The manifest flags exercises whose target output image is missing.
- Existing final images are excluded from missing generation by default.
- Every missing job uses the active 31-40 athlete reference from `reference-config.json`.
- Every missing job resolves environment references for `gym`, `home`, and `outdoor`.
- Target paths point to `backend/public/exercises/<slug>/<file>`.
- Prompts are exportable as JSONL, CSV, and copy-paste Markdown batches.
- Package scripts use existing Comfy pipeline files.
- The workflow does not require ComfyUI for prompt export.

## Non-goals

- Do not fabricate final exercise images inside this repo.
- Do not change exercise database schema.
- Do not upload assets to external services.
- Do not perform PR promotions.
