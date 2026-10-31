#!/usr/bin/env python3
"""Mirror a Roll20 character to a local YAML file and push local edits back.

Drives the game tab in the brave-agent browser (see the brave-agent skill) through
playwright-cli and the in-page Campaign model: the same data the sheet reads and writes.

  sync.py pull [--force]  Roll20 -> caladrel-ecthelion.yaml, and .base.json (the state the YAML started from)
  sync.py diff            what push would change, and what changed in Roll20 since the pull
  sync.py push            same as diff
  sync.py push --apply    write the changes to Roll20, then pull again and check them
  sync.py recalc          press the sheet's Recalc button (rebuilds totals, spell DCs and roll cards), then pull
  sync.py check           offline: recompute saves, concentration, spell DCs and uses per day from the YAML
                          and list what disagrees (exit 1 if anything does)
  sync.py site            offline: write ../site/data/sheet.js (the online sheet's facts) from the YAML.
                          pull, push --apply and recalc do this too

Push writes values directly and does not run the sheet's own calculations, so after a
push run `recalc`; `check` catches totals and roll cards that a push left stale.

Push sends only what you changed in the YAML since the last pull. If Roll20 also
changed one of those fields since then, push stops and lists the conflicts.
New list rows: add an item without `_id`. Rows removed from the YAML are reported,
never deleted in Roll20.
"""
import json
import os
import random
import re
import subprocess
import sys
import tempfile
import time

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
YAML_PATH = os.path.join(HERE, "caladrel-ecthelion.yaml")
BASE_PATH = os.path.join(HERE, ".base.json")
CHARACTER_ID = "-NFVT-hcPg_9VIgVZFh1"  # Caladrel Ecthëlion, campaign Ruthol (9745396)
CAMPAIGN_URL = "https://app.roll20.net/editor/setcampaign/9745396"
CDP = "http://127.0.0.1:9222"
# House DC bonus by school: Spell Focus + Greater Spell Focus (conjuration). Set as spelldc_mod per spell.
SCHOOL_DC_BONUS = {"conjuration": 2}

# Macro buttons and sheet bookkeeping: rebuilt by the sheet, not character data.
SKIP = re.compile(r"(_action$|^_reporder_|^ask_|^l1mancer|^tabcurrent$|^sheet_version$|^version$)")
ROW = re.compile(r"^repeating_(.+?)_(-[A-Za-z0-9_-]{19})_(.+)$")
ROW_ID_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"


GAME_TAB = (
    "let p = page.context().pages().find(p => p.url().includes('app.roll20.net/editor'));"
    f" if (!p) {{ p = await page.context().newPage(); await p.goto('{CAMPAIGN_URL}'); await p.waitForTimeout(20000); }}"
)


def run_in_game(js_body, timeout=180):
    """Run `js_body` (async function body; `ch` is the character) in the Roll20 game tab."""
    return run_playwright(
        f"async page => {{ {GAME_TAB} return await p.evaluate(async () => {{"
        f" const ch = Campaign.characters.get('{CHARACTER_ID}');"
        " if (!ch) return JSON.stringify({error: 'character not found'});"
        " if (ch.attribs.length === 0) { ch.attribs.fetch(ch.attribs); await new Promise(r => setTimeout(r, 4000)); }"
        f" {js_body} }}); }}",
        timeout,
    )


def run_playwright(script, timeout=180):
    """Run a playwright-cli `run-code` script that returns a JSON string; return the parsed value."""
    with tempfile.TemporaryDirectory() as wd:
        subprocess.run(["playwright-cli", "-s=brave", "attach", f"--cdp={CDP}"], cwd=wd, capture_output=True, text=True)
        out = subprocess.run(["playwright-cli", "-s=brave", "run-code", script], cwd=wd,
                             capture_output=True, text=True, timeout=timeout).stdout
    m = re.search(r"### Result\n(.*?)\n###", out, re.S)
    if not m:
        sys.exit("No result from the browser. Is brave-agent running with Roll20 signed in?\n" + out[-2000:])
    res = json.loads(json.loads(m.group(1)))
    if isinstance(res, dict) and res.get("error"):
        sys.exit(res["error"])
    return res


def fetch_live():
    """All attributes as {name: {current, max}}, first copy only (the copy the sheet shows)."""
    res = run_in_game(
        "const seen = new Set(); const out = [];"
        " ch.attribs.models.forEach(m => { const n = m.get('name'); if (seen.has(n)) return; seen.add(n);"
        " out.push([n, m.get('current'), m.get('max')]); });"
        " return JSON.stringify({name: ch.get('name'), sheet: ch.get('charactersheetname'), attrs: out});"
    )
    attrs = {n: {"current": "" if c is None else c, "max": "" if x is None else x} for n, c, x in res["attrs"]}
    return res, attrs


