/**
 * PWA Service Worker Registration
 * Includere questo script in index.html prima della chiusura del </body>
 */

(function() {
  'use strict';

  // Registra il service worker solo se supportato
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/servizi/PWA/sw.js')
        .then(function(registration) {
          console.log('PWA SW registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', function() {
            console.log('PWA: New version available');
            if (confirm('Nuova versione disponibile! Aggiornare?')) {
              registration.installing.postMessage({ action: 'skipWaiting' });
              window.location.reload();
            }
          });
        })
        .catch(function(error) {
          console.log('PWA SW registration failed:', error);
        });

      // Controlla aggiornamenti ogni 30 minuti
      setInterval(function() {
        registration.update();
      }, 30 * 60 * 1000);
    });

    // Mostra banner "Installa app" quando disponibile
    window.addEventListener('beforeinstallprompt', function(e) {
      console.log('PWA: Install prompt available');
      // Puoi salvare l'evento e mostrarlo quando vuoi
      window.deferredInstallPrompt = e;
    });

    window.addEventListener('appinstalled', function() {
      console.log('PWA: App installed');
      window.deferredInstallPrompt = null;
    });
  }
})();
