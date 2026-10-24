---
name: Caladrel Ecthëlion
description: A wizard's character sheet and spellbook kept as a drawer of typed library index cards.
colors:
  oak-900: "#17110c"
  oak-800: "#21180f"
  oak-700: "#2e2216"
  oak-500: "#5a4430"
  brass: "#b8925a"
  brass-hi: "#e3c58c"
  brass-lo: "#6e5330"
  stock: "#f5f4ee"
  stock-shade: "#e9e7dd"
  feint: "rgba(86, 140, 186, 0.28)"
  head-rule: "#c23b2e"
  ink: "#1e1d22"
  ink-soft: "#4a4740"
  ink-red: "#a3261c"
  stamp: "#5b2b7e"
  guide-buff: "#e4cf9b"
  guide-salmon: "#e9a78e"
  guide-sage: "#abc19b"
  guide-cadet: "#97afc6"
  guide-lilac: "#c3b0d4"
  guide-ochre: "#d9b25f"
  sch-abjuration: "#24598a"
  sch-conjuration: "#0d6b5c"
  sch-divination: "#7a5c08"
  sch-enchantment: "#9c2c68"
  sch-evocation: "#b0301f"
  sch-illusion: "#4a3f9c"
  sch-necromancy: "#34343a"
  sch-transmutation: "#95501a"
  sch-universal: "#56636b"
typography:
  display:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: "2.25rem"
    fontFeature: "\"tnum\", \"lnum\""
  title:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.06em"
  body:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
    fontFeature: "\"tnum\", \"lnum\""
  label:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.08em"
  small:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.35rem"
rounded:
  mark: "2px"
  card: "3px"
  plate: "4px"
  tab: "7px 7px 0 0"
spacing:
  hair: "4px"
  tight: "6px"
  snug: "10px"
  gutter: "14px"
  card: "16px"
  line: "1.5rem"
components:
  index-card:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 16px 18px"
  guide-tab:
    backgroundColor: "{colors.guide-buff}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.tab}"
    padding: "7px 14px 6px"
    height: "40px"
  brass-plate:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.plate}"
    padding: "10px 18px 9px"
  level-guide:
    backgroundColor: "{colors.guide-cadet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "8px 14px 6px"
  key:
    backgroundColor: "{colors.stock-shade}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 10px"
    height: "44px"
    width: "44px"
  key-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
  key-ghost:
    textColor: "{colors.ink-soft}"
  field:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.mark}"
    padding: "8px 10px"
    height: "44px"
  stamp:
    textColor: "{colors.stamp}"
    typography: "{typography.label}"
    rounded: "{rounded.card}"
    padding: "3px 6px 2px"
  stamp-red:
    textColor: "{colors.ink-red}"
  school-mark:
    typography: "{typography.small}"
    rounded: "{rounded.mark}"
    padding: "1px 5px 0"
  slot-pip:
    rounded: "{rounded.mark}"
    size: "40px"
---

# Design System: Caladrel Ecthëlion

## Overview

**Creative North Star: "The Card Catalogue Drawer"**

The sheet is one drawer pulled from a library card catalogue. The page ground is oiled oak, dark and grained. On it stand index cards: cool white stock, a red head rule, pale blue feint lines that track every typed line. Coloured pressboard guide cards divide the drawer into sections, and a brass label holder names the drawer at the top. Every fact is typed on a card in one typewriter face. State, such as a cast spell, a used scroll or a dead companion, is shown with a violet rubber stamp. A stamp is added and the card underneath stays readable. Nothing is erased.

Density is that of a working reference card: one typed line (1.5rem) is the unit, values sit right-aligned behind dot leaders, and the most-rolled numbers sit in a ruled form on the first card. Colour carries meaning, not decoration. Each spell school has one ink, and that ink marks the school wherever the school appears. The guide-card hues tell sections apart. Red ribbon marks labels and warnings. Violet marks only stamped state.

The world rejects the parchment-and-Cinzel fantasy sheet, the Homebrewery/5e PHB look, and the dark dashboard of stat tiles. Motion is limited to one authored movement: a spell card unfolds in place to show its rules. Everything else is a short state transition.

**Key Characteristics:**
- Oiled-oak ground with physical card stock; cards cast real shadows because they are objects in a drawer.
- One typeface (Courier Prime) for every role, distinguished by size, weight and case only.
- Feint rules locked to the 1.5rem typed line.
- One ink per spell school; violet stamp ink only for state.
- Coloured guide tabs as the only navigation.
- A single authored motion: the card unfolds in place.

