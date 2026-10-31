# Roll20 sync

Roll20 (campaign Ruthol) holds the real sheet. `caladrel-ecthelion.yaml` is a mirror of it.

```bash
brave-agent                          # Brave with the agent profile, signed in to Roll20
python3 roll20/sync.py pull          # Roll20 -> caladrel-ecthelion.yaml
python3 roll20/sync.py diff          # what you changed locally, and what changed in Roll20
python3 roll20/sync.py push --apply  # write your changes, then re-read and confirm them
```

- `fields` are sheet attributes, `lists` are the repeating sections (feats, gear, `spell-0` to `spell-4`, abilities, attacks, buff...). Each list item is one row, keyed by `_id`.
- Edit inputs (`*_base`, `*_ranks`, `*_misc`, `caster1_level`...), not totals; the sheet recalculates totals.
- New row: add an item without `_id`. Rows deleted from the YAML are reported and left in Roll20.
- Push only sends fields you changed since the last pull, and stops if Roll20 changed the same field meanwhile.
- `.base.json` (git-ignored) is the state of the last pull; push needs it.
- It reads and writes through the game page's own data model, which is not a public API. A Roll20 update can break it.
- Roll20 keeps a stale second copy of 956 attributes; the tool reads and writes the first copy, which the sheet shows.

Open items from the 2026-10-31 comparison: `CHECKLIST.md`.
