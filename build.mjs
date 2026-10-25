// Bina: gabungkan JS terkompil + CSS ke dalam satu fail HTML.
// Guna: node build.mjs   (jalankan `tsc -p tsconfig.json` dahulu)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const order = ["00-config", "01-util", "02-draw", "03-scenes", "04-steps", "05-ui", "07-three", "06-game"];
const js = '"use strict";\n(() => {\n' + order.map((f) => readFileSync(`build/js/${f}.js`, "utf8").replace(/^"use strict";\s*/m, "")).join("\n") + "\n})();\n";
mkdirSync("dist", { recursive: true });
writeFileSync("dist/main.js", js);
const css = readFileSync("style.css", "utf8");
const html = readFileSync("index.html", "utf8");
const body = html.split("<!--APP-->")[1].split("<!--/APP-->")[0].trim();
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Jejak Haji</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}`;
// 1) Fail kendiri penuh (boleh dibuka terus / dimuat naik ke laman web)
writeFileSync("dist/jejak-haji.html", `<!doctype html>\n<html lang="ms">\n<head>\n${head}\n<style>\n${css}\n</style>\n</head>\n<body>\n${body}\n<script>\n${js}</script>\n</body>\n</html>\n`);
// 2) Versi serpihan untuk Artifact (tanpa doctype/html/head/body)
writeFileSync("dist/artifact.html", `<title>Jejak Haji</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n${fonts}\n<style>\n${css}\n</style>\n${body}\n<script>\n${js}</script>\n`);
console.log("OK", (js.length / 1024).toFixed(1) + " KB JS");
