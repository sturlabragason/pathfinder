# Pathfinder

Character material for Caladrel Ecthëlion, an elf conjurer (Pathfinder 1e).

| File | What it is |
|---|---|
| `caladrel-ecthelion.md` | Full character sheet in plain markdown (source of truth) |
| `site/` | The online sheet, served at <https://caladrel.sturlabragason.online> |
| `site/caladrel-ecthelion.pdf` | Printable copy of the online sheet (A4) |
| `site/homebrewery/` | The old Homebrewery render and its PDF, kept for reference |
| `caladrel-ecthelion.homebrewery.md` | The character as a [Homebrewery](https://homebrewery.naturalcrit.com/) brew (no longer the main sheet) |
| `caladrel.jpg` | Portrait |
| `PRODUCT.md`, `DESIGN.md` | What the sheet is for, and its design system |

## The online sheet

`site/` is plain HTML, CSS and JavaScript with no build step. It is drawn like a pen-and-paper character sheet (the 5e/AD&D sheet layout): boxes with labels under each field, ability ovals, an AC shield, bubbles for skills, and a 5e-style spell sheet. See `DESIGN.md`.

- `index.html`: the sheet. Tabs: Character, Spells, Features, Equipment, Backstory.
- `sheet.js`: behaviour. Hit points, per-day uses, prepared spells, casts and used scrolls are saved in the browser (`localStorage`), so each device keeps its own play state. **Begin a new day** clears casts, per-day uses and temporary hit points.
- `paper.css`: the shared design system, also used by [pathfinder_spells](https://github.com/sturlabragason/pathfinder_spells). Keep the two copies the same.
- `fonts/`: Alegreya Sans, Alegreya Sans SC and Alegreya SC (SIL OFL).
- `sheet.css`: layout for this page, including print styles.
- `data/spellbook.json`: offline copy of the spellbook.

The Spells tab loads the live spellbook from <https://sturlabragason.github.io/pathfinder_spells/caladrel_ecthelion/spellbook.json> and falls back to `data/spellbook.json`. Spell links go to d20pfsrd.com; pathfinder_spells checks each URL against the d20pfsrd sitemap. To learn a spell, add it to `caladrel_ecthelion/spellbook.txt` in pathfinder_spells and run `scripts/update_spells.py`; then copy the new JSON into `site/data/`.

The homelab serves `site/` from this repo's `main` branch and pulls it again when the pod restarts. Bump the `?v=` query on the CSS and JS links in `index.html` after changes, because Cloudflare caches them.

To regenerate the PDF, print `site/index.html` from Chrome (A4, background graphics on), or use puppeteer `page.pdf` with `printBackground: true`.