def blank(v):
    return v is None or v == ""


def to_doc(res, attrs):
    """Live attributes -> YAML document. Empty values and macro fields are left out."""
    fields, sections = {}, {}
    for n, v in attrs.items():
        if SKIP.search(n) or (blank(v["current"]) and blank(v["max"])):
            continue
        val = v["current"] if blank(v["max"]) else {"current": v["current"], "max": v["max"]}
        m = ROW.match(n)
        if m:
            sections.setdefault(m.group(1), {}).setdefault(m.group(2), {})[m.group(3)] = val
        else:
            fields[n] = val
    lists = {}
    for sec, rows in sorted(sections.items()):
        rep = attrs.get(f"_reporder_repeating_{sec}", {}).get("current") or ""
        order = [r for r in rep.split(",") if r in rows]
        order += [r for r in rows if r not in order]
        lists[sec] = [dict({"_id": r}, **dict(sorted(rows[r].items()))) for r in order]
    return {
        "character": {"name": res["name"], "id": CHARACTER_ID, "sheet": res["sheet"],
                      "pulled": time.strftime("%Y-%m-%d %H:%M")},
        "fields": dict(sorted(fields.items())),
        "lists": lists,
    }


def new_row_id():
    t = int(time.time() * 1000)
    head = ""
    for _ in range(8):
        head = ROW_ID_CHARS[t % 64] + head
        t //= 64
    return (head + "".join(random.choice(ROW_ID_CHARS) for _ in range(12))).replace("_", "Z")


def flatten(doc):
    """YAML document -> {attribute name: {current, max}}. max None = not given, leave alone."""
    out = {}

    def put(name, val):
        if isinstance(val, dict):
            out[name] = {"current": val.get("current", ""), "max": val.get("max", "")}
        else:
            out[name] = {"current": val, "max": None}

    for n, v in (doc.get("fields") or {}).items():
        put(n, v)
    for sec, rows in (doc.get("lists") or {}).items():
        for row in rows or []:
            rid = row.get("_id") or row.setdefault("_id", new_row_id())
            for f, v in row.items():
                if f != "_id":
                    put(f"repeating_{sec}_{rid}_{f}", v)
    return out


def same(a, b):
    return str("" if a is None else a) == str("" if b is None else b)


def row_keys(attrs):
    return {f"{m.group(1)} {m.group(2)}" for m in map(ROW.match, attrs) if m}


def plan(local, base, live):
    """Changes = fields edited locally since the pull. Conflict = Roll20 changed them too."""
    empty = {"current": "", "max": ""}
    changes, conflicts = [], []
    for n, v in local.items():
        b = base.get(n, empty)
        cur_edit = not same(v["current"], b["current"])
        max_edit = v["max"] is not None and not same(v["max"], b["max"])
        if not (cur_edit or max_edit):
            continue
        l = live.get(n, empty)
        if not same(l["current"], b["current"]) or not same(l["max"], b["max"]):
            conflicts.append((n, b, l, v))
            continue
        c = {"name": n, "exists": n in live, "before": l}
        if cur_edit:
            c["current"] = v["current"]
        if max_edit:
            c["max"] = v["max"]
        changes.append(c)
    removed = sorted(row_keys(base) - row_keys(local))
    return changes, conflicts, removed


def remote_drift(base, live):
    empty = {}
    return [n for n in sorted(set(base) | set(live)) if not SKIP.search(n)
            and (not same(base.get(n, empty).get("current"), live.get(n, empty).get("current"))
                 or not same(base.get(n, empty).get("max"), live.get(n, empty).get("max")))]


class Dumper(yaml.SafeDumper):
    pass


Dumper.add_representer(
    str, lambda d, s: d.represent_scalar("tag:yaml.org,2002:str", s, style="|" if "\n" in s else None))

HEADER = """\
# Caladrel Ecthëlion, mirrored from Roll20 by roll20/sync.py. Roll20 is the source of truth.
# Edit values here, then: python3 roll20/sync.py diff, and push --apply to write them.
# fields: sheet attributes. lists: repeating sections (feats, gear, spell-0..4, ...), one item per row.
# The sheet recalculates totals; edit the inputs (base, ranks, misc), not the totals.
"""


