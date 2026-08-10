/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { ExpirationPlugin, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Kept deliberately narrow for this first PWA pass. The precache manifest
// (self.__SW_MANIFEST, built by `serwist build`) already covers every static
// build asset under `_next/static` plus everything in `public/` — including
// `/offline.html` and the manifest icons — so this array only needs to cover
// what precaching doesn't: self-hosted webfonts (excluded from the default
// precache glob) and document navigations.
//
// Locale is chosen via the BYL_LOCALE cookie (see src/i18n/locale.ts), not a
// URL prefix, so the same URL (e.g. "/") can render different HTML for
// different visitors. A cache-first or stale-while-revalidate rule for HTML
// documents would risk serving one visitor's cached locale (or another
// user's session) to someone else. So documents are NetworkOnly here — always
// re-rendered server-side for the current cookie — and `fallbacks` below
// covers the offline case with a static, locale-neutral shell instead of a
// stale cached page. Saved-recipe data is cached separately in IndexedDB
// (src/lib/recipe-cache.ts) and rendered client-side by the recipe-specific
// fallback below; starter data/photos still have no offline story.
const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: /\/_next\/static\/media\/.+\.(?:woff2?|ttf|otf|eot)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: "static-font-assets",
      plugins: [new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 365 * 24 * 60 * 60 })],
    }),
  },
  {
    matcher: ({ request }) => request.destination === "document",
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        // A saved recipe's own page — offline-recipe.html boots a small client script
        // (src/offline-shell/main.ts) that reads the recipe id out of the URL and
        // renders it from the IndexedDB cache instead of the generic offline notice.
        // Keep this pattern in sync with parseRecipeIdFromPath in src/offline-shell/url.ts
        // (excludes /dashboard/my-recipes itself and /dashboard/my-recipes/new).
        url: "/offline-recipe.html",
        matcher: ({ request }) =>
          request.destination === "document" &&
          /^\/dashboard\/my-recipes\/(?!new(?:\/|$))[^/]+\/?$/.test(new URL(request.url).pathname),
      },
      {
        url: "/offline.html",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

// Push infrastructure, part 1 — just deliver whatever payload the server sent as a system
// notification. No feeding-reminder scheduling logic lives here; that's part 2, server-side.
interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  let payload: PushPayload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || "Bless Your Loaf";
  const url = payload.url || "/dashboard/starters";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
    })
  );
});

// Focuses an already-open tab on the target page instead of always opening a new one.
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url || "/dashboard/starters";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === new URL(url, self.location.origin).href && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
