# Repo Rules

Last reviewed: 2026-06-27

## Documentation

- Keep substantive documentation under `docs/`.
- Keep root `AGENTS.md`, `CLAUDE.md`, and `.cursor/rules/cursor_rules.mdc` as thin wrappers that point to `docs/README.md`.
- Keep `.claude/`, `.codex/`, and `.cursor/` ignored in `.gitignore`.
- Update `docs/README.md` whenever routes, deployment commands, data flow, or production domains change.

## Static App Architecture

- This app is plain HTML, CSS, and browser JavaScript. Do not add a package manager, bundler, or framework unless the project explicitly needs one.
- Keep page controllers in `js/pages/`, reusable render helpers in `js/components/`, and shared utilities in `js/shared/`.
- Prefer small reusable render helpers over duplicating card/list markup.
- Keep mobile rendering practical. The Top Players page must not render the full global player set into the DOM at once; keep pagination or an equivalent bounded-rendering strategy in place.

## Data Generation

- Treat `world_cup_player_tables_collected.csv` as the source dataset.
- Regenerate `data/players-lite.json`, `data/teams-summary.json`, and `data/teams/*.json` with `node scripts/build-data.js` after changing the CSV or flag manifest.
- Keep generated JSON committed with source data changes so the deployed static app has everything it needs.
- Do not render `rating_confidence` in the UI unless the data methodology is intentionally changed.

## Deployment

- User-facing production URL is `https://wc26.parthshah.dev`.
- Cloud Run backing service is `world-cup-2026-guide` in project `parth-projects-500703`, region `us-central1`.
- Use `./scripts/deploy-gcloud.sh` for manual deployment from the current checkout.
- After deployment, smoke-test the custom production domain, not only the generated Cloud Run URL.

## Validation

Before considering a code change done:

- Run `node --check` on any touched JavaScript file.
- Run `git diff --check`.
- Serve locally with `python3 -m http.server 8765` when browser behavior changes.
- Smoke-test mobile-width `players.html` after player-list, pagination, or card layout changes.
