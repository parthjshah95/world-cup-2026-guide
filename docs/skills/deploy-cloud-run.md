# Deploy Cloud Run Workflow

Last reviewed: 2026-06-27

Use this workflow when deploying the static app to production.

## Preconditions

- The checkout contains the code and generated data you intend to deploy.
- `gcloud` is installed and authenticated.
- The active gcloud account has access to project `parth-projects-500703`.

Check the active account:

```bash
gcloud auth list --filter=status:ACTIVE --format='value(account)'
```

## Deploy

```bash
./scripts/deploy-gcloud.sh
```

The script:

- Sets project `parth-projects-500703`.
- Enables Artifact Registry, Cloud Build, and Cloud Run APIs.
- Creates the `world-cup-apps` Docker repository in `us-central1` if needed.
- Builds and pushes an nginx container tagged with the current git SHA.
- Deploys Cloud Run service `world-cup-2026-guide`.

## Post-Deploy Smoke Test

Use the custom production domain:

```bash
open https://wc26.parthshah.dev/players.html
```

Check:

- The page loads without a data-load error.
- The Top Players page renders 24 player cards on page 1.
- The pagination summary says page 1 of the expected total.
- The Next button advances the visible range.
- There is no horizontal overflow in a mobile-width browser.

The Cloud Run service URL is useful for debugging, but user-facing verification should happen at `https://wc26.parthshah.dev`.
