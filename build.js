/**
 * Génère quiz.html et etude.html en fichiers AUTONOMES (tout inliné),
 * à partir des templates src/*.html et des données data/*.js et fiches/*.js.
 *
 * Usage :  node build.js
 * À relancer après chaque ajout de question ou de fiche.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;

function build(template, sortie) {
  let html = fs.readFileSync(path.join(root, "src", template), "utf8");

  html = html.replace(/<script src="([^"]+\.js)"><\/script>\s*/g, (m, rel) => {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) {
      console.warn("  ! introuvable, ignoré :", rel);
      return "";
    }
    const code = fs.readFileSync(p, "utf8");
    return `<script>\n/* ${rel} */\n${code}\n</script>\n`;
  });

  fs.writeFileSync(path.join(root, sortie), html, "utf8");
  const ko = (fs.statSync(path.join(root, sortie)).size / 1024).toFixed(0);
  console.log(`  ✓ ${sortie} (${ko} Ko)`);
}

console.log("Génération des fichiers autonomes :");
build("quiz.html", "quiz.html");
build("etude.html", "etude.html");
console.log("Terminé. Ouvre index.html dans ton navigateur.");
