// ONTRACK — Service Worker v1.1
// Gère uniquement les notifications push — pas de cache

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Supprimer les anciens caches sans forcer le rechargement des pages
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => caches.delete(key)))
    )
    // Ne PAS appeler clients.claim() pour éviter de recharger la page
  );
});

// Ne pas intercepter les requêtes — laisser le navigateur gérer normalement
// (pas de stratégie cache-first qui bloquerait les mises à jour)

self.addEventListener('push', e => {
  if(!e.data) return;
  let payload;
  try { payload = e.data.json(); }
  catch { payload = { title: 'ONTRACK', body: e.data.text() }; }
  const title = payload.title || 'ONTRACK';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/Ontrack/icon-192.png',
    badge: '/Ontrack/icon-72.png',
    tag: payload.tag || 'ontrack-notif',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for(const client of clients){
        if(client.url.includes('Ontrack') && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow('https://ontrack-teck.github.io/Ontrack/');
    })
  );
});