## Colors

The palette uses the materials of a library card drawer: dark oak, brass, white card stock, typewriter ribbon inks, pressboard guide-card tints, and a set of spell-school inks.

### Primary
- **Typewriter Ribbon Black** (ink): all typed text on card stock and on guide tabs; the pressed state of a key.
- **Card Stock White** (stock): the face of every index card, the brass plate's label slip, the record form's ground.

### Secondary
- **Red Ribbon** (ink-red): form labels, call numbers, fact labels in an unfolded spell, `h4` sub-heads, the low-HP numeral, the red stamp variant, the text caret and the focus ring inside cards. Emphasis and warning, never fill.
- **Head-Rule Red** (head-rule): the 2px rule under each card head and under an opened spell's header. It is a rule colour, not a text colour.
- **Feint Blue** (feint): the ruled lines under typed paragraphs, typed lists and spell facts. The record form and the DC table use the same blue at higher opacity (abjuration ink at 45%) for their cell rules.

### Tertiary
- **Violet Stamp Ink** (stamp): rubber stamps ("Cast", "Void", "From memory", "Opposed · 2 slots", "Check"), the X across a spent pip, the strike-through on cast spells and used scrolls.
- **School inks** (sch-abjuration through sch-universal): the spell name and its school mark on every spell card, and every place a spell is listed by school (preparation list, scroll kit). Set through `data-school`, read as `--sch`.

### Neutral
- **Oak Black / Oak / Oak Highlight / Oak Grain** (oak-900, oak-800, oak-700, oak-500): the drawer ground. It is a vertical gradient from oak-700 to oak-900 with two faint repeating grain gradients, fixed to the viewport. oak-900 is also the sticky tab rail's backdrop, the scrollbar track and the `theme-color`.
- **Brass / Brass Highlight / Brass Shadow** (brass, brass-hi, brass-lo): the label plate's gradient and rivets, the focus ring on the oak ground, links in the footer, and the scrollbar thumb.
- **Faded Ribbon** (ink-soft): secondary text such as notes, asides, short spell summaries, untrained skills, struck items, and HP max.
- **Shaded Stock** (stock-shade): the face of a key, and the hover state of a pip.
- **Guide-card pressboard** (guide-buff, guide-salmon, guide-sage, guide-cadet, guide-lilac, guide-ochre): one tint per section tab (Record buff, Spells cadet, Skills sage, Powers salmon, Kit ochre, Lore lilac). Level guides in the spellbook cycle cadet, buff and sage. Guide-buff is also the footer text colour on oak. Ochre is the text-selection colour.

### Named Rules
**The One Ink Per School Rule.** Each spell school has exactly one ink. Wherever a spell or school is named, it is set in that ink, through `data-school`. Never pick a school colour by hand, and never give a school a second hue.

**The Stamp Means State Rule.** Violet stamp ink records something that happened: a spell cast, a scroll used, a slot spent, or a note to check. Do not use it for decoration or emphasis. A stamp is added on top of the card. The item it marks stays visible and is struck through if needed, never removed.

**The Ribbon Rule.** Typed text on stock comes in black, faded black, red or a school ink. Red ribbon marks labels and warnings. It is never used for a large fill.

## Typography

**Display Font:** Courier Prime (with Courier New, monospace)
**Body Font:** Courier Prime
**Label/Mono Font:** Courier Prime

**Character:** A single typewriter face in regular, bold, italic and bold italic, self-hosted as woff2 under the SIL Open Font License (`site/fonts/OFL.txt`). Hierarchy comes from size, weight, uppercase and tracking, the way a typist would make it. Numerals are tabular and lining everywhere so columns of modifiers line up.

### Hierarchy
- **Display** (700, 1.5rem, 1.2, +0.04em): the drawer name on the brass plate. Used once per page.
- **Headline** (700, 1.75rem, 2.25rem): numeric values in the record form. The big cells (AC, touch, flat-footed) go to 2.25rem and current HP to 2.75rem. These two steps are local overrides, not tokens.
- **Title** (700, 1.125rem, 1.25, +0.06em, uppercase): card heads, spell names (+0.03em, in school ink), level guides.
- **Body** (400, 1rem, 1.5rem): typed card text, at most 70ch. Labels in key/value rows are regular weight and values are bold.
- **Label** (700, 0.8125rem, +0.08em, uppercase): guide tabs. Stamps use the same size with +0.14em tracking.
- **Small** (400, 0.8125rem, 1.35rem): call numbers, asides, notes, form labels (uppercase, +0.04em, red), spell summaries, school marks.

