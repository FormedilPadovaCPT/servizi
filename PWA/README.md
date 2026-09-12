# App sul telefono — manifest, icone, service worker

> Riscritto il **12/09/2026**. La versione precedente di questo file (e `INTEGRAZIONE.md`, tolto) descriveva un'impostazione del 27/04/2026 che **non ha mai funzionato**: il service worker stava in `PWA/`, quindi poteva controllare solo questa cartella e non il portale, e la sua lista di file puntava a percorsi inesistenti (`/servizi/foto/…`), per cui l'installazione falliva a ogni visita. Inoltre `pwacompat.js` ricaricava la pagina a ogni aggiornamento, cioè avrebbe cancellato un modulo mentre lo si compilava.

## Dove stanno le cose

| File | A cosa serve |
|---|---|
| `../sw.js` | **Il service worker vero.** Sta nella radice del portale perché GitHub Pages non permette di allargare lo scope con un'intestazione: da `PWA/` controllerebbe solo `PWA/`. |
| `manifest.json` | Nome, icone, colori, schermate e scorciatoie. I percorsi sono **relativi al manifest** (`"../"`), così funziona uguale in locale e su `/servizi/`. Solo `id` è assoluto (`/servizi/`): è l'identità dell'app installata e **non va cambiato**, altrimenti i telefoni la vedono come un'app diversa. |
| `sw.js` | **Ritirato.** Se un telefono l'avesse registrato, si installa, svuota la vecchia cache e si deregistra. Copiato al posto di `../sw.js` è l'interruttore che spegne il service worker del portale. |
| `icons/icon-*.png` | Icone «any» (logo ufficiale su bianco). |
| `icons/icon-maskable-*.png` | Icone per Android, che le ritaglia a cerchio o goccia: lo stesso logo, **non alterato**, rimpicciolito dentro la zona sicura (cerchio dell'80%). |
| `screenshots/home-*.png` | Schermate mostrate da Chrome nella finestra di installazione (telefono 1080×2340, PC 1280×800), catturate dal portale pubblico il 12/09/2026. |
| `pwa-test.html` | Pagina di prova storica, non collegata. |

La registrazione e l'invito a installare stanno in fondo a `../index.html`, sezione «APP SUL TELEFONO».

## Come si comporta il service worker

1. **Solo i file del portale**: stessa origine e dentro `/servizi/`. Moduli (Apps Script), specchio e notizie (Supabase), font e Telegram non passano da lì; le richieste non GET non le vede nemmeno. Sulla stessa origine `formedilpadovacpt.github.io` vivono anche le altre app dell'ente: per questo non esce da `/servizi/` e cancella solo le cache che iniziano con `servizi-`.
2. **Rete prima**, scavalcando la cache HTTP di GitHub Pages (10 minuti): una pubblicazione si vede subito, meglio di prima. La copia salvata serve **solo se la rete manca**. Unica eccezione le **immagini**: dopo 4 secondi senza risposta si prende la copia, e la rete intanto aggiorna quella della volta dopo. HTML, script e stili aspettano sempre la rete quando c'è: la pagina contiene i moduli, e chi è online ma lento non deve compilarne uno vecchio (corretto in revisione prima della pubblicazione).
3. **Nessun ricaricamento automatico** quando esce una versione nuova.
4. Le richieste già compilate e non partite **restano nella coda IndexedDB del portale** (7 giorni) e ripartono al ritorno della rete: quello non è compito del service worker e non è cambiato.

**Quando si alza `VERSIONE`** (`servizi-v1` → `v2`): solo se cambia la lista `DA_SALVARE` o il comportamento del service worker. **Non serve** per pubblicare modifiche al portale, che con la rete prima arrivano da sole.

## L'invito a installare

- **Android / Chrome / Edge**: il browser annuncia che il portale si può installare (`beforeinstallprompt`); la barra «Aggiungi l'app al telefono» con **Installa** apre la finestra di sistema.
- **iPhone / iPad**: Safari non ha un pulsante; la barra spiega «Tocca Condividi, poi Aggiungi alla schermata Home». **Solo in Safari**: nei browser interni alle app (il link aperto da Telegram, WhatsApp, Facebook…) e in Chrome/Firefox per iPhone quel comando non c'è o sta altrove, e un'istruzione sbagliata farebbe premere «Ho capito» tacendo l'invito per 30 giorni. Il browser interno che usa Safari (SFSafariViewController) non si distingue da Safari: lì l'istruzione può ancora comparire.
- La barra compare **solo sul telefono, solo in home, dopo 5 secondi**, e sparisce appena si apre un'altra pagina: dentro un modulo non c'è mai. «Non ora» la tace per **30 giorni** (`localStorage` `servizi.invitoApp.chiusoIl`). La voce **«Installa l'app»** nel menu resta sempre, finché il portale non è installato.
- Scorciatoie dall'icona (pressione lunga su Android): Segnala un cantiere, Richiesta consulenza, Notizie → `?pagina=<id>`, che `index.html` apre all'avvio.

## Come si verifica

In locale: `.claude/launch.json` del vault, configurazione `servizi-static` (porta 8767). In Chrome, DevTools → Application → Manifest e Service workers; oppure da console:

```js
(await navigator.serviceWorker.getRegistrations()).map(r => r.scope)   // una sola, la radice del portale
await caches.keys()                                                     // ['servizi-v1']
```

Prova senza rete: aperta la pagina una volta, fermare il server e ricaricare. Deve comparire il portale.

⚠️ **Dopo la pubblicazione, sul telefono**: la prima visita registra il service worker, dalla seconda la pagina è sotto il suo controllo. Chi aveva il portale già aperto non deve fare niente.
