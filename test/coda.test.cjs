// Prova a secco di ritentaCoda del portale: si ritaglia la funzione vera e la si esegue con finti.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const src = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
const da = src.indexOf('let codaInCorso = false;');
const a = src.indexOf("window.addEventListener('online', ritentaCoda);");
assert(da > 0 && a > da, 'ancore non trovate');
const codice = src.slice(da, a);

async function giro(righe, risposte, online = true) {
  const tolte = [], scritte = [], avvisi = [], inviate = [];
  const ctx = {
    CODA_GIORNI: 7, console: { log() {}, warn() {} }, Date,
    navigator: { onLine: online }, inVolo: new Set(),
    codaTutte: async () => righe,
    codaTogli: async (id) => { tolte.push(id); },
    codaScrivi: async (r) => { scritte.push(r.submission_id); return true; },
    chiudiCompilazione() {},
    avvisaCodaPersa: (rec, perche) => avvisi.push(rec.submission_id + ': ' + perche),
    inviaAlServer: async (p) => { inviate.push(p.id); return risposte[p.id]; },
  };
  vm.createContext(ctx);
  vm.runInContext(codice + '\nthis.ritentaCoda = ritentaCoda;', ctx);
  await ctx.ritentaCoda();
  return { tolte, scritte, avvisi, inviate };
}
const ora = Date.now(), G = 86400000;
const riga = (id, giorni = 0) => ({ submission_id: id, creato: ora - giorni * G, payload: { id, tipo_modulo: 'seg' } });

(async () => {
  // 1. un rifiuto definitivo in testa NON ferma le successive, esce dalla coda e si dice
  let r = await giro([riga('A'), riga('B')], { A: { ok: false, riprovabile: false, motivo: 'campo mancante' }, B: { ok: true, progressivo: 7 } });
  assert.deepStrictEqual(r.inviate, ['A', 'B'], 'la seconda deve partire');
  assert.deepStrictEqual(r.tolte, ['A', 'B']);
  assert.strictEqual(r.avvisi.length, 1); assert(/rifiutata/.test(r.avvisi[0]));
  // 2. un intoppo passeggero resta in coda, senza avviso, e non ferma le altre
  r = await giro([riga('A'), riga('B')], { A: { ok: false, riprovabile: true, motivo: '503' }, B: { ok: true } });
  assert.deepStrictEqual(r.scritte, ['A']); assert.deepStrictEqual(r.tolte, ['B']); assert.strictEqual(r.avvisi.length, 0);
  // 3. scaduta: tolta E avvisata, senza tentare l'invio
  r = await giro([riga('V', 8)], {});
  assert.deepStrictEqual(r.inviate, []); assert.deepStrictEqual(r.tolte, ['V']); assert.strictEqual(r.avvisi.length, 1);
  // 4. offline: non parte niente
  r = await giro([riga('A')], {}, false);
  assert.deepStrictEqual(r.inviate, []);
  console.log('coda: 4 prove su 4 riuscite');
})().catch((e) => { console.error('FALLITA:', e.message); process.exit(1); });
