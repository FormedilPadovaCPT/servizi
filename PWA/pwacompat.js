/**
 * PWA Service Worker Registration
 * Aggiornamento automatico in background - no popup
 */

(function() {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/servizi/PWA/sw.js')
        .then(function(registration) {
          console.log('PWA SW registered:', registration.scope);

          // Aggiornamento automatico senza chiedere conferma
          registration.addEventListener('updatefound', function() {
            console.log('PWA: New version available, updating...');
            registration.installing.postMessage({ action: 'skipWaiting' });
          });

          // Quando il nuovo SW è attivo, ricarica la pagina
          navigator.serviceWorker.addEventListener('controllerchange', function() {
            window.location.reload();
          });
        })
        .catch(function(error) {
          console.log('PWA SW registration failed:', error);
        });
    });
  }
})();
