/* Regenerate the per-person home-screen entry pages (rob/, nina/) from index.html.
 *
 * WHY THIS EXISTS: iOS drops the ?u= query when you "Add to Home Screen" — the installed PWA
 * relaunches at its manifest start_url. So each person gets their OWN subfolder whose manifest
 * start_url IS that subfolder, and the page hard-sets window.MESO_USER before the app boots.
 *
 * The catch: each subfolder page is a COPY of index.html (same inline CSS + body), so ANY change
 * to index.html must be re-propagated here. Run `node build-entries.mjs` after editing index.html.
 * (App logic lives in ../js/*, which the copies load directly, so JS changes need no rebuild —
 *  only index.html's inline <style>/markup does.)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync("index.html", "utf8");

const PEOPLE = [
  { uid: "rob", name: "Robert" },
  { uid: "nina", name: "Nina" },
];

for (const { uid, name } of PEOPLE) {
  let h = src
    .replace('href="icon-180.png"', 'href="../icon-180.png"')
    .replace('<meta name="apple-mobile-web-app-title" content="Meso">',
             `<meta name="apple-mobile-web-app-title" content="Meso — ${name}">`)
    .replace("<title>Meso</title>", `<title>Meso — ${name}</title>`)
    .replaceAll('src="data/', 'src="../data/')
    .replaceAll('src="js/', 'src="../js/')
    .replace('<script src="../data/demo-alias.js',
             `<script>window.MESO_USER=${JSON.stringify(uid)};</script>\n<script src="../data/demo-alias.js`)
    .replace('navigator.serviceWorker.register("sw.js")',
             'navigator.serviceWorker.register("../sw.js")');

  mkdirSync(uid, { recursive: true });
  writeFileSync(`${uid}/index.html`, h);

  const manifest = {
    name: `Meso — ${name}`,
    short_name: name,
    start_url: ".",
    scope: ".",
    display: "standalone",
    orientation: "portrait",
    background_color: "#131416",
    theme_color: "#131416",
    icons: [
      { src: "../icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "../icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "../icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  writeFileSync(`${uid}/manifest.webmanifest`, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${uid}/index.html + manifest`);
}
