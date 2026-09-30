# I moduli del portale servizi dentro un altro sito — guida per chi sviluppa

Formedil Padova · Area Sicurezza e Salute — versione del 30/09/2026

I moduli con cui si chiedono i servizi dell'Area (visita in cantiere, RLST, segnalazione…) si possono
montare dentro le pagine del sito dell'ente come **blocchi**. Il modulo resta quello del portale: campi,
controlli, invio e ricevuta li teniamo noi, e quando un modulo cambia cambia anche nel sito, senza
interventi. A chi sviluppa il sito spettano due cose: **dove** metterlo e **come vestirlo**.

> L'indirizzo usato negli esempi è quello di oggi, `https://formedilpadovacpt.github.io/servizi/`.
> Prima della messa online vi confermiamo quello definitivo.

## 1. Montare un blocco

Nel punto della pagina in cui deve comparire il modulo:

```html
<div data-formedil-modulo="visita"></div>
<script src="https://formedilpadovacpt.github.io/servizi/incorpora.js" async></script>
```

Lo script si include **una volta sola**, anche con più moduli nella stessa pagina. Crea il riquadro, lo tiene
alto quanto il modulo (niente barre di scorrimento interne) e porta la pagina sul punto giusto quando c'è un
errore da correggere o la ricevuta da leggere. Non legge e non scrive niente della pagina che lo ospita.

Se i moduli vengono aggiunti alla pagina dopo il caricamento (contenuti caricati via script, schede, finestre),
si chiama `FormedilModuli.monta()`.

### I blocchi

| `data-formedil-modulo` | Servizio | Allegati |
|---|---|---|
| `rlst` | Affidamento al servizio RLST | 1 PDF |
| `rls` | Comunicazione del RLS eletto | 2 PDF |
| `conferenza` | Conferenza di cantiere | — |
| `visita` | Visita in cantiere o serie di visite | — |
| `consulenza` | Richiesta di consulenza | — |
| `attestazione` | Attestazione DM 132/2024 | — |
| `notifica` | Notifica di cantiere | — |
| `segnalazione` | Segnalazione di un cantiere (anche anonima) | fino a 3 foto |
| `questionario` | Valutazione del sopralluogo | — |
| `iscrizioni` | Corsi e incontri con le iscrizioni aperte, e il modulo di iscrizione | file Excel facoltativo |
| `campionario` | Tutti gli elementi dei moduli, per scrivere lo stile. **Non invia niente** | — |

### Opzioni, sul `<div>`

| Attributo | A che cosa serve |
|---|---|
| `data-formedil-introduzione="si"` | Mostra anche il testo di presentazione del servizio che c'è nell'app. Di norma non serve: quel testo lo scrive la pagina che ospita. |
| `data-formedil-margine="120"` | Pixel da lasciare in alto quando la pagina viene portata sul modulo. Serve con una testata fissa; se manca vale 90. |
| `data-formedil-altezza="900"` | Altezza provvisoria del riquadro prima che il modulo dica la sua (se manca, 600). Evita il salto della pagina al caricamento. |

### Eventi

Partono dal `<div>` e risalgono fino a `document`:

| Evento | Quando |
|---|---|
| `formedil:pronto` | il modulo è visibile |
| `formedil:inviata` | una richiesta è stata registrata |

```js
document.addEventListener('formedil:inviata', function (e) {
  // e.target è il <div> del modulo: e.target.getAttribute('data-formedil-modulo')
});
```

Negli eventi non passa **nessun dato** di chi ha compilato: servono a contare le richieste, non a leggerle.

### Collegamenti diretti

Se l'indirizzo della pagina ospite porta `?iscrizione=CODICE`, il blocco `iscrizioni` si apre direttamente
su quell'evento. Lo stesso vale per `?valuta=…` e il blocco `questionario`. Sono i due soli parametri che
passano dalla pagina al modulo.

### Senza script

Dove non si può inserire uno script esterno, il blocco è un indirizzo e si incorpora così:

```html
<iframe src="https://formedilpadovacpt.github.io/servizi/?blocco=visita"
        title="Richiesta di visita in cantiere" style="width:100%;height:1600px;border:0"></iframe>
```

Funziona, ma l'altezza è fissa e lo scorrimento avviene dentro il riquadro. Se potete, usate lo script.

## 2. La veste

Il blocco nasce con uno stile neutro. La grafica del sito gliela dà **un foglio di stile scritto e tenuto da
voi**, pubblicato sul sito dell'ente a un indirizzo concordato: il blocco lo carica da lì, per ultimo. Quando
ritoccate la grafica del sito ritoccate quel file, senza passare da noi. Se il file non risponde, il blocco
si presenta con lo stile neutro e continua a funzionare.

Per scriverlo si lavora sul **campionario**: `…/servizi/?blocco=campionario` (oppure
`…/servizi/blocco/prova.html?modulo=campionario`, che lo mostra dentro una pagina finta). C'è un modulo
vero e, sotto, gli elementi che in quel modulo non compaiono e gli stati che si vedono solo dopo l'invio,
ognuno col suo nome di classe. Un esempio di veste, per vedere fin dove si arriva:
`…/servizi/?blocco=campionario&veste=esempio` (file `blocco/veste-esempio.css`).

### Primo livello: le variabili

Bastano queste per colori, carattere e forma:

