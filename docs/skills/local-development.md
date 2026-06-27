# Local Development Workflow

Last reviewed: 2026-06-27

Use this workflow when changing HTML, CSS, JavaScript, generated JSON, or static assets.

## Start Local Server

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/.

## Regenerate Data

Run this after editing `world_cup_player_tables_collected.csv` or `assets/flags/manifest.json`:

```bash
node scripts/build-data.js
```

Commit the generated `data/` changes together with the source data change.

## Check JavaScript

Run `node --check` for every touched JavaScript file. Example:

```bash
node --check js/pages/players.js
node --check js/components/player-list.js
```

Also run:

```bash
git diff --check
```

## Browser Smoke Checks

At minimum, check:

- `index.html` loads country cards.
- `players.html` loads the global player list.
- On `players.html`, the first page renders 24 cards and the Next button advances the visible range.
- A filtered Top Players result with fewer than 25 rows hides pagination.
- `team.html?team=france` loads a team page with sortable player cards.
- `compare.html` allows selecting two countries, shows metrics, and renders each selected team's full player list.

Use a narrow/mobile viewport when changing card layout, filters, sorting, pagination, topbar behavior, or responsive CSS.
