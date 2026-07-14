#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
DATABASE_URL_VALUE="${DATABASE_URL:-postgresql://impulso:impulso@localhost:5432/impulso_test?schema=public}"

cd "${ROOT_DIR}"
npm ci

cd "${BACKEND_DIR}"
pnpm install --frozen-lockfile

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if ! docker ps --format '{{.Names}}' | grep -q '^anclora-impulso-postgres-test$'; then
    docker run \
      --name anclora-impulso-postgres-test \
      -e POSTGRES_USER=impulso \
      -e POSTGRES_PASSWORD=impulso \
      -e POSTGRES_DB=impulso_test \
      -p 5432:5432 \
      -d postgres:16 >/dev/null
  fi
else
  echo "Docker is unavailable; expecting DATABASE_URL to point to a running PostgreSQL instance."
fi

export DATABASE_URL="${DATABASE_URL_VALUE}"
pnpm prisma:generate
pnpm prisma:deploy
