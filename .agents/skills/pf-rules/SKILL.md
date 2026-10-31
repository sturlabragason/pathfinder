---
name: pf-rules
description: Look up and quote Pathfinder 1e rules (spells, feats, traits, racial traits, class features, magic items) for Caladrel Ecthëlion, with a cached fetcher so pages are not re-downloaded. Use when checking whether the Roll20 sheet is rules-correct, answering a rules question, writing spell/gear notes, or recording a finding in roll20/AUDIT.md.
---

# Pathfinder rules lookup

Never state a rule from memory when it decides a number on the sheet. Look it up, quote it, cite the URL.

## Order of sources

1. **Already local, no fetch:**
   - Spell data (level, school, range, duration, save, full text, d20pfsrd URL): `../pathfinder_spells/caladrel_ecthelion/spellbook.json` (his 110 spells); every wizard spell: `../pathfinder_spells/spells.tsv`.
   - Rulings already made: `roll20/AUDIT.md` (quoted rules for race, traits, class, feats, sheet maths) and `roll20/CHECKLIST.md` (D-rows = decisions, incl. house rules).
   - Roll20 sheet guide and v1.303 source: the wiki via brave-agent (Cloudflare blocks curl).
2. **Cached fetch:** `python3 tools/srd.py` (cache `~/.cache/pf-srd`, `cached` lists what is there).
3. d20pfsrd first (house rule: links go to d20pfsrd); Archives of Nethys when d20pfsrd lacks the page, and for traits.

```bash
python3 tools/srd.py aon feat "Combat Casting" --find Benefit --width 300
python3 tools/srd.py aon trait "Warrior of Old" --find initiative
python3 tools/srd.py get https://www.d20pfsrd.com/races/core-races/elf/ --find Moonkissed
python3 tools/srd.py cached
```

Pipe through `sed -n 2p` to print only the first passage. `--find` is case-insensitive; widen with `--width`.

## Known URLs (verified 2026-10-31)

| Topic | URL |
|---|---|
| Elf, alternate racial traits, favored class options | https://www.d20pfsrd.com/races/core-races/elf/ |
| Wizard (HD, ranks, bonus feats) | https://www.d20pfsrd.com/classes/core-classes/wizard/ |
| Conjuration school | https://www.d20pfsrd.com/classes/core-classes/wizard/arcane-schools/paizo-arcane-schools/classic-arcane-schools/conjuration/ |
| Teleportation subschool (Shift) | same path + `teleportation/` |
| Headband of Vast Intelligence (+FAQ) | https://www.d20pfsrd.com/magic-items/wondrous-items/h-l/headband-of-vast-intelligence/ |
| Scrolls (CL table) | https://www.d20pfsrd.com/magic-items/scrolls/ |
| Item save DCs | https://www.d20pfsrd.com/magic-items/ (find "ability modifier") |
| Feats, traits | `srd.py aon feat NAME`, `srd.py aon trait NAME` |

Dead ends, do not retry: `aonprd.com/ArcaneSchoolsDisplay.aspx` (404), d20pfsrd `…/favored-class/` (404). AoN pages start with a long menu: always use `--find`.

## Rules that tripped agents before

- Headband of Vast Intelligence: its Int bonus gives **no** extra ranks per level (FAQ); it gives ranks = Hit Dice in its fixed skill, not stacking with bought ranks.
- Teleportation's Shift replaces **acid dart**, not summoner's charm; it is a **swift** action, 3 + Int uses.
- Moonkissed replaces elven immunities and keen senses (no +2 Perception, no sleep immunity). Overwhelming Magic replaces elven magic and weapon familiarity (no +2 Spellcraft to identify items).
- Scroll defaults: lowest caster level for the spell level (wizard 1st → CL 1, 2nd → CL 3, 3rd → CL 5); save DC 10 + spell level + minimum Int mod (1st DC 11, 2nd DC 13).
- Wizard bonus feats (5th, 10th, …): metamagic, item creation, Spell Mastery or an arcane discovery only.

## Writing a finding

Add a row to `roll20/AUDIT.md`: item, the rule as a short quote, the URL, the sheet value, verdict (OK / FIX / ASK). FIX goes to Roll20 only with Sturla's go-ahead (see `roll20-sheet`). ASK goes to `roll20/CHECKLIST.md` as an open C-item.
