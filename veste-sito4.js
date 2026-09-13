/* ============================================================
   Veste «Sito 4 · Istantanea» del portale servizi — IN PROVA (13/09/2026)

   Caricato solo con ?veste=sito4. È la «Proposta 4 · fuori dalla famiglia»
   dell'11/09 portata nel portale vero: fondo scuro con nebbia ed effetto
   vetro, «Che cosa ti serve oggi?», notizie come storie, «scrivi o detta»,
   riquadri bento con la segnalazione piu' grande, barra flottante col
   pulsante Segnala al centro.

   Solo funzioni vere:
   - le storie sono le notizie pubblicate (cache del portale e tabella
     notizie); «Leggi la notizia» apre la pagina Notizie su quella notizia;
   - «scrivi o detta» capisce le frasi («ho visto un tetto senza parapetti»)
     e propone i servizi; la dettatura usa quella del browser e il microfono
     non compare dove non c'e';
   - il pulsante Segnala apre il modulo di segnalazione di sempre, che le
     foto le accetta gia'. «Le mie richieste» e la segnalazione a chat dalla
     fotocamera della proposta non ci sono: il portale oggi non le ha.

   Titoli, descrizioni ed etichette si leggono dalle schede della home
   (.service-card); ogni riquadro apre la stessa pagina di prima (showPage).
   ============================================================ */
