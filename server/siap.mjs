// Salin fail game ke server/public/ untuk Workers static assets.
// Guna: node siap.mjs   (jalankan `npm run build` di akar repo dahulu)
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
const root = new URL("../", import.meta.url).pathname;
const out = new URL("./public/", import.meta.url).pathname;
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(root + "dist/jejak-haji.html", out + "index.html");
for (const d of ["models", "audio", "panorama", "textures"]) {
  if (existsSync(root + d)) cpSync(root + d, out + d, { recursive: true, filter: (f) => !/\.(blend1?|b64|zip)$/.test(f) });
}
console.log("public/ siap");