def write_yaml(doc):
    with open(YAML_PATH, "w") as f:
        f.write(HEADER)
        yaml.dump(doc, f, Dumper=Dumper, allow_unicode=True, sort_keys=False, width=1000)
    write_site(doc)


# ---------- site export: the facts the online sheet shows, taken from the YAML ----------
SITE_DATA = os.path.join(HERE, "..", "site", "data", "sheet.js")
ABILITY = {"strength": "Str", "dexterity": "Dex", "constitution": "Con", "intelligence": "Int", "wisdom": "Wis", "charisma": "Cha"}
# [site name, field prefix, trained only]
SKILLS = [
    ("Acrobatics", "acrobatics", 0), ("Appraise", "appraise", 0), ("Bluff", "bluff", 0), ("Climb", "climb", 0),
    ("Diplomacy", "diplomacy", 0), ("Disable Device", "disable_device", 1), ("Disguise", "disguise", 0),
    ("Escape Artist", "escape_artist", 0), ("Fly", "fly", 0), ("Handle Animal", "handle_animal", 1), ("Heal", "heal", 0),
    ("Intimidate", "intimidate", 0),
    *[(f"Knowledge ({k})", f"knowledge_{k}", 1) for k in
      ("arcana", "dungeoneering", "engineering", "geography", "history", "local", "nature", "nobility", "planes", "religion")],
    ("Linguistics", "linguistics", 1), ("Perception", "perception", 0), ("Perform", "perform", 0),
    ("Profession", "profession", 1), ("Ride", "ride", 0), ("Sense Motive", "sense_motive", 0),
    ("Sleight of Hand", "sleight_of_hand", 1), ("Spellcraft", "spellcraft", 1), ("Stealth", "stealth", 0),
    ("Survival", "survival", 0), ("Swim", "swim", 0), ("Use Magic Device", "use_magic_device", 1),
]
# site power id -> name prefix of the Roll20 ability row whose per-day max it shows
USES = {"shift": "Shift", "bond": "Arcane Bond", "rod": "Lesser extend", "pentacles": "Master of Pentacles", "gloves": "Gloves of Arrow Snaring"}
# site label -> Roll20 gear row name, for quantities
GEAR_QTY = {"wand": "Wand of Detect Magic", "bolts": "Bolts", "scroll_case": "Case, Scroll", "blank_scrolls": "Blank Scrolls",
            "tongue": "Ice-Salamander Tongue"}
SMALL_WORDS = {"of", "from", "the", "and"}


def scroll_name(raw):
    n = raw.strip()
    if re.fullmatch(r"\d* ?scrolls?", n, re.I):
        return "Unidentified scroll"
    n = re.sub(r"^scroll of\s+|\s+scroll$", "", n, flags=re.I).strip()
    return " ".join(w if i and w.lower() in SMALL_WORDS else w[:1].upper() + w[1:] for i, w in enumerate(n.split()))