(function () {
  'use strict'

  var BENTO = [
    ['segnalazione', 'grande', 'Cantieri'],
    ['notizie', 'numero', 'Notizie'],
    ['visita', '', 'Sopralluogo'],
    ['rlst', '', 'Imprese'],
    ['rls', '', 'Imprese'],
    ['attestazione', 'largo', 'Patente a crediti'],
    ['consulenza', '', 'Imprese'],
    ['notifica', '', 'Cantieri'],
    ['conferenza', '', 'Cantieri'],
    ['questionario', '', 'Qualità'],
    ['cor', '', 'Formazione'],
    ['asseverazione', '', 'MOG'],
    ['telegram', 'largo', 'Canale'],
    ['cds', '', 'Applicativo'],
    ['myapp', '', 'Applicativo']
  ]
  var TITOLI_BREVI = { questionario: 'Valuta il sopralluogo', cor: 'Corsi art. 37', cds: 'CDS', myapp: 'Formedil MyApp', notizie: 'Notizie' }
  var SUGGERIMENTI = ['Segnalo un cantiere', 'Mi serve l\'RLST', 'Voglio una visita in cantiere', 'Notifico un cantiere', 'Corsi per i lavoratori', 'Patente a crediti']
  /* parole con cui la gente chiede, oltre a titolo e descrizione della scheda */
  var PAROLE = {
    visita: 'visita sopralluogo tecnico ispezione controllo verifica',
    conferenza: 'conferenza formazione informazione dipendenti operai lavoratori riunione',
    notifica: 'notifica notificare notifico preliminare apertura inizio lavori ripresa art 99 comunicare aprire',
    segnalazione: 'segnala segnalare segnalo pericolo pericoloso rischio anonimo anonima denuncia foto tetto parapetti imbracature ponteggio caduta operai scavo incidente',
    questionario: 'valutazione valutare gradimento giudizio questionario opinione',
    rlst: 'rlst rappresentante territoriale lavoratori sicurezza affidamento',
    rls: 'rls rappresentante lavoratori sicurezza elezione eletto nominativo verbale',
    consulenza: 'consulenza consiglio aiuto dubbio domanda sicurezza ambiente certificazioni',
    attestazione: 'attestazione patente crediti dm 132 monitoraggio punti',
    asseverazione: 'asseverazione mog modello organizzativo 231 uni 11751 attestato',
    cor: 'corso corsi formazione lavoratori art 37 aula docenti',
    cds: 'cds gestione sicurezza piattaforma documenti online',
    myapp: 'myapp app formazione telefono percorso',
    notizie: 'notizie news aggiornamenti novita normative eventi comunicazioni',
    telegram: 'telegram canale notifiche messaggi'
  }
  var VUOTE = ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'a', 'e', 'o', 'ho', 'mi', 'ci', 'si', 'che', 'del', 'della', 'dei', 'delle', 'al', 'alla', 'ai', 'sono', 'devo', 'voglio', 'vorrei', 'serve', 'servono', 'fare', 'come', 'cosa', 'nel', 'nella', 'posso', 'mio', 'mia', 'miei', 'nostro', 'nostra', 'qui', 'oggi', 'visto', 'vista', 'senza', 'non', 'ma', 'anche', 'sul', 'sulla', 'uno', 'mi', 'serve']
  var ICONE = {
    cerca: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>',
    freccia: '<path d="m9 5 7 7-7 7"/>',
    chiudi: '<path d="M6 6l12 12M18 6 6 18"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    casa: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/>',
    notizie: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    team: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.3"/><path d="M15.6 14.1A4.5 4.5 0 0 1 21 18.5"/>',
    telefono: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>'
  }
  var TEL = '049 761168', TEL_HREF = 'tel:049761168'
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition

  function el(tag, cls, testo) { var e = document.createElement(tag); if (cls) e.className = cls; if (testo != null) e.textContent = testo; return e }
  function bottone(cls, testo) { var b = el('button', cls, testo); b.type = 'button'; return b }
  function icona(nome) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 's4-i')
    s.innerHTML = ICONE[nome] || ICONE.freccia
    return s
  }
  function vai(id) { if (typeof window.showPage === 'function') window.showPage(id) }
  function paginaDi(nodo) { var m = String(nodo.getAttribute('onclick') || '').match(/showPage\('([^']+)'\)/); return m ? m[1] : null }
  function normalizza(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim() }
  function schede() {
    var out = {}
    document.querySelectorAll('#page-home .service-card').forEach(function (c) { var id = paginaDi(c); if (id && !out[id]) out[id] = c })
    return out
  }
  function testoDi(scheda, sel) { var n = scheda && scheda.querySelector(sel); return n ? n.textContent.trim() : '' }
  function classePill(t) { return /gratuit/i.test(t) ? 'ceiv' : /obbligator/i.test(t) ? 'obbl' : '' }
  function titoloPagina(id, scheda) {
    try { if (typeof PAGE_TITLES !== 'undefined' && PAGE_TITLES[id] && PAGE_TITLES[id][0]) return PAGE_TITLES[id][0] } catch (e) { /* sotto */ }
    return testoDi(scheda, '.sc-title')
  }
  function etichettaDi(id) { for (var i = 0; i < BENTO.length; i++) if (BENTO[i][0] === id) return BENTO[i][2]; return '' }
  function sulTelefono() { return !!(window.matchMedia && window.matchMedia('(max-width: 760px)').matches) }

  function caratteri() {
    if (document.querySelector('link[data-s4-font]')) return
    var l = el('link'); l.rel = 'stylesheet'; l.setAttribute('data-s4-font', '')
    l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&display=swap'
    document.head.appendChild(l)
  }

  /* ── testata ── */
  var vociMenu = []
  function testata() {
    var main = document.querySelector('.main')
    if (!main || main.querySelector('.s4-testa')) return
    main.insertBefore(el('div', 's4-nebbia'), main.firstChild)
    var t = el('header', 's4-testa'), d = el('div', 's4-vetro')
    var logo = el('img'); logo.src = 'img/email/logo_formedil_padova_bianco.png'; logo.alt = 'Formedil Padova — torna alla home'
    logo.onclick = function () { vai('home') }
    d.appendChild(logo)
    var menu = el('nav', 's4-menu'); menu.setAttribute('aria-label', 'Menu del portale')
    ;[['Home', 'home', function () { vai('home') }], ['Notizie', 'notizie', function () { vai('notizie') }], ['Il team', 'team', function () { vai('team') }], ['Contatti', '', function () { contatti() }]].forEach(function (v) {
      var b = bottone(null, v[0]); b.dataset.pag = v[1]; b.onclick = v[2]; vociMenu.push(b); menu.appendChild(b)
    })
    d.appendChild(menu)
    var c = bottone('s4-campanella s4-vetro'); c.setAttribute('aria-label', 'Notizie'); c.appendChild(icona('notizie'))
    var n = el('span', 's4-conta'); n.hidden = true; c.appendChild(n)
    c.onclick = function () { vai('notizie') }
    d.appendChild(c)
    t.appendChild(d)
    main.insertBefore(t, main.children[1] || null)
  }
  function contatti() {
    var go = function () { var c = document.getElementById('s4-contatti'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
    var home = document.getElementById('page-home')
    if (home && !home.classList.contains('active')) { vai('home'); setTimeout(go, 80) } else go()
  }

  /* ── home ── */
  var servizi = [], risultati = null, bento = null
  function home() {
    var pag = document.getElementById('page-home')
    if (!pag || pag.querySelector('.s4-home')) return
    var sc = schede()
    var h = el('div', 's4-home')

    var ap = el('section', 's4-apertura')
    var sx = el('div')
    var dom = el('h1', 's4-domanda'); dom.appendChild(document.createTextNode('Che cosa ti serve '))
    dom.appendChild(el('em', null, 'oggi?')); sx.appendChild(dom)
    var anelli = el('div', 's4-anelli'); anelli.hidden = true; anelli.setAttribute('aria-label', 'Notizie in formato storia'); sx.appendChild(anelli)
    var chiedi = el('label', 's4-chiedi s4-vetro')
    chiedi.appendChild(icona('cerca'))
    var inp = el('input'); inp.type = 'search'; inp.autocomplete = 'off'; inp.enterKeyHint = 'search'
    inp.placeholder = sulTelefono() ? 'Scrivi o detta cosa ti serve' : 'Scrivi o detta: «ho visto un tetto senza parapetti»'
    inp.setAttribute('aria-label', 'Scrivi o detta che cosa ti serve')
    chiedi.appendChild(inp)
    var mic = bottone('s4-mic'); mic.setAttribute('aria-label', 'Detta'); mic.appendChild(icona('mic'))
    mic.hidden = !SR
    chiedi.appendChild(mic)
    sx.appendChild(chiedi)
    var aiuto = el('p', 's4-aiuto'); aiuto.setAttribute('aria-live', 'polite'); sx.appendChild(aiuto)
    var sug = el('div', 's4-suggerimenti')
    SUGGERIMENTI.forEach(function (s) {
      var b = bottone('s4-vetro', s)
      b.onclick = function () { inp.value = s; cerca(inp.value) }
      sug.appendChild(b)
    })
    sx.appendChild(sug)
    ap.appendChild(sx)
    var storie = el('div', 's4-storie'); storie.hidden = true; storie.setAttribute('aria-label', 'Ultime notizie in formato storia')
    ap.appendChild(storie)
    h.appendChild(ap)

    risultati = el('section', 's4-risultati'); risultati.hidden = true; risultati.setAttribute('aria-live', 'polite')
    h.appendChild(risultati)

    bento = el('section', 's4-bento'); bento.setAttribute('aria-label', 'Servizi')
    BENTO.forEach(function (v) {
      var id = v[0], sch = sc[id]
      if (!sch) return
      var titolo = TITOLI_BREVI[id] || testoDi(sch, '.sc-title')
      var tag = testoDi(sch, '.sc-tag')
      servizi.push({ id: id, titolo: testoDi(sch, '.sc-title'), desc: testoDi(sch, '.sc-desc'),
        nTitolo: normalizza(testoDi(sch, '.sc-title') + ' ' + titolo), nParole: normalizza(PAROLE[id] || ''), nDesc: normalizza(testoDi(sch, '.sc-desc') + ' ' + tag + ' ' + v[2]) })
      var b = bottone('s4-b' + (v[1] === 'grande' ? ' grande' : ' s4-vetro') + (v[1] === 'largo' ? ' largo' : ''))
      b.appendChild(el('small', null, v[2]))
      if (v[1] === 'grande') {
        var st = el('strong'); st.appendChild(document.createTextNode('Segnala')); st.appendChild(el('br')); st.appendChild(document.createTextNode('un cantiere'))
        b.appendChild(st)
        var sca = el('span', 'scatto'); sca.appendChild(icona('camera')); sca.appendChild(document.createTextNode('Anche con una foto, pure anonima'))
        b.appendChild(sca)
      } else if (v[1] === 'numero') {
        var num = el('span', 'num s4-num-notizie', '›'); b.appendChild(num)
        b.setAttribute('aria-label', 'Notizie')
      } else {
        b.appendChild(el('strong', null, titolo))
        if (tag && id !== 'telegram') b.appendChild(el('span', 's4-pill ' + classePill(tag), tag))
      }
      b.title = testoDi(sch, '.sc-desc')
      b.onclick = function () { vai(id) }
      bento.appendChild(b)
    })
    h.appendChild(bento)

    var ct = el('section', 's4-contatti'); ct.id = 's4-contatti'
    ct.appendChild(el('h2', null, 'Parla con noi'))
    var cg = el('div', 's4-contatti-griglia')
    var tel = el('a', 's4-contatto s4-vetro'); tel.href = TEL_HREF
    tel.appendChild(el('small', null, 'Telefono')); tel.appendChild(el('b', null, TEL)); tel.appendChild(el('span', null, 'Interno 4 · tocca per chiamare'))
    cg.appendChild(tel)
    var em = el('div', 's4-contatto s4-vetro'); em.appendChild(el('small', null, 'Email'))
    ;['cpt@formedilpadova.it', 'cptpd@did.formedilpadova.it'].forEach(function (m) { var a = el('a', null, m); a.href = 'mailto:' + m; em.appendChild(a) })
    cg.appendChild(em)
    var sede = el('div', 's4-contatto s4-vetro'); sede.appendChild(el('small', null, 'Sede')); sede.appendChild(el('b', null, 'Via Basilicata 10')); sede.appendChild(el('span', null, '35127 Padova'))
    cg.appendChild(sede)
    var team = bottone('s4-contatto s4-vetro'); team.appendChild(el('small', null, 'Chi siamo')); team.appendChild(el('b', null, 'Il team dell\'Area')); team.appendChild(el('span', null, 'Tecnici e referenti'))
    team.onclick = function () { vai('team') }
    cg.appendChild(team)
    ct.appendChild(cg)
    h.appendChild(ct)

    pag.insertBefore(h, pag.firstChild)

    inp.addEventListener('input', function () { cerca(inp.value) })
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { inp.value = ''; cerca('') }
      if (e.key === 'Enter') { var p = risultati.querySelector('.s4-ris'); if (p) { e.preventDefault(); p.click() } }
    })
    if (SR) dettatura(mic, inp, aiuto)
    notizie(storie, anelli)
  }

  /* ricerca per frasi: conta le parole che trovano un servizio; le forme vicine valgono
     (notifico / notificare / notifica), le parole vuote no */
  function vicine(a, b) {
    if (a === b) return true
    if (a.length >= 4 && b.indexOf(a) === 0) return true
    var i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++
    return i >= 5
  }
  function trova(parola, testo) { return testo.split(' ').some(function (w) { return w && vicine(parola, w) }) }
  function cerca(q) {
    var parole = normalizza(q).split(' ').filter(function (p) { return p.length > 1 && VUOTE.indexOf(p) < 0 })
    if (!parole.length) { risultati.hidden = true; bento.hidden = false; risultati.textContent = ''; return }
    var voti = servizi.map(function (s) {
      var v = 0
      parole.forEach(function (p) { if (trova(p, s.nTitolo)) v += 3; else if (trova(p, s.nParole)) v += 2; else if (trova(p, s.nDesc)) v += 1 })
      return { s: s, v: v }
    }).filter(function (x) { return x.v > 0 }).sort(function (a, b) { return b.v - a.v })
    // solo i risultati che valgono almeno meta' del migliore: «corsi per i lavoratori» non deve
    // proporre anche RLS e RLST solo perche' nella descrizione c'e' «lavoratori»
    var migliore = voti.length ? voti[0].v : 0
    voti = voti.filter(function (x) { return x.v * 2 >= migliore }).slice(0, 5)
    risultati.textContent = ''
    risultati.appendChild(el('h2', null, voti.length ? 'Ecco cosa fa per te' : 'Non ho trovato un servizio'))
    if (!voti.length) {
      var n = el('p', 's4-nulla s4-vetro', 'Prova a dirlo con altre parole, oppure chiamaci: ')
      var a = el('a', null, TEL + ' (int. 4)'); a.href = TEL_HREF; n.appendChild(a)
      risultati.appendChild(n)
    }
    voti.forEach(function (x, i) {
      var b = bottone('s4-ris s4-vetro' + (i === 0 ? ' primo' : ''))
      b.appendChild(el('b', null, x.s.titolo)); b.appendChild(el('small', null, x.s.desc)); b.appendChild(icona('freccia'))
      b.onclick = function () { vai(x.s.id) }
      risultati.appendChild(b)
    })
    risultati.hidden = false; bento.hidden = true
  }
  function dettatura(mic, inp, aiuto) {
    var rec = null
    mic.onclick = function () {
      if (rec) { try { rec.stop() } catch (e) { /* niente */ } return }
      try {
        rec = new SR(); rec.lang = 'it-IT'; rec.interimResults = true; rec.continuous = false
        mic.classList.add('ascolta'); aiuto.textContent = 'Ti ascolto… di\' che cosa ti serve'
        rec.onresult = function (e) {
          var t = ''
          for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
          inp.value = t; cerca(t)
        }
        rec.onerror = function (e) {
          aiuto.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Il microfono non è autorizzato: consentilo nelle impostazioni del browser, oppure scrivi.'
            : e.error === 'no-speech' ? 'Non ho sentito niente: riprova o scrivi.' : 'La dettatura non è riuscita: scrivi pure.'
        }
        rec.onend = function () { rec = null; mic.classList.remove('ascolta'); if (/Ti ascolto/.test(aiuto.textContent)) aiuto.textContent = '' }
        rec.start()
      } catch (e) { rec = null; mic.classList.remove('ascolta'); aiuto.textContent = 'La dettatura non è disponibile qui: scrivi pure.' }
    }
  }

  /* ── notizie come storie ── */
  var elenco = [], visore = null, corrente = 0
  var CHIAVE_VISTE = 'servizi.storieViste'
  function viste() { try { return JSON.parse(localStorage.getItem(CHIAVE_VISTE) || '[]') } catch (e) { return [] } }
  function segnaVista(id) { try { var v = viste(); if (v.indexOf(id) < 0) { v.push(id); localStorage.setItem(CHIAVE_VISTE, JSON.stringify(v.slice(-80))) } } catch (e) { /* niente */ } }
  function testoCorpo(html) {
    var t = ''
    try { t = new DOMParser().parseFromString(String(html || ''), 'text/html').body.textContent || '' } catch (e) { t = '' }
    return t.replace(/\s+/g, ' ').trim()
  }
  function dataBreve(n) { var d = String(n.data_pubbl || n.created_at || '').slice(0, 10); return d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '' }
  function immagine(n) { return n.immagine_url && /^https:\/\//.test(n.immagine_url) ? 'url("' + String(n.immagine_url).replace(/["\\]/g, '') + '")' : '' }
  function notizie(storie, anelli) {
    var disegna = function (items) {
      elenco = (items || []).filter(function (x) { return x && x.pubblicata !== false && x.titolo }).slice(0, 8)
      storie.textContent = ''; anelli.textContent = ''
      storie.hidden = anelli.hidden = !elenco.length
      var v = viste()
      elenco.forEach(function (n, i) {
        if (i < 3) {
          var c = bottone('s4-storia c' + (i + 1))
          var img = immagine(n); if (img) { c.style.backgroundImage = img; c.classList.add('foto') }
          var seg = el('span', 'seg'); for (var k = 0; k < 4; k++) seg.appendChild(el('i')); c.appendChild(seg)
          c.appendChild(el('strong', null, n.titolo))
          c.appendChild(el('small', null, n.categoria && n.categoria !== 'generale' ? n.categoria : 'Notizie · ' + dataBreve(n)))
          c.setAttribute('aria-label', 'Apri la notizia: ' + n.titolo)
          c.onclick = function () { apri(i) }
          storie.appendChild(c)
        }
        var a = bottone('s4-anello' + (v.indexOf(n.id) >= 0 ? ' vista' : ''))
        var cerchio = el('i'), dentro = el('span', null, dataBreve(n))
        cerchio.appendChild(dentro); a.appendChild(cerchio)
        a.appendChild(el('small', null, n.titolo))
        a.setAttribute('aria-label', 'Apri la notizia: ' + n.titolo)
        a.onclick = function () { apri(i) }
        anelli.appendChild(a)
      })
    }
    var cache = null
    try { cache = JSON.parse(localStorage.getItem('formedil_news_cache_v2') || 'null') } catch (e) { cache = null }
    disegna(cache && cache.items)
    var client = null
    try { client = (typeof _sb !== 'undefined') ? _sb : null } catch (e) { client = null }
    if (client) {
      client.from('notizie').select('id,titolo,corpo,data_pubbl,created_at,pubblicata,immagine_url,categoria').eq('pubblicata', true)
        .order('data_pubbl', { ascending: false }).order('created_at', { ascending: false }).limit(8)
        .then(function (r) { if (r && r.data && r.data.length) disegna(r.data) })
        .catch(function () { /* restano quelle in cache */ })
    }
  }
  function costruisciVisore() {
    visore = el('div', 's4-visore'); visore.hidden = true
    visore.setAttribute('role', 'dialog'); visore.setAttribute('aria-modal', 'true'); visore.setAttribute('aria-label', 'Notizia')
    visore.addEventListener('click', function (e) { if (e.target === visore) chiudi() })
    document.addEventListener('keydown', function (e) {
      if (!visore || visore.hidden) return
      if (e.key === 'Escape') chiudi()
      if (e.key === 'ArrowRight') avanti()
      if (e.key === 'ArrowLeft') indietro()
    })
    document.body.appendChild(visore)
  }
  function apri(i) {
    if (!visore) costruisciVisore()
    corrente = i; visore.hidden = false; mostra()
    var x = visore.querySelector('.s4-chiudi'); if (x) x.focus()
  }
  function chiudi() { if (visore) { visore.hidden = true; visore.textContent = '' } }
  function avanti() { if (corrente < elenco.length - 1) { corrente++; mostra() } else chiudi() }
  function indietro() { if (corrente > 0) { corrente--; mostra() } }
  function mostra() {
    var n = elenco[corrente]
    if (!n) { chiudi(); return }
    segnaVista(n.id)
    var anello = document.querySelectorAll('.s4-anello')[corrente]; if (anello) anello.classList.add('vista')
    visore.textContent = ''
    var s = el('div', 's4-schermo-storia')
    var img = immagine(n); if (img) { s.style.backgroundImage = img; s.classList.add('foto') }
    var seg = el('div', 's4-segmenti')
    elenco.forEach(function (x, k) {
      var i = el('i', k < corrente ? 'fatto' : k === corrente ? 'ora' : '')
      if (k === corrente) { var b = el('b'); b.addEventListener('animationend', avanti); i.appendChild(b) }
      seg.appendChild(i)
    })
    s.appendChild(seg)
    var chi = el('div', 's4-chi'), c1 = el('div')
    c1.appendChild(el('span', 'tondo', 'FP'))
    var nome = el('span', null, 'Formedil Padova'); nome.appendChild(el('small', null, 'Notizie · ' + (corrente + 1) + ' di ' + elenco.length)); c1.appendChild(nome)
    chi.appendChild(c1)
    var x = bottone('s4-chiudi'); x.setAttribute('aria-label', 'Chiudi'); x.appendChild(icona('chiudi')); x.onclick = chiudi
    chi.appendChild(x)
    s.appendChild(chi)
    s.appendChild(el('div'))
    var cont = el('div', 's4-contenuto')
    cont.appendChild(el('span', 'etic s4-vetro', n.categoria && n.categoria !== 'generale' ? n.categoria : 'Notizie · ' + dataBreve(n)))
    cont.appendChild(el('strong', null, n.titolo))
    var t = testoCorpo(n.corpo); if (t) cont.appendChild(el('p', null, t.length > 260 ? t.slice(0, 257).replace(/\s+\S*$/, '') + '…' : t))
    s.appendChild(cont)
    var su = el('div', 's4-su'), leggi = bottone(null, 'Leggi la notizia')
    leggi.onclick = function () { var id = n.id; chiudi(); vai('notizie'); setTimeout(function () { apriNotizia(id) }, 350) }
    su.appendChild(leggi); s.appendChild(su)
    var p = bottone('s4-tocca prima'); p.setAttribute('aria-label', 'Notizia precedente'); p.onclick = indietro; s.appendChild(p)
    var d = bottone('s4-tocca dopo'); d.setAttribute('aria-label', 'Notizia successiva'); d.onclick = avanti; s.appendChild(d)
    visore.appendChild(s)
  }
  /* nella pagina Notizie ogni notizia porta il suo data-id: ci si porta sopra e la si segna come letta */
  function apriNotizia(id) {
    var voce = document.querySelector('#news-list .news-item[data-id="' + String(id).replace(/"/g, '') + '"]')
    if (!voce) return
    voce.scrollIntoView({ behavior: 'smooth', block: 'start' })
    voce.click()
  }

  /* ── pagine dei servizi ── */
  var EMOJI = /(?:[\u{1F000}-\u{1FAFF}]|[\u2600-\u27BF]|[\u2B00-\u2BFF]|[\u2300-\u23FF]|[\u2190-\u21FF]|[\u25A0-\u25FF]|\u2139)(?:\uFE0F|\u200D(?:[\u{1F000}-\u{1FAFF}]|[\u2600-\u27BF]))*\uFE0F?/gu
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
      if (id === 'home' || p.querySelector(':scope > .s4-pag-testa')) return
      try { togliEmoji(p) } catch (e) { /* le icone restano */ }
      var t = el('div', 's4-pag-testa')
      var ind = bottone('s4-indietro s4-vetro'); ind.appendChild(icona('freccia')); ind.appendChild(document.createTextNode('Home'))
      ind.onclick = function () { vai('home') }
      t.appendChild(ind)
      var et = etichettaDi(id); if (et && id !== 'notizie') t.appendChild(el('small', null, et))
      if (id !== 'notizie') t.appendChild(el('h1', null, titoloPagina(id, sc[id])))
      p.insertBefore(t, p.firstChild)
    })
  }

  /* ── barra flottante (telefono) ── */
  var tabs = []
  function barra() {
    if (document.querySelector('.s4-tab')) return
    var n = el('nav', 's4-tab s4-vetro'); n.setAttribute('aria-label', 'Navigazione')
    ;[['home', 'Home', 'casa', function () { vai('home') }],
      ['notizie', 'Notizie', 'notizie', function () { vai('notizie') }],
      ['segnala', '', 'camera', function () { vai('segnalazione') }],
      ['team', 'Team', 'team', function () { vai('team') }],
      ['contatti', 'Contatti', 'telefono', function () { contatti() }]
    ].forEach(function (v) {
      var b = bottone(v[0] === 'segnala' ? 's4-fab' : null); b.dataset.tab = v[0]
      b.appendChild(icona(v[2])); if (v[1]) b.appendChild(document.createTextNode(v[1]))
      if (v[0] === 'segnala') b.setAttribute('aria-label', 'Segnala un cantiere')
      if (v[0] === 'notizie') { var c = el('span', 's4-conta'); c.hidden = true; b.appendChild(c) }
      b.onclick = v[3]
      tabs.push(b); n.appendChild(b)
    })
    document.body.appendChild(n)
  }
  function aggiornaNavigazione() {
    var att = document.querySelector('.page.active')
    var id = att ? att.id.replace(/^page-/, '') : 'home'
    vociMenu.forEach(function (b) { b.classList.toggle('ora', !!b.dataset.pag && b.dataset.pag === id) })
    tabs.forEach(function (b) { b.classList.toggle('ora', b.dataset.tab === id || (b.dataset.tab === 'segnala' && id === 'segnalazione')) })
  }
  /* contatore delle notizie da leggere: lo stesso della scheda in home, che si nasconde togliendo la classe «vis» */
  function contatore() {
    var src = document.getElementById('home-nbadge')
    if (!src) return
    var copia = function () {
      var n = parseInt(src.textContent, 10) || 0
      var nascosto = !src.classList.contains('vis') || !n
      document.querySelectorAll('.s4-conta').forEach(function (c) { c.textContent = String(n); c.hidden = nascosto })
      var num = document.querySelector('.s4-num-notizie')
      if (num) num.textContent = nascosto ? '›' : String(n)
    }
    copia()
    new MutationObserver(copia).observe(src, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  }

  function avviso() {
    if (document.querySelector('.s4-prova')) return
    var a = el('div', 's4-prova'); a.setAttribute('role', 'status')
    a.appendChild(el('span', null, 'Veste «Sito 4 · Istantanea» in prova'))
    var l = el('a', null, 'Torna all\'attuale'); l.href = location.pathname + '?veste=attuale'
    a.appendChild(l)
    document.body.appendChild(a)
  }

  function avvia() {
    if (document.documentElement.getAttribute('data-veste') !== 'sito4') return
    ;[caratteri, testata, home, pagine, barra, contatore, avviso].forEach(function (fn) {
      try { fn() } catch (e) { console.log('[veste-sito4] ' + fn.name + ':', e && e.message) }
    })
    aggiornaNavigazione()
    document.querySelectorAll('.page').forEach(function (p) {
      new MutationObserver(aggiornaNavigazione).observe(p, { attributes: true, attributeFilter: ['class'] })
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia)
  else avvia()
})()
