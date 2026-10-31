# Roll20 sheet checklist: Caladrel Ecthëlion

Comparison of the Roll20 sheet (campaign Ruthol) with the repo, 2026-10-31. Roll20 is the source of truth.
Tick an item when it is resolved. ("Handanvaldur" is Icelandic for conjurer.)

## Feats (7 slots, 7 feats in Roll20)

| Slot | Source | Roll20 feat |
|---|---|---|
| Racial | Overwhelming Magic (elf, replaces elven magic and weapon familiarity) | Spell Focus (Conjuration) |
| Wizard 1 | free wizard feat | Scribe Scroll |
| Level 1 | general | one of the four below |
| Level 3 | general | one of the four below |
| Level 5 | general | one of the four below |
| Level 5 | wizard bonus feat (metamagic, item creation or Spell Mastery) | one of the four below |
| Level 7 | general | Augment Summoning |

The four: Greater Spell Focus (Conjuration), Improved Initiative, Combat Casting, Eschew Materials.

When rows were added (decoded from the Roll20 row ids, local time):

| Date | Added | Reading |
|---|---|---|
| 2022-11-01/02 | Spell Focus, Greater Spell Focus, Improved Initiative, Scribe Scroll, Combat Casting, Eschew Materials, all race and class abilities | Character built at level 5 |
| 2023-11 to 2024-02 | 3rd level: Gaseous Form, Shifting Sand, Heroism, Blink, Displacement | Bought or copied between levels |
| 2024-09-20 | Sleet Storm | Level 6 (Shift became 15 ft that night). Only one new spell that day |
| 2024-12-14 20:08-20:45 | Augment Summoning, Summon Monster IV, Black Tentacles | Level 7, at the start of that session |

Work through the open items one at a time by ID. When one is resolved, move it to Done with the date and what changed.

## Open

| ID | Area | Item | Next step |
|---|---|---|---|
| C1 | Feats | Level-5 wizard bonus feat: none of Greater Spell Focus, Improved Initiative, Combat Casting or Eschew Materials is metamagic, item creation or Spell Mastery. | Ask Flóki which feat fills the slot, or whether it was a GM allowance. |
| C4 | Abilities | Shift: Roll20 says move action; APG says swift ("as if using dimension door", ends your turn). GM ruled on 2023-01-28 (r/Pathfinder_RPG b5tvnf) that it ends your turn. The Roll20 text changed to "move" around 2023-11-18. Sturla vaguely remembers changing it on the GM's request. | **Review later.** Confirm with Flóki; then note it as a Ruthol house ruling or revert to "swift". Don't change Roll20 until then. |
| C5 | Other | 956 attributes exist twice in Roll20; the hidden second copy holds default values (level 1, Int 10, HP 0). Harmless for play. | Optional cleanup so tools read the right copy. |

## Done

