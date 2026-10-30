(() => {
  "use strict";
  const REMOTE = "https://sturlabragason.github.io/pathfinder_spells/caladrel_ecthelion/spellbook.json";
  const LOCAL = "data/spellbook.json";
  const KEY = "caladrel.sheet.v1";
  const HP_MAX = 40;
  const SLOTS = { 0: 4, 1: 7, 2: 6, 3: 4, 4: 3 };
  const DC = (lvl, school) => 10 + lvl + 6 + (school === "conjuration" ? 2 : 0);
  const ABBR = { abjuration: "Abj", conjuration: "Conj", divination: "Div", enchantment: "Ench", evocation: "Evoc", illusion: "Illus", necromancy: "Necro", transmutation: "Trans", universal: "Univ" };
  const PFSRD = "https://www.d20pfsrd.com/";
  const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const PFSRD_SEARCH = (q) => "https://www.d20pfsrd.com/?s=" + encodeURIComponent(q);

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  };
  const sign = (n) => (n < 0 ? "−" + Math.abs(n) : "+" + n);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state ---------- */
  const fresh = () => ({ hp: HP_MAX, temp: 0, prep: {}, used: {}, scrolls: {}, day: 1 });
  let state;
  try { state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { state = fresh(); }
  // Older sheets stored prepared spells as [{n: name, c: cast?}] per level; fold them into {name: {n: copies, c: casts}}.
  for (const [lvl, v] of Object.entries(state.prep)) {
    if (!Array.isArray(v)) continue;
    const m = {};
    for (const p of v) { const e = (m[p.n] ||= { n: 0, c: 0 }); e.n++; if (p.c) e.c++; }
    state.prep[lvl] = m;
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

  /* ---------- tabs ---------- */
  const OLD = { record: "character", skills: "character", powers: "features", kit: "gear", lore: "story" };
  const sections = $$("main > section");
  const tabs = $$(".tab");
  function show() {
    let id = (location.hash || "#character").slice(1);
    id = OLD[id] || id;
    const target = sections.find((s) => s.id === "s-" + id) || sections[0];
    sections.forEach((s) => { s.hidden = s !== target; });
    tabs.forEach((t) => {
      if (t.getAttribute("href") === "#" + target.id.slice(2)) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    const active = tabs.find((t) => t.getAttribute("aria-current"));
    const rail = $(".tabs");
    if (active && rail && rail.scrollWidth > rail.clientWidth) {
      const l = active.offsetLeft - 12, r = active.offsetLeft + active.offsetWidth + 12;
      if (l < rail.scrollLeft) rail.scrollLeft = l;
      else if (r > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = r - rail.clientWidth;
    }
  }
  window.addEventListener("hashchange", () => { show(); window.scrollTo(0, 0); });
  show();

  /* ---------- hit points ---------- */
  const hpNow = $("#hp-now"), hpAmt = $("#hp-amt"), hpTemp = $("#hp-temp"), hpTempWrap = $("#hp-temp-wrap"), hpStamp = $("#hp-stamp");
  function drawHp() {
    hpNow.textContent = state.hp;
    hpTemp.textContent = state.temp;
    hpTempWrap.hidden = !state.temp;
    const word = state.hp <= -12 ? "Dead" : state.hp < 0 ? "Dying" : state.hp === 0 ? "Disabled" : "";
    hpStamp.hidden = !word;
    hpStamp.textContent = word;
    hpNow.classList.toggle("low", state.hp <= HP_MAX / 4);
  }
  $$("[data-hp]").forEach((b) => b.addEventListener("click", () => {
    const n = Math.max(0, parseInt(hpAmt.value, 10) || 0);
    if (!n) { hpAmt.focus(); return; }
    if (b.dataset.hp === "dmg") {
      const soak = Math.min(state.temp, n);
      state.temp -= soak;
      state.hp -= n - soak;
    } else if (b.dataset.hp === "heal") {
      state.hp = Math.min(HP_MAX, state.hp + n);
    } else {
      state.temp = Math.max(state.temp, n);
    }
    hpAmt.value = "";
    save(); drawHp();
  }));
  hpAmt.addEventListener("keydown", (e) => { if (e.key === "Enter") $("[data-hp=dmg]").click(); });
  drawHp();

  /* ---------- per-day pips ---------- */
  function pips(id, total, label) {
    const wrap = h("div", { class: "pips", role: "group", "aria-label": label });
    const draw = () => {
      wrap.replaceChildren();
      const used = state.used[id] || 0;
      for (let i = 0; i < total; i++) {
        const spent = i < used;
        wrap.append(h("button", {
          class: "pip" + (spent ? " spent" : ""), type: "button",
          "aria-pressed": spent ? "true" : "false",
          "aria-label": `${label}: use ${i + 1} of ${total}${spent ? ", spent" : ""}`,
          onclick: (e) => { state.used[id] = spent ? i : i + 1; save(); draw(); wrap.children[i]?.focus(); e.preventDefault(); },
        }));
      }
      wrap.append(h("span", { class: "pip-count", text: `${total - used} left` }));
    };
    wrap.redraw = draw;
    draw();
    return wrap;
  }

  /* ---------- features ---------- */
  const POWERS = [
    { id: "shift", url: "https://www.d20pfsrd.com/classes/core-classes/wizard/arcane-schools/paizo-arcane-schools/classic-arcane-schools/conjuration/teleportation/", name: "Shift (Su)", per: 9, aside: "swift · 15 ft",
      text: "Teleport up to 15 ft to a space you can see, as dimension door. No attack of opportunity. You can't bring other creatures, except a familiar. Replaces acid dart." },
    { id: "bond", url: "https://www.d20pfsrd.com/classes/core-classes/wizard/", name: "Arcane bond", per: 1, aside: "Ring of Pengolodh",
      text: "Once per day, cast any one spell that is in your spellbook, even if it isn't prepared. It uses the spell's normal casting time and level. Without the ring, concentration DC 20 + spell level to cast at all." },
    { id: "rod", url: "https://www.d20pfsrd.com/magic-items/rods/metamagic-rods/", name: "Lesser extend rod", per: 3, aside: "metamagic",
      text: "Extend a spell of 3rd level or lower: double its duration without raising its level or casting time." },
    { id: "pentacles", url: "https://aonprd.com/TraitDisplay.aspx?ItemName=Master%20of%20Pentacles", name: "Master of Pentacles", per: 1, aside: "1/day",
      text: "When you cast a conjuration spell, treat your caster level as 2 higher for its duration." },
    { id: "charm", url: "https://www.d20pfsrd.com/classes/core-classes/wizard/arcane-schools/paizo-arcane-schools/classic-arcane-schools/conjuration/", name: "Summoner's charm (Su)", aside: "always on",
      text: "Conjuration (summoning) spells last 3 rounds longer (half wizard level). Extend Spell doesn't double the extra rounds." },
    { id: "wand", url: "https://www.d20pfsrd.com/magic/all-spells/d/detect-magic/", name: "Wand of detect magic", per: 19, keep: true, aside: "charges",
      text: "One charge per use. Charges don't come back with a new day." },
    { id: "bolts", url: "https://www.d20pfsrd.com/equipment/weapons/weapon-descriptions/crossbow-light/", name: "Crossbow bolts", per: 5, keep: true, aside: "ammunition",
      text: "Mark a box when a bolt is fired. Clear it when you recover the bolt." },
  ];
  const pipSets = [];
  for (const p of POWERS) {
    const feat = h("div", { class: "feat" },
      h("p", {}, h("b", {}, h("i", {}, p.url ? h("a", { href: p.url, rel: "noopener", text: p.name }) : p.name, ". ")), p.text, " ", h("span", { class: "aside", text: `(${p.aside})` })));
    if (p.per) { const ps = pips(p.id, p.per, p.name); pipSets.push(ps); feat.append(ps); }
    $("#power-list").append(feat);
  }

  /* ---------- skills ---------- */
  // [name, total, ranks, ability, flags: c = class skill, t = trained only]
  const SKILLS = [
    ["Acrobatics", 4, 0, "Dex"], ["Appraise", 10, 1, "Int", "c"], ["Bluff", 1, 3, "Cha"], ["Climb", -2, 0, "Str"],
    ["Craft (alchemy)", 10, 1, "Int", "c"], ["Craft (calligraphy)", 10, 1, "Int", "c"], ["Craft (cartography)", 10, 1, "Int", "c"],
    ["Diplomacy", 2, 4, "Cha"], ["Disable Device", 4, 0, "Dex", "t"], ["Disguise", -2, 0, "Cha"], ["Escape Artist", 4, 0, "Dex"],
    ["Fly", 8, 1, "Dex", "c"], ["Handle Animal", -2, 0, "Cha", "t"], ["Heal", 0, 0, "Wis"], ["Intimidate", 2, 4, "Cha"],
    ["Knowledge (arcana)", 16, 7, "Int", "ct"], ["Knowledge (dungeoneering)", 11, 2, "Int", "ct"], ["Knowledge (engineering)", 11, 2, "Int", "ct"],
    ["Knowledge (geography)", 11, 2, "Int", "ct"], ["Knowledge (history)", 10, 1, "Int", "ct"], ["Knowledge (local)", 10, 1, "Int", "ct"],
    ["Knowledge (nature)", 10, 1, "Int", "ct"], ["Knowledge (nobility)", 10, 1, "Int", "ct"], ["Knowledge (planes)", 14, 5, "Int", "ct"],
    ["Knowledge (religion)", 11, 2, "Int", "ct"], ["Linguistics", 12, 3, "Int", "ct"], ["Perception", 7, 7, "Wis"], ["Perform", -2, 0, "Cha"],
    ["Profession", 0, 0, "Wis", "ct"], ["Ride", 4, 0, "Dex"], ["Sense Motive", 2, 2, "Wis"], ["Sleight of Hand", 5, 1, "Dex", "t"],
    ["Spellcraft", 16, 1, "Int", "ct"], ["Stealth", 4, 0, "Dex"], ["Survival", 1, 1, "Wis"], ["Swim", -1, 1, "Str"], ["Use Magic Device", -2, 0, "Cha", "t"],
  ];
  const skillList = $("#skill-list");
  for (const [name, total, ranks, ab, flags = ""] of SKILLS) {
    const untrained = flags.includes("t") && !ranks;
    const cls = flags.includes("c");
    skillList.append(h("li", { "data-name": name.toLowerCase(), class: untrained ? "untrained" : null },
      h("i", { class: "bub" + (cls && ranks ? " on" : ""), title: cls ? "class skill" : null, "aria-hidden": "true" }),
      h("span", { class: "slot", text: untrained ? "—" : sign(total) }),
      h("span", { class: "nm" }, h("a", { href: PFSRD + "skills/" + slug(name.replace(/ \(.*/, "")) + "/", rel: "noopener", text: name }), " ", h("small", { text: `(${ab})` }),
        flags.includes("t") ? h("span", { class: "tr", title: "trained only", text: "T" }) : null,
        cls ? h("span", { class: "visually-hidden", text: ", class skill" }) : null)));
  }
  $("#skill-q").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("li", skillList).forEach((li) => { li.hidden = !!q && !li.dataset.name.includes(q); });
  });

  /* ---------- spellbook data ---------- */
  let BOOK = [];
  const byName = new Map();
  const cost = (s) => (s && s.opposed ? 2 : 1);
  const linkFor = (s) => {
    const url = s.url || PFSRD_SEARCH(s.name);
    const aonLink = s.link_source === "aon" || /aonprd\.com/.test(url);
    return { url, label: aonLink ? "Archives of Nethys" : "d20pfsrd" };
  };

  /* ---------- equipment ---------- */
  const WORN = [
    ["Headband of Vast Intelligence", "+2 Int", PFSRD + "magic-items/wondrous-items/h-l/headband-of-vast-intelligence/"], ["Rauð skikkja með logandi öxi", "cloak of resistance +2", PFSRD + "magic-items/wondrous-items/c-d/cloak-of-resistance/"],
    ["Amulet of Natural Armor", "+1 AC", PFSRD + "magic-items/wondrous-items/a-b/amulet-of-natural-armor/"], ["Gloves of Arrow Snaring", "", PFSRD + "magic-items/wondrous-items/e-g/gloves-of-arrow-snaring/"],
    ["Ring of Pengolodh", "bonded"], ["Ecthëlion signet ring", ""], ["Lesser extend metamagic rod", "3/day", PFSRD + "magic-items/rods/metamagic-rods/"],
    ["Light crossbow", "4 lb", PFSRD + "equipment/weapons/weapon-descriptions/crossbow-light/"], ["Dagger", "1 lb", PFSRD + "equipment/weapons/weapon-descriptions/dagger/"], ["Wand of detect magic", "19 ch.", PFSRD + "magic-items/wands/"], ["Scholar's outfit", "6 lb", PFSRD + "equipment/goods-and-services/containers-bags-boxes-more/"],
  ];
  const PACK = [
    ["Spellbook, wizard's", "×2", PFSRD + "magic/spellbooks/"], ["Spell component pouch", "", PFSRD + "equipment/goods-and-services/containers-bags-boxes-more/"], ["Belt pouch", "", PFSRD + "equipment/goods-and-services/containers-bags-boxes-more/"], ["Scroll case", "×3", PFSRD + "equipment/goods-and-services/containers-bags-boxes-more/"], ["Bandolier", "", PFSRD + "equipment/goods-and-services/containers-bags-boxes-more/"],
    ["Blank scrolls", "×8", PFSRD + "equipment/goods-and-services/books-paper-writing-supplies/"], ["Library card, Horeck", ""], ["Maps", ""], ["Notes", ""], ["Ice-salamander tongue", "×3"],
    ["Ancient Dwarven text", "unread"], ["Crossbow bolts", "×5", PFSRD + "equipment/weapons/weapon-descriptions/crossbow-light/"],
  ];
  const SCROLLS = ["Obscuring Mist", "Bull's Strength", "Swift Girding", "Knock", "Feather Fall", "Illusion of Calm",
    "Protection from Evil", "Mudball", "False Life", "Mount", "Fog Cloud", "See Invisibility", "Unidentified scroll"];
  // Verified d20pfsrd pages for the scrolls (checked when the sheet was built); the spellbook's own URL wins when present.
  const SCROLL_URL = Object.fromEntries(Object.entries({ "Obscuring Mist": "obscuring-mist", "Bull's Strength": "bull-s-strength", "Swift Girding": "swift-girding", "Knock": "knock", "Feather Fall": "feather-fall", "Illusion of Calm": "illusion-of-calm", "Protection from Evil": "protection-from-evil", "Mudball": "mudball", "False Life": "false-life", "Mount": "mount", "Fog Cloud": "fog-cloud", "See Invisibility": "see-invisibility" }).map(([n, sl]) => [n, `https://www.d20pfsrd.com/magic/all-spells/${sl[0]}/${sl}/`]));
  const row = ([name, v, url]) => h("li", {}, h("span", {}, url ? h("a", { href: url, rel: "noopener", text: name }) : name), v ? h("b", { text: v }) : null);
  WORN.forEach((w) => $("#kit-worn").append(row(w)));
  PACK.forEach((w) => $("#kit-pack").append(row(w)));
  function drawScrolls() {
    const ul = $("#kit-scrolls");
    ul.replaceChildren();
    let left = 0;
    SCROLLS.forEach((s, i) => {
      const used = !!state.scrolls[s];
      if (!used) left++;
      const known = byName.get(s);
      const href = known && !/aonprd/.test(known.url || "") ? known.url : SCROLL_URL[s];
      const name = s === "Unidentified scroll" ? h("span", { text: s })
        : h("span", {}, h("a", { href: href || PFSRD_SEARCH(s), rel: "noopener", text: s }));
      ul.append(h("li", { class: used ? "used" : null },
        h("button", { class: "pip" + (used ? " spent" : ""), type: "button", "aria-pressed": used ? "true" : "false",
          "aria-label": used ? `Scroll of ${s} used; mark unused` : `Mark scroll of ${s} as used`,
          onclick: () => { state.scrolls[s] = !used; save(); drawScrolls(); $$("#kit-scrolls .pip")[i]?.focus(); } }),
        name, used ? h("b", { text: "used" }) : null));
    });
    $("#scroll-count").textContent = `${left} of ${SCROLLS.length} unread`;
  }
  drawScrolls();

  /* ---------- spells page ---------- */
  const book = $("#book"), bookQ = $("#book-q");
  const openSet = new Set();
  let view = "known";
  const prepOf = (lvl) => (state.prep[lvl] ||= {});
  const slotsUsed = (lvl) => Object.entries(prepOf(lvl)).reduce((a, [n, p]) => a + p.n * cost(byName.get(n)), 0);
  const slotsCast = (lvl) => Object.entries(prepOf(lvl)).reduce((a, [n, p]) => a + p.c * cost(byName.get(n)), 0);

  function setPrep(lvl, name, n) {
    const m = prepOf(lvl);
    if (n <= 0) delete m[name];
    else { const e = (m[name] ||= { n: 0, c: 0 }); e.n = n; e.c = Math.min(e.c, n); }
    save();
  }

  function spellLine(s) {
    const lvl = s.level, k = slug(s.name);
    const p = prepOf(lvl)[s.name] || { n: 0, c: 0 };
    const free = SLOTS[lvl] - slotsUsed(lvl);
    const did = "sd-" + k;
    const isOpen = openSet.has(s.name);
    const nameBtn = h("button", { class: "sp-name", type: "button", "aria-expanded": String(isOpen), "aria-controls": did, "data-k": "n-" + k },
      s.name, p.n > 1 ? h("span", { class: "x", text: ` ×${p.n}` }) : null);
    nameBtn.addEventListener("click", () => {
      if (openSet.has(s.name)) openSet.delete(s.name); else openSet.add(s.name);
      redrawLevel(lvl, "n-" + k);
    });
    const casts = h("span", { class: "casts" });
    if (lvl > 0) {
      for (let i = 0; i < p.n; i++) {
        const on = i < p.c;
        casts.append(h("button", { class: "cast-b", type: "button", "aria-pressed": String(on), "data-k": `c${i}-${k}`,
          "aria-label": on ? `${s.name}: copy ${i + 1} cast; undo` : `Cast ${s.name}${p.n > 1 ? ` (copy ${i + 1})` : ""}`,
          onclick: () => { setPrep(lvl, s.name, p.n); prepOf(lvl)[s.name].c = on ? i : i + 1; save(); redrawLevel(lvl, `c${i}-${k}`); } }));
      }
      if (p.n > 0 && free >= cost(s))
        casts.append(h("button", { class: "more-b", type: "button", text: "+", "data-k": "m-" + k, "aria-label": `Prepare another copy of ${s.name}`,
          onclick: () => { setPrep(lvl, s.name, p.n + 1); redrawLevel(lvl, "m-" + k); } }));
    }
    const canPrep = p.n > 0 || free >= cost(s);
    const facts = [["Casting time", s.casting_time], ["Components", s.components], ["Range", s.range], ["Area", s.area], ["Effect", s.effect],
      ["Targets", s.targets], ["Duration", s.duration], ["Saving throw", s.save], ["Spell resistance", s.sr]].filter(([, v]) => v);
    const hasSave = s.save && !/^none/i.test(s.save);
    const link = linkFor(s);
    const school = s.school + (s.subschool ? ` (${s.subschool})` : "") + (s.descriptor ? ` [${s.descriptor}]` : "");
    const detail = h("div", { class: "sp-detail", id: did, hidden: !isOpen },
      h("p", { class: "short" }, s.short || "", " ", h("span", { class: "src", text: school })),
      h("dl", { class: "facts" }, facts.map(([a, b]) => [h("dt", { text: a }), h("dd", { text: b })])),
      hasSave ? h("p", { class: "dcline" }, "Save DC ", h("b", { text: String(DC(lvl, s.school)) })) : null,
      isOpen ? h("div", { class: "rules", html: s.text || "" }) : null,
      h("p", { class: "src" }, s.source ? `${s.source} · ` : "", h("a", { href: link.url, rel: "noopener", text: `Read on ${link.label}` })));
    return h("li", {
      class: "sp" + (s.school === "conjuration" ? " conj" : "") + (lvl > 0 && p.n > 0 && p.c >= p.n ? " all-cast" : ""),
      id: "sp-" + k, "data-name": s.name,
      "data-q": [s.name, s.short, s.school, s.subschool, s.descriptor].join(" ").toLowerCase(),
      "data-prepared": p.n > 0 ? "1" : null, "data-opposed": s.opposed ? "" : null, "data-memory": s.in_book === false ? "" : null,
    },
      h("div", { class: "sp-row" },
        h("button", { class: "prep-b", type: "button", "aria-pressed": String(p.n > 0), disabled: !canPrep, "data-k": "p-" + k,
          "aria-label": p.n > 0 ? `Unprepare ${s.name}` : `Prepare ${s.name}${s.opposed ? " (2 slots)" : ""}`,
          onclick: () => { setPrep(lvl, s.name, p.n > 0 ? 0 : 1); redrawLevel(lvl, "p-" + k); } }),
        nameBtn,
        h("span", { class: "sch-ab", title: s.school, text: ABBR[s.school] || "Univ" }),
        casts),
      detail);
  }

  function levelBlock(lvl) {
    const list = BOOK.filter((s) => s.level === lvl);
    const used = slotsUsed(lvl), cast = slotsCast(lvl);
    const ticks = h("span", { class: "ticks", "aria-hidden": "true" });
    for (let i = 0; i < SLOTS[lvl]; i++) ticks.append(h("i", { class: lvl && i < cast ? "cast" : i < used ? "filled" : null }));
    const head = h("div", { class: "lvl-head" },
      h("span", { class: "lvl-no" }, String(lvl), h("small", { text: lvl ? "level" : "cantrip" })),
      h("span", { class: "lvl-box" }, h("b", { text: String(SLOTS[lvl]) }), h("span", { class: "lbl", text: "Slots" })),
      h("span", { class: "lvl-used" }, ticks,
        h("span", { class: "lbl", text: lvl ? `${used} prepared · ${cast} expended · DC ${DC(lvl)}/${DC(lvl, "conjuration")}` : `${used} prepared · at will · DC ${DC(0)}/${DC(0, "conjuration")}` })));
    const ul = h("ul", { class: "spell-lines" }, list.map(spellLine));
    const sec = h("section", { class: "box spell-level", "data-level": lvl, "aria-label": lvl ? `Level ${lvl} spells` : "Cantrips" },
      head, ul, h("p", { class: "empty", hidden: true }));
    return sec;
  }

  function filterBook() {
    const q = bookQ.value.trim().toLowerCase();
    $$(".spell-level", book).forEach((sec) => {
      let n = 0;
      $$(".sp", sec).forEach((li) => {
        const ok = (view === "known" || li.dataset.prepared) && (!q || li.dataset.q.includes(q));
        li.hidden = !ok; if (ok) n++;
      });
      const empty = $(".empty", sec);
      empty.hidden = n > 0;
      empty.textContent = q ? "No match at this level." : view === "prepared" ? "Nothing prepared. Switch to All known and tap a bubble." : "No spells of this level in the book yet.";
    });
  }

  function redrawLevel(lvl, focusKey) {
    const old = $(`.spell-level[data-level="${lvl}"]`, book);
    const fresh = levelBlock(lvl);
    old.replaceWith(fresh);
    filterBook();
    if (focusKey) {
      const el = $(`[data-k="${focusKey}"]`, fresh) || $(`[data-k="p-${focusKey.split("-").slice(1).join("-")}"]`, fresh);
      el?.focus({ preventScroll: true });
    }
  }

  function drawBook() {
    book.replaceChildren(...[0, 1, 2, 3, 4].map(levelBlock));
    filterBook();
  }

  function setView(v) {
    view = v;
    $$(".seg-b[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
    filterBook();
  }
  $$(".seg-b[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  bookQ.addEventListener("input", () => { if (bookQ.value && view === "prepared") setView("known"); else filterBook(); });

  function setBook(data, from) {
    BOOK = data.spells.filter((s) => s.level != null && s.level <= 4).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    byName.clear();
    BOOK.forEach((s) => byName.set(s.name, s));
    const lower = new Map(BOOK.map((s) => [s.name.toLowerCase(), s.name]));
    for (const lvl of Object.keys(state.prep)) for (const n of Object.keys(prepOf(lvl))) {
      if (byName.has(n)) continue;
      const renamed = lower.get(n.toLowerCase());
      if (renamed && !state.prep[lvl][renamed]) state.prep[lvl][renamed] = state.prep[lvl][n];
      delete state.prep[lvl][n];
    }
    const links = BOOK.filter((s) => linkFor(s).label === "d20pfsrd").length;
    $("#book-src").textContent = from === "remote"
      ? `${BOOK.length} spells from the live spell list${links ? `, linked to d20pfsrd` : ""}.`
      : `Offline copy: ${BOOK.length} spells. The live list couldn't be reached.`;
    const anyPrepared = Object.values(state.prep).some((m) => Object.keys(m).length);
    view = anyPrepared ? "prepared" : "known";
    $$(".seg-b[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    drawBook(); drawScrolls();
  }
  const getJson = (url, ms) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal, cache: "no-cache" }).then((r) => { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  };
  getJson(REMOTE, 4000).then((d) => setBook(d, "remote"))
    .catch(() => getJson(LOCAL, 8000).then((d) => setBook(d, "local")))
    .catch((e) => {
      book.replaceChildren(h("p", { class: "empty", text: `The spellbook didn't load (${e.message || e}). Check the connection and reload.` }));
    });

  /* ---------- new day ---------- */
  const dayAside = $("#day-aside");
  const drawDay = () => { dayAside.textContent = `day ${state.day}`; };
  drawDay();
  $("#new-day").addEventListener("click", () => {
    for (const p of POWERS) if (p.per && !p.keep) delete state.used[p.id];
    Object.values(state.prep).forEach((m) => Object.values(m).forEach((p) => { p.c = 0; }));
    state.temp = 0;
    state.day += 1;
    save(); drawDay(); drawHp(); if (BOOK.length) drawBook(); pipSets.forEach((p) => p.redraw());
    const b = $("#new-day"); b.textContent = `Day ${state.day} begun`; setTimeout(() => { b.textContent = "Begin a new day"; }, 1800);
  });

  // Deep link: #spells/<spell-name-slug> opens that spell.
  const m = location.hash.match(/^#spells\/(.+)$/);
  if (m) {
    location.hash = "#spells";
    const wait = setInterval(() => {
      if (!BOOK.length) return;
      clearInterval(wait);
      const s = BOOK.find((x) => slug(x.name) === m[1]);
      if (!s) return;
      setView("known"); openSet.add(s.name); redrawLevel(s.level);
      $("#sp-" + slug(s.name))?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    }, 100);
    setTimeout(() => clearInterval(wait), 10000);
  }
})();
