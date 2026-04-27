# PWA Formedil Padova - Istruzioni di Deploy

## Contenuto cartella PWA

| File | Descrizione |
|------|-------------|
| `manifest.json` | Configurazione PWA (nome, icone, colors, shortcuts) |
| `sw.js` | Service Worker per cache offline |
| `pwacompat.js` | Registrazione Service Worker + gestione install |
| `README.md` | Questa guida |

---

## Come attivare la PWA

### 1. Caricare i file sul server

Carica **tutta la cartella `PWA/`** nella root del tuo sito web, in modo che sia accessibile da:

```
https://tuo-dominio.it/servizi/PWA/manifest.json
https://tuo-dominio.it/servizi/PWA/sw.js
```

### 2. Aggiungere i tag meta nell'HTML

In `index.html`, dentro il `<head>`, aggiungi:

```html
<!-- PWA Meta Tags -->
<meta name="theme-color" content="#1e2d5e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Formedil PD">
<link rel="manifest" href="/servizi/PWA/manifest.json">
```

### 3. Includere lo script di registrazione

Prima della chiusura `</body>` in `index.html`:

```html
<script src="/servizi/PWA/pwacompat.js"></script>
```

### 4. Creare le icone

Crea una cartella `icons/` dentro `PWA/` con le seguenti immagini PNG:

| File | Dimensioni |
|------|------------|
| `icon-72x72.png` | 72x72 px |
| `icon-96x96.png` | 96x96 px |
| `icon-128x128.png` | 128x128 px |
| `icon-144x144.png` | 144x144 px |
| `icon-152x152.png` | 152x152 px |
| `icon-192x192.png` | 192x192 px |
| `icon-384x384.png` | 384x384 px |
| `icon-512x512.png` | 512x512 px |

**Nota:** Puoi usare il logo Formedil come base. Le icone devono essere quadrate (senza sfrangiature).

### 5. (Opzionale) Screenshot

Crea una cartella `screenshots/` dentro `PWA/` con uno screenshot dell'app (`home.png`, 1280x720px).

---

## Test locale

1. Apri `index.html` con Chrome
2. Apri DevTools → Application → Service Workers
3. Verifica che il Service Worker sia registrato
4. In DevTools → Application → Manifest, verifica il manifest

---

## Per pubblicare su GitHub Pages

1. Copia la cartella `PWA/` nel branch `gh-pages`
2. Assicurati che i path nel manifest siano corretti:
   - `/servizi/PWA/manifest.json`
   - `/servizi/PWA/sw.js`

---

## Funzionalità PWA

- ✅ Installabile sul telefono ("Aggiungi alla schermata Home")
- ✅ Funziona offline (visualizza la cache)
- ✅ Shortcuts nel menu contestuale
- ✅ Tema color conforme al brand Formedil

---

## Aggiornare la PWA

Quando pubblichi una nuova versione:
1. Aggiorna il Service Worker (cambia `CACHE_NAME` in `v2`, `v3`, ecc.)
2. Ogni utente riceverà la notifica di aggiornamento al prossimo accesso
