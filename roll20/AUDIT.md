# Rules audit: race, traits, feats, class features and sheet maths

Audited 2026-10-31 against `caladrel-ecthelion.yaml` (pulled from Roll20 after the C10 Recalc). Rules quoted from d20pfsrd and Archives of Nethys; re-fetch any of them with `python3 tools/srd.py` (cached in `~/.cache/pf-srd`).

Legend: **OK** matches the rules and the sheet maths; **FIX** the sheet is wrong; **ASK** depends on a fact only Sturla or Flóki has.

## Race: elf with two alternate racial traits

Source: <https://www.d20pfsrd.com/races/core-races/elf/>

| Item | Rule (quoted) | Sheet | Verdict |
|---|---|---|---|
| Ability modifiers | Elf: +2 Dex, +2 Int, −2 Con | `dexterity_race` 2, `intelligence_race` 2, `constitution_race` −2 | OK |
| Moonkissed | "Elves with this alternate racial trait gain a +1 racial bonus on saving throws. This replaces elven immunities and keen senses." | +1 in each `*_misc` save, explained in the save notes | OK |
| Elven immunities (gone) | "Elves are immune to magic sleep effects and gain a +2 racial saving throw bonus against enchantment spells and effects." Replaced by Moonkissed. | No sleep immunity or +2 vs enchantment on the sheet | OK |
| Keen senses (gone) | "Elves receive a +2 racial bonus on Perception checks." Replaced by Moonkissed. | Perception 7 = 7 ranks + Wis 0, no racial bonus | OK |
| Overwhelming Magic | "These elves gain Spell Focus as a bonus feat. This racial trait replaces elven magic and weapon familiarity." | Spell Focus (Conjuration) as feat type `misc` | OK |
| Elven magic (gone) | +2 to beat spell resistance, +2 Spellcraft to identify magic item properties. Replaced by Overwhelming Magic. | No such bonus | OK |
| Weapon familiarity (gone) | Replaced by Overwhelming Magic | Weapons are dagger and light crossbow, both wizard proficiencies | OK |
| Low-light vision | Kept | Listed | OK |
| Speed | 30 ft. | 30 | OK |

## Traits

| Trait | Rule (quoted) | Sheet | Verdict |
|---|---|---|---|
| Warrior of Old (combat) | "You gain a +2 trait bonus on initiative checks." <https://aonprd.com/TraitDisplay.aspx?ItemName=Warrior%20of%20Old> | `initiative_misc` 6 = 2 + Improved Initiative 4; initiative 10 with Dex 4 | OK |
| Master of Pentacles (faction) | "Once per day, when casting a spell of the Conjuration school, treat your caster level as two higher when determining the spell's duration." <https://aonprd.com/TraitDisplay.aspx?ItemName=Master%20of%20Pentacles> | Same text, 1 use per day | OK |

Two traits from different categories (combat, faction): OK.

## Class: wizard 7, conjurer, Teleportation subschool

Source: <https://www.d20pfsrd.com/classes/core-classes/wizard/>

| Item | Rule | Sheet | Verdict |
|---|---|---|---|
| Hit die | "Hit Die: d6" | `class1_hitdietype` 6 | OK |
| BAB, saves | Wizard 7: BAB +3, Fort +2, Ref +2, Will +5 | 3 / 2 / 2 / 5 | OK |
| Skill ranks | "Skill Ranks per Level: 2 + Int modifier." | See skills below | OK (see below) |
| Scribe Scroll | "At 1st level, a wizard gains Scribe Scroll as a bonus feat." | Listed | OK |
| Bonus feat at 5th | "he can choose a metamagic feat, an item creation [feat], or Spell Mastery" (or an arcane discovery) | No feat fits | ASK (already C1) |
| Teleportation subschool | "The following school power replaces the acid dart power of the conjuration school. Shift (Su): At 1st level, you can teleport to a nearby space as a swift action … You can move 5 feet for every two wizard levels you possess … a number of times per day equal to 3 + your Intelligence modifier." <https://www.d20pfsrd.com/classes/core-classes/wizard/arcane-schools/paizo-arcane-schools/classic-arcane-schools/conjuration/teleportation/> | Shift 15 ft., `3+@{intelligence_mod}` = 9/day; sheet says move action | OK; action type is C4 |
| Summoner's Charm | Conjuration power; Teleportation replaces acid dart, not this. <https://www.d20pfsrd.com/classes/core-classes/wizard/arcane-schools/paizo-arcane-schools/classic-arcane-schools/conjuration/> | Listed | OK |
| Arcane bond (ring) | Once per day, cast any spell in the spellbook | 1 use | OK |

