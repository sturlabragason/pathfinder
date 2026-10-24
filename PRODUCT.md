# Product

<!-- impeccable:product-schema 1 -->

> Facts marked *(inferred)* come from the brief and repository because Sturla was away when asked (2026-10-24). Confirm or correct them.

## Platform

web

## Stack

Static HTML/CSS/JS, no build step *(inferred: the question was asked, unanswered; the existing hosting serves static files)*. The sheet is served from `site/` by nginx in the homelab at caladrel.sturlabragason.online; the spell compendium is served by GitHub Pages from `sturlabragason/pathfinder_spells`.

## Users

Sturla, the player of Caladrel Ecthëlion in a Pathfinder 1e campaign. He uses the sheet at the table during play, mostly on a phone, to find a number or a spell fast; and between sessions to prepare spells, level up and reread the backstory *(inferred split: at the table is the default)*. The table also includes the GM and other players who may glance at it.

## Product Purpose

A personal, online character sheet and spellbook for one wizard that is more useful at the table than the Roll20 sheet: every number he rolls is one glance away, his spellbook is searchable with the rules text, and his daily preparation and slot use can be tracked. Success: during a session he never has to open Roll20 or a rules site to answer "what's my Will save" or "what does Glitterdust do and what's the DC".

## Positioning

Built for this one character only. It knows his school, opposed schools, Spell Focus feats and slots, so it can show conjuration DCs, mark opposed-school spells and count slots; a generic sheet cannot.

## Operating Context

- Pathfinder 1st edition rules (Archives of Nethys, aonprd.com, is the reference used for spell links).
- Roll20 holds the live character; this site is a read-mostly companion that mirrors it by hand.
- Spell data: `spells.tsv` in pathfinder_spells (1,897 sorcerer/wizard spells, refreshed by `scripts/update_spells.py` from the Foundry VTT PF1 pack). His known spells: `caladrel_ecthelion/spellbook.txt` in the same repo.
- The table plays in Icelandic and English; campaign notes are in Icelandic.

## Capabilities and Constraints

- Read-only content; any interactive state (prepared spells, used slots, HP) lives in the browser's localStorage only *(inferred)*.
- No accounts, no backend, no tracking. `noindex`.
- Must work on a phone at the table, offline-tolerant once loaded.
- Undecided / unrecorded in any source: his level-7 feat, the two free spells gained at level 7 (no 4th-level spells are recorded), deity and homeland.

## Brand Commitments

None beyond the subject: Pathfinder 1e, an elven conjurer of the Handanvaldur, old-school D&D inspiration requested by Sturla (2026-10-24). Homebrewery and the 5e PHB look are explicitly rejected.

## Evidence on Hand

- Character sheet: `caladrel-ecthelion.md` (from the Roll20 export, 2026-10-23).
- Level-5 sheet (Nov 2023) with feats, traits and an explicit spell list: pathfinder_spells git history, commit 7d04e01, `caladrel_ecthelion/index.html`.
- Portrait: `caladrel.jpg`.
- Backstory and campaign notes: in `caladrel-ecthelion.md`.
- No GM-provided art, maps or logos. Do not invent campaign facts.

## Product Principles

1. The number he needs at the table is never more than one tap away.
2. Show the rule, not a link to the rule, for anything he casts.
3. Every figure traces to a source; anything derived or reconciled says so.
4. One character, deeply: knowledge of his build beats generic flexibility.

## Accessibility & Inclusion

Readable in low tabletop light on a phone; tap targets sized for play; works without JavaScript for reading.
