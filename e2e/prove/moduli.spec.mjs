// OGNI MODULO DEL PORTALE PARTE DAVVERO (18/11/2026, chiesto dall'utente:
// «dobbiamo essere certi al 100% che quando uno invia una richiesta, questa
// parta e venga processata. Non esiste che perdiamo le cose»).
//
// Nato dal guasto del modulo d'iscrizione: dal 18/09 al 18/11/2026 il
// pulsante «Invia l'iscrizione» andava in errore e non spediva niente, e
// nessun controllo lo vedeva, perché nessuno premeva il pulsante.
//
// Qui, per OGNI modulo: si apre la pagina come la apre chi la usa (dalla
// home o dal suo link), si compila con dati di prova, si preme «Invia» e si
// pretende che
//   1. la richiesta PARTA verso la cassetta, una volta sola, col tipo giusto
//      e coi campi che il Gestionale si aspetta;
//   2. chi ha compilato veda la conferma, e nessun errore JavaScript.
// La cassetta è FINTA (page.route): niente arriva al database. Che la
// richiesta, arrivata, venga anche lavorata lo prova l'altra metà del
// controllo, la prova vera di tutti i moduli nel Gestionale.
//
// ⚠️ Un modulo nuovo che chiama submitForm e NON è in MODULI fa fallire la
// prova «nessun modulo resta fuori»: così non si può aggiungere un modulo
// dimenticandosi di provarlo.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const SB = 'https://qcvwrgjldbdoxcfdsvkq.supabase.co';
const oggi = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
const fraGiorni = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

/* le risposte finte del database Servizi, per le pagine che si aprono da un link */
const evento = () => ({ trovato: true, aperto: true, codice: 'E2E-TEST', titolo: 'Evento di prova automatica', sede: 'Padova',
  giornate: [{ data: oggi(), dalle: '00:00', alle: '23:59' }] });
const RPC = {
  apri_iscrizione: evento,
  apri_questionario: () => ({ trovato: true, aperto: true, codice: 'Q-E2E', titolo: 'Evento di prova automatica', tipo: 'convegno',
    domande: [{ id: 1, testo: 'Domanda di prova', tipo: 'scala' }], tronco: true }),
  apri_test: () => ({ trovato: true, aperto: true, codice: 'T-E2E', titolo: 'Corso di prova automatica', durata_min: 30,
    domande: [{ id: 1, testo: 'Domanda di prova?', tipo: 'chiusa', opzioni: ['Sì', 'No'] }] }),
  chi_sono: () => ({ trovato: true, iniziali: 'P. A.', gia_consegnato: false }),
  apri_presenza: () => ({ trovato: true, aperto: true, codice: 'P1-E2E', titolo: 'Corso di prova automatica', giornate: [{ data: oggi(), dalle: '00:00', alle: '23:59' }], oggi: oggi() }),
  pres_che_cosa: () => ({ trovato: true, iniziali: 'P. A.', giornata: oggi(), oggi: true, tipo: 'entrata', turno: 1, ora_turno: '00:00', fuori_orario: false }),
  iscrizioni_aperte: () => [],
  conta_visita: () => null,
};

/* i moduli: come ci si arriva e che cosa deve partire.
   campi = chiavi che il payload deve avere, non vuote */
