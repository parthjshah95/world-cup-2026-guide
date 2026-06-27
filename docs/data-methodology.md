# Data Methodology

Last reviewed: 2026-06-27

This dataset powers the interactive World Cup player-comparison app. It is not a fully audited sports database.

## Current CSV Scope

`world_cup_player_tables_collected.csv` combines two collection passes:

- The original seven-team curated player sets for Uruguay, Spain, Argentina, France, England, Portugal, and Brazil.
- A generated 48-team expansion built from 2026 World Cup squad tables plus FC 26 rating matches.

Rows should be treated as selected notable/core player rows, not as a definitive complete scouting database.

## Fields

Core fields:

- `team`
- `player`
- `club`
- `club_country`
- `club_with_country`
- `position`
- `date_of_birth`
- `age`
- `age_as_of`
- `fc26_ovr`
- `rating_source`
- `rating_confidence`
- `notes`

Optional provenance/display fields:

- `source_url`
- `age_source`
- `age_source_url`
- `rating_url`
- `headshot_url`
- `last_verified_at`

The generated browser JSON intentionally keeps a compact field set for runtime payload size. `scripts/build-data.js` writes `data/players-lite.json`, `data/teams-summary.json`, and `data/teams/*.json` from the CSV.

## Source Hierarchy

Preferred source order:

1. EA SPORTS FC 26 official ratings pages for FC 26 base OVR.
2. Official federation or national-team sources for squad membership.
3. Reputable match reporting for confirmed matchday lineups.
4. Club official pages for current club verification.
5. Reputable football publications and squad aggregators for roster context.
6. Third-party FC rating databases only as fallback.

## 48-Team Expansion

For the all-team expansion:

- Squad, position, and club seed data came from 2026 FIFA World Cup squad tables.
- FC 26 OVR, rating URL, and headshot URL were matched from the FC Ratings search index.
- The original seven curated teams were preserved rather than overwritten.
- Missing-team rows were generated as ratings-led 15-player team datasets from each final squad, with at least one goalkeeper included when available.
- Rows matched through FC Ratings are marked `rating_source = third_party_fc_database`.
- Rows without a rating match keep blank `fc26_ovr` and are marked `rating_confidence = unknown`.

## Age Enrichment

Player ages were computed from date-of-birth values as of `2026-06-27`.

- Rows with FC Ratings pages use the page's schema.org `birthDate` value.
- Remaining rows use the Wikipedia infobox `bday` value from the matched player page.
- `age_source` and `age_source_url` record which source supplied each birth date.

## Confidence Rules

`rating_confidence` is retained for data-quality review only. It should not be rendered as a player-card field, table column, or filter control.

- `high`: rating from official EA page and squad/club from official or major reliable source.
- `medium`: rating matched from a structured ratings source and club/player identity looked consistent.
- `low`: third-party rating match was weaker, club/current status was uncertain, or identity needed manual review.
- `unknown`: rating was not collected or not matched.

## App Data Note

FC 26 ratings are base overall ratings, not Ultimate Team promo or special-card ratings. Current clubs and player selections are manually curated/generated app data unless row-level source URLs are present.
