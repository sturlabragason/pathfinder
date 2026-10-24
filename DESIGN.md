---
name: Caladrel Ecthëlion
description: A wizard's character sheet and spellbook drawn as a pen-and-paper RPG character sheet.
colors:
  desk: "#d9d5cc"
  paper: "#fffefa"
  ink: "#1b1a19"
  ink-2: "#4a4744"
  rule: "#8d8a85"
  hair: "#c9c5bd"
  grey: "#ebe8e1"
  grey-2: "#dcd8cf"
  accent: "#7e1d18"
  focus: "#1d4f8c"
typography:
  body: "Alegreya Sans 400/700/800"
  labels: "Alegreya Sans SC 500/700/800"
  display: "Alegreya SC 700/800 (character name, section heads)"
  scale: "0.75 / 0.875 / 1 / 1.25 / 1.75 / 2.5 rem"
---

# Design: Caladrel's sheet

## Direction

The sheet looks like the printed pen-and-paper character sheet players fill in with a pencil: the 5e sheet's layout language, which itself descends from the AD&D sheets. Sturla asked for this on 2026-10-24 after rejecting Homebrewery and then the card-catalogue design.

- White stock on a warm grey desk. Black rule work, 2px strokes.
- Boxes have scooped corners (`corner-shape: scoop` where supported, rounded corners elsewhere).
- Every field has its label **below** it, set in small caps (Alegreya Sans SC), as on the paper sheet.
- Ability scores: the modifier large in the box, the score in an oval that overlaps the bottom border. Intelligence, his casting ability, is shaded grey.
- Armor class sits in a shield. Initiative and speed sit in square boxes beside it, inside a grey rounded panel with hit points, hit dice and CMB.
- Saves and skills are rows of bubbles and value lines. A filled bubble is a class skill with ranks; a small boxed **T** marks trained-only skills.
- Attacks are a table with grey row bands.
- Colour is reserved: one dark red (`accent`) for warnings, opposed-school notes and "not recorded". No school colours.

## Spells page

Modelled on the 5e spell sheet:

- Each spell level is a box headed by a circled level number, a "Slots" box and a row of slot ticks (grey = prepared, black = expended).
- Each spell is a line: tap the bubble to prepare it, **+** to prepare another copy, a square to mark a cast (an X), the name to unfold the stat block, save DC and full rules.
- Opposed-school spells (enchantment, divination) say "2 slots" and use two slot ticks.
- Every spell links to its d20pfsrd page. The URL comes from `spellbook.json` (`url`, with `link_source`), which pathfinder_spells verifies against the d20pfsrd sitemap.

## Files

- `site/paper.css`: tokens and components (box, panel, shield, pill, lines, bubbles, pips, tabs, buttons). Shared with pathfinder_spells; keep the copies the same.
- `site/sheet.css`: layout for the five pages and print.
- `site/fonts/`: Alegreya Sans, Alegreya Sans SC and Alegreya SC by Huerta Tipográfica, SIL Open Font License (`OFL.txt`), latin and latin-ext subsets.

## Layout

- Phone (default): one column. Abilities as a 3×2 grid at the top, then combat, then saves and skills, then casting.
- 720px: two columns, abilities in a row of six.
- 1100px: the paper sheet's four columns: abilities down the left edge, skills, combat, spellcasting.
- Features, Equipment and Backstory use two balanced CSS columns from 900px.
- Print (A4): all five pages, one per sheet, no controls, spell details folded.

## Rules

- Text is at least 11px. Tap targets are at least 30px, with invisible padding on the small boxes.
- `[hidden]` always wins (`display: none !important`).
- Tabs are links to `#character`, `#spells`, `#features`, `#gear`, `#story`. Section ids are `s-<name>` so the browser doesn't jump.

## Imagery

- `site/caladrel-720.jpg` is a resized copy of `caladrel.jpg`, Sturla's own portrait of the character. It is the only raster on the sheet. The legacy pages in `site/homebrewery/` are not part of this system.