### Named Rules
**The One Face Rule.** Courier Prime is the only face. Do not add a display face, a sans for UI, or icon fonts. Make hierarchy with size, weight, case and tracking.

**The Typed Line Rule.** Body line height is one typed line (`--line`, 1.5rem). Paragraph spacing is one line. Feint rules are drawn at the line pitch so they sit under the text.

## Layout

Phone first. The page stacks from top to bottom: the brass plate (at most 34rem wide, centred); the guide-tab rail, sticky at the top and scrolling sideways on narrow screens; a 6px guide rule in the active section's tab colour; then the drawer. The drawer is a single-column grid of cards with a 14px gap, `min(100% - 20px, 64rem)` wide, with 64px bottom padding. Only one section is shown at a time.

At 720px and up, the drawer becomes two columns. The record card, the spellbook, powers, lore prose and the portrait card span both columns. The record form goes from 3 to 6 columns, with HP spanning 3 columns and 2 rows. Spell levels show their cards two per row. At 1100px and up, the drawer grows to 76rem, and the Spells section puts the preparation card in a sticky 24rem left column next to the book.

Inside cards, use 16px side padding, a 10px top and 6px bottom on the card head, 12px before a block that follows the head, and 6px between controls. Print uses A4 with 10mm margins. Cards flow in 2 columns and spell cards in 3. All controls, tabs and the ground are hidden, and every section is shown.

## Elevation & Depth

Depth is physical. The cards, plate and tabs are objects in a wooden drawer, so they cast soft, warm-black shadows on the oak. On the cards themselves, structure comes only from rules, never from shadow. The brass plate has bevel lighting from inset highlights and a recessed label slip. The guide tabs have a top highlight and sit lower when inactive.

### Shadow Vocabulary
- **Card on oak** (`box-shadow: 0 1px 1px rgba(0,0,0,.35), 0 6px 14px -4px rgba(0,0,0,.55)`): every index card.
- **Brass plate** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.35), 0 3px 8px rgba(0,0,0,.6)`): the drawer label holder. The label slip inside is recessed (`inset 0 1px 3px rgba(0,0,0,.35)`).
- **Guide tab** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 -1px 2px rgba(0,0,0,.4)`): the top-lit pressboard edge. Level guides use `inset 0 1px 0 rgba(255,255,255,.4), 0 2px 5px rgba(0,0,0,.45)`.
- **Key** (`box-shadow: 0 1px 0 rgba(30,29,34,.25)`): a one-pixel lip that disappears when the key is pressed.
- **Photograph** (`box-shadow: 0 2px 6px rgba(0,0,0,.35)`): the portrait print.

### Named Rules
**The Objects-Cast-Shadows Rule.** Only physical objects cast shadows: cards, plate, tabs, keys and the photograph. Text, rules and marks on a card are flat ink.

## Shapes

The shapes are mostly square, as cut paper is. Index cards have 3px corners and form fields 2px. School marks, pips and tags use 2px. Stamps have a 3px border radius and are tilted −6° (−4° in the scroll list). Their outline is roughened by a radial mask, and the ink blends with multiply. Guide cards are the only rounded shape: 7px top corners and square bottoms, so they read as tabs rising from the drawer. The brass plate has 4px corners and a rivet at each end. The portrait is a white-bordered print with a deeper bottom margin, tilted −1.5°. Borders are typed rules: 2px solid red under heads, 1px feint blue under lines, 2px dotted ink for dot leaders.

## Components

### Buttons (keys)
Typewriter-key buttons typed onto the card.
- **Shape:** squared (3px), at least 44 × 44px; a slim variant is 36px tall and 64px wide in small type.
- **Primary:** shaded stock face, ink text, bold body type, 1px ink border at 35%.
- **Hover / Focus:** the face turns white (0.15s, `--ease-out`). Pressing moves the key down 1px and removes its lip. Focus is a 2px red-ribbon ring offset 2px.
- **Pressed toggle:** an ink face with stock text (`aria-pressed="true"`).
- **Ghost:** transparent with faded-ribbon text and a lighter border, for secondary actions.
- **Disabled:** 45% opacity, not-allowed cursor.