| ID | Date | What changed |
|---|---|---|
| D1 | 2026-10-31 | Level-7 feat is Augment Summoning; Dimensional Agility removed from the repo (md, site, PDF). |
| D2 | 2026-10-31 | 4th-level spells are Black Tentacles and Summon Monster IV; Acid Pit and Dimension Door removed from the repo and the pathfinder_spells spellbook (not yet pushed). |
| D3 | 2026-10-31 | Cloak of Resistance +2 confirmed. Roll20 saves misc 2 -> 3, totals Fort +6 / Ref +9 / Will +8; each save note lists every source (base, ability, Moonkissed +1, cloak +2). |
| D4 | 2026-10-31 | Roll20 caster level 6 -> 7 (concentration total 16 -> 17 to match). |
| D5 | 2026-10-31 | Roll20 4th-level slots 2 -> 3 (1 base + 1 Int 22 + 1 school). |
| D6 | 2026-10-31 | Roll20 initiative note: "Warrior of Old +2 (trait), Improved Initiative +4 (feat)" (was "Reactionary +2"). |
| D7 | 2026-10-31 | Roll20 Master of Pentacles type "Magic" -> "Faction". |
| D8 | 2026-10-31 | Roll20 light crossbow ammo 20 -> 5 (matches 5 bolts in gear). |
| D9 | 2026-10-31 | Roll20 empty gear row (no name, quantity 0) deleted. |
| D10 | 2026-10-31 | Roll20 quantity 1 filled in on 22 gear rows that had none. |
| D11 | 2026-10-31 | XP: ignored (owner's decision; not tracked in Roll20). |
| D12 | 2026-10-31 | Repo-only differences ignored (owner's decision): Fly on the repo's 3rd-level list (house rule makes it 4th), Rope Trick (banned in Ruthol), 31 cantrips in repo vs 10 in Roll20. |
| D13 | 2026-10-31 | Second level-6 free spell: **Ablative Barrier** (conjuration (creation) [force], Ultimate Combat p. 221; wizard 3, not on the cleric list). Chosen as an all-day buff for Björn: the first 5 lethal damage per attack becomes nonlethal, up to 35 points at CL 7; the +2 armour bonus doesn't stack with worn armour. Added to Roll20 (3rd level, DC 21 shown; Will harmless, SR no), pathfinder_spells spellbook (108 spells), md and site. Runners-up: Sheet Lightning, Nauseating Trail. |
| D14 | 2026-10-31 | Concentration: Roll20 misc 4 → 0, total 17 → 13 (caster level 7 + Int 6). Note on the field: +4 Combat Casting only when casting defensively or grappled, plus the Ruthol casting-defensively DC formula. md updated. |
| D15 | 2026-10-31 | Buffs cleaned up: deleted Favored Enemy Allies (from Rorove, the old ranger) and Bard boost (no bard in the current party); Endure Elements given its effect text (no numeric bonus). |
| D16 | 2026-10-31 | Buffs and gear (C6–C8): added 11 buff rows: Heroism, Ablative Barrier, Expeditious Retreat, Bull's Strength, Stone Shield (numeric); Resist Energy, Protection from Arrows, Blur, Displacement, Blink, Mirror Image (text only). Mage Armor changed to `+4 armor to armor ac` so it doesn't stack with Ablative Barrier. Invisible changed to +20 Stealth with a note for +40 when not moving. Endure Elements text reworded so the parser ignores it. Added ability row Gloves of Arrow Snaring (2/day) with Snatch Arrows and Deflect Arrows text. Every line checked against the sheet's buff parser (Pathfinder Official sheet: `<+N> [type] to <target>`, one per line). |
| D17 | 2026-10-31 | C9: Protection From Evil buff now adds only `+2 deflection to ac`; the save line is a note (its resistance bonus doesn't stack with the Cloak of Resistance +2 in save misc). |
| D18 | 2026-10-31 | C10: spell roll cards. Magic Missile `[[4]]d4+[[4]]` by CL; Scorching Ray ray count + ray 2 roll in notes; Fire Breath cone query (4d6/2d6/1d6); Ray of Enfeeblement ranged touch + `1d6+3` Str penalty; Make Whole and Snowball damage by CL; Black Tentacles grapple roll `1d20+CL+5`; Chain of Perdition maneuver and touch AC. DCs now from `spelldc_mod`: +2 added on Acid Splash, Mage Armor, Summon Swarm, Sleet Storm, Ablative Barrier, Summon Monster IV, Black Tentacles; removed from Chain of Perdition (evocation). |
| D19 | 2026-10-31 | C11: `sync.py recalc` clicks the sheet's Recalc button (rebuilds totals, DCs, roll cards from fields) and pulls; `sync.py check` recomputes saves, concentration, DCs and uses per day offline. First Recalc changed only the 7 intended DCs; all pushed totals already matched. |
| D20 | 2026-10-31 | C12: buff "Combat Casting (defensive/grappled)" `+4 to concentration` (toggle off by default). |
| D21 | 2026-10-31 | C13: token actions on the character (not in the YAML): Init, Conc (`roll_caster1_concentration_roll`), Fort, Ref, Will, Perc, Shift (`repeating_abilities_-NFrI4LlyYpF8Xc-UJ8Z_roll_ability`). All `%{selected|…}`, verified after reload. |
| D22 | 2026-10-31 | C14: notes on 12 scrolls and the wand from spellbook.json: CL (assumed minimum: 1st CL 1, 2nd CL 3), range at that CL, duration, save DC (11 / 13), inline rolls for False Life, Knock, Mudball, d20pfsrd link. C15 (query modifiers) dropped by Sturla. |
| D23 | 2026-10-31 | Audit (`AUDIT.md`): `caster1_spells_total_level_4` 2 → 3 (perday was already 3); Spellcraft note corrected to headband 7 ranks replacing the 1 bought (+6 misc). Race, traits, class features, 6 of 7 feats, AC, CMB/CMD, saves, initiative, concentration, DCs, attacks: OK. |
| D24 | 2026-10-31 | Site: Blink and Sleet Storm were missing from the spellbook (pathfinder_spells `spellbook.txt`); added, 110 spells. |
| D25 | 2026-10-31 | C16: HP were rolled (Sturla). 40 HP is legal, and 54 of 49 + favored-class ranks is legal with 5–7 favored-class points on skills. If all 7 went to skills (matches Roll20's pool of 56), 2 ranks are unspent. |

Play history (chat archive): Caladrel played 4 sessions at level 7 (2024-12-14 to 2025-02-07) and cast Summon Monster IV once; Bren from 2025-02-21.

Already matching, no action: bio, ability scores, HP, BAB/CMB/CMD, attack bonuses, AC, initiative, saves, speeds, all 37 skills and 56/56 ranks, craft skills, money, encumbrance, spell DCs, languages, senses, campaign notes, gear names.
