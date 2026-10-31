#!/usr/bin/env python3
"""Mirror a Roll20 character to a local YAML file and push local edits back.

Drives the game tab in the brave-agent browser (see the brave-agent skill) through
playwright-cli and the in-page Campaign model: the same data the sheet reads and writes.

  sync.py pull [--force]  Roll20 -> caladrel-ecthelion.yaml, and .base.json (the state the YAML started from)
  sync.py diff            what push would change, and what changed in Roll20 since the pull
  sync.py push            same as diff
  sync.py push --apply    write the changes to Roll20, then pull again and check them

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

# Macro buttons and sheet bookkeeping: rebuilt by the sheet, not character data.
SKIP = re.compile(r"(_action$|^_reporder_|^ask_|^l1mancer|^tabcurrent$|^sheet_version$|^version$)")
ROW = re.compile(r"^repeating_(.+?)_(-[A-Za-z0-9_-]{19})_(.+)$")
ROW_ID_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"


def run_in_game(js_body, timeout=180):
    """Run `js_body` (async function body; `ch` is the character) in the Roll20 game tab."""
    script = (
        "async page => { let p = page.context().pages().find(p => p.url().includes('app.roll20.net/editor'));"
        f" if (!p) {{ p = await page.context().newPage(); await p.goto('{CAMPAIGN_URL}'); await p.waitForTimeout(20000); }}"
        " return await p.evaluate(async () => {"
        f" const ch = Campaign.characters.get('{CHARACTER_ID}');"
        " if (!ch) return JSON.stringify({error: 'character not found'});"
        " if (ch.attribs.length === 0) { ch.attribs.fetch(ch.attribs); await new Promise(r => setTimeout(r, 4000)); }"
        f" {js_body} }}); }}"
    )
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


def load_yaml():
    with open(YAML_PATH) as f:
        return yaml.safe_load(f)


def save_base(live):
    with open(BASE_PATH, "w") as f:
        json.dump(live, f, ensure_ascii=False)


def cmd_pull():
    if os.path.exists(YAML_PATH) and os.path.exists(BASE_PATH) and "--force" not in sys.argv:
        base = json.load(open(BASE_PATH))
        pending, _, _ = plan(flatten(load_yaml()), base, base)
        if pending:
            sys.exit(f"{len(pending)} local edit(s) not pushed yet. Push them, or pull --force to discard them.")
    res, live = fetch_live()
    write_yaml(to_doc(res, live))
    save_base(live)
    print(f"Pulled {len(live)} attributes into {os.path.relpath(YAML_PATH)}")


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
    else:
        sys.exit(__doc__)
