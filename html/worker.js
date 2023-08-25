self.addEventListener("push", e => {
    const data = e.data.json();
    self.registration.showNotification(
        data.title, {
            "body": data.body,
            "data": {
                "url": data.url ?? "about:blank"
            }
        }
    );
});
self.addEventListener("notificationclick", e => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url));
})