const MODULI = [
  { tipo: 'rlst', pagina: 'rlst', form: 'form-rlst', campi: ['ragione_sociale', 'pdf_base64'] },
  { tipo: 'rls', pagina: 'rls', form: 'form-rls', campi: ['ragione_sociale'] },
  { tipo: 'conf', pagina: 'conferenza', form: 'form-conferenza', campi: ['ragione_sociale', 'tipo_richiesta'] },
  { tipo: 'vis', pagina: 'visita', form: 'form-visita', campi: ['ragione_sociale'] },
  { tipo: 'cons', pagina: 'consulenza', form: 'form-consulenza', campi: ['ragione_sociale'] },
  { tipo: 'att', pagina: 'attestazione', form: 'form-attestazione', campi: ['ragione_sociale'] },
  { tipo: 'not', pagina: 'notifica', form: 'form-notifica', campi: [] },
  { tipo: 'seg', pagina: 'segnalazione', form: 'form-segnalazione', campi: [] },
  { tipo: 'qst', link: '?valuta=V2526-0001.abcdef123456', form: 'form-questionario', campi: ['riferimento'] },
  { tipo: 'isc', nome: 'iscrizione «mi iscrivo io»', modo: 'io', link: '?iscrizione=E2E-TEST.abcdef123456', form: 'form-iscrizione', campi: ['riferimento', 'persone', 'referente', 'email'] },
  { tipo: 'isc', nome: 'iscrizione «iscrivo altre persone»', modo: 'altri', link: '?iscrizione=E2E-TEST.abcdef123456', form: 'form-iscrizione', campi: ['riferimento', 'persone', 'referente', 'email'] },
  { tipo: 'isc', nome: 'sala', link: '?sala=E2E-TEST.abcdef123456', form: 'form-sala', campi: ['riferimento', 'persone'] },
  { tipo: 'qev', link: '?evento=Q-E2E.abcdef123456', form: 'form-qevento', campi: [] },
  { tipo: 'tst', link: '?test=T-E2E.abcdef123456', form: 'form-test', campi: [] },
  { tipo: 'prs', link: '?presenza=P1-E2E.abcdef123456', form: 'form-presenza', campi: ['codice_personale'] },
  { tipo: 'dtst', link: '?testdocente=T-E2E.abcdef123456&c=Corso&d=Docente', form: 'form-testdocente', campi: [] },
];

/* compila un modulo come farebbe una persona: tutti i campi visibili, i
   pulsanti di scelta, le spunte, gli allegati */
