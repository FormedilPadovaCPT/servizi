/* ============================================================
   MODO «BLOCCO» del portale servizi (30/09/2026)

   Si carica solo con ?blocco=<nome> (vedi in testa a index.html): chi usa
   l'app non lo scarica. Il modulo e' quello dell'app, senza copie; qui sta
   solo cio' che serve a farlo vivere dentro la pagina di un altro sito:
   - gli stili: blocco.css (neutro) e poi la VESTE del sito che ospita;
   - l'altezza del riquadro, detta alla pagina ospite a ogni cambiamento;
   - lo scorrimento: «portami sull'errore», «portami sulla ricevuta» li
     esegue la pagina ospite, perche' il riquadro non scorre da solo;
   - le finestre «alert», che dentro un altro sito il browser non mostra;
   - il campionario (?blocco=campionario) per chi scrive la veste.

   Con la pagina ospite parla incorpora.js, a messaggi:
     blocco → ospite   { formedil:'blocco', modulo, tipo:'pronto' | 'altezza' | 'vista' | 'inviata' }
     ospite → blocco   { formedil:'ospite', tipo:'ciao' }
   Nei messaggi non passa MAI un dato scritto da chi compila: solo misure
   e «e' stata inviata».

   ⚠️ Finche' la pagina ospite non ha detto «ciao» il blocco scorre da se',
   come una pagina normale: e' il caso di chi lo incorpora con un <iframe>
   semplice, senza incorpora.js.
   ============================================================ */
