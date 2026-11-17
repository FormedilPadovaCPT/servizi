// node test/immagini-leggere.test.cjs
// (17/11/2026, l'utente: «l'importante è che sul cell siano velocissime app servizi e visite»)
// All'apertura il portale scaricava 24,8 MB di immagini. Da oggi:
//  · nessuna immagine della pagina pesa più di 150 KB, salvo il logo istituzionale in CMYK
//    (non si riduce per non cambiare i colori del marchio), che però si scarica solo se si vede;
//  · ogni versione dichiarata in srcset esiste e ha davvero la larghezza dichiarata;
//  · le immagini fuori dalla prima schermata si scaricano solo quando servono (loading="lazy");
//  · la veste salvata dal service worker è la stessa versione che usa la pagina.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const R = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(R, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(R, 'sw.js'), 'utf8');

// larghezza di un JPEG o PNG letta dai byte (senza librerie)
function larghezza(file) {
  const b = fs.readFileSync(file);
  if (b.slice(1, 4).toString() === 'PNG') return b.readUInt32BE(16);
  for (let i = 2; i < b.length;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return b.readUInt16BE(i + 7);
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('larghezza non trovata: ' + file);
}

const ECCEZIONI = ['Formedil_Padova_Positivo_colori.png'];
const PRIMA_SCHERMATA = ['Logo_Formedil_pd_piccolo.png'];   // lo splash: si vede subito
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
let controllate = 0;
for (const tag of imgs) {
  const src = (tag.match(/\bsrc="([^"]+)"/) || [])[1];
  if (!src || !/^[\w .\/%-]+\.(png|jpe?g|webp|gif|svg)$/i.test(src)) continue;   // solo file veri, non tag costruiti dal codice
  const file = path.join(R, decodeURIComponent(src));
  assert.ok(fs.existsSync(file), 'immagine mancante: ' + src);
  const kb = fs.statSync(file).size / 1024;
  if (!ECCEZIONI.includes(src)) assert.ok(kb <= 150, `${src}: ${Math.round(kb)} KB, troppo per il telefono (massimo 150)`);
  // le icone piccole (pochi KB) possono scaricarsi subito; le altre solo quando servono
  if (!PRIMA_SCHERMATA.includes(src) && kb > 30) assert.ok(/loading="lazy"/.test(tag), src + ': manca loading="lazy"');
  const ss = (tag.match(/\bsrcset="([^"]+)"/) || [])[1];
  if (ss) {
    assert.ok(/\bsizes="[^"]+"/.test(tag), src + ': srcset senza sizes');
    for (const voce of ss.split(',').map((x) => x.trim())) {
      const [f, d] = voce.split(/\s+/);
      const ff = path.join(R, f);
      assert.ok(fs.existsSync(ff), 'versione mancante: ' + f);
      assert.ok(fs.statSync(ff).size / 1024 <= 250, f + ': oltre 250 KB');
      assert.strictEqual(larghezza(ff) + 'w', d, f + ': larghezza dichiarata diversa da quella vera');
    }
  }
  controllate++;
}
assert.ok(controllate >= 20, 'troppe poche immagini controllate: ' + controllate);
for (const f of ['RLST.png', 'Andrea Pagnacco.jpg', 'visentini Tommaso.jpg']) {
  assert.ok(fs.existsSync(path.join(R, f)), 'gli originali restano nel repository: ' + f);
}
const v = (s, f) => (s.match(new RegExp(f.replace('.', '\\.') + '\\?v=(\\d+)')) || [])[1];
for (const f of ['veste-sito3.css', 'veste-sito3.js']) {
  assert.ok(v(html, f), f + ' non trovato in index.html');
  assert.strictEqual(v(sw, f), v(html, f), f + ': il service worker salva una versione diversa da quella della pagina');
}
// ── foto delle notizie: miniature (17/11/2026) ──
const vm = require('vm');
const veste = fs.readFileSync(path.join(R, 'veste-sito3.js'), 'utf8');
const admin = fs.readFileSync(path.join(R, 'admin', 'index.html'), 'utf8');
const pezzo = html.slice(html.indexOf('window.nzMin = function'), html.indexOf('const NZ_LARGHEZZA'));
const ctx = { window: {} };
vm.runInNewContext(pezzo.replace(/^function nzImgAttr/m, 'window.nzImgAttr = function nzImgAttr').replace(/nzMin\(url\)/, 'window.nzMin(url)'), ctx);
const B = 'https://qcvwrgjldbdoxcfdsvkq.supabase.co/storage/v1/object/public/notizie-media/';
const mini = ctx.window.nzMin(B + 'img/123-abc.png');
assert.strictEqual(mini.src, B + 'min/480/img/123-abc.png.webp');
assert.strictEqual(mini.srcset, `${B}min/480/img/123-abc.png.webp 480w, ${B}min/960/img/123-abc.png.webp 960w, ${B}min/1600/img/123-abc.png.webp 1600w`);
assert.strictEqual(ctx.window.nzMin(B + 'img/animata.gif'), null, 'le GIF non hanno miniature');
assert.strictEqual(ctx.window.nzMin('https://i.ytimg.com/vi/abc/hqdefault.jpg'), null, 'le anteprime di YouTube non si toccano');
assert.match(ctx.window.nzImgAttr(B + 'img/1.jpg', '100vw'), /data-orig="[^"]+img\/1\.jpg" onerror="nzSenzaMin\(this\)"/, 'se la miniatura manca si torna all\'originale');
const card = html.slice(html.indexOf('function nzCard('), html.indexOf('function nzCard(') + 2500);
assert.strictEqual((card.match(/<img \$\{nzImgAttr\(/g) || []).length, 3, 'copertina del video, carosello e foto singola usano le miniature');
assert.ok(!/<img src="\$\{(u|imgs\[0\]|poster)\}"/.test(card), 'nessuna foto delle notizie all\'originale');
assert.ok((card.match(/data-zoom="\$\{(u|imgs\[0\])\}"/g) || []).length === 2, 'l\'ingrandimento resta sull\'originale');
assert.ok(/window\.nzMin \? window\.nzMin\(u\)/.test(veste) && /img\.srcset = mini\.srcset/.test(veste), 'i riquadri della home usano le miniature');
assert.ok(/const MINIATURE = \[480, 960, 1600\]/.test(admin) && /await creaMiniature\(file, path\)/.test(admin), 'l\'admin crea le miniature al caricamento');
assert.ok(/miniatureMancanti\(\)/.test(admin) && /list\('min\/1600\/img'/.test(admin), 'e quelle mancanti all\'apertura');
console.log('immagini-leggere: ' + controllate + ' immagini ok, miniature delle notizie ok');
