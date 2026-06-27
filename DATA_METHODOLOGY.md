# Data Methodology

This dataset is a prototype seed dataset for an interactive World Cup player-comparison app. It is not a fully audited sports database.

## Current CSV Scope

`world_cup_player_tables_collected.csv` combines two collection passes:

- The original seven-team curated watchlists for Uruguay, Spain, Argentina, France, England, Portugal, and Brazil.
- A generated 48-team expansion built from current 2026 World Cup squad tables plus FC 26 rating matches.

Rows should be treated as selected notable/core player rows, not as a definitive complete scouting database.

## Fields

Core fields:

- `team`
- `player`
- `club`
- `club_country`
- `club_with_country`
- `position`
- `fc26_ovr`
- `inclusion_type`
- `rating_source`
- `rating_confidence`
- `notes`

Optional provenance/display fields:

- `source_url`
- `rating_url`
- `headshot_url`
- `last_verified_at`

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

- Squad, position, and club seed data came from the current 2026 FIFA World Cup squads page.
- FC 26 OVR, rating URL, and headshot URL were matched from the FC Ratings search index.
- The original seven curated teams were preserved rather than overwritten.
- Missing-team rows were generated as ratings-led 15-player watchlists from each final squad, with at least one goalkeeper included when available.
- Rows matched through FC Ratings are marked `rating_source = third_party_fc_database`.
- Rows without a rating match keep blank `fc26_ovr` and are marked `rating_confidence = unknown`.

## Confidence Rules

- `high`: rating from official EA page and squad/club from official or major reliable source.
- `medium`: rating matched from a structured ratings source and club/player identity looked consistent.
- `low`: third-party rating match was weaker, club/current status was uncertain, or identity needed manual review.
- `unknown`: rating was not collected or not matched.

## App Data Note

FC 26 ratings are base overall ratings, not Ultimate Team promo or special-card ratings. Current clubs and player selections are manually curated/generated prototype data unless row-level source URLs are present.
