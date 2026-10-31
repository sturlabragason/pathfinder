#!/usr/bin/env python3
"""Cached Pathfinder 1e rules lookup (d20pfsrd, Archives of Nethys).

    python3 tools/srd.py get URL [--find TERM] [--width N]   # page text, or the passages around TERM
    python3 tools/srd.py aon KIND NAME [--find TERM]          # AoN by name: spell feat trait wondrous ring rod staff wand race
    python3 tools/srd.py cached                               # list cached pages

Pages are cached in ~/.cache/pf-srd (HTML) so repeat lookups cost nothing; add --refresh to refetch.
Quote what you use with its URL. The Roll20 wiki is behind Cloudflare: fetch it through brave-agent instead.
"""
import argparse, hashlib, html, json, pathlib, re, sys, urllib.parse, urllib.request

CACHE = pathlib.Path.home() / ".cache" / "pf-srd"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
AON = {
    "spell": "SpellDisplay.aspx?ItemName=",
    "feat": "FeatDisplay.aspx?ItemName=",
    "trait": "TraitDisplay.aspx?ItemName=",
    "wondrous": "MagicWondrousDisplay.aspx?FinalName=",
    "ring": "MagicRingsDisplay.aspx?FinalName=",
    "rod": "MagicRodsDisplay.aspx?FinalName=",
    "staff": "MagicStaffsDisplay.aspx?FinalName=",
    "wand": "MagicWandsDisplay.aspx?FinalName=",
    "race": "RacesDisplay.aspx?ItemName=",
}


def fetch(url, refresh=False):
    CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(url.encode()).hexdigest()[:16]
    f, meta = CACHE / f"{key}.html", CACHE / "index.json"
    if f.exists() and not refresh:
        return f.read_text(errors="replace")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode("utf-8", errors="replace")
    if re.search(r"Page not found|resource cannot be found", body[:20000]):
        sys.exit(f"not found: {url}")
    f.write_text(body)
    idx = json.loads(meta.read_text()) if meta.exists() else {}
    idx[key] = url
    meta.write_text(json.dumps(idx, indent=1))
    return body


def text_of(page):
    page = re.sub(r"(?is)<(script|style|nav|footer|header)\b.*?</\1>", " ", page)
    page = re.sub(r"(?i)<br\s*/?>|</(p|div|h\d|li|tr|table)>", "\n", page)
    t = html.unescape(re.sub(r"<[^>]+>", " ", page))
    t = re.sub(r"[ \t\xa0]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n", t)
    for marker in ("Section 15: Copyright Notice", "Discuss! Join Our Discord"):
        i = t.find(marker)
        if i > 0:
            t = t[:i]
    return t.strip()


def show(url, find=None, width=700, refresh=False):
    try:
        t = text_of(fetch(url, refresh))
    except Exception as e:  # noqa: BLE001
        sys.exit(f"fetch failed: {url}: {e}")
    print(f"SOURCE: {url}")
    if not find:
        print(t[:20000])
        return
    hits = [m.start() for m in re.finditer(re.escape(find), t, re.I)]
    if not hits:
        sys.exit(f"'{find}' not on {url}")
    last = -width
    for h in hits:
        if h - last < width:
            continue
        print("…" + t[max(0, h - width // 4): h + width].replace("\n", " ") + "…\n")
        last = h


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("get"); g.add_argument("url")
    a = sub.add_parser("aon"); a.add_argument("kind", choices=AON); a.add_argument("name")
    for p in (g, a):
        p.add_argument("--find"); p.add_argument("--width", type=int, default=700); p.add_argument("--refresh", action="store_true")
    sub.add_parser("cached")
    o = ap.parse_args()
    if o.cmd == "cached":
        idx = CACHE / "index.json"
        print("\n".join(json.loads(idx.read_text()).values()) if idx.exists() else "(empty)")
    elif o.cmd == "get":
        show(o.url, o.find, o.width, o.refresh)
    else:
        show("https://aonprd.com/" + AON[o.kind] + urllib.parse.quote(o.name), o.find, o.width, o.refresh)


if __name__ == "__main__":
    main()
