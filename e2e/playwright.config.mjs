// Prove nel browser del portale servizi (18/11/2026): ogni modulo parte.
// Gira sul codice del commit (servito in locale) a ogni push, e sul sito
// PUBBLICATO ogni mattina (INDIRIZZO_PORTALE). La cassetta è finta.
import { defineConfig, devices } from '@playwright/test';

const pubblicato = process.env.INDIRIZZO_PORTALE;
export default defineConfig({
  testDir: './prove',
  timeout: 60_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: pubblicato || 'http://127.0.0.1:8799/', trace: 'retain-on-failure' },
  webServer: pubblicato ? undefined : { command: `${process.env.PYTHON || 'python3'} -m http.server 8799 --directory "${process.env.DIR_PORTALE || '..'}"`, port: 8799, reuseExistingServer: false },
  projects: [
    { name: 'telefono', use: { ...devices['Pixel 7'] } },
    { name: 'computer', use: { ...devices['Desktop Chrome'] } },
  ],
});