```css
:root {
  --carattere: 'Il vostro carattere', sans-serif;
  --corpo: 15px;               /* testo dentro i campi */
  --accento: #FF571D;          /* pulsante di invio, titoli di sezione, stato attivo */
  --accento-scuro: #d9420c;
  --tinta: #fff1ea;            /* sfondo tenue di scelte selezionate e note */
  --testo: #2b2b2b;
  --testo-tenue: #5d6b73;      /* etichette, testi di aiuto */
  --bordo: #cfd6da;
  --campo: #ffffff;            /* sfondo dei campi */
  --riquadro: #f5f5f5;         /* sfondo dei riquadri: sezioni ripetute, privacy */
  --raggio: 0px;
  --errore: #e24b4a;  --errore-sfondo: #fcebeb;  --errore-testo: #a32d2d;
  --ok: #3b6d11;      --ok-sfondo: #eaf3de;
}
```

Il carattere va caricato dal vostro foglio di stile (`@font-face` o `@import`): il blocco è una pagina a sé
e non eredita quello del sito.

### Secondo livello: le classi

Si scrivono **semplici**, senza prefissi e senza `!important`: il vostro foglio si carica per ultimo e a
parità di selettore vince.

```css
.btn-send { border-radius: 999px; text-transform: uppercase; }
.section-title { font-size: 18px; text-transform: none; }
```

| Classe | Che cos'è |
|---|---|
| `.prog-wrap` `.prog-label` `.prog-bar` `.prog-fill` | barra di avanzamento della compilazione |
| `.section-title` | titolo di una sezione del modulo |
| `.grid-2` `.grid-3` `.grid-4` `.col-full` | griglie dei campi (una colonna sotto i 768 px di larghezza del blocco) |
| `.field` | un campo con la sua etichetta; `label`, `label .req` (asterisco), `label small` |
| `input` `select` `textarea` | i campi; `.err` sul campo da correggere |
| `.field-hint` | riga di aiuto sotto un campo |
| `.radio-group` `.radio-opt` | scelta singola; `.radio-opt.sel` quella scelta |
| `.check-group` `.check-opt` | scelta multipla; `.check-opt.sel` quelle scelte; `.check-children` sotto-scelte |
| `.request-grid` `.request-card` | scelta a schede (conferenza di cantiere); `.request-card.selected`; `.rc-icon` `.rc-label` `.rc-sub` |
| `.file-area` | caricamento di un PDF; `.fi-icon` `.fi-text` `.fi-sub`; `.file-name.ok` / `.file-name.err-msg` |
| `.photo-upload-area` `.photo-preview` | caricamento delle foto (segnalazione) |
| `.cantiere-block` `.cantiere-block-title` | riquadro di una sezione che si ripete (più cantieri, più figure, più imprese) |
| `.info-box` `.form-note` `.conditions-box` | note e avvertenze dentro il modulo |
| `.privacy-box` | riquadro dell'informativa con la spunta |
| `.btn-row` `.btn-reset` `.btn-send` | pulsanti; `.btn-send:disabled`; `.spinner` durante l'invio |
| `.error-banner` | messaggio di invio non riuscito |
| `.success-banner` `.ricevuta` `.btn-new` | ricevuta a invio riuscito |
| `.fb-avviso` | avviso dentro il modulo (una foto di troppo, un file non valido) |
| `.is-card` `.is-p` `.is-t` `.is-q` `.is-d` `.is-posti` `.is-vuoto` | blocco `iscrizioni`: scheda di un corso, elenco vuoto |
| `.iz-persona` `.iz-aggiungi` `.iz-togli` `.iz-avviso` `.qz-rif` | blocco `iscrizioni`: scheda di un partecipante, riepilogo dell'evento |

**Questi nomi e le variabili sono un impegno**: non li cambiamo senza avvisarvi. Le altre classi che si
vedono nel codice possono cambiare.

Alcuni elementi hanno stili scritti dentro la pagina (le classi `.is-*`, `.iz-*`, `.qz-*`): se una vostra
regola non prende, anteponete `html` al selettore (`html .is-card { … }`).

## 3. Che cosa non serve fare

- **Nessun server, database o casella di posta**: il blocco consegna ai nostri sistemi. Chi compila vede il
  numero di ricevuta e riceve una mail di conferma; l'ufficio trova la pratica aperta.
- **Nessun cookie, nessun tracciamento.** Il blocco tiene sul dispositivo, per qualche giorno, la sola
  richiesta non ancora consegnata, per ritentare se manca la rete: è memoria tecnica.
- **Nessuna validazione da riscrivere**, nessun testo del modulo da copiare.

## 4. Se il sito filtra i contenuti

Con una Content-Security-Policy vanno ammessi, per l'indirizzo del portale: `script-src` (per
`incorpora.js`) e `frame-src` (per il riquadro). Nient'altro: le chiamate ai nostri sistemi partono da
dentro il riquadro, non dalla pagina.

## 5. Provare

`…/servizi/blocco/prova.html` è una pagina finta con testata fissa, testo e piede, in cui si sceglie il
modulo, la veste e l'introduzione, e si leggono gli eventi. ⚠️ Tutti i blocchi tranne `campionario`
**inviano davvero**: per le prove di invio scrivete «PROVA» nella ragione sociale e avvisateci
(`cpt@formedilpadova.it`, 049 761168).
