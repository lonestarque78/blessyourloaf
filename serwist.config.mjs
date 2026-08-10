import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { serwist } from "@serwist/next/config";

// @serwist/next's default manifest transform assumes any *.html file it finds
// while globbing is a Next.js-rendered route (e.g. ".next/server/app/foo.html"
// -> "/foo") and strips the extension unconditionally. `public/offline.html`
// and `public/offline-recipe.html` are literal static files, not rendered
// routes, so that transform mangles their URLs to "/public/offline" etc. —
// which 404s, which in turn stalls the service worker in "installing"
// forever. Work around it by excluding both files from the automatic public/
// glob and re-adding them manually with the URLs they're actually served at.
// `public/offline-recipe.js` (built by `npm run build:offline-shell`, see
// package.json, which must run before this config is used) needs no such
// workaround — it's a plain .js file, so the default glob precaches it as-is.
const offlineHtmlPath = "public/offline.html";
const offlineHtmlRevision = createHash("md5").update(readFileSync(offlineHtmlPath)).digest("hex");

const offlineRecipeHtmlPath = "public/offline-recipe.html";
const offlineRecipeHtmlRevision = createHash("md5").update(readFileSync(offlineRecipeHtmlPath)).digest("hex");

export default serwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Next statically prerenders some routes at build time (using whichever
  // locale/session resolves with no request cookies present). Precaching
  // those HTML files would risk serving that build-time snapshot to every
  // visitor offline, regardless of their actual BYL_LOCALE cookie. Only the
  // static, locale-neutral fallback shells (`offline.html`, offline-recipe.html)
  // are precached as documents; see src/app/sw.ts for the reasoning.
  precachePrerendered: false,
  globIgnores: [offlineHtmlPath, offlineRecipeHtmlPath],
  additionalPrecacheEntries: [
    { url: "/offline.html", revision: offlineHtmlRevision },
    { url: "/offline-recipe.html", revision: offlineRecipeHtmlRevision },
  ],
});
