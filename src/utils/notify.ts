export function notifyNewMessage(senderName: string, message: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(`New message from ${senderName}`, {
    body: message,
    icon: '/icon-192.png', // optional
  });
}


