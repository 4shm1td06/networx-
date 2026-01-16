/**
 * Browser Notification Utils
 * Handles push notifications like WhatsApp and Instagram
 * Works even when the app is closed
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Register service worker for background notifications
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  try {
    if (!("serviceWorker" in navigator)) {
      console.log("Service workers not supported");
      return null;
    }

    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("✅ Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("❌ Service Worker registration failed:", error);
    return null;
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications not supported");
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      console.log("✅ Subscribed to push notifications");

      // Send subscription to backend
      await savePushSubscription(subscription);
    }

    return subscription;
  } catch (error) {
    console.error("❌ Failed to subscribe to push notifications:", error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    if (!("serviceWorker" in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("✅ Unsubscribed from push notifications");
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Unsubscribe failed:", error);
    return false;
  }
};

/**
 * Send subscription to backend
 */
const savePushSubscription = async (subscription: PushSubscription): Promise<void> => {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("Failed to save push subscription");
    }
  } catch (error) {
    console.error("Error saving push subscription:", error);
  }
};

/**
 * Convert VAPID key from base64 to Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Try to subscribe to push notifications
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (vapidKey) {
        await subscribeToPushNotifications(vapidKey);
      }
    }
    return permission === "granted";
  }

  return false;
};

/**
 * Send a notification with proper handling
 */
export const sendNotification = async (options: NotificationOptions) => {
  try {
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log("Notification permission denied");
        return;
      }
    }

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SEND_NOTIFICATION",
        payload: {
          title: options.title,
          options: {
            body: options.body,
            icon: options.icon || "/icon-192x192.png",
            badge: options.badge || "/badge-72x72.png",
            tag: options.tag || "default",
            data: options.data || {},
          },
        },
      });
    } else {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icon-192x192.png",
        badge: options.badge || "/badge-72x72.png",
        tag: options.tag || "default",
        data: options.data || {},
      });
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};

/**
 * Send message notification
 */
export const notifyNewMessage = async (
  senderName: string,
  messagePreview: string,
  senderAvatar?: string,
  threadId?: string
) => {
  await sendNotification({
    title: senderName,
    body: messagePreview || "Sent a message",
    icon: senderAvatar,
    tag: "dm-" + senderName,
    data: {
      threadId: threadId,
      type: "message",
    },
  });
};
