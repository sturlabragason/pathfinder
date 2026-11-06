# Pathfinder

Character material for Caladrel Ecthëlion, an elf conjurer (Pathfinder 1e).

| File | What it is |
|---|---|
| `caladrel-ecthelion.md` | Full character sheet in plain markdown (source of truth) |
| `roll20/` | Mirror of the Roll20 sheet as YAML, with pull/diff/push (`roll20/README.md`) and an open-items checklist |
| `roll20/AUDIT.md` | Rules audit of race, traits, feats, class features and sheet maths, with quoted sources |
| `tools/srd.py` | Cached rules lookup on d20pfsrd and Archives of Nethys (`pf-rules` skill) |
| `site/` | The online sheet, served at <https://caladrel.sturlabragason.online> |
| `site/caladrel-ecthelion.pdf` | Printable copy of the online sheet (A4) |
| `site/homebrewery/` | The old Homebrewery render and its PDF, kept for reference |
| `caladrel-ecthelion.homebrewery.md` | The character as a [Homebrewery](https://homebrewery.naturalcrit.com/) brew (no longer the main sheet) |
| `caladrel.jpg` | Portrait |
| `PRODUCT.md`, `DESIGN.md` | What the sheet is for, and its design system |

## The online sheet

`site/` is plain HTML, CSS and JavaScript with no build step. It is drawn like a pen-and-paper character sheet (the 5e/AD&D sheet layout): boxes with labels under each field, ability ovals, an AC shield, bubbles for skills, and a 5e-style spell sheet. See `DESIGN.md`.

- `index.html`: the sheet. Tabs: Character, Spells, Features, Equipment, Backstory.
- `sheet.js`: behaviour. Hit points, per-day uses, prepared spells, casts, used scrolls and active buffs and conditions are saved in the browser (`localStorage`), so each device keeps its own play state. **Move to another device** (Character tab) copies a link with the state compressed into its hash (`#state=…`); opening it on another device asks before replacing that device's state. **Begin a new day** clears casts, per-day uses, buffs, conditions and temporary hit points. Buffs and conditions (Character tab) recompute AC, saves, attacks, CMB/CMD and speed; changed numbers turn red.
- `paper.css`: the shared design system, also used by [pathfinder_spells](https://github.com/sturlabragason/pathfinder_spells). Keep the two copies the same.
- `fonts/`: Alegreya Sans, Alegreya Sans SC and Alegreya SC (SIL OFL).
- `sw.js`, `manifest.json`, `icon-*.png`: offline support and "Add to home screen". The service worker fetches pages, scripts, styles and data from the network first and falls back to its cache when offline or after 3.5 s; fonts and images come from the cache. `sheet.js` registers it as `sw.js?v=<sheet.js ?v>`, and the cache is named after that number, so bumping `sheet.js?v=` also drops the old cache.
- `sheet.css`: layout for this page, including print styles.
- `data/spellbook.json`: offline copy of the spellbook.

On the Spells tab a sticky bar shows the prepared slots left at each level and the arcane bond use; an open spell has **Cast** and **Cast with arcane bond** buttons.

The Spells tab loads the live spellbook from <https://sturlabragason.github.io/pathfinder_spells/caladrel_ecthelion/spellbook.json> and falls back to `data/spellbook.json`. Spell links go to d20pfsrd.com; pathfinder_spells checks each URL against the d20pfsrd sitemap. To learn a spell, add it to `caladrel_ecthelion/spellbook.txt` in pathfinder_spells and run `scripts/update_spells.py`; then copy the new JSON into `site/data/`.

The sheet's numbers (abilities, saves, AC, attacks, DCs, slots, skills, uses per day, money, load, scrolls) come from `site/data/sheet.js`, which `roll20/sync.py` writes from the Roll20 YAML on every pull, push and recalc (or `sync.py site`). Elements with `data-f="path"` in `index.html` take their text from it; the literal values in the HTML are only fallbacks. Prose (feat and power descriptions) is hand-written.

The homelab serves `site/` from this repo's `main` branch and pulls it again when the pod restarts. Bump the `?v=` query on the CSS and JS links in `index.html` after changes, because Cloudflare caches them.

To regenerate the PDF, print `site/index.html` from Chrome (A4, background graphics on), or use puppeteer `page.pdf` with `printBackground: true`.
