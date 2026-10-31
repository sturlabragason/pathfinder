---
name: roll20-sheet
description: Read, check or edit Caladrel Ecthëlion's character sheet in Roll20 (campaign Ruthol) through the brave-agent browser and roll20/sync.py (pull, diff, push). Use when the user asks what is on the Roll20 sheet, wants to change it, level up, add spells/feats/gear, or compare the repo with Roll20.
---

# Roll20 sheet (Caladrel Ecthëlion)

Roll20 is the source of truth for the character. The repo files (`caladrel-ecthelion.md`, `site/`, the spellbook in pathfinder_spells) were built from Roll20 PDFs and pastes, and agents have added errors to them. Check claims against Roll20, not against the repo.

| Thing | Value |
|---|---|
| Campaign | Ruthol, id 9745396; Sturla is a player, not GM (no Mod/API scripts) |
| Character id | `-NFVT-hcPg_9VIgVZFh1` (sheet `pathfinderofficial` v1.303) |
| Also controlled | Bren Di'Joer `-OJOYPqWN0FjPWFFOJmx` (not this repo's character) |
| Mirror | `roll20/caladrel-ecthelion.yaml` |
| Tool | `roll20/sync.py` |
| Open items | `roll20/CHECKLIST.md` |

## Use

```bash
brave-agent                          # Brave agent profile; Roll20 login persists there
python3 roll20/sync.py pull          # Roll20 -> YAML; refuses if there are unpushed local edits
python3 roll20/sync.py diff          # local edits since the pull + changes made in Roll20 since then
python3 roll20/sync.py push --apply  # writes, re-reads, confirms
```

If the browser has no Roll20 session, the login page shows (after a Cloudflare check that passes by itself). Ask Sturla to sign in in the Brave window; never type the password.

## Rules

- Never write to Roll20 without Sturla's go-ahead for the specific change. Show `sync.py diff` output first.
- Edit inputs (`*_base`, `*_ranks`, `*_misc`, `caster1_level`, list rows), not totals; the sheet recalculates totals. Whether sheet workers recalculate after a write from this tool is not yet verified: after the first real push, open the sheet and check the totals.
- Only `push` sends edits; deleting a row from the YAML does not delete it in Roll20.

## How it works

- No public Roll20 API for players. The game page (`app.roll20.net/editor`) holds `window.Campaign`, a Backbone model: `Campaign.characters.get(id).attribs` are the attributes; `model.save({current, max})` writes and syncs like a click on the sheet.
- Repeating rows are attributes named `repeating_<section>_<rowid>_<field>`; order is in `_reporder_repeating_<section>`. Sections: `feats`, `abilities` (race, traits, class features), `gear`, `attacks`, `buff`, `acitems`, `skillcraft`, `spell-0` to `spell-4`.
- 956 attributes exist twice; the second copy holds defaults (level 1, Int 10, HP 0). The sheet shows the first copy; the tool reads and writes the first copy only.
- Row ids start with a base-64 millisecond timestamp (alphabet `-0-9A-Z_a-z`, first 8 chars), so you can tell when a row was added. That dated the level-7 picks: Augment Summoning, Black Tentacles and Summon Monster IV, all on 2024-12-14.

## Pathfinder facts that tripped agents before

- Feats: Spell Focus (Conjuration) is a free racial feat (Overwhelming Magic); Scribe Scroll is the free wizard feat. Then general feats at 1, 3, 5, 7 plus the wizard bonus feat at 5. All slots are filled; do not tell Sturla a feat is missing without counting these.
- The 4th-level spells are Black Tentacles and Summon Monster IV. Acid Pit, Dimension Door and the Dimensional Agility feat in the repo came from a wrong "missing" claim.
- "Handanvaldur" is Icelandic for conjurer, not an archetype.
- Warrior of Old is the trait (+2 initiative); "Reactionary" in the Roll20 initiative notes is an old label.
