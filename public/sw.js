/**
 * Service Worker for Push Notifications
 * Works even when the app is not open
 */

const CACHE_NAME = "networx-v1";
const ASSETS_TO_CACHE = ["/", "/index.html"];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Ignore errors for missing files
        console.log("Some assets could not be cached");
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          // Cache successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page if available
          return caches.match("/index.html");
        });
    })
  );
});

// Handle push notifications
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push notification received with no data");
    return;
  }

  try {
    const data = event.data.json();

    const notificationOptions = {
      body: data.body || "You have a new message",
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/badge-72x72.png",
      tag: data.tag || "default",
      data: data.data || {},
      actions: [
        {
          action: "open",
          title: "Open",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "NetworX", notificationOptions)
    );
  } catch (error) {
    console.error("Error handling push notification:", error);
    // Fallback for non-JSON push data
    event.waitUntil(
      self.registration.showNotification("NetworX", {
        body: event.data.text(),
        icon: "/icon-192x192.png",
      })
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const threadId = event.notification.data?.threadId;
  const action = event.action;

  if (action === "close") {
    return;
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          if (threadId) {
            // Send message to open specific thread
            client.postMessage({
              type: "OPEN_THREAD",
              threadId: threadId,
            });
          }
          return client.focus();
        }
      }

      // If app not open, open it
      const url = threadId ? `/home?thread=${threadId}` : "/home";
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag);
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data.type === "SEND_NOTIFICATION") {
    const { title, options } = event.data.payload;
    self.registration.showNotification(title, options);
  }
});
