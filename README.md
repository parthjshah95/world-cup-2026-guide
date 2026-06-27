# World Cup 2026 Player Guide

Static interactive HTML app for browsing and comparing World Cup player tables from `world_cup_player_tables_collected.csv`.

## Run Locally

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8765
```

Then visit `http://127.0.0.1:8765/`.

## Deploy

Deploy to Cloud Run in the hardcoded Google Cloud project `parth-projects-500703`:

```bash
./scripts/deploy-gcloud.sh
```

Optional environment overrides:

```bash
REGION=us-central1 SERVICE_NAME=world-cup-2026-guide ./scripts/deploy-gcloud.sh
```

## Features

- Premium flag-card home page
- Country detail pages with full-width player tables
- Head-to-head country comparison
- Global top players view
- Search, lean filters, sortable columns, and OVR bands
- Static CSV source with no build system
- Local SVG flag backgrounds for all 48 qualified teams, sourced from FlagCDN