(function () {
  'use strict';
  var B = window.__BLOCCO;
  if (!B) return;

  var V = '1';   // ⚠️ si alza insieme a ?v= di blocco.js in fondo a index.html

  /* LA VESTE DEL SITO: l'indirizzo del foglio di stile tenuto da chi sviluppa
     il sito dell'ente. Vuoto finche' non e' concordato: il blocco si presenta
     con lo stile neutro.
     ⚠️ Solo un indirizzo dell'ente, scritto qui: MAI da un parametro dell'URL,
     altrimenti chiunque potrebbe vestire (e travestire) un modulo dell'ente
     con un foglio di stile suo. */
  var VESTE_SITO = '';
  /* vesti di prova, file di questo repo: ?veste=esempio */
  var VESTI_DI_PROVA = { esempio: 'blocco/veste-esempio.css' };

  var dentro = window.parent !== window;
  var gestito = false;    // la pagina ospite ha risposto: altezza e scorrimento li fa lei
  var toccato = false;    // chi compila ha fatto qualcosa: prima di allora non si sposta la pagina

  function manda(m) {
    if (!dentro) return;
    m.formedil = 'blocco';
    m.modulo = B.nome;
    try { window.parent.postMessage(m, '*'); } catch (e) { /* nessuno ad ascoltare */ }
  }

  /* ── ALTEZZA ─────────────────────────────────────────────── */
  var ultima = -1;
  function misura() {
    var a = Math.ceil(document.body.getBoundingClientRect().height);
    if (a > 0 && a !== ultima) { ultima = a; manda({ tipo: 'altezza', altezza: a }); }
  }
  if ('ResizeObserver' in window) new ResizeObserver(misura).observe(document.body);
  else setInterval(misura, 700);
  window.addEventListener('load', misura);
  /* ResizeObserver segue il disegno della pagina, e un riquadro che non e' a
     schermo (in fondo alla pagina ospite, o in una scheda non in primo piano)
     il browser non lo disegna: un elenco arrivato dopo — i corsi aperti — non
     cambierebbe l'altezza finche' non lo si guarda. Si misura quindi anche a
     ogni cambiamento del contenuto, che non dipende dal disegno. */
  var inAttesa = 0;
  new MutationObserver(function () {
    if (inAttesa) return;
    inAttesa = setTimeout(function () { inAttesa = 0; misura(); }, 60);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });

  /* ── STILI ───────────────────────────────────────────────── */
  function foglio(href, poi) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onload = l.onerror = function () { if (poi) { var f = poi; poi = null; f(); } };
    /* in fondo al corpo: dopo gli <style> che stanno dentro le pagine, cosi'
       la veste del sito vince a parita' di selettore */
    document.body.appendChild(l);
  }
  var mostrato = false;
  function mostra() {
    if (mostrato) return;
    mostrato = true;
    document.body.style.visibility = 'visible';
    misura();
    manda({ tipo: 'pronto' });
  }
  foglio('blocco/blocco.css?v=' + V, function () {
    var prova = Object.prototype.hasOwnProperty.call(VESTI_DI_PROVA, B.veste) ? VESTI_DI_PROVA[B.veste] + '?v=' + V : '';
    var veste = prova || VESTE_SITO;
    if (veste) foglio(veste, mostra); else mostra();
  });
  /* se un foglio di stile non risponde, il modulo si mostra lo stesso */
  setTimeout(mostra, 3000);

  /* ── INTRODUZIONE AL SERVIZIO ──────────────────────────────
     I testi che nell'app precedono il modulo (che cos'e' il servizio, quando
     chiederlo) nel sito li scrive chi tiene la pagina: qui si segnano, e
     blocco.css li nasconde salvo richiesta (data-formedil-introduzione="si").
     Si segna solo cio' che sta PRIMA del modulo e non ha un id: gli elementi
     con un id sono parti vive (riferimento della visita, avvisi…). */
  document.querySelectorAll('.page').forEach(function (pag) {
    var haModulo = false, i, n;
    for (i = 0; i < pag.children.length; i++) if (pag.children[i].tagName === 'FORM') haModulo = true;
    if (!haModulo) return;
    for (i = 0; i < pag.children.length; i++) {
      n = pag.children[i];
      if (n.tagName === 'FORM' || n.classList.contains('prog-wrap')) break;
      if (n.id || n.tagName === 'STYLE' || n.matches('.page-hero, .btn-back, .form-header')) continue;
      n.setAttribute('data-intro', '');
    }
  });

  /* ── PAROLE CHE NEL BLOCCO NON HANNO SENSO ─────────────────
     «Torna alla home»: qui la home non c'e'. */
  B.pagine.forEach(function (id) {
    var p = document.getElementById('page-' + id);
    if (!p) return;
    p.querySelectorAll('.btn-new').forEach(function (b) {
      if (/torna alla home/i.test(b.textContent)) b.textContent = 'Compila una nuova richiesta';
    });
  });
  var indietro = document.getElementById('iz-indietro');
  if (indietro && B.nome === 'iscrizioni') {
    new MutationObserver(function () {
      if (/home/i.test(indietro.textContent)) indietro.textContent = '← Tutti i corsi e gli incontri aperti';
    }).observe(indietro, { childList: true, characterData: true, subtree: true });
  }

  /* ── UNA PAGINA CHE IL BLOCCO NON HA ───────────────────────
     Lo chiama showPage quando gli si chiede una pagina fuori dal blocco. */
  window.bloccoFuoriPagina = function (id) {
    var att = document.querySelector('.page.active');
    var qui = att ? att.id.replace(/^page-/, '') : '';
    if (id === 'home') {
      /* da una pagina interna (l'iscrizione) si torna alla prima (l'elenco);
         dalla prima si ricomincia con il modulo pulito */
      if (qui && qui !== B.pagine[0]) { window.showPage(B.pagine[0]); return; }
      try { history.replaceState(null, '', location.pathname + location.search + '#ricomincia'); } catch (e) {}
      location.reload();
      return;
    }
    /* un'altra pagina del portale (le notizie, per esempio): si apre il
       portale intero, in un'altra scheda */
    var u = new URL(location.href);
    u.search = '?pagina=' + encodeURIComponent(id);
    u.hash = '';
    window.open(u.href, '_blank', 'noopener');
  };

  /* ── AVVISO ALLA PAGINA OSPITE ─────────────────────────────
     Lo chiama submitForm a invio riuscito. */
  window.bloccoEvento = function (tipo) {
    if (tipo === 'inviata') manda({ tipo: 'inviata' });
  };

  /* ── SCORRIMENTO ───────────────────────────────────────────
     Il riquadro e' alto quanto il modulo e non scorre: «vai all'errore» lo
     deve fare la pagina ospite. Si prendono i due comandi che il portale usa
     (scrollIntoView e scrollTo) e si girano alla pagina ospite: cosi' vale
     anche per i moduli che verranno, senza doverci pensare.
     Prima che chi compila tocchi qualcosa non si sposta niente: il blocco che
     si carica non deve trascinare la pagina del sito su di se'. */
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () { toccato = true; }, { capture: true, passive: true });
  });
  var scrollNativo = Element.prototype.scrollIntoView;
  var toNativo = window.scrollTo;
  Element.prototype.scrollIntoView = function (o) {
    if (!gestito) return scrollNativo.apply(this, arguments);
    if (!toccato) return;
    var r = this.getBoundingClientRect();
    manda({
      tipo: 'vista',
      y: Math.round(r.top + (window.pageYOffset || 0)),
      alto: Math.round(r.height),
      centro: !!(o && typeof o === 'object' && o.block === 'center')
    });
  };
  window.scrollTo = function () {
    if (!gestito) return toNativo.apply(window, arguments);
    if (toccato) manda({ tipo: 'vista', y: 0, alto: 0, centro: false });
  };

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || e.data.formedil !== 'ospite') return;
    if (e.data.tipo === 'ciao') {
      gestito = true;
      ultima = -1;
      misura();
      /* dopo «Compila una nuova richiesta» il modulo riparte dall'inizio:
         la pagina ospite va riportata in cima al blocco */
      if (location.hash === '#ricomincia') {
        try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
        manda({ tipo: 'vista', y: 0, alto: 0, centro: false });
      }
    }
  });

  /* ── «ALERT» ───────────────────────────────────────────────
     Dentro la pagina di un altro sito il browser non mostra le finestre
     alert(): chi sbaglia una foto non saprebbe perche'. Il testo si scrive
     nella pagina, vicino a dove si stava lavorando. */
  window.alert = function (t) {
    var pag = document.querySelector('.page.active');
    if (!pag) return;
    var vecchio = pag.querySelector('.fb-avviso');
    if (vecchio) vecchio.remove();
    var d = document.createElement('div');
    d.className = 'fb-avviso';
    d.setAttribute('role', 'alert');
    var s = document.createElement('span');
    s.textContent = String(t == null ? '' : t);
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Ho capito';
    b.onclick = function () { d.remove(); };
    d.appendChild(s);
    d.appendChild(b);
    var att = document.activeElement;
    var dove = (att && att !== document.body && pag.contains(att))
      ? (att.closest('.field, .photo-upload-area, .file-area') || att) : null;
    if (dove && dove.parentNode) dove.parentNode.insertBefore(d, dove);
    else pag.insertBefore(d, pag.firstChild);
    d.scrollIntoView({ block: 'center' });
  };

  /* ── CAMPIONARIO ───────────────────────────────────────────
     ?blocco=campionario: il modulo della visita, vero, piu' gli elementi che
     li' non compaiono e gli stati che si vedono solo a invio fatto (errore,
     ricevuta). Serve a chi scrive la veste del sito.
     ⚠️ I pezzi si CLONANO dai moduli veri: se un modulo cambia, il campionario
     lo segue. Non invia niente. */
  function campionario() {
    var pag = document.getElementById('page-visita');
    if (!pag) return;

    document.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toccato = true;
      var r = document.getElementById('fb-ricevuta');
      if (r) r.scrollIntoView({ block: 'center' });
    }, true);

    function pulisci(n) {
      [n].concat([].slice.call(n.querySelectorAll('*'))).forEach(function (x) {
        ['id', 'name', 'for', 'required', 'onclick', 'onchange', 'oninput', 'data-intro'].forEach(function (a) { x.removeAttribute(a); });
      });
      return n;
    }
    function clona(sel) {
      var n = document.querySelector(sel);
      return n ? pulisci(n.cloneNode(true)) : null;
    }
    function el(tag, classe, testo) {
      var n = document.createElement(tag);
      if (classe) n.className = classe;
      if (testo != null) n.textContent = testo;
      return n;
    }

    var box = el('div', 'fb-campione');
    box.appendChild(el('div', 'section-title', 'Campionario'));
    box.appendChild(el('p', 'fb-campione-nota',
      'Qui sopra c’è un modulo vero (la visita in cantiere). Qui sotto gli elementi che in quel modulo '
      + 'non compaiono e gli stati che si vedono solo dopo l’invio. Accanto a ognuno, il nome di classe su cui '
      + 'scrivere lo stile. Da questa pagina non parte nessuna richiesta.'));
    function pezzo(nome, nodo) {
      if (!nodo) return;
      box.appendChild(el('div', 'fb-campione-nome', nome));
      box.appendChild(nodo);
    }

    pezzo('.info-box', clona('#page-visita .info-box'));
    pezzo('.form-note', clona('.form-note'));
    pezzo('.field-hint', (function () { var n = clona('.field-hint'); return n; })());

    var cg = el('div', 'check-group');
    [].slice.call(document.querySelectorAll('.check-opt')).slice(0, 3).forEach(function (c, i) {
      var k = pulisci(c.cloneNode(true));
      k.classList.remove('sel');
      if (i === 1) { k.classList.add('sel'); var inp = k.querySelector('input'); if (inp) inp.checked = true; }
      cg.appendChild(k);
    });
    if (cg.children.length) pezzo('.check-group  .check-opt  .check-opt.sel', cg);

    var rg = clona('#conf-requestGrid');
    if (rg) { var seconda = rg.querySelectorAll('.request-card')[1]; if (seconda) seconda.classList.add('selected'); }
    pezzo('.request-grid  .request-card  .request-card.selected', rg);

    var sc = clona('.scale-wrap');
    if (sc) { var sb = sc.querySelectorAll('.scale-btn')[3]; if (sb) sb.classList.add('sel'); }
    pezzo('.scale-wrap  .scale-btn  .scale-btn.sel', sc);

    var fa = clona('#rlst-fileArea');
    if (fa) {
      var fn = fa.querySelector('.file-name');
      if (fn) { fn.className = 'file-name ok'; fn.style.display = 'block'; fn.textContent = '✓ verbale-riunione.pdf'; }
    }
    pezzo('.file-area  .fi-icon  .fi-text  .fi-sub  .file-name.ok', fa);
    pezzo('.photo-upload-area  .photo-preview', clona('.photo-upload-area'));
    pezzo('.cantiere-block  .cantiere-block-title', clona('.cantiere-block'));

    var conErrore = clona('#page-visita .field');
    if (conErrore) { var ci = conErrore.querySelector('input, select, textarea'); if (ci) ci.classList.add('err'); }
    pezzo('.field  input.err', conErrore);

    var av = el('div', 'fb-avviso');
    av.appendChild(el('span', null, 'Max 3 foto consentite'));
    av.appendChild(el('button', null, 'Ho capito'));
    pezzo('.fb-avviso', av);

    var riga = el('div', 'btn-row');
    riga.style.flexWrap = 'wrap';
    riga.appendChild(el('button', 'btn-reset', 'Cancella'));
    riga.appendChild(el('button', 'btn-send', 'Invia richiesta'));
    var spento = el('button', 'btn-send', 'Invia richiesta'); spento.disabled = true; riga.appendChild(spento);
    var inCorso = el('button', 'btn-send'); inCorso.disabled = true;
    inCorso.appendChild(el('span', 'spinner')); inCorso.appendChild(document.createTextNode('Invio in corso...'));
    riga.appendChild(inCorso);
    [].slice.call(riga.children).forEach(function (b) { b.type = 'button'; });
    pezzo('.btn-row  .btn-reset  .btn-send  .btn-send:disabled  .spinner', riga);

    var ko = clona('#vis-error');
    if (ko) {
      ko.style.display = 'block';
      ko.innerHTML = '<strong>Invio non riuscito</strong> (connessione assente).<br>La richiesta è stata '
        + '<strong>salvata su questo dispositivo</strong> e verrà reinviata automaticamente.';
    }
    pezzo('.error-banner', ko);

    var ok = clona('#vis-success');
    if (ok) {
      ok.style.display = 'block';
      ok.id = 'fb-ricevuta';
      var p = el('p', 'ricevuta');
      p.innerHTML = '<strong>Richiesta registrata con il n° 123.</strong><br>Riceverai una email di conferma a '
        + '<strong>nome@esempio.it</strong>: se non arriva entro 15 minuti chiamaci allo 049 761168.';
      ok.insertBefore(p, ok.querySelector('button'));
      var bn = ok.querySelector('.btn-new'); if (bn) bn.type = 'button';
    }
    pezzo('.success-banner  .ricevuta  .btn-new', ok);

    /* corsi e incontri aperti: l'elenco vero dipende da che cosa e' aperto
       oggi, quindi qui una scheda di esempio con le stesse classi */
    var card = el('button', 'is-card'); card.type = 'button';
    card.appendChild(el('div', 'is-p', 'Nome del progetto'));
    card.appendChild(el('div', 'is-t', 'Titolo del corso o dell’incontro'));
    card.appendChild(el('div', 'is-q', 'giovedì 15 ottobre 2026 · Sede di Padova · 4 ore'));
    card.appendChild(el('div', 'is-d', 'Due righe di descrizione dell’evento, come le scrive la segreteria.'));
    card.appendChild(el('span', 'is-posti', 'ancora 12 posti'));
    pezzo('.is-card  .is-p  .is-t  .is-q  .is-d  .is-posti   (blocco «iscrizioni»)', card);

    pag.appendChild(box);
  }
  if (B.nome === 'campionario') {
    try { campionario(); } catch (e) { console.warn('[blocco] campionario:', e && e.message); }
  }
})();
