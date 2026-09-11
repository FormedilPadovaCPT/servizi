/* ============================================================
   Veste «Sito nuovo» del portale servizi — IN PROVA (11/09/2026)

   Caricato solo da chi apre il portale con ?veste=sito (vedi lo
   script in testa a index.html). Veste il portale come il nuovo sito
   proposto da Studio Tagliani: testata col menu, foto a tutta larghezza,
   banda coi bottoni a pillola, riquadri fotografici, banda Telegram,
   notizie, piede grigio.

   Titoli, descrizioni ed etichette dei servizi si leggono dalle schede
   della home; ogni riquadro apre la stessa pagina di prima (showPage).
   Le foto sono quelle che il portale usa gia', ritagliate: nessuna foto
   del prototipo (servirebbe il permesso di Tagliani). Niente viene tolto
   dalla pagina: la veste attuale e' solo nascosta dal CSS.
   ============================================================ */
(function () {
  'use strict'

  var CONF = 'CONFERENZA%20DI%20CANTIERE.png'
  /* immagine, posizione, dimensione — ritagli delle foto gia' nel portale,
     piu' tre foto del laboratorio della Scuola (img/sito, da 00_INBOX 11/09/2026) */
  var FOTO = {
    hero: ['RLST.png', '78% 45%', 'cover'],
    segnalazione: ['img/sito/pericolo-cantiere.jpg', '50% 20%', 'cover'],
    visita: ['cantieri.png', '42% 12%', 'auto 210%'],
    consulenza: ['img/sito/disegni-casseratura.jpg', '45% 55%', 'cover'],
    cor: ['img/sito/attrezzi-laboratorio.jpg', '50% 30%', 'cover'],
    conferenza: [CONF, '72% 50%', 'cover'],
    rlst: ['RLST.png', '70% 60%', 'cover'],
    rls: ['RLST.png', '93% 55%', 'cover'],
    notifica: [CONF, '62% 0%', 'auto 170%'],
    attestazione: ['pericolo.png', '88% 45%', 'cover'],
    questionario: [CONF, '86% 70%', 'auto 150%'],
    telegram: [CONF, '12% 12%', 'cover'],
    bottoni: ['RLST.png', '100% 35%', 'auto 280%'],
    cielo: [CONF, '20% 25%', 'cover']
  }
  var LOGHI = {
    asseverazione: 'logo_asseverazione_cpt.jpg',
    cds: 'CDS.jpg',
    myapp: 'FormedilMyApp.jpg'
  }
  var GRUPPI = [
    { chiave: 'imprese', nome: 'Servizi per le imprese', breve: 'Servizi imprese', pagine: ['rlst', 'rls', 'consulenza', 'attestazione'], tipo: 'tessere' },
    { chiave: 'cantieri', nome: 'Cantieri', breve: 'Cantieri', pagine: ['visita', 'conferenza', 'notifica', 'segnalazione'], tipo: 'tessere' },
    { chiave: 'formazione', nome: 'Qualità, formazione e MOG', breve: 'Formazione e MOG', pagine: ['questionario', 'asseverazione', 'cor', 'cds', 'myapp'], tipo: 'schede' }
  ]

  function el(tag, cls, testo) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (testo != null) e.textContent = testo
    return e
  }
  function bottone(cls, testo) { var b = el('button', cls, testo); b.type = 'button'; return b }
  function foto(nodo, chiave) {
    var f = FOTO[chiave]
    if (!f) return
    nodo.style.backgroundImage = 'url("' + f[0] + '")'
    nodo.style.backgroundPosition = f[1]
    nodo.style.backgroundSize = f[2]
  }
  function paginaDi(nodo) {
    var m = String(nodo.getAttribute('onclick') || '').match(/showPage\('([^']+)'\)/)
    return m ? m[1] : null
  }
  function vai(id) { if (typeof window.showPage === 'function') window.showPage(id) }
  function scorriA(sel) {
    var go = function () { var t = document.querySelector(sel); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
    var home = document.getElementById('page-home')
    if (home && !home.classList.contains('active')) { vai('home'); setTimeout(go, 60) } else go()
  }
  function pill(tag) {
    if (!tag) return null
    var t = tag.textContent.trim()
    var c = 'anon'
    if (tag.classList.contains('free')) c = 'ceiv'
    else if (tag.classList.contains('ext')) c = /PD/.test(t) ? 'pd' : 'obbl'
    else if (/riservato/i.test(t)) c = 'ris'
    return el('span', 'vs-pill ' + c, t)
  }
  function titoloPagina(id) {
    var p = document.getElementById('page-' + id)
    var h = p && p.querySelector('.form-header h2')
    if (h && h.textContent.trim()) return h.textContent.trim()
    var n = document.querySelector('.nav-item[onclick="showPage(\'' + id + '\')"]')
    return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''
  }

  /* ── testata col menu, per tutte le pagine ── */
  var voci = []
  function testata() {
    var main = document.querySelector('.main')
    if (!main || main.querySelector('.vs-testa')) return
    var t = el('header', 'vs-testa')
    var logo = el('img')
    logo.src = 'Formedil_Padova_Positivo_colori.png'
    logo.alt = 'Formedil Padova — torna alla home'
    logo.onclick = function () { vai('home') }
    t.appendChild(logo)
    var menu = el('nav', 'vs-menu')
    menu.setAttribute('aria-label', 'Menu del portale')
    ;[['Home', function () { vai('home') }, 'home'],
      ['Servizi', function () { scorriA('#vs-servizi') }, null],
      ['Notizie', function () { vai('notizie') }, 'notizie'],
      ['Il team', function () { vai('team') }, 'team'],
      ['Telegram', function () { vai('telegram') }, 'telegram'],
      ['Contatti', function () { scorriA('.vs-piede') }, null]
    ].forEach(function (v) {
      var b = bottone(null, v[0]); b.onclick = v[1]; b.dataset.pag = v[2] || ''
      voci.push(b); menu.appendChild(b)
    })
    t.appendChild(menu)
    var h = bottone('vs-hamb'); h.setAttribute('aria-label', 'Apri il menu')
    h.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>'
    h.onclick = function () { if (typeof window.toggleSidebar === 'function') window.toggleSidebar() }
    t.appendChild(h)
    main.insertBefore(t, main.firstChild)
  }
  function aggiornaMenu() {
    var att = document.querySelector('.page.active')
    var id = att ? att.id.replace(/^page-/, '') : 'home'
    voci.forEach(function (b) { b.classList.toggle('ora', b.dataset.pag === id) })
  }

  /* ── home ── */
  function home() {
    var pag = document.getElementById('page-home')
    var wrap = pag && pag.querySelector('.services-grid-wrap')
    if (!pag || !wrap || pag.querySelector('.vs-hero')) return

    var hero = el('div', 'vs-hero'); foto(hero, 'hero')
    var hc = el('div')
    hc.appendChild(el('h1', null, 'I servizi di Sicurezza e Salute'))
    hc.appendChild(el('p', null, 'Tutti i moduli di richiesta di Formedil Padova per imprese, lavoratori e cantieri, in un unico punto di accesso.'))
    var sc = bottone('vs-pillola', 'Scopri i servizi ›'); sc.onclick = function () { scorriA('#vs-servizi') }
    hc.appendChild(sc)
    hero.appendChild(hc)

    var banda = el('nav', 'vs-banda'); banda.setAttribute('aria-label', 'Gruppi di servizi')
    GRUPPI.forEach(function (g) { var b = bottone('vs-pillola', g.breve); b.onclick = function () { scorriA('#vs-g-' + g.chiave) }; banda.appendChild(b) })
    var bn = bottone('vs-pillola', 'Notizie'); bn.onclick = function () { vai('notizie') }; banda.appendChild(bn)

    var schede = {}
    wrap.querySelectorAll('.service-card').forEach(function (c) { var id = paginaDi(c); if (id) schede[id] = c })

    var sez = el('section', 'vs-sez'); sez.id = 'vs-servizi'
    var cont = el('div', 'vs-cont')
    cont.appendChild(el('h2', null, 'Servizi per imprese e cantieri'))
    cont.appendChild(el('p', null, 'Tutti i servizi dell\'Area Sicurezza e Salute si chiedono da qui, in pochi minuti. Su ogni servizio trovi le condizioni: gratuito per le imprese iscritte alla Cassa Edile, obbligatorio, anche anonimo.'))
    var usati = {}
    GRUPPI.forEach(function (g) {
      var ids = g.pagine.filter(function (p) { return schede[p] })
      if (!ids.length) return
      var box = el('div', 'vs-gruppo'); box.id = 'vs-g-' + g.chiave
      box.appendChild(el('h3', null, g.nome))
      var griglia = el('div', g.tipo === 'schede' ? 'vs-schede' : 'vs-tessere')
      ids.forEach(function (id) { usati[id] = true; griglia.appendChild(g.tipo === 'schede' ? scheda(id, schede[id]) : tessera(id, schede[id])) })
      box.appendChild(griglia)
      cont.appendChild(box)
    })
    // eventuali servizi aggiunti in futuro e non ancora in un gruppo: non si perdono
    var altri = Object.keys(schede).filter(function (id) { return !usati[id] && id !== 'notizie' && id !== 'telegram' })
    if (altri.length) {
      var ab = el('div', 'vs-gruppo'); ab.appendChild(el('h3', null, 'Altri servizi'))
      var ag = el('div', 'vs-schede')
      altri.forEach(function (id) { ag.appendChild(scheda(id, schede[id])) })
      ab.appendChild(ag); cont.appendChild(ab)
    }
    sez.appendChild(cont)

    var tg = bottone('vs-telegram')
    var tf = el('div', 'vs-f'); foto(tf, 'telegram'); tg.appendChild(tf)
    var tb = el('div', 'vs-bar'); tb.appendChild(el('b', null, 'Telegram ›')); tb.appendChild(el('span', null, 'Iscriviti al canale per rimanere sempre aggiornato'))
    tg.appendChild(tb)
    tg.onclick = function () { vai('telegram') }

    var bot = el('div', 'vs-bottoni'); foto(bot, 'bottoni')
    ;[['Novità dell\'Area', 'Notizie e aggiornamenti ›', 'notizie'], ['Chi siamo', 'Il team dei tecnici ›', 'team']].forEach(function (x) {
      var b = bottone(null); b.appendChild(el('small', null, x[0])); b.appendChild(el('b', null, x[1])); b.onclick = function () { vai(x[2]) }; bot.appendChild(b)
    })

    var news = el('section', 'vs-news vs-vuota')
    var nc = el('div', 'vs-cont'); nc.appendChild(el('h2', null, 'News'))
    var ng = el('div', 'vs-news-grid'); nc.appendChild(ng); news.appendChild(nc)

    ;[hero, banda, sez, tg, bot, news].forEach(function (x) { pag.insertBefore(x, wrap) })
    ultimeNotizie(news, ng)
  }
  function tessera(id, c) {
    var b = bottone('vs-t'); foto(b, id)
    var p = pill(c.querySelector('.sc-tag')); if (p) b.appendChild(p)
    var t = c.querySelector('.sc-title')
    b.appendChild(el('b', null, t ? t.textContent.trim() : id))
    b.appendChild(el('i', null, '›'))
    var d = c.querySelector('.sc-desc'); if (d) b.title = d.textContent.trim()
    b.onclick = function () { vai(id) }
    return b
  }
  function scheda(id, c) {
    var b = bottone('vs-card')
    var f = el('div', 'vs-f')
    if (LOGHI[id]) f.style.backgroundImage = 'url("' + LOGHI[id] + '")'
    else { f.classList.add('foto'); foto(f, id) }
    b.appendChild(f)
    var tx = el('div')
    var t = c.querySelector('.sc-title'), d = c.querySelector('.sc-desc')
    tx.appendChild(el('b', null, t ? t.textContent.trim() : id))
    if (d) tx.appendChild(el('small', null, d.textContent.trim()))
    var p = pill(c.querySelector('.sc-tag')); if (p) { p.style.justifySelf = 'start'; tx.appendChild(p) }
    tx.appendChild(el('em', null, 'Scopri di più ›'))
    b.appendChild(tx)
    b.onclick = function () { vai(id) }
    return b
  }

  function mostraNotizie(sez, griglia, items) {
    var vis = (items || []).filter(function (n) { return n && n.pubblicata !== false && n.titolo }).slice(0, 3)
    griglia.innerHTML = ''
    sez.classList.toggle('vs-vuota', !vis.length)
    vis.forEach(function (n) {
      var b = bottone('vs-n')
      if (n.immagine_url && /^https:\/\//.test(n.immagine_url)) {
        var f = el('div', 'vs-f'); f.style.backgroundImage = 'url("' + String(n.immagine_url).replace(/["\\]/g, '') + '")'; b.appendChild(f)
      }
      var tx = el('div', 'vs-testo')
      var d = String(n.data_pubbl || n.created_at || '').slice(0, 10)
      if (d) tx.appendChild(el('time', null, d.split('-').reverse().join('/')))
      tx.appendChild(el('b', null, n.titolo))
      tx.appendChild(el('em', null, 'Leggi di più ›'))
      b.appendChild(tx)
      b.onclick = function () { vai('notizie') }
      griglia.appendChild(b)
    })
  }
  function ultimeNotizie(sez, griglia) {
    var c = null
    try { c = JSON.parse(localStorage.getItem('formedil_news_cache_v2') || 'null') } catch (e) { c = null }
    mostraNotizie(sez, griglia, c && c.items)
    var client = null
    try { client = (typeof _sb !== 'undefined') ? _sb : null } catch (e) { client = null }
    if (!client) return
    client.from('notizie').select('id,titolo,data_pubbl,created_at,pubblicata,immagine_url').eq('pubblicata', true)
      .order('data_pubbl', { ascending: false }).order('created_at', { ascending: false }).limit(3)
      .then(function (r) { if (r && r.data) mostraNotizie(sez, griglia, r.data) })
      .catch(function () { /* restano quelle in cache */ })
  }

  /* ── pagine interne: foto con il titolo, come le pagine del sito ── */
  var FOTO_PAGINA = { team: 'hero', notizie: 'cielo', telegram: 'telegram', cor: 'cielo', asseverazione: 'cielo', cds: 'cielo', myapp: 'cielo' }
  function pagine() {
    document.querySelectorAll('.page').forEach(function (p) {
      var id = p.id.replace(/^page-/, '')
      if (id === 'home' || p.querySelector(':scope > .vs-hero')) return
      var h = el('div', 'vs-hero')
      foto(h, FOTO[id] ? id : (FOTO_PAGINA[id] || 'hero'))
      var hc = el('div'); hc.appendChild(el('h1', null, titoloPagina(id))); h.appendChild(hc)
      p.insertBefore(h, p.firstChild)
      p.querySelectorAll('.btn-back').forEach(function (b) { if (/home/i.test(b.textContent)) b.textContent = '‹ Tutti i servizi' })
    })
  }

  /* ── piede del sito, sotto tutte le pagine ── */
  function piede() {
    var main = document.querySelector('.main')
    if (!main || main.querySelector('.vs-piede')) return
    var f = el('footer', 'vs-piede')
    var c1 = el('div')
    c1.appendChild(el('b', null, 'FORMEDIL PADOVA · SCUOLA COSTRUZIONI GIUSEPPE JAPPELLI'))
    c1.appendChild(el('span', null, 'Area Sicurezza e Salute'))
    c1.appendChild(el('br'))
    c1.appendChild(el('span', null, 'Via Basilicata 10 · 35127 Padova'))
    var tel = el('a', null, 'Tel. 049 761168 (int. 4)'); tel.href = 'tel:049761168'; c1.appendChild(tel)
    ;['cpt@formedilpadova.it', 'cptpd@did.formedilpadova.it'].forEach(function (m) { var a = el('a', null, m); a.href = 'mailto:' + m; c1.appendChild(a) })
    f.appendChild(c1)
    var col = function (tit, righe) {
      var d = el('div'); d.appendChild(el('b', null, tit))
      righe.forEach(function (r) { var b = bottone(null, r[0]); b.onclick = r[1]; d.appendChild(b) })
      return d
    }
    f.appendChild(col('Servizi', GRUPPI.map(function (g) { return [g.breve, function () { scorriA('#vs-g-' + g.chiave) }] })))
    f.appendChild(col('Area Sicurezza e Salute', [['Notizie', function () { vai('notizie') }], ['Il team', function () { vai('team') }], ['Canale Telegram', function () { vai('telegram') }]]))
    var sito = el('div'); sito.appendChild(el('b', null, 'Formedil Padova'))
    var w = el('a', null, 'www.formedilpadova.it'); w.href = 'https://www.formedilpadova.it'; w.target = '_blank'; w.rel = 'noopener'; sito.appendChild(w)
    var app = bottone(null, 'Formedil MyApp'); app.onclick = function () { vai('myapp') }; sito.appendChild(app)
    f.appendChild(sito)
    main.appendChild(f)
  }

  function avviso() {
    if (document.querySelector('.vs-prova')) return
    var a = el('div', 'vs-prova'); a.setAttribute('role', 'status')
    a.appendChild(el('span', null, 'Veste «Sito nuovo» in prova'))
    var l = el('a', null, 'Torna all\'attuale'); l.href = location.pathname + '?veste=attuale'
    a.appendChild(l)
    document.body.appendChild(a)
  }

  function avvia() {
    if (document.documentElement.getAttribute('data-veste') !== 'sito') return
    ;[testata, home, pagine, piede, avviso].forEach(function (fn) {
      try { fn() } catch (e) { console.log('[veste-sito] ' + fn.name + ':', e && e.message) }
    })
    aggiornaMenu()
    document.querySelectorAll('.page').forEach(function (p) {
      new MutationObserver(aggiornaMenu).observe(p, { attributes: true, attributeFilter: ['class'] })
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia)
  else avvia()
})()
