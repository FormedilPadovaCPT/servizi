/* ============================================================
   Veste grafica del portale servizi: «Sito 3 · Sportello»

   Proposta libera del 13/09/2026, scelta dall'utente il 14/09/2026 come
   unica veste del portale: index.html la carica sempre (data-veste="sito3").
   Lo sportello online dell'Area Sicurezza e Salute.
   - Home che parte da «Cosa ti serve?»: ricerca che capisce anche le
     parole di chi scrive («patente a crediti», «corso», «pericolo») e
     quattro situazioni; i servizi sono righe con icona, nome, frase ed
     etichetta. In evidenza la segnalazione di un cantiere pericoloso e
     l'ultima notizia; in fondo i contatti, col telefono che si tocca.
   - Pagine dei servizi con un'intestazione semplice e «Tutti i servizi».
   - Sul telefono una barra in basso: Servizi, Notizie, Segnala, Contatti.

   Titoli, descrizioni ed etichette si leggono dalle schede della home
   (.service-card); ogni riga apre la stessa pagina di prima (showPage).
   Niente viene tolto dalla pagina: la veste attuale e' solo nascosta.
   ============================================================ */
(function () {
  'use strict'

  var SITUAZIONI = [
    { id: 'cantiere', nome: 'Ho un cantiere', frase: 'Visite, notifiche, segnalazioni e valutazioni', pagine: ['visita', 'conferenza', 'notifica', 'segnalazione', 'questionario'] },
    { id: 'impresa', nome: 'Per la mia impresa', frase: 'Rappresentanti per la sicurezza, consulenza e attestazioni', pagine: ['rlst', 'rls', 'consulenza', 'attestazione', 'asseverazione'] },
    { id: 'formazione', nome: 'Formazione e strumenti', frase: 'Corsi per i lavoratori e applicativi online', pagine: ['cor', 'cds', 'myapp'] },
    { id: 'informato', nome: 'Resta informato', frase: 'Notizie dell\'Area e canale Telegram', pagine: ['notizie', 'telegram'] }
  ]
  /* parole con cui la gente cerca, oltre al titolo e alla descrizione della scheda */
  var PAROLE = {
    visita: 'sopralluogo tecnico ispezione controllo cantiere',
    conferenza: 'formazione informazione dipendenti operai in cantiere riunione',
    notifica: 'notifica preliminare apertura cantiere inizio lavori ripresa art 99',
    segnalazione: 'pericolo pericoloso rischio anonimo anonima denuncia foto',
    questionario: 'valutazione gradimento giudizio questionario opinione',
    rlst: 'rappresentante territoriale lavoratori sicurezza affidamento',
    rls: 'rappresentante lavoratori sicurezza elezione nominativo verbale comunicazione',
    consulenza: 'consulenza consiglio aiuto dubbio sicurezza ambiente certificazioni',
    attestazione: 'patente a crediti crediti dm 132 monitoraggio',
    asseverazione: 'mog modello organizzativo 231 uni 11751 attestato',
    cor: 'corso corsi formazione lavoratori art 37 docenti aula',
    cds: 'gestione sicurezza piattaforma documenti online',
    myapp: 'app formazione telefono percorso formativo',
    notizie: 'news aggiornamenti novita normative eventi comunicazioni',
    telegram: 'canale telegram notifiche messaggi'
  }
  var ICONE = {
    /* gru a torre (14/09/2026, chiesta dall'utente) */
    visita: '<path d="M3.5 21h8"/><path d="M6 21V6.5M9 21V6.5"/><path d="M6 10.5 9 14l-3 3.5L9 21"/><path d="M2.5 6.5h19"/><path d="M6 6.5 7.5 3 9 6.5M7.5 3l14 3.5M7.5 3 2.5 6.5"/><path d="M17 6.5V11"/><path d="M15.3 11h3.4v3h-3.4z"/>',
    conferenza: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.3"/><path d="M15.6 14.1A4.5 4.5 0 0 1 21 18.5"/>',
    notifica: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12h6M9.5 15.5h6"/>',
    segnalazione: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5"/><path d="M12 17.2v.3"/>',
    questionario: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    /* operaio col caschetto (14/09/2026, chiesto dall'utente) */
    rlst: '<path d="M7.5 9V8a4.5 4.5 0 0 1 9 0v1"/><path d="M5.8 9h12.4"/><path d="M12 3.5v2.3"/><path d="M8.8 10.5a3.2 3.2 0 0 0 6.4 0"/><path d="M4.8 21a7.2 7.2 0 0 1 14.4 0"/>',
    rls: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20.5a7 7 0 0 1 14 0"/><path d="M12 14.5v3.5"/>',
    consulenza: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    attestazione: '<circle cx="12" cy="9" r="5"/><path d="m9 13.5-1.5 7L12 18l4.5 2.5-1.5-7"/>',
    asseverazione: '<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.2 2.6 2.6 5-5"/>',
    cor: '<path d="M3.5 5.5c3-1.3 5.8-1.3 8.5 0v14c-2.7-1.3-5.5-1.3-8.5 0z"/><path d="M12 5.5c2.7-1.3 5.5-1.3 8.5 0v14c-3-1.3-5.8-1.3-8.5 0"/>',
    cds: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    myapp: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
    installa: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M12 7v7M9.2 11.3 12 14l2.8-2.7"/>',
    notizie: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    telegram: '<path d="M21 4 3 11l6.5 2.2L12 20l3.2-4.6L20 19z"/><path d="m9.5 13.2 6-4.7"/>',
    cerca: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    telefono: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
    email: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    sede: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    elenco: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    team: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.3"/><path d="M15.6 14.1A4.5 4.5 0 0 1 21 18.5"/>',
    freccia: '<path d="m9 5 7 7-7 7"/>',
    chiudi: '<path d="M6 6l12 12M18 6 6 18"/>'
  }
  var TEL = '049 761168', TEL_INT = '(int. 4)', TEL_HREF = 'tel:049761168'
  var SEDE = 'Via Basilicata 10, 35127 Padova'
  // informativa privacy: la stessa del piede di www.formedilpadova.it (14/09/2026, indicata dall'utente)
  var PRIVACY = 'https://www.scuolaedilepadova.net/wp-content/uploads/2020/11/PRIVACY-2020-SCUOLA-EDILE-PADOVA.pdf'
  /* la sede apre il navigatore (14/09/2026, chiesto dall'utente): su iPhone e iPad Mappe di Apple,
     altrove Google Maps, che sul telefono Android apre l'app col percorso in auto e sul PC la mappa */
  function hrefNavigatore() {
    var ua = navigator.userAgent || '', dest = encodeURIComponent(SEDE)
    var apple = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    return apple ? 'https://maps.apple.com/?daddr=' + dest + '&dirflg=d'
      : 'https://www.google.com/maps/dir/?api=1&destination=' + dest + '&travelmode=driving&dir_action=navigate'
  }

  function el(tag, cls, testo) { var e = document.createElement(tag); if (cls) e.className = cls; if (testo != null) e.textContent = testo; return e }
  function bottone(cls, testo) { var b = el('button', cls, testo); b.type = 'button'; return b }
  function icona(nome) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 's3-i')
    s.innerHTML = ICONE[nome] || ICONE.freccia
    return s
  }
  function vai(id) { if (typeof window.showPage === 'function') window.showPage(id) }
  function paginaDi(nodo) { var m = String(nodo.getAttribute('onclick') || '').match(/showPage\('([^']+)'\)/); return m ? m[1] : null }
  function situazioneDi(id) { for (var i = 0; i < SITUAZIONI.length; i++) if (SITUAZIONI[i].pagine.indexOf(id) >= 0) return SITUAZIONI[i]; return null }
  function normalizza(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim() }
  function classeEtichetta(tag) {
    if (!tag) return ''
    var t = tag.textContent
    // verde solo se la scheda dice davvero «gratuito»: la classe free sta anche su «Notizie in tempo reale»
    if (/gratuit/i.test(t)) return 'ceiv'
    if (/riservat/i.test(t)) return 'ris'
    if (/obbligator/i.test(t)) return 'obbl'
    if (/\bPD\b/.test(t)) return 'pd'
    return ''
  }
  function titoloPagina(id, scheda) {
    try { if (typeof PAGE_TITLES !== 'undefined' && PAGE_TITLES[id] && PAGE_TITLES[id][0]) return PAGE_TITLES[id][0] } catch (e) { /* sotto */ }
    var t = scheda && scheda.querySelector('.sc-title')
    return t ? t.textContent.trim() : ''
  }
  function schede() {
    var out = {}
    document.querySelectorAll('#page-home .service-card').forEach(function (c) { var id = paginaDi(c); if (id && !out[id]) out[id] = c })
    return out
  }

  /* ── caratteri: Barlow c'e' gia', si aggiunge la versione stretta per i titoli ── */
  function caratteri() {
    if (document.querySelector('link[data-s3-font]')) return
    var l = el('link'); l.rel = 'stylesheet'; l.setAttribute('data-s3-font', '')
    l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&display=swap'
    document.head.appendChild(l)
  }

  /* ── testata ── */
  var vociMenu = []
  function testata() {
    var main = document.querySelector('.main')
    if (!main || main.querySelector('.s3-testa')) return
    var t = el('header', 's3-testa'), d = el('div')
    var logo = el('img'); logo.src = 'img/sito/logo-formedil-padova.png'; logo.alt = 'Formedil Padova — torna ai servizi'
    logo.onclick = function () { vai('home') }
    d.appendChild(logo)
    var menu = el('nav', 's3-menu'); menu.setAttribute('aria-label', 'Menu del portale')
    ;[['Servizi', 'home', function () { vai('home') }],
      ['Notizie', 'notizie', function () { vai('notizie') }],
      ['Il team', 'team', function () { vai('team') }],
      ['Contatti', null, function () { contatti() }]
    ].forEach(function (v) {
      var b = bottone(null, v[0]); b.dataset.pag = v[1] || ''; b.onclick = v[2]
      if (v[1] === 'notizie') { var c = el('span', 's3-conta'); c.hidden = true; b.appendChild(c) }
      vociMenu.push(b); menu.appendChild(b)
    })
    d.appendChild(menu)
    var tel = el('a', 's3-tel'); tel.href = TEL_HREF; tel.setAttribute('aria-label', 'Chiama l\'Area Sicurezza e Salute, ' + TEL + ' interno 4')
    tel.appendChild(icona('telefono')); tel.appendChild(document.createTextNode(TEL))
    d.appendChild(tel)
    t.appendChild(d)
    main.insertBefore(t, main.firstChild)
  }
  function contatti() {
    var go = function () { var c = document.getElementById('s3-contatti'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
    var home = document.getElementById('page-home')
    if (home && !home.classList.contains('active')) { vai('home'); setTimeout(go, 80) } else go()
  }

  /* ── home ── */
  var righe = [], stato = { sit: 'tutti', testo: '' }
  function home() {
    var pag = document.getElementById('page-home')
    if (!pag || pag.querySelector('.s3-home')) return
    var sc = schede()
    var h = el('div', 's3-home')

    // apertura: domanda, ricerca, situazioni
    var ap = el('section', 's3-apertura')
    ap.appendChild(el('p', 's3-occhiello', 'Sportello online · Area Sicurezza e Salute'))
    ap.appendChild(el('h1', null, 'Cosa ti serve?'))
    var cerca = el('label', 's3-cerca')
    cerca.appendChild(icona('cerca'))
    var inp = el('input'); inp.type = 'search'; inp.autocomplete = 'off'; inp.enterKeyHint = 'search'
    // sul telefono il suggerimento lungo veniva tagliato a meta'
    inp.placeholder = window.matchMedia && window.matchMedia('(max-width: 760px)').matches ? 'Cerca: notifica, RLS, corso…' : 'Cerca: notifica, RLS, corso, patente a crediti…'
    inp.setAttribute('aria-label', 'Cerca un servizio')
    cerca.appendChild(inp)
    var kbd = el('kbd', null, '/'); kbd.title = 'Premi / per cercare'; cerca.appendChild(kbd)
    var sv = bottone('s3-svuota'); sv.hidden = true; sv.setAttribute('aria-label', 'Svuota la ricerca'); sv.appendChild(icona('chiudi'))
    cerca.appendChild(sv)
    ap.appendChild(cerca)
    var filtri = el('div', 's3-filtri'); filtri.setAttribute('role', 'group'); filtri.setAttribute('aria-label', 'Mostra i servizi per situazione')
    ;[{ id: 'tutti', nome: 'Tutti' }].concat(SITUAZIONI).forEach(function (s) {
      var b = bottone(null, s.nome); b.dataset.sit = s.id; b.setAttribute('aria-pressed', String(s.id === 'tutti'))
      b.onclick = function () { stato.sit = s.id; filtri.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)) }); applica() }
      filtri.appendChild(b)
    })
    ap.appendChild(filtri)
    h.appendChild(ap)

    // in evidenza
    var ev = el('section', 's3-evidenza'); ev.setAttribute('aria-label', 'In evidenza')
    var seg = bottone('s3-segnala')
    var c1 = el('span', 's3-cerchio'); c1.appendChild(icona('segnalazione')); seg.appendChild(c1)
    var t1 = el('span'); t1.appendChild(el('strong', null, 'Hai visto un cantiere pericoloso?'))
    t1.appendChild(el('small', null, 'Segnalalo in due minuti, anche in forma anonima e con una foto.')); seg.appendChild(t1)
    seg.appendChild(el('span', 's3-vai', 'Segnala'))
    seg.onclick = function () { vai('segnalazione') }
    ev.appendChild(seg)
    ev.appendChild(ultimaNotizia())
    h.appendChild(ev)

    // elenco
    var elenco = el('section', 's3-elenco'); elenco.id = 's3-servizi'; elenco.setAttribute('aria-label', 'Servizi')
    SITUAZIONI.forEach(function (s) {
      var ids = s.pagine.filter(function (id) { return sc[id] })
      if (!ids.length) return
      var g = el('div', 's3-gruppo'); g.dataset.sit = s.id
      var gt = el('div', 's3-gruppo-testa'); gt.appendChild(el('h2', null, s.nome)); gt.appendChild(el('span', null, s.frase)); g.appendChild(gt)
      var rr = el('div', 's3-righe')
      ids.forEach(function (id) { rr.appendChild(riga(id, sc[id], s)) })
      g.appendChild(rr)
      elenco.appendChild(g)
    })
    h.appendChild(elenco)
    // «Installa l'app»: nella grafica di prima stava nel menu laterale, che qui non si vede. La riga segue la
    // voce #nav-installa, che lo script dell'invito in index.html mostra solo quando il browser lo permette
    var gInf = elenco.querySelector('.s3-gruppo[data-sit="informato"] .s3-righe'), voce = document.getElementById('nav-installa')
    if (gInf && voce) {
      var ins = bottone('s3-riga s3-installa'); ins.dataset.sit = 'informato'; ins.dataset.pag = 'installa'; ins.hidden = true
      var ii = el('span', 's3-ico'); ii.appendChild(icona('installa')); ins.appendChild(ii)
      var it = el('span', 's3-testo'); it.appendChild(el('b', null, 'Installa l\'app')); it.appendChild(el('small', null, 'Il portale si apre da un\'icona, come le altre app.')); ins.appendChild(it)
      ins.appendChild(icona('freccia'))
      ins.onclick = function () { if (typeof window.apriInvitoApp === 'function') window.apriInvitoApp() }
      gInf.appendChild(ins)
      new MutationObserver(function () { applica() }).observe(voce, { attributes: true, attributeFilter: ['hidden'] })
    }
    var vuoto = el('p', 's3-vuoto'); vuoto.hidden = true; vuoto.id = 's3-vuoto'
    h.appendChild(vuoto)

    // contatti
    var ct = el('section', 's3-contatti'); ct.id = 's3-contatti'
    ct.appendChild(el('h2', null, 'Parla con noi'))
    var cg = el('div', 's3-contatti-griglia')
    var tel = el('a', 's3-contatto'); tel.href = TEL_HREF
    tel.appendChild(icona('telefono')); tel.appendChild(el('small', null, 'Telefono')); tel.appendChild(el('b', null, TEL + ' ' + TEL_INT)); tel.appendChild(el('span', null, 'Tocca per chiamare'))
    cg.appendChild(tel)
    var em = el('div', 's3-contatto')
    em.appendChild(icona('email')); em.appendChild(el('small', null, 'Email'))
    ;['cpt@formedilpadova.it', 'cptpd@did.formedilpadova.it'].forEach(function (m, i) { var a = el('a', null, m); a.href = 'mailto:' + m; var w = el(i ? 'span' : 'b'); w.appendChild(a); em.appendChild(w) })
    // sotto le email il sito dell'ente, che si apre in un'altra scheda
    em.appendChild(el('small', 's3-sotto', 'Sito web'))
    var web = el('a', null, 'www.formedilpadova.it'); web.href = 'https://www.formedilpadova.it'; web.target = '_blank'; web.rel = 'noopener'
    var wb = el('b'); wb.appendChild(web); em.appendChild(wb)
    cg.appendChild(em)
    var sede = el('a', 's3-contatto'); sede.href = hrefNavigatore(); sede.target = '_blank'; sede.rel = 'noopener'
    sede.setAttribute('aria-label', 'Sede: ' + SEDE + '. Apri il percorso nel navigatore')
    // tutto il riquadro e' il pulsante, senza scritte d'istruzione (14/09/2026, chiesto dall'utente)
    sede.appendChild(icona('sede')); sede.appendChild(el('small', null, 'Sede')); sede.appendChild(el('b', null, 'Via Basilicata 10')); sede.appendChild(el('span', null, '35127 Padova'))
    cg.appendChild(sede)
    var team = bottone('s3-contatto')
    team.appendChild(icona('team')); team.appendChild(el('small', null, 'Chi siamo')); team.appendChild(el('b', null, 'Il team dell\'Area')); team.appendChild(el('span', null, 'Tecnici e referenti'))
    team.onclick = function () { vai('team') }
    cg.appendChild(team)
    ct.appendChild(cg)
    h.appendChild(ct)

    // piede con l'informativa sulla privacy
    var piede = el('footer', 's3-piede')
    piede.appendChild(el('span', null, 'Formedil Padova – Area Sicurezza e Salute · ' + SEDE))
    var pr = el('a', null, 'Informativa sulla privacy'); pr.href = PRIVACY; pr.target = '_blank'; pr.rel = 'noopener'
    piede.appendChild(pr)
    h.appendChild(piede)

    pag.insertBefore(h, pag.firstChild)
    applica()

    var aggiorna = function () { stato.testo = inp.value; sv.hidden = !inp.value; kbd.hidden = !!inp.value; applica() }
    inp.addEventListener('input', aggiorna)
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { inp.value = ''; aggiorna() }
      if (e.key === 'Enter') { var prima = righe.filter(function (r) { return !r.nodo.hidden })[0]; if (prima) { e.preventDefault(); vai(prima.id) } }
    })
    sv.onclick = function () { inp.value = ''; aggiorna(); inp.focus() }
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      var a = document.activeElement
      if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return
      if (!pag.classList.contains('active')) return
      e.preventDefault(); inp.focus()
    })
  }
  function riga(id, scheda, s) {
    var b = bottone('s3-riga'); b.dataset.sit = s.id; b.dataset.pag = id
    var ic = el('span', 's3-ico'); ic.appendChild(icona(id)); b.appendChild(ic)
    var tx = el('span', 's3-testo')
    var titolo = (scheda.querySelector('.sc-title') || {}).textContent || id
    var desc = (scheda.querySelector('.sc-desc') || {}).textContent || ''
    var tag = scheda.querySelector('.sc-tag')
    var bt = el('b', null, titolo.trim()); tx.appendChild(bt)
    var sm = el('small', null, desc.trim()); if (desc.trim()) tx.appendChild(sm)
    if (tag && tag.textContent.trim()) tx.appendChild(el('span', 's3-etichetta ' + classeEtichetta(tag), tag.textContent.trim()))
    b.appendChild(tx)
    b.appendChild(icona('freccia'))
    b.onclick = function () { vai(id) }
    righe.push({ id: id, sit: s.id, nodo: b, titolo: bt, testoTitolo: titolo.trim(), cerca: normalizza([titolo, desc, tag ? tag.textContent : '', PAROLE[id] || '', s.nome].join(' ')) })
    return b
  }
  function applica() {
    var q = normalizza(stato.testo), parole = q ? q.split(' ') : []
    righe.forEach(function (r) {
      var okSit = stato.sit === 'tutti' || r.sit === stato.sit
      var okTesto = parole.every(function (p) { return r.cerca.indexOf(p) >= 0 })
      r.nodo.hidden = !(okSit && okTesto)
      // evidenzia nel titolo la parola cercata, se c'e'
      r.titolo.textContent = r.testoTitolo
      if (parole.length) {
        var n = normalizza(r.testoTitolo), i = n.indexOf(parole[0])
        if (i >= 0 && n.length === r.testoTitolo.length) {
          r.titolo.textContent = ''
          r.titolo.appendChild(document.createTextNode(r.testoTitolo.slice(0, i)))
          r.titolo.appendChild(el('mark', 's3-trovato', r.testoTitolo.slice(i, i + parole[0].length)))
          r.titolo.appendChild(document.createTextNode(r.testoTitolo.slice(i + parole[0].length)))
        }
      }
    })
    var inst = document.querySelector('.s3-installa'), voce = document.getElementById('nav-installa')
    if (inst) inst.hidden = !(voce && !voce.hidden) || !(stato.sit === 'tutti' || stato.sit === 'informato') ||
      !parole.every(function (p) { return 'installa installare app applicazione telefono icona home'.indexOf(p) >= 0 })
    var visibili = 0
    document.querySelectorAll('.s3-gruppo').forEach(function (g) {
      var n = g.querySelectorAll('.s3-riga:not([hidden])').length
      g.hidden = n === 0; visibili += n
    })
    var ev = document.querySelector('.s3-evidenza')
    if (ev) ev.hidden = !!(parole.length || stato.sit !== 'tutti')
    var v = document.getElementById('s3-vuoto')
    if (v) {
      v.hidden = visibili > 0
      if (!visibili) {
        v.textContent = 'Nessun servizio corrisponde a «' + stato.testo.trim() + '». Prova con un\'altra parola, oppure chiamaci: '
        var a = el('a', null, TEL + ' ' + TEL_INT); a.href = TEL_HREF; v.appendChild(a)
      }
    }
  }
  function ultimaNotizia() {
    var b = bottone('s3-notizia')
    var c = el('span', 's3-cerchio'); c.appendChild(icona('notizie')); b.appendChild(c)
    var tx = el('span')
    var et = el('em', null, 'Notizie dell\'Area')
    var tit = el('strong', null, 'Comunicazioni, normative ed eventi')
    var est = el('small', null, 'Le novità per imprese e cantieri, aggiornate in tempo reale.')
    tx.appendChild(et); tx.appendChild(tit); tx.appendChild(est); b.appendChild(tx)
    b.appendChild(el('span', 's3-vai', 'Tutte ›'))
    b.onclick = function () { vai('notizie') }
    var mostra = function (items) {
      var n = (items || []).filter(function (x) { return x && x.pubblicata !== false && x.titolo })[0]
      if (!n) return
      var d = String(n.data_pubbl || n.created_at || '').slice(0, 10)
      et.textContent = 'Ultima notizia' + (d ? ' · ' + d.split('-').reverse().join('/') : '')
      tit.textContent = n.titolo
      var testo = ''
      try { testo = new DOMParser().parseFromString(String(n.corpo || ''), 'text/html').body.textContent || '' } catch (e) { testo = '' }
      testo = testo.replace(/\s+/g, ' ').trim()
      if (testo) est.textContent = testo.length > 160 ? testo.slice(0, 157).replace(/\s+\S*$/, '') + '…' : testo
    }
    var cache = null
    try { cache = JSON.parse(localStorage.getItem('formedil_news_cache_v2') || 'null') } catch (e) { cache = null }
    mostra(cache && cache.items)
    var client = null
    try { client = (typeof _sb !== 'undefined') ? _sb : null } catch (e) { client = null }
    if (client) {
      client.from('notizie').select('id,titolo,corpo,data_pubbl,created_at,pubblicata').eq('pubblicata', true)
        .order('data_pubbl', { ascending: false }).order('created_at', { ascending: false }).limit(1)
        .then(function (r) { if (r && r.data) mostra(r.data) })
        .catch(function () { /* resta quella in cache */ })
    }
    return b
  }

  /* ── pagine dei servizi: intestazione semplice ── */
  var EMOJI = /(?:[\u{1F000}-\u{1FAFF}]|[☀-➿]|[⬀-⯿]|[⌀-⏿]|[←-⇿]|[■-◿]|ℹ)(?:️|‍(?:[\u{1F000}-\u{1FAFF}]|[☀-➿]))*️?/gu
  function togliEmoji(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName
        if (p === 'OPTION' || p === 'SELECT' || p === 'TEXTAREA' || p === 'SCRIPT' || p === 'STYLE') return NodeFilter.FILTER_REJECT
        EMOJI.lastIndex = 0
        return EMOJI.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      }
    })
    var nodi = []
    while (w.nextNode()) nodi.push(w.currentNode)
    nodi.forEach(function (n) { EMOJI.lastIndex = 0; n.nodeValue = n.nodeValue.replace(EMOJI, '').replace(/^\s+(?=\S)/, function (m) { return /\n/.test(m) ? m : '' }) })
    root.querySelectorAll('.fi-icon, .rc-icon, .form-header h2 svg').forEach(function (x) { x.style.display = 'none' })
  }
  function pagine() {
    var sc = schede()
    document.querySelectorAll('.page').forEach(function (p) {
      var id = p.id.replace(/^page-/, '')
      if (id === 'home' || p.querySelector(':scope > .s3-pag-testa')) return
      try { togliEmoji(p) } catch (e) { /* le icone restano */ }
      var t = el('div', 's3-pag-testa')
      var ind = bottone('s3-indietro'); ind.appendChild(icona('freccia')); ind.appendChild(document.createTextNode('Tutti i servizi'))
      ind.onclick = function () { vai('home') }
      t.appendChild(ind)
      var s = situazioneDi(id)
      if (s) t.appendChild(el('p', 's3-occhiello', s.nome))
      // la pagina Notizie ha gia' il suo titolo con l'indicatore in tempo reale
      if (id !== 'notizie') {
        t.appendChild(el('h1', null, titoloPagina(id, sc[id])))
        var tag = sc[id] && sc[id].querySelector('.sc-tag')
        if (tag && tag.textContent.trim()) t.appendChild(el('span', 's3-etichetta ' + classeEtichetta(tag), tag.textContent.trim()))
      }
      p.insertBefore(t, p.firstChild)
    })
  }

  /* ── barra in basso (telefono) ── */
  var tabs = []
  function barra() {
    if (document.querySelector('.s3-tab')) return
    var n = el('nav', 's3-tab'); n.setAttribute('aria-label', 'Navigazione')
    ;[['servizi', 'Servizi', 'elenco', function () { vai('home') }],
      ['notizie', 'Notizie', 'notizie', function () { vai('notizie') }],
      ['segnala', 'Segnala', 'segnalazione', function () { vai('segnalazione') }],
      ['contatti', 'Contatti', 'telefono', function () { contatti() }]
    ].forEach(function (v) {
      var b = bottone(null); b.dataset.tab = v[0]
      b.appendChild(icona(v[2])); b.appendChild(document.createTextNode(v[1]))
      if (v[0] === 'notizie') { var c = el('span', 's3-conta'); c.hidden = true; b.appendChild(c) }
      b.onclick = v[3]
      tabs.push(b); n.appendChild(b)
    })
    document.body.appendChild(n)
  }
  function aggiornaNavigazione() {
    var att = document.querySelector('.page.active')
    var id = att ? att.id.replace(/^page-/, '') : 'home'
    vociMenu.forEach(function (b) { b.classList.toggle('ora', b.dataset.pag === id || (b.dataset.pag === 'home' && !!situazioneDi(id) && id !== 'notizie' && id !== 'telegram')) })
    tabs.forEach(function (b) {
      var t = b.dataset.tab
      b.classList.toggle('ora', (t === 'notizie' && id === 'notizie') || (t === 'segnala' && id === 'segnalazione') || (t === 'servizi' && id !== 'notizie' && id !== 'segnalazione'))
    })
  }
  /* contatore delle notizie da leggere: lo stesso numero della scheda in home. La scheda si
     nasconde togliendo la classe «vis» e lascia il vecchio numero nel testo: si guarda la classe */
  function contatore() {
    var src = document.getElementById('home-nbadge')
    if (!src) return
    var copia = function () {
      var n = parseInt(src.textContent, 10) || 0
      var nascosto = !src.classList.contains('vis') || !n
      document.querySelectorAll('.s3-conta').forEach(function (c) { c.textContent = String(n); c.hidden = nascosto })
    }
    copia()
    new MutationObserver(copia).observe(src, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  }

  function avvia() {
    if (document.documentElement.getAttribute('data-veste') !== 'sito3') return
    ;[caratteri, testata, home, pagine, barra, contatore].forEach(function (fn) {
      try { fn() } catch (e) { console.log('[veste-sito3] ' + fn.name + ':', e && e.message) }
    })
    aggiornaNavigazione()
    document.querySelectorAll('.page').forEach(function (p) {
      new MutationObserver(aggiornaNavigazione).observe(p, { attributes: true, attributeFilter: ['class'] })
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia)
  else avvia()
})()
