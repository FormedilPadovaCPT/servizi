/* ============================================================
   Veste «Ciclo» del portale servizi — IN PROVA (11/09/2026)

   Caricato solo da chi apre il portale con ?veste=ciclo (vedi lo
   script in testa a index.html). Ricompone la home nella forma della
   proposta — testata, banda grigia, servizi in elenco per gruppi,
   ultime notizie — leggendo le schede che ci sono gia': titoli,
   descrizioni ed etichette restano quelle del portale, e ogni riga
   apre la stessa pagina (showPage). Nei moduli aggiunge l'etichetta
   del gruppo sopra il titolo. Niente viene tolto dalla pagina: la
   veste attuale e' solo nascosta dal CSS.
   ============================================================ */
(function () {
  'use strict'

  var GRUPPI = [
    { nome: 'Servizi imprese', pagine: ['rlst', 'rls', 'conferenza', 'consulenza', 'attestazione'] },
    { nome: 'Cantieri', pagine: ['visita', 'notifica', 'segnalazione'] },
    { nome: 'Qualità e formazione', pagine: ['questionario', 'cor'] },
    { nome: 'MOG e applicativi Formedil', pagine: ['asseverazione', 'cds', 'myapp'] }
  ]
  var AREA = ['notizie', 'telegram', 'team']

  function el(tag, cls, testo) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (testo != null) e.textContent = testo
    return e
  }
  function paginaDi(nodo) {
    var m = String(nodo.getAttribute('onclick') || '').match(/showPage\('([^']+)'\)/)
    return m ? m[1] : null
  }
  function vai(id) { if (typeof window.showPage === 'function') window.showPage(id) }
  function gruppoDi(id) {
    for (var i = 0; i < GRUPPI.length; i++) if (GRUPPI[i].pagine.indexOf(id) >= 0) return GRUPPI[i].nome
    return AREA.indexOf(id) >= 0 ? 'Area Sicurezza e Salute' : 'Servizi'
  }
  function pill(tag) {
    if (!tag) return null
    var t = tag.textContent.trim()
    var c = 'anon'
    if (tag.classList.contains('free')) c = 'ceiv'
    else if (tag.classList.contains('ext')) c = /PD/.test(t) ? 'pd' : 'obbl'
    else if (tag.classList.contains('anon')) c = 'anon'
    else if (/riservato/i.test(t)) c = 'ris'
    return el('span', 'vc-pill ' + c, t)
  }

  /* ── home ── */
  function home() {
    var pag = document.getElementById('page-home')
    var wrap = pag && pag.querySelector('.services-grid-wrap')
    if (!pag || !wrap || pag.querySelector('.vc-testa')) return

    var testa = el('header', 'vc-testa')
    var t1 = el('div')
    t1.appendChild(el('div', 'vc-spaz', 'Area Sicurezza e Salute'))
    t1.appendChild(el('h1', null, 'Portale servizi'))
    t1.appendChild(el('p', null, 'Servizi per le imprese edili, i lavoratori e chi segue un cantiere in provincia di Padova.'))
    testa.appendChild(t1)
    var logo = el('img')
    logo.src = 'Formedil_Padova_Positivo_colori.png'
    logo.alt = 'Formedil Padova'
    testa.appendChild(logo)

    var banda = el('div', 'vc-banda')
    var bNot = el('button'); bNot.type = 'button'
    bNot.appendChild(el('span', 'vc-spaz', 'Notizie'))
    var bNotB = el('b'); bNot.appendChild(bNotB)
    bNot.onclick = function () { vai('notizie') }
    var bTel = el('button'); bTel.type = 'button'
    bTel.appendChild(el('span', 'vc-spaz', 'Telegram'))
    var bt = el('b', null, 'Canale '); bt.appendChild(el('small', null, 'Formedil Padova')); bTel.appendChild(bt)
    bTel.onclick = function () { vai('telegram') }
    var sede = el('div', 'vc-solo-pc')
    sede.appendChild(el('span', 'vc-spaz', 'Sede')); sede.appendChild(el('b', null, 'Via Basilicata 10, Padova'))
    var tel = el('a', 'vc-solo-pc'); tel.href = 'tel:049761168'
    tel.appendChild(el('span', 'vc-spaz', 'Telefono')); tel.appendChild(el('b', null, '049 761168 · int. 4'))
    ;[bNot, bTel, sede, tel].forEach(function (x) { banda.appendChild(x) })

    var badge = document.getElementById('home-nbadge')
    var aggNotizie = function () {
      bNotB.textContent = ''
      var n = badge && badge.classList.contains('vis') ? parseInt(badge.textContent, 10) : 0
      if (n > 0) { bNotB.appendChild(document.createTextNode(n + ' ')); bNotB.appendChild(el('small', null, n === 1 ? 'da leggere' : 'da leggere')) }
      else { bNotB.appendChild(document.createTextNode('Aggiornamenti ')); bNotB.appendChild(el('small', null, 'in tempo reale')) }
    }
    aggNotizie()
    if (badge) new MutationObserver(aggNotizie).observe(badge, { attributes: true, childList: true, characterData: true, subtree: true })

    // servizi: dalle schede della home, divisi per gruppi
    var schede = {}
    var ordine = []
    wrap.querySelectorAll('.service-card').forEach(function (c) {
      var id = paginaDi(c)
      if (!id || id === 'notizie' || id === 'telegram') return
      schede[id] = c
      ordine.push(id)
    })
    var corpo = el('div', 'vc-home')
    var colonna = el('div', 'vc-servizi')
    var usati = {}
    var gruppi = GRUPPI.map(function (g) { return { nome: g.nome, pagine: g.pagine.filter(function (p) { return schede[p] }) } })
    var altri = ordine.filter(function (p) { return GRUPPI.every(function (g) { return g.pagine.indexOf(p) < 0 }) })
    if (altri.length) gruppi.push({ nome: 'Altri servizi', pagine: altri })
    gruppi.forEach(function (g) {
      if (!g.pagine.length) return
      var box = el('section', 'vc-gruppo')
      box.appendChild(el('div', 'vc-spaz', g.nome))
      var griglia = el('div', 'vc-griglia')
      g.pagine.forEach(function (id) {
        if (usati[id]) return
        usati[id] = true
        var c = schede[id]
        var r = el('button', 'vc-riga'); r.type = 'button'
        var tit = c.querySelector('.sc-title'), des = c.querySelector('.sc-desc')
        r.appendChild(el('b', null, tit ? tit.textContent.trim() : id))
        var p = pill(c.querySelector('.sc-tag'))
        if (p) r.appendChild(p)
        if (des) r.appendChild(el('small', null, des.textContent.trim()))
        r.onclick = function () { vai(id) }
        griglia.appendChild(r)
      })
      box.appendChild(griglia)
      colonna.appendChild(box)
    })
    corpo.appendChild(colonna)

    var notizie = el('aside', 'vc-notizie')
    notizie.appendChild(el('span', 'vc-spaz', 'Ultime notizie'))
    corpo.appendChild(notizie)

    pag.insertBefore(testa, wrap)
    pag.insertBefore(banda, wrap)
    pag.insertBefore(corpo, wrap)
    ultimeNotizie(notizie, corpo)
  }

  function mostraNotizie(box, corpo, items) {
    var vis = (items || []).filter(function (n) { return n && n.pubblicata !== false && n.titolo }).slice(0, 4)
    box.querySelectorAll('button').forEach(function (b) { b.remove() })
    if (!vis.length) { corpo.classList.add('vc-senza-notizie'); return }
    corpo.classList.remove('vc-senza-notizie')
    vis.forEach(function (n) {
      var b = el('button'); b.type = 'button'
      var d = String(n.data_pubbl || n.created_at || '').slice(0, 10)
      if (d) b.appendChild(el('time', null, d.split('-').reverse().join('/')))
      b.appendChild(el('b', null, n.titolo))
      b.onclick = function () { vai('notizie') }
      box.appendChild(b)
    })
  }
  function ultimeNotizie(box, corpo) {
    var c = null
    try { c = JSON.parse(localStorage.getItem('formedil_news_cache_v2') || 'null') } catch (e) { c = null }
    mostraNotizie(box, corpo, c && c.items)
    // il portale tiene il client in una costante globale `_sb`
    var client = null
    try { client = (typeof _sb !== 'undefined') ? _sb : null } catch (e) { client = null }
    if (!client) return
    client.from('notizie').select('id,titolo,data_pubbl,created_at,pubblicata').eq('pubblicata', true)
      .order('data_pubbl', { ascending: false }).order('created_at', { ascending: false }).limit(4)
      .then(function (r) { if (r && r.data) mostraNotizie(box, corpo, r.data) })
      .catch(function () { /* restano quelle in cache */ })
  }

  /* ── moduli: gruppo sopra il titolo, «indietro» come nella proposta ── */
  function moduli() {
    document.querySelectorAll('.page').forEach(function (p) {
      var id = p.id.replace(/^page-/, '')
      var fh = p.querySelector('.form-header')
      if (fh && !fh.querySelector('.vc-spaz')) {
        var h2 = fh.querySelector('h2')
        var titolo = h2 ? h2.textContent.trim() : ''
        var s = el('span', 'vc-spaz', gruppoDi(id))
        fh.insertBefore(s, fh.firstChild)
        if (!titolo) s.textContent = gruppoDi(id)
      }
      p.querySelectorAll('.btn-back').forEach(function (b) {
        if (/home/i.test(b.textContent)) b.textContent = '‹ Tutti i servizi'
      })
    })
  }

  /* ── avviso: chi prova sa di essere in prova, e sa come tornare indietro ── */
  function avviso() {
    if (document.querySelector('.vc-prova')) return
    var a = el('div', 'vc-prova')
    a.setAttribute('role', 'status')
    a.appendChild(el('span', null, 'Veste «Ciclo» in prova'))
    var l = el('a', null, 'Torna all\'attuale')
    l.href = location.pathname + '?veste=attuale'
    a.appendChild(l)
    document.body.appendChild(a)
  }

  function avvia() {
    if (document.documentElement.getAttribute('data-veste') !== 'ciclo') return
    try { home() } catch (e) { console.log('[veste-ciclo] home:', e && e.message) }
    try { moduli() } catch (e) { console.log('[veste-ciclo] moduli:', e && e.message) }
    avviso()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia)
  else avvia()
})()
