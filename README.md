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

`site/` is plain HTML, CSS and JavaScript with no build step. It is styled as a library card catalogue: one index card per block, coloured guide tabs, one ink per spell school, Courier Prime throughout.

- `index.html`: the sheet. Tabs: Record, Spells, Skills, Powers, Kit, Lore.
- `sheet.js`: behaviour. Hit points, per-day pips, prepared spells, cast stamps and scroll stamps are saved in the browser (`localStorage`), so each device keeps its own play state. **New day** clears the day's stamps.
- `catalog.css`: the shared design system, also used by [pathfinder_spells](https://github.com/sturlabragason/pathfinder_spells). Keep the two copies the same.
- `sheet.css`: layout for this page, including print styles.
- `data/spellbook.json`: offline copy of the spellbook.

The Spells tab loads the live spellbook from <https://sturlabragason.github.io/pathfinder_spells/caladrel_ecthelion/spellbook.json> and falls back to `data/spellbook.json`. To learn a spell, add it to `caladrel_ecthelion/spellbook.txt` in pathfinder_spells and run `scripts/update_spells.py`; then copy the new JSON into `site/data/`.

The homelab serves `site/` from this repo's `main` branch and pulls it again when the pod restarts. Bump the `?v=` query on the CSS and JS links in `index.html` after changes, because Cloudflare caches them.

To regenerate the PDF, print `site/index.html` from Chrome (A4, background graphics on), or use puppeteer `page.pdf` with `printBackground: true`.