def site_facts(doc):
    f, L = doc["fields"], doc["lists"]

    def n(key, default=0):
        v = f.get(key)
        if isinstance(v, dict):
            v = v.get("max", v.get("current"))
        try:
            return int(float(v))
        except (TypeError, ValueError):
            return default

    def qty(name):
        row = next((g for g in L.get("gear", []) if (g.get("name") or "").strip() == name), None)
        return n_of(row.get("quantity")) if row else None

    def n_of(v):
        try:
            return int(float(v))
        except (TypeError, ValueError):
            return 0

    skills = []
    for name, key, trained in SKILLS:
        skills.append([name, n(key), n(key + "_ranks"), ABILITY.get(f.get(key + "_ability"), "?"),
                       ("c" if n(key + "_classkill") else "") + ("t" if trained else "")])
    craft = [(f.get("craft_name") or "", n("craft"), n("craft_ranks"), f.get("craft_ability"), n("craft_classkill"))]
    craft += [(r.get("name") or "", n_of(r.get("skill")), n_of(r.get("ranks")), "intelligence", n_of(r.get("classkill")))
              for r in L.get("skillcraft", [])]
    for cname, total, ranks, ab, ck in craft:
        if cname:
            skills.append([f"Craft ({cname.lower()})", total, ranks, ABILITY.get(ab, "Int"), "c" if ck else ""])
    skills.sort(key=lambda s: s[0])

    uses = {}
    for sid, prefix in USES.items():
        row = next((a for a in L.get("abilities", []) if (a.get("name") or "").startswith(prefix)), None)
        pd = row.get("perday") if row else None
        uses[sid] = n_of(pd.get("max") if isinstance(pd, dict) else pd)
    gear = {k: qty(v) for k, v in GEAR_QTY.items()}

    scrolls = []
    for g in L.get("gear", []):
        name = (g.get("name") or "").strip()
        if re.search(r"scroll", name, re.I) and not re.search(r"case|blank", name, re.I) and n_of(g.get("quantity")) > 0:
            scrolls += [scroll_name(name)] * n_of(g.get("quantity"))
    scrolls.sort(key=lambda s: s == "Unidentified scroll")

    langs = [x.strip() for x in re.split(r"[,.]\s*", f.get("languages") or "") if x.strip()]
    learning = [re.sub(r"\s*\(.*", "", x) for x in langs if re.search(r"teacher", x, re.I)]
    known = [x for x in langs if not re.search(r"teacher", x, re.I)]

    attacks = {}
    for r in L.get("attacks", []):
        dmg = re.sub(r"\+0$", "", str(r.get("atkdmgdisplay") or "")).replace("-", "−")
        crit = r.get("atkcritrange")
        crit = f"{crit}–20/×{r.get('dmgcritmulti') or 2}" if crit and str(crit) != "20" else f"×{r.get('dmgcritmulti') or 2}"
        rng = str(r.get("atkrange") or "").replace(".", "").strip()
        key = slug_key(r.get("atkname"))
        if r.get("atktype") == "ranged":
            attacks[key] = {"atk": signed(r.get("atkbonusdisplay")), "line": " · ".join(x for x in (dmg, crit, rng) if x)}
        else:
            attacks[key] = {"atk": signed(r.get("atkbonusdisplay")), "line": f"{dmg} · {crit}"}
            if rng:  # thrown: same damage, ranged attack bonus
                attacks[key + "_thrown"] = {"atk": signed(n("ranged_mod")), "line": f"{dmg} · {rng}"}

    school_bonus = sum(SCHOOL_DC_BONUS.values())
    coins = f.get("encumbrance_coins_weight") if n("encumbrance_coins_flag") else 0
    carried = round(float(f.get("encumbrance_gear_weight") or 0) + float(coins or 0), 1)
    return {
        "pulled": doc["character"].get("pulled"),
        "abilities": {ABILITY[a]: {"score": n(a), "mod": n(a + "_mod")} for a in ABILITY},
        "bab": n("bab"), "concentration": n("caster1_concentration"),
        "saves": {"fort": n("fortitude"), "ref": n("reflex"), "will": n("will")},
        "save_misc": n("will_misc"),
        "ac": n("ac"), "touch": n("ac_touch"), "flatfooted": n("ac_flatfooted"),
        "cmb": n("cmb_mod"), "cmd": n("cmd_mod"), "initiative": n("initiative"), "speed": n("speed"),
        "hp_max": n("hp"), "hit_dice": f"{n('class1_level')}d{n('class1_hitdietype')}",
        "melee": n("melee_mod"), "ranged": n("ranged_mod"), "attacks": attacks,
        "caster_level": n("caster1_level"),
        "dc": [n(f"caster1_dc_level_{i}") for i in range(5)],
        "dc_conj": [n(f"caster1_dc_level_{i}") + school_bonus for i in range(5)],
        "slots": [n(f"caster1_spells_perday_level_{i}") for i in range(5)],
        "skills": skills,
        "ranks": {"spent": sum(s[2] for s in skills), "pool": n("class1_skillranks")},
        "money": {c: n("money_" + c) for c in ("cp", "sp", "gp", "pp")},
        "load": {"carried": carried, "light": n("encumbrance_load_light"), "medium": n("encumbrance_load_medium"),
                 "heavy": n("encumbrance_load_heavy"), "lift_head": n("encumbrance_lift_head"),
                 "lift_ground": n("encumbrance_lift_ground"), "drag": n("encumbrance_drag_push")},
        "languages": known, "learning": learning, "senses": f.get("senses") or "",
        "uses": uses, "gear": gear, "scrolls": scrolls,
    }


def signed(v):
    try:
        i = int(str(v).strip().replace("−", "-"))
    except ValueError:
        return str(v).strip()
    return f"+{i}" if i >= 0 else f"−{abs(i)}"


def slug_key(name):
    return re.sub(r"[^a-z0-9]+", "_", (name or "").lower()).strip("_")


