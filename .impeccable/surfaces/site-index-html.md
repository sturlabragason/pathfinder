---
version: 2
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: ["site/paper.css", "site/sheet.css", "site/sheet.js"]
---

# Surface: Caladrel's sheet (site/index.html)

Mode: Operate (at the table, phone first); Read for the Backstory page.
Audience/job: Sturla mid-session needs a number or a spell rule in one tap; between sessions he prepares spells.
Constraints: static, no build, offline-tolerant, localStorage only, noindex. Spell data comes from pathfinder_spells (spellbook.json), with a bundled copy. Spell links go to d20pfsrd.
Unresolved: level-7 feat and the two level-7 free spells are unrecorded; 4th-level slots: rules give 3 where the earlier sheet said 2.

## Direction contract

THESIS: The pen-and-paper character sheet, the 5e layout that descends from AD&D: white stock, black rule work, labels under every field, ability ovals, AC shield, bubbles, and a 5e spell sheet. Requested by Sturla on 2026-10-24, replacing the card-catalogue design he rejected.

FIRST VIEWPORT: Phone: name box and bio fields, the five page tabs, then the six ability boxes and the grey combat panel (AC shield, initiative, speed, HP).

FINISH: DESIGN.md describes this system; review screenshots in `.impeccable/review/`.
