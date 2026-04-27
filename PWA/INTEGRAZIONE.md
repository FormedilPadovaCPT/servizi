# Integrazione PWA in index.html

## 1. Aggiungere i meta tag nel `<head>` (obbligatorio)

Cerca nel file `index.html` la sezione `<head>` e aggiungi questi meta tag **prima** di qualsiasi altro link:

```html
<head>
  <!-- PWA Meta Tags - aggiungere all'inizio del <head> -->
  <meta name="theme-color" content="#1e2d5e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Formedil PD">
  <link rel="manifest" href="PWA/manifest.json">

  <!-- Icone per iOS -->
  <link rel="apple-touch-icon" href="PWA/icons/icon-192x192.png">

  <!--[ resto del head esistente ]-->
```

## 2. Aggiungere lo script di registrazione prima di `</body>` (obbligatorio)

Cerca la chiusura del `</body>` e **prima** di essa aggiungi:

```html
  <!-- PWA Service Worker Registration -->
  <script src="PWA/pwacompat.js"></script>
</body>
```

## 3. Verificare che sw.js sia accessibile

Assicurati che il file `sw.js` sia raggiungibile da:
`https://tuo-dominio.it/servizi/PWA/sw.js`

---

## Checklist

- [ ] Meta tag aggiunti nel `<head>`
- [ ] Link al manifest.json nel `<head>`
- [ ] Script pwacompat.js incluso prima di `</body>`
- [ ] File sw.js caricato sul server
- [ ] File manifest.json caricato sul server
- [ ] Icone create in PWA/icons/ (minimo 192x192 e 512x512)

---

## Path relativi vs assoluti

Se il sito è in una sottocartella (es. `/servizi/`), usa path relativi:
- `PWA/manifest.json` → funziona se index.html è in `/servizi/`

Se il sito è nella root (es. `/`), usa path assoluti:
- `/PWA/manifest.json`
- `/PWA/sw.js`
