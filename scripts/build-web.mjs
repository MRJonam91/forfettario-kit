// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)
// Costruisce la web app statica in site/: un unico file HTML autosufficiente
// (CSS, font, JS e dati inclusi), pubblicabile su GitHub Pages o aperto offline.
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const years = readdirSync(new URL("data/years/", root))
  .filter((f) => /^\d{4}\.json$/.test(f))
  .map((f) => JSON.parse(read(`data/years/${f}`)));
const pkg = JSON.parse(read("package.json"));

const { outputFiles } = await build({
  entryPoints: [new URL("src/web/app.ts", root).pathname],
  bundle: true,
  format: "iife",
  minify: true,
  target: "es2020",
  write: false,
  legalComments: "none",
  define: { __FK_YEARS__: JSON.stringify(years) },
  banner: { js: `/* forfettario-kit ${pkg.version} · AGPL-3.0-only · (c) 2026 Manoj Rollo (MRJonam91) · github.com/MRJonam91/forfettario-kit */` },
});
const js = outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const font = (pkgName, file, family, weight) => {
  const b64 = readFileSync(new URL(`node_modules/@fontsource/${pkgName}/files/${file}`, root)).toString("base64");
  return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
};
const fonts = [
  font("ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff2", "IBM Plex Sans", 400),
  font("ibm-plex-sans", "ibm-plex-sans-latin-600-normal.woff2", "IBM Plex Sans", 600),
  font("ibm-plex-sans-condensed", "ibm-plex-sans-condensed-latin-600-normal.woff2", "IBM Plex Sans Condensed", 600),
  font("ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff2", "IBM Plex Mono", 400),
  font("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2", "IBM Plex Mono", 500),
].join("\n");

const fragment = read("web/app.html")
  .replace("/*__FONTS__*/", () => fonts)
  .replace("/*__CSS__*/", () => read("web/app.css"))
  .replace("/*__JS__*/", () => js);

// CSP rigida per la pagina pubblicata: nessuna richiesta di rete possibile, solo lo script incluso.
const inline = fragment.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
const hash = createHash("sha256").update(inline).digest("base64");
const csp = [
  "default-src 'none'",
  `script-src 'sha256-${hash}'`,
  "style-src 'unsafe-inline'",
  "font-src data:",
  "img-src data: 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const cut = fragment.indexOf('<div class="page">');
const head = fragment.slice(0, cut);
const body = fragment.slice(cut);
const url = "https://mrjonam91.github.io/forfettario-kit/";
const page = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="no-referrer">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="forfettario-kit · calcolatore regime forfettario ${years.at(-1).year}">
<meta property="og:description" content="Tasse, contributi INPS, netto mensile e scadenze F24 con i codici tributo. Gratis, open source, nel tuo browser.">
<meta property="og:image" content="${url}social-preview.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%230b6b4e'/%3E%3Ctext x='16' y='23' font-family='Arial' font-weight='700' font-size='20' text-anchor='middle' fill='white'%3EF%3C/text%3E%3C/svg%3E">
${head}</head>
<body>
${body}</body>
</html>
`;

mkdirSync(new URL("site/", root), { recursive: true });
writeFileSync(new URL("site/index.html", root), page);
writeFileSync(new URL("site/app.html", root), fragment);
copyFileSync(new URL("docs/assets/social-preview.png", root), new URL("site/social-preview.png", root));
writeFileSync(new URL("site/.nojekyll", root), "");
console.log(`site/index.html: ${(page.length / 1024).toFixed(0)} KB (js ${(js.length / 1024).toFixed(0)} KB, anni: ${years.map((y) => y.year).join(", ")})`);
