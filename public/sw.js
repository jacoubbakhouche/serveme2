self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "📩 إشعار جديد";
  const options = {
    body: data.body || "وصلك إشعار جديد",
    icon: "/icon.png", // أي أيقونة عندك
    badge: "/icon.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/") // يفتح صفحة عند الضغط
  );
});
