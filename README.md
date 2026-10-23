# Pathfinder

Character material for Caladrel Ecthëlion, an elf conjurer (Pathfinder 1e).

| File | What it is |
|---|---|
| `caladrel-ecthelion.md` | Full character sheet in plain markdown |
| `caladrel-ecthelion.homebrewery.md` | The same character as a [Homebrewery](https://homebrewery.naturalcrit.com/) brew |
| `caladrel.jpg` | Portrait, used by the brew |
| `site/` | Static HTML render of the brew, plus `caladrel-ecthelion.pdf` |

## Using the brew

1. Open <https://homebrewery.naturalcrit.com/new>.
2. In the **Properties** tab, set the renderer to **V3** and the theme to **5e PHB**.
3. Paste the contents of `caladrel-ecthelion.homebrewery.md` into the editor.
4. For A4 printing, add the **PRINT → A4 Pagesize** snippet, then print from Chrome with "Background graphics" on.

Homebrewery only loads images from the web, so the brew pulls the portrait from this repo's raw URL:
`https://raw.githubusercontent.com/sturlabragason/pathfinder/main/caladrel.jpg`

## Web page and PDF

`site/index.html` is a self-contained snapshot of the brew rendered by Homebrewery 3.24.2 (5e PHB theme), with the theme's CSS and fonts inlined under `site/assets/`. `site/caladrel-ecthelion.pdf` is printed from it (Letter, 5 pages).

It is served at <https://caladrel.sturlabragason.online> from the homelab, which pulls `site/` from this repo's `main` branch on pod start.

The snapshot does not update itself. After editing the brew, re-render it with a local Homebrewery and regenerate `site/`, or paste the brew into homebrewery.naturalcrit.com and print to PDF.
