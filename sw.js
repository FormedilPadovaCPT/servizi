/* ============================================================
   Service worker del portale servizi (12/09/2026)

   Serve a due cose: che il portale si possa installare sul
   telefono come un'app, e che si apra anche con poca o nessuna
   rete (in cantiere capita). Non contiene logica del portale.

   Regole, nell'ordine in cui contano:
   1. Si occupa SOLO dei file del portale (stessa origine e dentro
      /servizi/). Moduli, notizie, Supabase, Google, font: non li
      tocca. Le richieste che non sono GET non le vede nemmeno.
      Sulla stessa origine ci sono anche le altre app dell'ente:
      per questo non si esce da /servizi/ e si cancellano solo le
      cache che iniziano con «servizi-».
   2. Rete prima, sempre scavalcando la cache HTTP (GitHub Pages
      tiene i file 10 minuti): una pubblicazione si vede subito.
      La copia salvata serve solo quando la rete manca. Unica
      eccezione le IMMAGINI: se la rete non risponde entro ATTESA_MS
      si mostra la copia e la rete intanto aggiorna quella della volta
      dopo. HTML, script e stili no: la pagina contiene i moduli, e
      chi è online ma lento non deve compilarne uno vecchio.
   3. Nessun ricaricamento automatico della pagina quando esce una
      versione nuova: cancellerebbe un modulo mentre lo si compila
      (lo faceva il vecchio PWA/pwacompat.js, ritirato oggi).

   4. Avvisi delle notizie (13/09/2026): riceve la notifica mandata
      dalla funzione push-notizie (progetto Servizi) e la mostra; al
      tocco apre la pagina Notizie. Se il portale e' gia' aperto NON lo
      ricarica: gli chiede di mostrare la pagina (regola 3).

   Per spegnerlo del tutto: sostituire questo file con il
   contenuto di PWA/sw.js (si installa, svuota la cache e si
   deregistra da solo).
   ============================================================ */

const VERSIONE = 'servizi-v4';
const PREFISSO = 'servizi-';
const ATTESA_MS = 4000;

// Il minimo per aprire il portale senza rete. Se un file manca
// l'installazione va avanti lo stesso (niente addAll).
const DA_SALVARE = [
  './',
  'PWA/manifest.json',
  'PWA/icons/icon-192x192.png',
  'PWA/icons/icon-512x512.png',
  'PWA/icons/apple-touch-icon.png',
  'Logo_Formedil_pd_piccolo.png',
  'Formedil_Padova_Positivo_colori.png',
  // la veste grafica (14/09/2026): ?v= deve essere lo stesso di index.html,
  // perché per questi file la copia si cerca con la query
  'veste-sito3.css?v=21',
  'veste-sito3.js?v=21',
  'img/sito/logo-formedil-padova.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSIONE);
    await Promise.all(DA_SALVARE.map((u) =>
      cache.add(new Request(u, { cache: 'reload' })).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomi = await caches.keys();
    await Promise.all(nomi
      .filter((n) => (n.startsWith(PREFISSO) && n !== VERSIONE) || n === 'formedil-padova-v1')
      .map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

const attesa = (ms) => new Promise((ok) => setTimeout(ok, ms));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scope = self.registration.scope;
  if (url.origin !== self.location.origin || !url.href.startsWith(scope)) return;

  // La home si salva sempre sotto la stessa chiave, qualunque sia la
  // query (?pagina=…): è quella che serve quando manca la rete.
  const home = req.mode === 'navigate' &&
    (url.pathname === new URL(scope).pathname || url.pathname === new URL('index.html', scope).pathname);
  const chiave = home ? new URL('./', scope).href : req;

  const pazienza = req.destination === 'image' ? ATTESA_MS : 0;

  e.respondWith((async () => {
    const cache = await caches.open(VERSIONE);
    // La query si ignora solo per la home: per gli altri file (?v=6 delle
    // vesti) una copia di un'altra versione sarebbe la copia sbagliata.
    const copia = () => caches.match(chiave, { ignoreSearch: home });

    if (self.navigator && self.navigator.onLine === false) {
      const salvata = await copia();
      if (salvata) return salvata;
    }

    const dallaRete = fetch(req, { cache: 'no-cache' }).then((r) => {
      if (r.ok && r.status === 200 && r.type === 'basic') {
        e.waitUntil(cache.put(chiave, r.clone()).catch(() => {}));
      }
      return r;
    });
    e.waitUntil(dallaRete.then(() => {}, () => {}));

    try {
      if (!pazienza) return await dallaRete;
      return await Promise.race([
        dallaRete,
        attesa(pazienza).then(async () => (await copia()) || dallaRete),
      ]);
    } catch (err) {
      const salvata = await copia();
      if (salvata) return salvata;
      throw err;
    }
  })());
});

// ── Avvisi delle notizie ─────────────────────────────────────
// Il messaggio arriva cifrato e lo decifra il browser: { titolo, testo, url, tag }.
// Ogni avviso ricevuto va mostrato (iPhone toglie il permesso a chi non lo fa).
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { testo: e.data ? e.data.text() : '' }; }
  const titolo = String(d.titolo || 'Formedil Padova – Notizie').slice(0, 120);
  e.waitUntil(self.registration.showNotification(titolo, {
    body: String(d.testo || '').slice(0, 240),
    icon: 'PWA/icons/icon-192x192.png',
    tag: String(d.tag || 'notizie'),
    lang: 'it',
    data: { url: typeof d.url === 'string' ? d.url : './?pagina=notizie' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const scope = self.registration.scope;
  let dest;
  try { dest = new URL((e.notification.data && e.notification.data.url) || './?pagina=notizie', scope); }
  catch (err) { dest = new URL('./?pagina=notizie', scope); }
  if (!dest.href.startsWith(scope)) dest = new URL('./?pagina=notizie', scope);   // mai fuori dal portale
  const pagina = dest.searchParams.get('pagina') || 'notizie';
  e.waitUntil((async () => {
    const aperte = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of aperte) {
      if (c.url.startsWith(scope)) {
        c.postMessage({ tipo: 'apri-pagina', pagina });
        return c.focus();
      }
    }
    return self.clients.openWindow(dest.href);
  })());
});
