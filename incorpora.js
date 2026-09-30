/* ============================================================
   FORMEDIL PADOVA — Area Sicurezza e Salute
   incorpora.js: mette un modulo del portale servizi dentro una pagina.

   USO — nel punto della pagina in cui deve comparire il modulo:

     <div data-formedil-modulo="visita"></div>
     <script src="https://…/incorpora.js" async></script>

   Lo script si include una volta sola, anche con piu' moduli nella pagina.

   MODULI: rlst, rls, conferenza, visita, consulenza, attestazione, notifica,
   segnalazione, questionario, iscrizioni   (campionario: per scrivere lo stile)

   OPZIONI, sul <div>:
     data-formedil-introduzione="si"   mostra anche il testo di presentazione
                                       del servizio che c'e' nell'app (di norma
                                       lo scrive la pagina che ospita)
     data-formedil-margine="120"       pixel da lasciare in alto quando la
                                       pagina viene portata sul modulo (una
                                       testata fissa: di norma 90)

   EVENTI, sul <div> (risalgono fino a document):
     formedil:pronto     il modulo e' visibile
     formedil:inviata    una richiesta e' stata registrata — nessun dato di
                         chi ha compilato: serve solo a contarle

   CHE COSA FA: crea il riquadro, lo tiene alto quanto il modulo (niente barre
   di scorrimento interne) e porta la pagina sul punto giusto quando c'e' un
   errore da correggere o la ricevuta da leggere. Non legge e non scrive
   niente della pagina che lo ospita, non usa cookie.

   ⚠️ Questo file deve restare PICCOLO e FERMO: tutto cio' che cambia (i
   moduli, i controlli, l'invio) sta dentro il riquadro. Cosi' chi lo monta
   puo' anche copiarselo o bloccarlo con un'impronta di integrita' senza
   perdere gli aggiornamenti dei moduli.
   ============================================================ */
(function () {
  'use strict';
  if (window.FormedilModuli) { window.FormedilModuli.monta(); return; }

  /* l'indirizzo del portale e' quello da cui arriva questo file */
  var io = document.currentScript;
  var BASE = new URL('.', (io && io.src) || location.href).href;
  var ORIGINE = new URL(BASE).origin;

  var NOMI = {
    rlst: 'Affidamento al servizio RLST', rls: 'Comunicazione del RLS',
    conferenza: 'Richiesta di conferenza di cantiere', visita: 'Richiesta di visita in cantiere',
    consulenza: 'Richiesta di consulenza', attestazione: 'Attestazione DM 132/2024',
    notifica: 'Notifica di cantiere', segnalazione: 'Segnalazione di un cantiere',
    questionario: 'Valutazione del sopralluogo', iscrizioni: 'Corsi e incontri aperti',
    campionario: 'Campionario dei moduli'
  };
  /* dall'indirizzo della pagina ospite passano al modulo solo questi
     parametri: il collegamento a un'iscrizione e quello a una valutazione */
  var PASSANO = ['iscrizione', 'valuta'];

  var riquadri = [];   // { cornice, contenitore }

  function avvisa(contenitore, nome) {
    var ev;
    try { ev = new CustomEvent('formedil:' + nome, { bubbles: true }); }
    catch (e) { ev = document.createEvent('Event'); ev.initEvent('formedil:' + nome, true, false); }
    contenitore.dispatchEvent(ev);
  }

  function monta(radice) {
    var dove = (radice || document).querySelectorAll('[data-formedil-modulo]');
    for (var i = 0; i < dove.length; i++) {
      var c = dove[i];
      if (c.getAttribute('data-formedil-montato')) continue;
      var nome = (c.getAttribute('data-formedil-modulo') || '').trim().toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(NOMI, nome)) continue;
      c.setAttribute('data-formedil-montato', '1');

      var q = new URLSearchParams();
      q.set('blocco', nome);
      if (/^(si|sì|1|true)$/i.test(c.getAttribute('data-formedil-introduzione') || '')) q.set('intro', '1');
      /* solo per le prove: una veste di esempio fra quelle del portale */
      var veste = (c.getAttribute('data-formedil-veste') || '').trim();
      if (/^[a-z0-9-]{1,30}$/.test(veste)) q.set('veste', veste);
      var qui = new URLSearchParams(location.search);
      for (var k = 0; k < PASSANO.length; k++) {
        var v = qui.get(PASSANO[k]);
        if (v) q.set(PASSANO[k], v.slice(0, 200));
      }

      var f = document.createElement('iframe');
      f.src = BASE + '?' + q.toString();
      f.title = NOMI[nome] + ' – Formedil Padova, Area Sicurezza e Salute';
      f.setAttribute('scrolling', 'no');
      var provvisoria = parseInt(c.getAttribute('data-formedil-altezza'), 10);
      if (!(provvisoria > 0 && provvisoria < 20000)) provvisoria = 600;
      f.style.cssText = 'display:block;width:100%;border:0;height:' + provvisoria + 'px;background:transparent;';
      c.appendChild(f);
      riquadri.push({ cornice: f, contenitore: c });
    }
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGINE || !e.data || e.data.formedil !== 'blocco') return;
    var r = null;
    for (var i = 0; i < riquadri.length; i++) if (riquadri[i].cornice.contentWindow === e.source) r = riquadri[i];
    if (!r) return;
    var d = e.data;

    if (d.tipo === 'pronto') {
      /* da qui in poi altezza e scorrimento li gestisce questa pagina */
      e.source.postMessage({ formedil: 'ospite', tipo: 'ciao' }, ORIGINE);
      avvisa(r.contenitore, 'pronto');
    } else if (d.tipo === 'altezza') {
      var a = Number(d.altezza);
      if (a > 0 && a < 100000) r.cornice.style.height = Math.ceil(a) + 'px';
    } else if (d.tipo === 'vista') {
      var margine = Number(r.contenitore.getAttribute('data-formedil-margine'));
      if (!(margine >= 0)) margine = 90;
      var y = Number(d.y) || 0, alto = Number(d.alto) || 0;
      var cima = r.cornice.getBoundingClientRect().top + (window.pageYOffset || 0) + y;
      var meta = d.centro
        ? cima - Math.max(margine, (window.innerHeight - alto) / 2)
        : cima - margine;
      window.scrollTo({ top: Math.max(0, Math.round(meta)), behavior: 'smooth' });
    } else if (d.tipo === 'inviata') {
      avvisa(r.contenitore, 'inviata');
    }
  });

  window.FormedilModuli = { monta: monta, indirizzo: BASE };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { monta(); });
  else monta();
})();