## Feats (7)

Slots: Overwhelming Magic 1, Scribe Scroll 1, levels 1/3/5/7 4, wizard bonus at 5 1 = 7.

| Feat | Prerequisite / benefit (quoted, AoN) | Verdict |
|---|---|---|
| Spell Focus (Conjuration) | racial bonus feat | OK |
| Greater Spell Focus (Conjuration) | "Prerequisites: Spell Focus." "This bonus stacks with the bonus from Spell Focus." | OK; DCs +2 via `spelldc_mod` |
| Augment Summoning | "Prerequisites: Spell Focus (conjuration)." "+4 enhancement bonus to Strength and Constitution" | OK |
| Combat Casting | "+4 bonus on concentration checks … when casting on the defensive or while grappled." | OK; toggle buff added (C12) |
| Eschew Materials | "any spell with a material component costing 1 gp or less" | OK |
| Improved Initiative | +4 initiative | OK |
| Scribe Scroll | wizard 1st-level bonus feat | OK |

## Sheet maths

| Value | Calculation | Sheet | Verdict |
|---|---|---|---|
| Abilities | Str 7, Dex 16+2, Con 14−2, Int 18+2+2 (headband), Wis 10, Cha 7 | 7 / 18 / 12 / 22 / 10 / 7 | OK |
| AC | 10 + Dex 4 + natural 1 (amulet) | 15, touch 14, flat-footed 11 | OK |
| CMB / CMD | 3 − 2 = 1; 10 + 3 − 2 + 4 = 15 | 1 / 15 | OK |
| Melee / ranged | 3 − 2 = 1; 3 + 4 = 7 | 1 / 7 | OK |
| Saves | Fort 2+1+3, Ref 2+4+3, Will 5+0+3 (misc 3 = Moonkissed 1 + cloak 2) | 6 / 9 / 8 | OK |
| Initiative | Dex 4 + trait 2 + feat 4 | 10 | OK |
| Concentration | CL 7 + Int 6 | 13 | OK |
| Spell DC | 10 + level + Int 6, +2 conjuration | 16+lvl, 18+lvl | OK |
| Slots per day | Wizard 7: 4/4/3/2/1; Int 22 bonus −/2/2/1/1; school slot 1st–4th | 4/7/6/4/3 | FIXED (D23): `caster1_spells_total_level_4` was 2 though `perday` was 3 |
| Encumbrance | Str 7: light 23 lb | 19.5 lb carried, light | OK |
| Dagger | 1d4, 19–20/×2, 10 ft. | same | OK |
| Light crossbow | 1d8, 19–20/×2, 80 ft., no Str | same | OK |
| HP | d6, rolled (Sturla, 2026-10-31); 6 at 1st + Con 1 × 7 + rolls for levels 2–7 + favored-class HP | 40, typed in | OK (rolls total 27, possible on 6d6) |

## Skills and the headband

Source: <https://www.d20pfsrd.com/magic-items/wondrous-items/h-l/headband-of-vast-intelligence/>

> "the headband grants a number of skill ranks in those skills equal to the wearer's total Hit Dice. These ranks do not stack with the ranks a creature already possesses."

> FAQ: "If I wear a headband of vast intelligence, do I get retroactive skill ranks for my Int increase in addition to the skill ranks associated with the item? No."

- Spellcraft: 1 own rank, headband gives 7 (not stacking) → 7 ranks + Int 6 + class skill 3 = 16. Total OK; the note says "+5 Ranks", now says +6 misc (7 headband ranks replace the 1 bought). **FIXED** (D23).
- Rank pool: Roll20 shows 56 = (2 + 6) × 7, using the headband's Int. By the FAQ it is (2 + 5) × 7 = 49 at most (less if Int was lower before the 4th-level increase), plus 1 per level of favored-class bonus spent on skills.
- Spent: 54 ranks (none above 7 per skill; class-skill +3 applied correctly on all 23 skills).
- 54 needs at least 5 favored-class points on skills. HP were rolled (Sturla, 2026-10-31), so 40 HP = 6 (1st) + 7 (Con) + 27 from six d6 rolls and any favored-class HP; that fits any split with 5–7 points on skills. **OK** (C16 closed, D25).
- Simplest reading: all 7 favored-class points on skills → pool 56, which is what Roll20 shows, with **2 ranks unspent**.
