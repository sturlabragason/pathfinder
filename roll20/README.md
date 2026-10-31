# Roll20 sync

Roll20 (campaign Ruthol) holds the real sheet. `caladrel-ecthelion.yaml` is a mirror of it.

```bash
brave-agent                          # Brave with the agent profile, signed in to Roll20
python3 roll20/sync.py pull          # Roll20 -> caladrel-ecthelion.yaml
python3 roll20/sync.py diff          # what you changed locally, and what changed in Roll20
python3 roll20/sync.py push --apply  # write your changes, then re-read and confirm them
python3 roll20/sync.py recalc        # press the sheet's Recalc button, then pull (run after every push)
python3 roll20/sync.py check         # offline: totals, spell DCs, uses per day that disagree with the sheet's formulas
python3 roll20/sync.py site          # offline: rewrite site/data/sheet.js from the YAML (pull, push --apply and recalc do it too)
```

- `fields` are sheet attributes, `lists` are the repeating sections (feats, gear, `spell-0` to `spell-4`, abilities, attacks, buff...). Each list item is one row, keyed by `_id`.
- Edit inputs (`*_base`, `*_ranks`, `*_misc`, `caster1_level`...), not totals. A push does not run the sheet's calculations; `recalc` does, and rebuilds every spell roll card from its fields.
- Spell DCs: never type `spelldc`. Set `spelldc_mod` per spell (2 for conjuration: Spell Focus + Greater Spell Focus) and let Recalc compute it.
- Spell damage and notes can hold roll formulas (`[[{@{caster1_level},5}kl1]]d6`); notes show on the roll card.
- Sheet guide (v1.303): https://wiki.roll20.net/Pathfinder_Official and its Roll Templates subpage.
- New row: add an item without `_id`. Rows deleted from the YAML are reported and left in Roll20.
- Push only sends fields you changed since the last pull, and stops if Roll20 changed the same field meanwhile.
- `.base.json` (git-ignored) is the state of the last pull; push needs it.
- It reads and writes through the game page's own data model, which is not a public API. A Roll20 update can break it.
- Roll20 keeps a stale second copy of 956 attributes; the tool reads and writes the first copy, which the sheet shows.

Open items from the 2026-10-31 comparison: `CHECKLIST.md`.