async function compila(page, formId) {
  await page.evaluate((formId) => {
    const f = document.getElementById(formId);
    let n = 0;
    const visibile = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const val = (el) => {
      const etich = el.closest('.form-group, .field')?.querySelector('label')?.textContent || '';
      const k = `${el.name || ''} ${el.id || ''} ${el.placeholder || ''} ${etich}`.toLowerCase();
      if (el.type === 'email' || /mail|pec/.test(k)) return 'prova.automatica@example.com';
      if (el.type === 'tel' || /tel|cell/.test(k)) return '0497611680';
      if (el.type === 'date') return new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      if (el.type === 'number') return el.min && Number(el.min) > 1 ? el.min : '2';
      if (/anno/.test(k)) return '1980';
      if (/piva|partita/.test(k)) return '00000000000';
      if (/\bcf\b|cf_|_cf|fiscale/.test(k)) return 'RSSMRA80A01H501U';
      if (/ragione sociale|impresa|\bente\b/.test(k)) return 'Impresa di prova automatica';
      if (/cap\b|_cap/.test(k)) return '35127';
      if (/prov/.test(k)) return 'PD';
      if (/codice|personale/.test(k)) return 'ABCDE';
      /* testi diversi fra loro: due risposte uguali a una domanda non passano */
      return 'Prova automatica ' + (++n);
    };
    for (const el of f.querySelectorAll('input, select, textarea')) {
      if (!visibile(el) || el.disabled || el.readOnly) continue;
      if (el.type === 'hidden' || el.type === 'file' || el.type === 'submit' || el.type === 'button') continue;
      if (el.type === 'checkbox') { if (!el.checked) el.click(); continue; }
      if (el.type === 'radio') {
        if (!f.querySelector(`input[type=radio][name="${CSS.escape(el.name)}"]:checked`)) el.click();
        continue;
      }
      if (el.tagName === 'SELECT') {
        if (!el.value) { const o = [...el.options].find((x) => x.value); if (o) el.value = o.value; }
      } else if (!el.value) el.value = val(el);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    /* le schede a scelta (conferenza): la prima */
    const card = f.querySelector('.request-card:not(.selected)');
    if (card && !f.querySelector('.request-card.selected')) card.click();
  }, formId);
  /* gli allegati: un PDF minuscolo dove serve */
  const pdf = { name: 'prova.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n') };
  for (const inp of await page.locator(`#${formId} input[type=file]`).all()) {
    if (await inp.isVisible() || await inp.evaluate((e) => !!e.required)) {
      await inp.setInputFiles(/image/.test(await inp.getAttribute('accept') || '') ? { ...pdf, name: 'prova.png', mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') } : pdf);
    }
  }
}

async function prepara(page, inviate, errori) {
  page.on('pageerror', (e) => errori.push(String(e)));
  page.on('dialog', (d) => d.accept());
  await page.route(`${SB}/rest/v1/rpc/*`, async (route) => {
    const nome = route.request().url().split('/rpc/')[1].split('?')[0];
    const f = RPC[nome];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(f ? f() : null) });
  });
  /* la cassetta: ogni POST verso il database Servizi che non è una rpc */
  await page.route((url) => url.href.startsWith(SB) && !url.pathname.includes('/rest/v1/rpc/'), async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      let corpo = null;
      try { corpo = JSON.parse(req.postData() || 'null'); } catch { corpo = req.postData(); }
      inviate.push(corpo);
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', progressivo: 9999, submission_id: corpo?.submission_id || 'x', email: 'ok' }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

for (const m of MODULI) {
  test(`il modulo ${m.nome || m.tipo} parte e chi compila vede la conferma`, async ({ page }) => {
    const inviate = [], errori = [];
    await prepara(page, inviate, errori);
    await page.goto(m.link || './');
    if (m.pagina) await page.evaluate((p) => window.showPage(p), m.pagina);
    await page.waitForTimeout(800);

    /* le pagine a più passi: quello che fa una persona prima del modulo */
    if (m.tipo === 'prs') {
      await page.fill('#pz-codice', 'ABCDE'); await page.fill('#pz-anno', '1980'); await page.click('#pz-cerca');
    }
    if (m.tipo === 'tst') {
      await page.fill('#te-codice', 'ABCDE'); await page.click('#te-cerca'); await page.click('#te-inizia');
    }
    if (m.tipo === 'qst') await page.click('#qst-faccine .qz-fac[data-v="4"]');
    if (m.modo) await page.click(`#iz-scelta [data-iz-modo="${m.modo}"]`);
    await expect(page.locator(`#${m.form}`), 'il modulo si deve vedere').toBeVisible({ timeout: 10_000 });
    await compila(page, m.form);
    if (m.tipo === 'tst') {
      await page.locator('#te-domanda .qz-r').first().click();
      if (!(await page.locator('#tst-btnSend').isVisible())) await page.click('#te-avanti');
    }
    if (m.tipo === 'dtst') {
      /* la domanda come la scrive un docente: testo, punti, due risposte diverse e una sola giusta */
      await page.fill('.td-testo', 'Domanda di prova automatica?');
      await page.fill('.td-punti', '1');
      await page.locator('.td-opz-testo').nth(0).fill('Risposta giusta');
      await page.locator('.td-opz-testo').nth(1).fill('Risposta sbagliata');
      await page.evaluate(() => document.querySelectorAll('.td-opz-giusta').forEach((c, i) => { c.checked = i === 0; }));
    }
    const invia = page.locator(`#${m.form} button[type=submit]`).first();
    await invia.click();
    await expect.poll(() => inviate.length, { timeout: 15_000 }).toBeGreaterThan(0).catch(async () => {
      /* il motivo che la pagina dà a chi compila, perché chi legge il rapporto capisca subito */
      const motivo = await page.evaluate((f) => [...document.querySelectorAll(`#${f} .error-banner, #${f} [id$="-error"]`)]
        .filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.textContent.trim()).join(' | '), m.form);
      throw new Error(`«Invia» non ha fatto partire niente dal modulo ${m.form}. La pagina dice: ${motivo || '(niente)'}${errori.length ? `. Errori JavaScript: ${errori.join(' | ')}` : ''}`);
    });
    await page.waitForTimeout(1500);

    expect(inviate.length, 'una richiesta sola per un clic').toBe(1);
    const p = inviate[0];
    expect(p.tipo_modulo, 'tipo del modulo').toBe(m.tipo);
    expect(p.submission_id, 'ogni invio porta il suo identificativo').toBeTruthy();
    for (const c of m.campi) expect(p[c], `campo ${c} nel payload`).toBeTruthy();
    if (m.form === 'form-iscrizione') {
      /* (18/11/2026) la data di nascita si riempie dal codice fiscale e parte aaaa-mm-gg */
      const pers = JSON.parse(p.persone);
      expect(pers[0].nato_il, 'data di nascita presa dal codice fiscale RSSMRA80A01H501U').toBe('1980-01-01');
      expect(pers[0].nato_il_scritta, 'la data «come scritta» non deve partire').toBeUndefined();
    }
    const ok = page.locator(`#${m.form} .success-banner`).first();
    await expect(ok, 'chi compila deve vedere la conferma').toBeVisible({ timeout: 5_000 });
    expect(errori, 'nessun errore JavaScript').toEqual([]);
  });
}

/* (18/11/2026, dalla prova del corso 336) chi ha già firmato quel momento non
   firma di nuovo: niente pulsante, l'avviso del tutor, e niente parte */
test('firma di presenza: chi ha già firmato vede «hai già firmato» e non può rifirmare', async ({ page }) => {
  const inviate = [], errori = [];
  await prepara(page, inviate, errori);
  await page.route(`${SB}/rest/v1/rpc/pres_che_cosa*`, (route) => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ...RPC.pres_che_cosa(), gia_firmato: true, gia_ora: '14:16' }) }));
  await page.goto('?presenza=P1-E2E.abcdef123456');
  await page.waitForTimeout(800);
  await page.fill('#pz-codice', 'ABCDE'); await page.fill('#pz-anno', '1980'); await page.click('#pz-cerca');
  await expect(page.locator('#pz-cosa-txt')).toHaveText("Hai già firmato l'entrata", { timeout: 10_000 });
  await expect(page.locator('#pz-cosa-ora')).toContainText('alle 14:16');
  await expect(page.locator('#pz-cosa-ora')).toContainText("tutor d'aula");
  await expect(page.locator('#prs-btnSend'), 'il pulsante Firmo non deve esserci').toBeHidden();
  await page.waitForTimeout(500);
  expect(inviate.length, 'non deve partire niente').toBe(0);
  expect(errori, 'nessun errore JavaScript').toEqual([]);
});