def write_site(doc):
    if not os.path.isdir(os.path.dirname(SITE_DATA)):
        return
    facts = site_facts(doc)
    with open(SITE_DATA, "w") as fh:
        fh.write("// Generated by roll20/sync.py from roll20/caladrel-ecthelion.yaml. Do not edit; pull or run `sync.py site`.\n")
        fh.write("window.SHEET = " + json.dumps(facts, ensure_ascii=False, indent=1) + ";\n")


def load_yaml():
    with open(YAML_PATH) as f:
        return yaml.safe_load(f)


def save_base(live):
    with open(BASE_PATH, "w") as f:
        json.dump(live, f, ensure_ascii=False)


def pending_edits():
    if not (os.path.exists(YAML_PATH) and os.path.exists(BASE_PATH)):
        return []
    base = json.load(open(BASE_PATH))
    return plan(flatten(load_yaml()), base, base)[0]


def cmd_pull():
    if pending_edits() and "--force" not in sys.argv:
        sys.exit(f"{len(pending_edits())} local edit(s) not pushed yet. Push them, or pull --force to discard them.")
    res, live = fetch_live()
    write_yaml(to_doc(res, live))
    save_base(live)
    print(f"Pulled {len(live)} attributes into {os.path.relpath(YAML_PATH)}")


def cmd_recalc():
    """Press the sheet's Recalc button so its own calculations rebuild totals, spell DCs and roll cards."""
    if pending_edits():
        sys.exit("Local edits not pushed yet. Push them first, so Recalc works from the values you meant.")
    _, before = fetch_live()
    run_playwright(
        f"async page => {{ {GAME_TAB}"
        f" await p.evaluate(() => Campaign.characters.get('{CHARACTER_ID}').view.showDialog());"
        " await p.waitForTimeout(4000);"
        f" const f = p.frames().find(f => f.name() === 'iframe_{CHARACTER_ID}');"
        " if (!f) return JSON.stringify({error: 'character sheet frame not found'});"
        " const ok = await f.evaluate(() => { const b = document.querySelector('button[name=\"act_le_big_stuff\"]');"
        " if (b) b.click(); return !!b; });"
        " if (!ok) return JSON.stringify({error: 'Recalc button not found'});"
        " await p.waitForTimeout(12000); return JSON.stringify('ok'); }",
        timeout=240,
    )
    res, after = fetch_live()
    changed = [n for n in sorted(set(before) | set(after))
               if not SKIP.search(ROW.sub(r"\3", n)) and not same(before.get(n, {}).get("current"), after.get(n, {}).get("current"))]
    cards = [n for n in changed if n.endswith(("rollcontent", "rollbase", "rollbase_atk", "rollbase_dmg"))]
    for n in changed:
        if n not in cards:
            print(f"  {n}: {str(before.get(n, {}).get('current'))[:50]!r} -> {str(after.get(n, {}).get('current'))[:50]!r}")
    print(f"Recalc changed {len(changed) - len(cards)} value(s) and rebuilt {len(cards)} roll card(s).")
    write_yaml(to_doc(res, after))
    save_base(after)


def num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def sheet_formula(expr, fields):
    """Evaluate a per-day style formula such as 3+@{intelligence_mod}; None if it is not plain arithmetic."""
    text = re.sub(r"@\{(\w+)\}", lambda m: str(num(fields.get(m.group(1)))), str(expr))
    if not re.fullmatch(r"[\d+\-*/() .]+", text):
        return None
    return int(eval(text))


