(() => {
  "use strict";
  const REMOTE = "https://sturlabragason.github.io/pathfinder_spells/caladrel_ecthelion/spellbook.json";
  const LOCAL = "data/spellbook.json";
  const KEY = "caladrel.sheet.v1";
  const HP_MAX = 40;
  const SLOTS = { 0: 4, 1: 7, 2: 6, 3: 4, 4: 3 };
  const DC = (lvl, school) => 10 + lvl + 6 + (school === "conjuration" ? 2 : 0);
  const ORD = ["0", "1st", "2nd", "3rd", "4th"];
  const ABBR = { abjuration: "ABJ", conjuration: "CON", divination: "DIV", enchantment: "ENC", evocation: "EVO", illusion: "ILL", necromancy: "NEC", transmutation: "TRS", universal: "UNI" };

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
    for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  };
  const sign = (n) => (n < 0 ? "−" + Math.abs(n) : "+" + n);

  /* ---------- state ---------- */
  const fresh = () => ({ hp: HP_MAX, temp: 0, prep: {}, used: {}, scrolls: {}, day: 1 });
  let state;
  try { state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { state = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

  /* ---------- tabs ---------- */
  const sections = $$("main > section");
  const guides = $$(".guide");
  function show() {
    const id = (location.hash || "#record").slice(1);
    const target = sections.find((s) => s.id === "s-" + id) || sections[0];
    sections.forEach((s) => { s.hidden = s !== target; });
    guides.forEach((g) => {
      if ("#s-" + g.getAttribute("href").slice(1) === "#" + target.id) g.setAttribute("aria-current", "page");
      else g.removeAttribute("aria-current");
    });
    document.documentElement.style.setProperty("--tab-active", target.dataset.tab);
    const active = guides.find((g) => g.getAttribute("aria-current"));
    const rail = $(".guides");
    if (active && rail) {
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
  function pips(id, total, label, keep) {
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
          onclick: () => { state.used[id] = spent ? i : i + 1; save(); draw(); },
        }));
      }
      wrap.append(h("span", { class: "pip-count", text: `${total - used} left` }));
    };
    wrap.dataset.keep = keep ? "1" : "";
    wrap.redraw = draw;
    draw();
    return wrap;
  }

  /* ---------- powers ---------- */
  const POWERS = [
    { id: "shift", call: "CON · 020", name: "Shift (Su)", per: 9, aside: "swift · 15 ft",
      text: "Teleport up to 15 ft to a space you can see, as dimension door. No attack of opportunity. You can't bring other creatures, except a familiar. Replaces acid dart." },
    { id: "bond", call: "CON · 021", name: "Arcane bond", per: 1, aside: "Ring of Pengolodh",
      text: "Once per day, cast any one spell that is in your spellbook, even if it isn't prepared. It uses the spell's normal casting time and level. Without the ring, concentration DC 20 + spell level to cast at all." },
    { id: "rod", call: "UNI · 022", name: "Lesser extend rod", per: 3, aside: "metamagic",
      text: "Extend a spell of 3rd level or lower: double its duration without raising its level or casting time." },
    { id: "pentacles", call: "CON · 023", name: "Master of Pentacles", per: 1, aside: "1/day",
      text: "Rules text isn't on the Roll20 sheet. Check with the GM." },
    { id: "charm", call: "CON · 024", name: "Summoner's charm (Su)", aside: "always on",
      text: "Conjuration (summoning) spells last 3 rounds longer (half wizard level). Extend Spell doesn't double the extra rounds." },
    { id: "wand", call: "DIV · 025", name: "Wand of detect magic", per: 19, keep: true, aside: "charges",
      text: "One charge per use. Charges don't come back with a new day." },
    { id: "bolts", call: "WPN · 026", name: "Crossbow bolts", per: 5, keep: true, aside: "ammunition",
      text: "Tap a box when a bolt is fired. Clear it when you recover the bolt." },
  ];
  const powerList = $("#power-list");
  const pipSets = [];
  for (const p of POWERS) {
    const card = h("article", { class: "card power" },
      h("header", { class: "card-head" }, h("h3", { text: p.name }), h("span", { class: "aside", text: p.aside })),
      h("p", { text: p.text }));
    if (p.per) { const ps = pips(p.id, p.per, p.name, p.keep); pipSets.push(ps); card.append(ps); }
    powerList.append(card);
  }

  /* ---------- skills ---------- */
  const SKILLS = [
    ["Acrobatics", 4, 0], ["Appraise", 10, 1, "c"], ["Bluff", 1, 3], ["Climb", -2, 0],
    ["Craft (alchemy)", 10, 1, "c"], ["Craft (calligraphy)", 10, 1, "c"], ["Craft (cartography)", 10, 1, "c"],
    ["Diplomacy", 2, 4], ["Disable Device", 4, 0, "t"], ["Disguise", -2, 0], ["Escape Artist", 4, 0],
    ["Fly", 8, 1, "c"], ["Handle Animal", -2, 0, "t"], ["Heal", 0, 0], ["Intimidate", 2, 4],
    ["Knowledge (arcana)", 16, 7, "ct"], ["Knowledge (dungeoneering)", 11, 2, "ct"], ["Knowledge (engineering)", 11, 2, "ct"],
    ["Knowledge (geography)", 11, 2, "ct"], ["Knowledge (history)", 10, 1, "ct"], ["Knowledge (local)", 10, 1, "ct"],
    ["Knowledge (nature)", 10, 1, "ct"], ["Knowledge (nobility)", 10, 1, "ct"], ["Knowledge (planes)", 14, 5, "ct"],
    ["Knowledge (religion)", 11, 2, "ct"], ["Linguistics", 12, 3, "ct"], ["Perception", 7, 7], ["Perform", -2, 0],
    ["Profession", 0, 0, "ct"], ["Ride", 4, 0], ["Sense Motive", 2, 2], ["Sleight of Hand", 5, 1, "t"],
    ["Spellcraft", 16, 1, "ct"], ["Stealth", 4, 0], ["Survival", 1, 1], ["Swim", -1, 1], ["Use Magic Device", -2, 0, "t"],
  ];
  const skillList = $("#skill-list");
  for (const [name, total, ranks, flags = ""] of SKILLS) {
    const untrained = flags.includes("t") && !ranks;
    skillList.append(h("li", { "data-name": name.toLowerCase(), class: untrained ? "untrained" : null },
      h("span", {}, name, flags.includes("c") ? h("span", { class: "cs", title: "class skill", text: "c" }) : null,
        flags.includes("t") ? h("span", { class: "tr", title: "trained only", text: "t" }) : null),
      h("span", { class: "lead" }),
      h("b", { text: untrained ? "—" : sign(total) })));
  }
  $("#skill-q").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("li", skillList).forEach((li) => { li.hidden = q && !li.dataset.name.includes(q); });
  });

  /* ---------- kit ---------- */
  const aon = (q) => "https://aonprd.com/Search.aspx?Query=" + encodeURIComponent(q);
  const WORN = [
    ["Headband of Vast Intelligence", "+2 Int"], ["Rauð skikkja með logandi öxi", "resist. +2"],
    ["Amulet of Natural Armor", "+1 AC"], ["Gloves of Arrow Snaring", "", "Gloves of Arrow Snaring"],
    ["Ring of Pengolodh", "bonded"], ["Ecthëlion signet ring", ""], ["Lesser extend metamagic rod", "3/day"],
    ["Light crossbow", "4 lb"], ["Dagger", "1 lb"], ["Wand of detect magic", "19 ch."], ["Scholar's outfit", "6 lb"],
  ];
  const PACK = [
    ["Spellbook, wizard's", "×2"], ["Spell component pouch", ""], ["Belt pouch", ""], ["Scroll case", "×3"], ["Bandolier", ""],
    ["Blank scrolls", "×8"], ["Library card, Horeck", ""], ["Maps", ""], ["Notes", ""], ["Ice-salamander tongue", "×3"],
    ["Ancient Dwarven text", "unread"], ["Crossbow bolts", "×5"],
  ];
  const SCROLLS = ["Obscuring Mist", "Bull's Strength", "Swift Girding", "Knock", "Feather Fall", "Illusion of Calm",
    "Protection from Evil", "Mudball", "False Life", "Mount", "Fog Cloud", "See Invisibility", "Unidentified scroll"];
  const row = ([name, v, link]) => h("li", {}, link ? h("a", { href: aon(link), text: name }) : h("span", { text: name }), v ? h("span", { class: "lead" }) : null, v ? h("b", { class: "nowrap", text: v }) : null);
  WORN.forEach((w) => $("#kit-worn").append(row(w)));
  PACK.forEach((w) => $("#kit-pack").append(row(w)));
  function drawScrolls() {
    const ul = $("#kit-scrolls");
    ul.replaceChildren();
    let left = 0;
    for (const s of SCROLLS) {
      const used = !!state.scrolls[s];
      if (!used) left++;
      const link = s === "Unidentified scroll" ? h("span", { text: s }) : h("a", { href: "https://aonprd.com/SpellDisplay.aspx?ItemName=" + encodeURIComponent(s), text: s });
      ul.append(h("li", { class: used ? "used" : null }, link, h("span", { class: "lead" }),
        used ? h("span", { class: "stamp", text: "Void" }) : null,
        h("button", { class: "key slim", type: "button", "aria-pressed": used ? "true" : "false",
          text: used ? "Undo" : "Read",
          "aria-label": used ? `Restore scroll of ${s}` : `Read scroll of ${s}`,
          onclick: () => { state.scrolls[s] = !used; save(); drawScrolls(); } })));
    }
    $("#scroll-count").textContent = `${left} of ${SCROLLS.length}`;
  }
  drawScrolls();

  /* ---------- spells ---------- */
  let BOOK = [];
  const byName = new Map();
  const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cost = (s) => (s && s.opposed ? 2 : 1);

  function spellCard(s) {
    const open = h("div", { class: "unfold" });
    const id = "sp-" + slug(s.name);
    const facts = [["Casting", s.casting_time], ["Components", s.components], ["Range", s.range], ["Area", s.area], ["Effect", s.effect],
      ["Targets", s.targets], ["Duration", s.duration], ["Save", s.save], ["SR", s.sr]].filter(([, v]) => v);
    const hasSave = s.save && !/^none/i.test(s.save);
    const inner = h("div", { class: "unfold-inner", id },
      h("dl", { class: "facts" }, facts.flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })])),
      hasSave ? h("p", { class: "dcline" }, "Save DC ", h("b", { text: String(DC(s.level, s.school)) })) : null,
      h("div", { class: "rules ruled", html: s.text }),
      h("p", { class: "src" }, s.source ? `${s.source} · ` : "", h("a", { href: s.url, rel: "noopener", text: "Archives of Nethys" })));
    open.append(inner);
    const btn = h("button", { class: "spell-btn", type: "button", "aria-expanded": "false", "aria-controls": id },
      h("span", { class: "call", text: `${ABBR[s.school] || "UNI"}·${s.level}` }),
      h("span", { class: "spell-name", text: s.name }),
      h("span", { class: "school-mark", text: s.school + (s.subschool ? ` (${s.subschool})` : "") }),
      h("span", { class: "spell-short", text: s.short }),
      h("svg", { class: "chev", viewBox: "0 0 16 16", "aria-hidden": "true", html: '<path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/>' }));
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(on));
      card.classList.toggle("open", on);
    });
    const stamps = [];
    if (!s.in_book) stamps.push(h("span", { class: "stamp", text: "From memory" }));
    else if (s.opposed) stamps.push(h("span", { class: "stamp", text: "Opposed · 2 slots" }));
    const card = h("article", { class: "card spell", id: "card-" + slug(s.name), "data-school": s.school, "data-level": s.level,
      "data-q": (s.name + " " + s.short + " " + s.school + " " + s.subschool + " " + s.descriptor).toLowerCase() },
      stamps.length ? h("div", { class: "stamps" }, stamps) : null, btn, open);
    return card;
  }

  function drawBook() {
    const book = $("#book");
    book.replaceChildren();
    for (let lvl = 0; lvl <= 4; lvl++) {
      const list = BOOK.filter((s) => s.level === lvl);
      const sec = h("section", { class: "level", "data-level": lvl, "aria-label": `${ORD[lvl]} level` },
        h("div", { class: "level-guide" },
          h("h3", { text: lvl ? `${ORD[lvl]} level` : "Cantrips" }),
          h("span", { text: `${list.length} cards · ${SLOTS[lvl]}/day · DC ${DC(lvl)}` })));
      if (!list.length) sec.append(h("p", { class: "empty on-oak", text: "No cards filed at this level yet." }));
      list.forEach((s) => sec.append(spellCard(s)));
      book.append(sec);
    }
    filterBook();
  }
  let lvlFilter = "all";
  function filterBook() {
    const q = $("#book-q").value.trim().toLowerCase();
    let shown = 0;
    $$(".level", $("#book")).forEach((sec) => {
      const lvlOk = lvlFilter === "all" || sec.dataset.level === lvlFilter;
      let n = 0;
      $$(".spell", sec).forEach((c) => { const ok = lvlOk && (!q || c.dataset.q.includes(q)); c.hidden = !ok; if (ok) n++; });
      sec.hidden = !lvlOk || (q && !n);
      shown += n;
    });
    $("#book-count").textContent = q || lvlFilter !== "all" ? `${shown} of ${BOOK.length}` : `${BOOK.length} cards`;
  }
  $("#book-q").addEventListener("input", filterBook);
  $$("[data-lvl]").forEach((b) => b.addEventListener("click", () => {
    lvlFilter = b.dataset.lvl;
    $$("[data-lvl]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    filterBook();
  }));

  function openSpell(name) {
    const card = document.getElementById("card-" + slug(name));
    if (!card) return;
    const btn = card.querySelector(".spell-btn");
    if (btn.getAttribute("aria-expanded") !== "true") btn.click();
    card.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    btn.focus({ preventScroll: true });
  }

  function drawPrep() {
    const root = $("#prep");
    root.replaceChildren();
    let open = 0, total = 0;
    for (let lvl = 0; lvl <= 4; lvl++) {
      const list = (state.prep[lvl] ||= []).filter((p) => byName.has(p.n));
      state.prep[lvl] = list;
      const used = list.reduce((a, p) => a + cost(byName.get(p.n)), 0);
      const free = SLOTS[lvl] - used;
      open += Math.max(0, free); total += SLOTS[lvl];
      const known = BOOK.filter((s) => s.level === lvl);
      const boxes = h("span", { class: "slots", "aria-label": `${used} of ${SLOTS[lvl]} slots filed` });
      for (let i = 0; i < SLOTS[lvl]; i++) boxes.append(h("i", { class: i < used ? "full" : "" }));
      const block = h("div", { class: "prep-level" },
        h("div", { class: "prep-head" }, h("h4", { text: lvl ? `${ORD[lvl]} · DC ${DC(lvl)}` : `Cantrips · DC ${DC(0)}` }), boxes));
      const ul = h("ul", { class: "prep-list" });
      list.forEach((p, i) => {
        const s = byName.get(p.n);
        ul.append(h("li", { "data-school": s.school, class: p.c ? "cast" : null },
          h("button", { class: "sch linkish", type: "button", text: s.name + (s.opposed ? " (2 slots)" : ""), "aria-label": `Read ${s.name}`, onclick: () => openSpell(s.name) }),
          p.c ? h("span", { class: "stamp", text: "Cast" }) : null,
          lvl ? h("button", { class: "key slim", type: "button", "aria-pressed": p.c ? "true" : "false",
            text: p.c ? "Undo" : "Cast", "aria-label": `${p.c ? "Undo casting" : "Cast"} ${s.name}`,
            onclick: () => { p.c = !p.c; save(); drawPrep(); } }) : null,
          p.c ? null : h("button", { class: "key slim ghost", type: "button", text: "Unfile", "aria-label": `Remove ${s.name} from today's slots`,
            onclick: () => { list.splice(i, 1); save(); drawPrep(); } })));
      });
      block.append(ul);
      if (lvl && known.length && !list.some((p) => byName.get(p.n).school === "conjuration"))
        block.append(h("p", { class: "hint", text: "The school slot wants a conjuration spell." }));
      if (!known.length) {
        block.append(h("p", { class: "empty", text: "No spells of this level in the book yet." }));
      } else if (free > 0) {
        const sel = h("select", { class: "field", "aria-label": `File a ${ORD[lvl]}-level spell` },
          h("option", { value: "", text: `File a spell… (${free} open)` }),
          known.map((s) => h("option", { value: s.name, disabled: cost(s) > free ? true : null,
            text: s.name + (s.opposed ? " · 2 slots" : "") + (s.school === "conjuration" ? " · conj." : "") })));
        sel.addEventListener("change", () => { if (sel.value) { list.push({ n: sel.value, c: false }); save(); drawPrep(); } });
        block.append(sel);
      }
      root.append(block);
    }
    $("#prep-aside").textContent = `${open} of ${total} open`;
  }

  function setBook(data, from) {
    BOOK = data.spells.filter((s) => s.level != null && s.level <= 9);
    BOOK.forEach((s) => byName.set(s.name, s));
    $("#book-src").textContent = from === "remote"
      ? `Filed from pathfinder_spells: ${BOOK.length} spells.`
      : `Offline copy: ${BOOK.length} spells. The live list couldn't be reached.`;
    drawBook(); drawPrep();
  }
  const getJson = (url, ms) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal, cache: "no-cache" }).then((r) => { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  };
  getJson(REMOTE, 4000).then((d) => setBook(d, "remote"))
    .catch(() => getJson(LOCAL, 8000).then((d) => setBook(d, "local")))
    .catch((e) => {
      $("#prep").replaceChildren(h("p", { class: "empty", text: `The spellbook didn't load (${e.message || e}). Check the connection and reload.` }));
    });

  /* ---------- new day ---------- */
  const dayAside = $("#day-aside");
  const drawDay = () => { dayAside.textContent = `day ${state.day}`; };
  drawDay();
  $("#new-day").addEventListener("click", () => {
    for (const p of POWERS) if (p.per && !p.keep) delete state.used[p.id];
    Object.values(state.prep).forEach((l) => l.forEach((p) => { p.c = false; }));
    state.temp = 0;
    state.day += 1;
    save(); drawDay(); drawHp(); drawPrep(); pipSets.forEach((p) => p.redraw());
    const b = $("#new-day"); b.textContent = `Day ${state.day} begun`; setTimeout(() => { b.textContent = "Begin a new day"; }, 1800);
  });
})();
