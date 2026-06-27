#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="parth-projects-500703"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-world-cup-2026-guide}"
REPOSITORY="${REPOSITORY:-world-cup-apps}"
TAG="${TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:${TAG}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI is required. Install Google Cloud SDK before deploying." >&2
  exit 1
fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
if [[ -z "${ACTIVE_ACCOUNT}" ]]; then
  echo "No active gcloud account found. Run: gcloud auth login" >&2
  exit 1
fi

echo "Deploying ${SERVICE_NAME} to project ${PROJECT_ID} in ${REGION}"
echo "Using gcloud account: ${ACTIVE_ACCOUNT}"

gcloud config set project "${PROJECT_ID}"

gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  --project "${PROJECT_ID}"

if ! gcloud artifacts repositories describe "${REPOSITORY}" \
  --project "${PROJECT_ID}" \
  --location "${REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPOSITORY}" \
    --project "${PROJECT_ID}" \
    --location "${REGION}" \
    --repository-format docker \
    --description "Static app containers"
fi

gcloud builds submit . \
  --project "${PROJECT_ID}" \
  --tag "${IMAGE}"

gcloud run deploy "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --platform managed \
  --image "${IMAGE}" \
  --port 8080 \
  --allow-unauthenticated

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format 'value(status.url)')"

echo "Deployed: ${SERVICE_URL}"