/* (18/11/2026) chi ha già l'entrata e va via prima di metà turno firma l'uscita anticipata */
test('firma di presenza: «Stai uscendo in anticipo?» manda l\'uscita anticipata', async ({ page }) => {
  const inviate = [], errori = [];
  await prepara(page, inviate, errori);
  await page.route(`${SB}/rest/v1/rpc/pres_che_cosa*`, (route) => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ...RPC.pres_che_cosa(), gia_firmato: true, gia_ora: '09:28', puo_uscire: true }) }));
  await page.goto('?presenza=P1-E2E.abcdef123456');
  await page.waitForTimeout(800);
  await page.fill('#pz-codice', 'ABCDE'); await page.fill('#pz-anno', '1980'); await page.click('#pz-cerca');
  await expect(page.locator('#pz-cosa-tit')).toHaveText('Stai uscendo in anticipo?', { timeout: 10_000 });
  const btn = page.locator('#prs-btnSend');
  await expect(btn).toBeVisible();
  await expect(btn).toContainText('esco in anticipo');
  await btn.click();
  await expect.poll(() => inviate.length, { timeout: 15_000 }).toBeGreaterThan(0);
  expect(inviate[0].uscita_anticipata, 'l\'uscita anticipata deve partire dichiarata').toBe('si');
  await expect(page.locator('#form-presenza .success-banner').first()).toBeVisible({ timeout: 5_000 });
  expect(errori, 'nessun errore JavaScript').toEqual([]);
});

test('nessun modulo resta fuori da questa prova', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const nelPortale = [...new Set([...html.matchAll(/submitForm\('([\w-]+)',\s*'(\w+)'/g)].map((x) => x[1]))].sort();
  const provati = [...new Set(MODULI.map((m) => m.form))].sort();
  expect(nelPortale, 'ogni submitForm del portale deve avere la sua riga in MODULI').toEqual(provati);
});