### Chips (school marks and tags)
- **Style:** an outlined uppercase tag in the school's ink (1px currentColor, 2px corners, small type). Class-skill (`cs`, conjuration ink) and trait (`tr`, red) tags follow the same pattern at 0.6875rem.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** card stock.
- **Shadow Strategy:** card on oak (see Elevation & Depth).
- **Border:** none. The card head has a 2px head-rule red underline.
- **Internal Padding:** 16px sides and 18px bottom. The head is a three-part row: call number (red, small) on the left, uppercase title in the middle, aside or stamp on the right.
- **Typed lists:** key/value rows with a dotted leader, values bold and right-aligned, each row on a feint rule.
- **Record form:** a ruled grid of cells with blue rules. Each cell has a red uppercase label over a large bold value.

### Inputs / Fields
- **Style:** white field, 1px ink border at 40%, 2px corners, 8px × 10px padding, at least 44px tall, body type. The caret is red ribbon and the placeholder is `#6b675d`.
- **Focus:** a 2px red-ribbon outline offset 2px, the same ring as every focus on a card.

### Navigation (guide tabs)
- **Style:** a sticky horizontal rail of pressboard tabs, each in its section tint (`--tab`), with bold uppercase small type tracked +0.08em, at least 40px tall. Tabs alternate by 3px in height so the rail looks staggered.
- **States:** inactive tabs sit 6px low and are dulled (saturate .75, brightness .86). On hover they rise to 3px. The current tab (`aria-current="page"`) sits at full height in full colour, and the guide rule under the rail takes its tint (`--tab-active`). Transitions are 0.25s `--ease-out`.
- **Mobile:** the rail scrolls sideways with its scrollbar hidden.

### Spell card (signature)
The spell card is a whole card that works as a button. Its call number and spell name are in the school ink, with a school mark and a one-line summary below. Stamps for state ("From memory", "Opposed · 2 slots") sit in the top-right corner. Tapping the card runs the one authored motion: the body unfolds in place (grid rows from 0fr to 1fr, 0.45s `cubic-bezier(.16, 1, .3, 1)`), the header gets its red head rule, and the chevron turns 180°. The unfolded body is a ruled facts list with red labels and bold values, a DC line and the rules text. With reduced motion, the unfold is instant.

### Rubber stamp
Violet bold uppercase small type tracked +0.14em, inside a 2px border. It is tilted −6°, set at 88% opacity, blended with multiply, and its edges are roughened by a mask. The red variant is for a disabled HP state and dead companions.

### Slot pip
A 40px white box with a 1.5px ink border. A spent pip is stamped with a violet X. Small inline slot counters use 12px boxes that fill with ink when full.

### Brass label plate
A brass gradient plate with a rivet at each end, holding a recessed card-stock slip with the drawer name (display) and the character line (small, faded ribbon).

### Portrait print
A white-bordered photograph, 8px on three sides and 30px at the bottom, tilted −1.5°, at most 300px wide. The image is `site/caladrel-720.jpg`, a resized derivative of `caladrel.jpg` (Sturla's own portrait of the character). It is the only raster on the card-catalogue sheet. The legacy pages in `site/homebrewery/` are not part of this system.

## Do's and Don'ts

### Do:
- **Do** put every fact on an index card: stock face, red head rule, call number, uppercase title.
- **Do** set every spell name and school mark through `data-school`, so the One Ink Per School Rule holds.
- **Do** record state with a violet stamp, a struck line or a stamped pip, and keep the underlying item visible.
- **Do** keep body text on the 1.5rem typed line, with feint rules at the same pitch.
- **Do** keep tap targets at least 44px (pips 40px, guide tabs 40px tall).
- **Do** use the card unfold (0.45s, `--ease-out`) as the only authored motion, and respect `prefers-reduced-motion`.

### Don't:
- **Don't** use parchment textures, Cinzel or other fantasy display faces, or the Homebrewery/5e PHB look.
- **Don't** build a dark dashboard of stat tiles. Numbers belong in a ruled form on a card.
- **Don't** add a second typeface or an icon font. Any icon is an inline SVG drawn with `currentColor`, such as the chevron.
- **Don't** use violet stamp ink for anything other than state.
- **Don't** add new motion: no entrance animations, parallax or scroll effects.
