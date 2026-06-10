self.addEventListener('push', (event) => {
  let data = { title: 'Glow', body: 'Новое уведомление' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Glow', body: event.data.text() };
    }
  }
  const options = {
    body: data.body,
    icon: '/sakura.png',
    badge: '/sakura.png',
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});