def cmd_check():
    """Offline: recompute what the sheet derives and list values that disagree (stale pushes, wrong DCs)."""
    doc = load_yaml()
    f, lists = doc["fields"], doc["lists"]
    issues = []

    def expect(label, have, want):
        if num(have) != want:
            issues.append(f"{label}: sheet has {have}, expected {want}")

    for save in ("fortitude", "reflex", "will"):
        expect(save, f.get(save), sum(num(f.get(f"{save}_{p}")) for p in ("base", "ability_mod", "misc", "bonus")))
    expect("caster1_concentration", f.get("caster1_concentration"),
           sum(num(f.get(f"caster1_{p}")) for p in ("level", "ability_mod", "concentration_misc", "concentration_bonus")))
    for lv in range(10):
        level_dc = 10 + lv + num(f.get("caster1_ability_mod")) + num(f.get("caster1_dc_misc")) + num(f.get(f"caster1_dcbonus_level_{lv}"))
        expect(f"caster1_dc_level_{lv}", f.get(f"caster1_dc_level_{lv}"), level_dc)
        for row in lists.get(f"spell-{lv}", []):
            name = f"{row.get('spellname')} (level {lv})"
            school = str(row.get("spellschool", "")).lower()
            want_mod = next((b for s, b in SCHOOL_DC_BONUS.items() if school.startswith(s)), 0)
            if num(row.get("spelldc_mod")) != want_mod:
                issues.append(f"{name}: spelldc_mod {row.get('spelldc_mod')!r}, expected {want_mod} for {school.split(' ')[0] or 'no school'}")
            expect(f"{name} spelldc", row.get("spelldc"), level_dc + num(row.get("spelldc_mod")))
            card = re.search(r"\{\{savedc=\[\[(\d+)\]\]\}\}", str(row.get("rollcontent", "")))
            if card and num(card.group(1)) != num(row.get("spelldc")):
                issues.append(f"{name}: roll card says DC {card.group(1)}, spelldc is {row.get('spelldc')} (press Recalc)")
            dmg = str(row.get("spelldmg", ""))
            if dmg and re.search(r"[a-z]{3,}", re.sub(r"@\{\w+\}|\?\{[^}]*\}|k[hl]\d|floor|ceil|round", "", dmg)):
                issues.append(f"{name}: damage {dmg!r} is text, not a roll")
    for row in lists.get("abilities", []):
        qty = row.get("perday_qty")
        want = sheet_formula(qty, f) if qty not in (None, "") else None
        have = (row.get("perday") or {}).get("max") if isinstance(row.get("perday"), dict) else None
        if want is not None and have is not None and num(have) != want:
            issues.append(f"{row.get('name')}: uses per day max {have}, formula {qty} gives {want}")
    for line in issues:
        print("  " + line)
    print(f"{len(issues)} issue(s)")
    return len(issues)


def show_plan(changes, conflicts, removed):
    for c in changes:
        parts = []
        if "current" in c:
            parts.append(f"{str(c['before']['current'])[:60]!r} -> {str(c['current'])[:60]!r}")
        if "max" in c:
            parts.append(f"max {c['before']['max']!r} -> {c['max']!r}")
        print(("  new  " if not c["exists"] else "  set  ") + c["name"] + ": " + "; ".join(parts))
    for n, b, l, v in conflicts:
        print(f"  CONFLICT {n}: pulled {b['current']!r}, Roll20 now {l['current']!r}, yours {v['current']!r}")
    for r in removed:
        print(f"  row removed here, left in Roll20: {r}")
    print(f"{len(changes)} change(s), {len(conflicts)} conflict(s), {len(removed)} removed row(s) ignored")


def cmd_diff(apply):
    local = flatten(load_yaml())
    base = json.load(open(BASE_PATH))
    _, live = fetch_live()
    changes, conflicts, removed = plan(local, base, live)
    drift = remote_drift(base, live)
    if drift:
        print(f"Changed in Roll20 since the pull ({len(drift)}): " + ", ".join(drift[:20]) + (" ..." if len(drift) > 20 else ""))
    show_plan(changes, conflicts, removed)
    if not apply or not changes:
        return
    if conflicts:
        sys.exit("Not pushing: resolve the conflicts first (pull --force discards your edits).")
    payload = json.dumps([{k: c[k] for k in ("name", "current", "max") if k in c} for c in changes], ensure_ascii=False)
    run_in_game(
        f"const changes = {payload};"
        " for (const c of changes) { const m = ch.attribs.models.find(m => m.get('name') === c.name);"
        " const upd = {}; if ('current' in c) upd.current = c.current; if ('max' in c) upd.max = c.max;"
        " if (m) m.save(upd); else ch.attribs.create(Object.assign({name: c.name, current: '', max: ''}, upd)); }"
        " await new Promise(r => setTimeout(r, 3000)); return JSON.stringify(changes.length);"
    )
    time.sleep(2)
    res, after = fetch_live()
    bad = [c["name"] for c in changes if "current" in c and not same(after.get(c["name"], {}).get("current"), c["current"])]
    print(f"Pushed {len(changes)} change(s)." + (" Not saved as expected: " + ", ".join(bad) if bad else " All confirmed."))
    write_yaml(to_doc(res, after))
    save_base(after)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "pull":
        cmd_pull()
    elif cmd in ("diff", "push"):
        cmd_diff(cmd == "push" and "--apply" in sys.argv)
    elif cmd == "recalc":
        cmd_recalc()
    elif cmd == "check":
        sys.exit(1 if cmd_check() else 0)
    elif cmd == "site":
        write_site(load_yaml())
        print(f"Wrote {os.path.relpath(SITE_DATA)}")
    else:
        sys.exit(__doc__)
