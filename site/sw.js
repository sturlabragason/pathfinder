// Service worker: keeps the sheet usable offline at the table.
// The cache is named after the ?v= that sheet.js registers this file with, so a version bump drops the old cache.
// Pages, scripts, styles and data are network-first (online you always get the latest, including new tabs);
// fonts and images are cache-first. The cache is only the fallback when the network is down or slow.
const VERSION = new URL(self.location.href).searchParams.get("v") || "0";
const CACHE = "caladrel-" + VERSION;
const TIMEOUT = 3500;
const SPELLBOOK = "https://sturlabragason.github.io/pathfinder_spells/caladrel_ecthelion/spellbook.json";

// Precache the page and everything it links to, read from the live HTML so the list never goes stale.
async function precache() {
  const cache = await caches.open(CACHE);
  const urls = new Set(["./", "manifest.json", "data/spellbook.json", "icon-192.png", "icon-512.png"]);
  const grab = async (path, re) => {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) return;
    const text = await res.clone().text();
    for (const m of text.matchAll(re)) {
      const u = new URL(m[1], new URL(path, self.location.href));
      if (u.origin === self.location.origin && !u.pathname.endsWith(".pdf")) urls.add(u.href);
    }
    return text;
  };
  await grab("./", /(?:href|src)="([^"#:]+)"/g);
  await grab("fonts/alegreya.css", /url\(["']?([^"')]+)["']?\)/g).catch(() => {});
  await Promise.all([...urls].map((u) => cache.add(new Request(u, { cache: "no-cache" })).catch(() => {})));
}

self.addEventListener("install", (e) => { e.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("caladrel-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirst(req, fallbackKey) {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then((res) => {
    if (res.ok) cache.put(fallbackKey || req, res.clone());
    return res;
  });
  net.catch(() => {});
  const timer = new Promise((resolve) => setTimeout(resolve, TIMEOUT));
  try {
    const first = await Promise.race([net, timer]);
    if (first) return first;
  } catch { /* offline: fall through to the cache */ }
  const hit = await cache.match(fallbackKey || req);
  return hit || net;
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" && url.origin === self.location.origin) {
    e.respondWith(networkFirst(req, new URL("./", self.location.href).href));
  } else if (url.origin === self.location.origin) {
    if (/\.pdf$/.test(url.pathname)) return;
    e.respondWith(/\.(woff2|png|jpe?g|svg)$/.test(url.pathname) ? cacheFirst(req) : networkFirst(req));
  } else if (url.href.split("?")[0] === SPELLBOOK) {
    e.respondWith(networkFirst(req));
  }
});
