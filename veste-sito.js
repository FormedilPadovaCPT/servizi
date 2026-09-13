/* ============================================================
   Veste «Sito nuovo» del portale servizi — IN PROVA (11/09/2026)

   Caricato solo da chi apre il portale con ?veste=sito (vedi lo
   script in testa a index.html). Veste il portale come il nuovo sito
   proposto da Studio Tagliani: testata col menu, in home il banner del
   portale in una fascia arancio, l'ultima notizia, riquadri fotografici per
   Cantieri e Servizi imprese, Applicativi con la striscia Telegram, piede
   grigio in una riga. Nelle pagine dei servizi niente emoji.

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
    consulenza: ['img/sito/disegni-casseratura.jpg', '92% 35%', 'auto 170%'],
    asseverazione: ['img/sito/disegni-casseratura.jpg', '45% 55%', 'cover'],
    notizie: ['RLST.png', '85% 20%', 'auto 200%'],
    cor: ['img/sito/attrezzi-laboratorio.jpg', '50% 30%', 'cover'],
    conferenza: [CONF, '72% 50%', 'cover'],
    rlst: ['RLST.png', '72% 80%', 'auto 150%'],
    rls: ['RLST.png', '96% 80%', 'auto 150%'],
    notifica: [CONF, '62% 0%', 'auto 170%'],
    attestazione: ['pericolo.png', '88% 45%', 'cover'],
    questionario: [CONF, '86% 70%', 'auto 150%'],
    telegram: [CONF, '12% 12%', 'cover'],
    bottoni: ['RLST.png', '100% 35%', 'auto 280%'],
    cielo: [CONF, '20% 25%', 'cover']
  }
  var LOGHI = {
    cds: 'CDS.jpg',
    myapp: 'FormedilMyApp.jpg'
  }
  var GRUPPI = [
    { chiave: 'cantieri', nome: 'Cantieri', breve: 'Cantieri', pagine: ['visita', 'conferenza', 'notifica', 'segnalazione', 'questionario'], larghi: ['visita'], tipo: 'tessere' },
    { chiave: 'imprese', nome: 'Servizi per le imprese', breve: 'Servizi imprese', pagine: ['rlst', 'rls', 'consulenza', 'attestazione', 'asseverazione', 'cor'], tipo: 'tessere' },
    { chiave: 'applicativi', nome: 'Applicativi', breve: 'Applicativi', pagine: ['cds', 'myapp'], tipo: 'schede', striscia: 'telegram' }
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
    if (!n) return ''
    // dal menu solo il testo: niente icona ne' contatore delle notizie
    var copia = n.cloneNode(true)
    copia.querySelectorAll('span').forEach(function (x) { x.remove() })
    return copia.textContent.replace(/\s+/g, ' ').trim()
  }

  /* ── testata col menu, per tutte le pagine ── */
  var voci = []
  function testata() {
    var main = document.querySelector('.main')
    if (!main || main.querySelector('.vs-testa')) return
    var t = el('header', 'vs-testa')
    var logo = el('img')
    logo.src = 'img/sito/logo-formedil-padova.png'
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
    if (!pag || !wrap || pag.querySelector('#vs-servizi')) return

    // fascia arancio istituzionale al posto del banner Servizi.png (richiesta dell'utente 13/09):
    // scritta in HTML, il testo si adatta alla larghezza e resta centrato.
    // Tolto il testo di benvenuto (richiesta dell'utente 13/09) per abbassare la fascia.
    var hero = el('header', 'vs-fascia')
    var dentro = el('div')
    dentro.appendChild(el('h1', null, 'Portale Servizi'))
    dentro.appendChild(el('p', 'vs-sotto', 'Area Sicurezza e Salute'))
    hero.appendChild(dentro)

    var schede = {}
    wrap.querySelectorAll('.service-card').forEach(function (c) { var id = paginaDi(c); if (id) schede[id] = c })

    var sez = el('section', 'vs-sez'); sez.id = 'vs-servizi'
    var cont = el('div', 'vs-cont')
    // in apertura l'ultima notizia, larga quanto i riquadri: un clic porta alla pagina Notizie
    cont.appendChild(ultimaNotizia())
    var usati = {}
    GRUPPI.forEach(function (g) {
      var ids = g.pagine.filter(function (p) { return schede[p] })
      if (!ids.length) return
      var box = el('div', 'vs-gruppo'); box.id = 'vs-g-' + g.chiave
      box.appendChild(el('h3', null, g.nome))
      var griglia = el('div', g.tipo === 'schede' ? 'vs-schede' : 'vs-tessere')
      // 6 o 3 riquadri: tre per riga, cosi' nessuno resta da solo
      // i riquadri «larghi» (Notizie) occupano due posti
      var larghi = g.larghi || []
      var posti = ids.length + ids.filter(function (id) { return larghi.indexOf(id) >= 0 }).length
      if (g.tipo !== 'schede' && posti % 4 !== 0 && posti % 3 === 0) griglia.classList.add('vs-3')
      ids.forEach(function (id) {
        usati[id] = true
        var r = g.tipo === 'schede' ? scheda(id, schede[id]) : tessera(id, schede[id])
        if (larghi.indexOf(id) >= 0) r.classList.add('vs-largo')
        griglia.appendChild(r)
      })
      if (g.striscia === 'telegram') griglia.appendChild(strisciaTelegram())
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

    // tolte su richiesta dell'utente (11/09): banda Telegram larga, bottoni arancioni e sezione news
    pag.insertBefore(hero, wrap)
    pag.insertBefore(sez, wrap)
  }
  function ultimaNotizia() {
    var b = bottone('vs-ultima vs-senza-foto')
    b.setAttribute('aria-label', 'Apri le notizie')
    var f = el('div', 'vs-f')
    // sulla foto la scritta «Notizie», come il titolo sulle tessere dei servizi (richiesta dell'utente 13/09)
    f.appendChild(el('span', 'vs-ft', 'Notizie'))
    var tx = el('div', 'vs-testo')
    var et = el('span', 'vs-et', 'Notizie e aggiornamenti')
    var tit = el('b', null, 'Comunicazioni, normative ed eventi dell\'Area Sicurezza e Salute')
    var est = el('p')
    tx.appendChild(et); tx.appendChild(tit); tx.appendChild(est); tx.appendChild(el('em', null, 'Tutte le notizie ›'))
    b.appendChild(f); b.appendChild(tx)
    b.onclick = function () { vai('notizie') }
    var mostra = function (items) {
      var n = (items || []).filter(function (x) { return x && x.pubblicata !== false && x.titolo })[0]
      if (!n) return
      var d = String(n.data_pubbl || n.created_at || '').slice(0, 10)
      et.textContent = 'Ultima notizia' + (d ? ' · ' + d.split('-').reverse().join('/') : '')
      tit.textContent = n.titolo
      // il corpo e' HTML scritto dalla redazione: se ne prende solo il testo
      var testo = ''
      try { testo = new DOMParser().parseFromString(String(n.corpo || ''), 'text/html').body.textContent || '' } catch (e) { testo = '' }
      testo = testo.replace(/\s+/g, ' ').trim()
      est.textContent = testo.length > 230 ? testo.slice(0, 227).replace(/\s+\S*$/, '') + '…' : testo
      if (n.immagine_url && /^https:\/\//.test(n.immagine_url)) {
        f.style.backgroundImage = 'url("' + String(n.immagine_url).replace(/["\\]/g, '') + '")'
        b.classList.remove('vs-senza-foto')
      } else {
        f.style.backgroundImage = ''
        b.classList.add('vs-senza-foto')
      }
    }
    var c = null
    try { c = JSON.parse(localStorage.getItem('formedil_news_cache_v2') || 'null') } catch (e) { c = null }
    mostra(c && c.items)
    var client = null
    try { client = (typeof _sb !== 'undefined') ? _sb : null } catch (e) { client = null }
    if (client) {
      client.from('notizie').select('id,titolo,corpo,data_pubbl,created_at,pubblicata,immagine_url').eq('pubblicata', true)
        .order('data_pubbl', { ascending: false }).order('created_at', { ascending: false }).limit(1)
        .then(function (r) { if (r && r.data) mostra(r.data) })
        .catch(function () { /* resta quella in cache */ })
    }
    return b
  }
  function strisciaTelegram() {
    var b = bottone('vs-tg')
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.4 3.6 2.9 10.7c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8s.6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.8-1.4-1.4ZM9.3 13.3l8.8-5.6c.4-.3.8-.1.5.2l-7.3 6.6-.3 3.1-1.7-4.3Z"/></svg>'
    var tx = el('div')
    var c = document.querySelector('.service-card[onclick="showPage(\'telegram\')"]')
    tx.appendChild(el('b', null, 'Canale Telegram'))
    tx.appendChild(el('small', null, 'Notizie in tempo reale, eventi formativi e novità normative'))
    b.appendChild(tx)
    b.appendChild(el('i', null, '›'))
    b.title = c && c.querySelector('.sc-desc') ? c.querySelector('.sc-desc').textContent.trim() : ''
    b.onclick = function () { vai('telegram') }
    return b
  }
  /* via le emoji dalle pagine dei servizi (titoli, elenchi, pulsanti); le tendine no:
     il testo di un'opzione senza value e' il valore che si invia */
  // intervalli espliciti (non \p{Extended_Pictographic}, che prenderebbe anche © ® ™)
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
    nodi.forEach(function (n) {
      EMOJI.lastIndex = 0
      n.nodeValue = n.nodeValue.replace(EMOJI, '').replace(/^\s+(?=\S)/, function (m) { return /\n/.test(m) ? m : '' })
    })
    root.querySelectorAll('.fi-icon, .rc-icon, .form-header h2 svg').forEach(function (x) { x.style.display = 'none' })
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

  /* ── pagine interne: foto con il titolo, come le pagine del sito ── */
  var FOTO_PAGINA = { team: 'hero', notizie: 'cielo', telegram: 'telegram', cor: 'cielo', asseverazione: 'cielo', cds: 'cielo', myapp: 'cielo' }
  function pagine() {
    document.querySelectorAll('.page').forEach(function (p) {
      var id = p.id.replace(/^page-/, '')
      if (id === 'home' || p.querySelector(':scope > .vs-hero')) return
      try { togliEmoji(p) } catch (e) { /* se qualcosa va storto le icone restano */ }
      var h = el('div', 'vs-hero')
      foto(h, FOTO[id] ? id : (FOTO_PAGINA[id] || 'hero'))
      var hc = el('div'); hc.appendChild(el('h1', null, titoloPagina(id))); h.appendChild(hc)
      p.insertBefore(h, p.firstChild)
      p.querySelectorAll('.btn-back').forEach(function (b) { if (/home/i.test(b.textContent)) b.textContent = '‹ Tutti i servizi' })
    })
  }

  /* ── piede del sito, sotto tutte le pagine: una riga, quattro blocchi ── */
  function piede() {
    var main = document.querySelector('.main')
    if (!main || main.querySelector('.vs-piede')) return
    var f = el('footer', 'vs-piede')
    var blocco = function (tit) { var d = el('div'); d.appendChild(el('b', null, tit)); f.appendChild(d); return d }
    var link = function (d, testo, fn) { var b = bottone(null, testo); b.onclick = fn; d.appendChild(b) }
    var b1 = blocco('Formedil Padova')
    b1.appendChild(el('span', null, 'Scuola Costruzioni Giuseppe Jappelli'))
    b1.appendChild(el('span', null, 'Via Basilicata 10 · 35127 Padova'))
    var b2 = blocco('Contatti Area Sicurezza e Salute')
    var tel = el('a', null, 'Tel. 049 761168 (int. 4)'); tel.href = 'tel:049761168'; b2.appendChild(tel)
    ;['cpt@formedilpadova.it', 'cptpd@did.formedilpadova.it'].forEach(function (m) { var a = el('a', null, m); a.href = 'mailto:' + m; b2.appendChild(a) })
    var b3 = blocco('Servizi')
    GRUPPI.forEach(function (g) { link(b3, g.breve, function () { scorriA('#vs-g-' + g.chiave) }) })
    var b4 = blocco('Area')
    link(b4, 'Notizie', function () { vai('notizie') })
    link(b4, 'Il team', function () { vai('team') })
    link(b4, 'Canale Telegram', function () { vai('telegram') })
    var w = el('a', null, 'www.formedilpadova.it'); w.href = 'https://www.formedilpadova.it'; w.target = '_blank'; w.rel = 'noopener'; b4.appendChild(w)
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
