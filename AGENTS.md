# AGENTS.md: pathfinder

Character material for Caladrel Ecthëlion, an elf conjurer (Pathfinder 1e, wizard 7), played by Sturla in the Roll20 campaign Ruthol. See `README.md` for the files.

## Source of truth

1. **Roll20** is the real sheet. Read and change it with the `roll20-sheet` skill (`.agents/skills/roll20-sheet/`) and `roll20/sync.py`.
2. `roll20/caladrel-ecthelion.yaml` is a mirror of Roll20. Pull before reading it.
3. `caladrel-ecthelion.md`, `site/` and the spellbook (`site/data/spellbook.json`, from sturlabragason/pathfinder_spells) were made from Roll20 PDFs and pastes and contain agent errors. They have not yet been rechecked against Roll20; open items are in `roll20/CHECKLIST.md`.

When you state something about the character (a feat is missing, a number is wrong), check it in Roll20 first and count every source (racial and class bonus feats included).

## Rules

- No writes to Roll20 without Sturla's go-ahead for that change; show `python3 roll20/sync.py diff` first.
- Show a draft and get approval before commits or pushes.
- `site/`: bump the `?v=` query on CSS/JS links in `index.html` after changes (Cloudflare caches them). Keep `paper.css` identical to the copy in pathfinder_spells.
- Spell links go to d20pfsrd.com; Archives of Nethys only where d20pfsrd has no page.
