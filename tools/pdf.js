// Génère un PDF A4 à partir d'une source HTML de docs-src/ : node tools/pdf.js docs-src/x.html app/docs/x.pdf
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [src, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(src)); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('PDF :', out);
})();
