/* ============================================================
   RITIRATO il 12/09/2026 — il service worker vero è /servizi/sw.js

   Questo file veniva registrato da PWA/pwacompat.js dal 27/04/2026,
   ma non ha mai funzionato: stando in PWA/ poteva controllare solo
   quella cartella (non il portale), e la sua lista di file da
   salvare puntava a percorsi inesistenti, quindi l'installazione
   falliva a ogni visita.

   Se un telefono l'avesse comunque registrato, questa versione si
   installa, cancella la vecchia cache e si deregistra da sola.
   Serve anche come interruttore: copiato al posto di /servizi/sw.js
   spegne il service worker del portale.
   ============================================================ */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomi = await caches.keys();
    await Promise.all(nomi
      .filter((n) => n === 'formedil-padova-v1' || n.startsWith('servizi-'))
      .map((n) => caches.delete(n)));
    await self.registration.unregister();
  })());
});
