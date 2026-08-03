/**
 * Génère quiz.html, qcm.html, etude.html et formations.html en fichiers AUTONOMES,
 * à partir des gabarits src/*.html et des données data/, qcm/, fiches/.
 *
 * Usage :  node build.js
 * À relancer après chaque ajout de question ou de fiche.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;

/* ---------- Regroupement des domaines en « formations » ---------- */
const FORMATIONS = [
  { id:"terraform",  titre:"Terraform & IaC",      doms:["Terraform","Ansible"] },
  { id:"kubernetes", titre:"Kubernetes",           doms:["Kubernetes"] },
  { id:"aws",        titre:"AWS",                  doms:["AWS"] },
  { id:"azure",      titre:"Azure",                doms:["Azure"] },
  { id:"cicd",       titre:"CI/CD & GitOps",       doms:["CI/CD","GitOps"] },
  { id:"conteneurs", titre:"Docker & Git",         doms:["Docker","Git"] },
  { id:"linux",      titre:"Linux & Bash",         doms:["Linux"] },
  { id:"reseau",     titre:"Réseau",               doms:["Réseau"] },
  { id:"securite",   titre:"Sécurité & conformité",doms:["Sécurité"] },
  { id:"sre",        titre:"Observabilité & SRE",  doms:["Observabilité","SRE"] },
  { id:"donnees",    titre:"Données & flux",       doms:["SQL","Messagerie"] }
];

/* ---------- Chargement des banques pour construire l'index ---------- */
function charger(fichiers, cle) {
  const sandbox = {};
  global.window = sandbox;
  fichiers.forEach(f => {
    delete require.cache[require.resolve(f)];
    require(f);
  });
  const banque = sandbox[cle] || [];
  delete global.window;
  return banque;
}

/* Tous les .js du dossier, triés : niveau*.js puis import-*.js */
function fichiersDe(dossier) {
  return fs.readdirSync(path.join(root, dossier))
    .filter(f => f.endsWith(".js"))
    .sort()
    .map(f => path.join(root, dossier, f));
}
const fichiersLibre = fichiersDe("data");
const fichiersQcm = fichiersDe("qcm");

const LIBRE = charger(fichiersLibre, "QBANK");
const QCM = charger(fichiersQcm, "QCM");

function idsParNiveau(banque, doms) {
  const out = [];
  for (let l = 1; l <= 10; l++) {
    out.push(banque.filter(q => q.lvl === l && doms.includes(q.dom)).map(q => q.id));
  }
  return out;
}

const INDEX = FORMATIONS.map(f => ({
  id: f.id,
  titre: f.titre,
  doms: f.doms,
  libre: idsParNiveau(LIBRE, f.doms),
  qcm: idsParNiveau(QCM, f.doms)
}));

/* ---------- Génération ---------- */
function build(template, sortie) {
  let html = fs.readFileSync(path.join(root, "src", template), "utf8");

  html = html.replace("/*__INDEX__*/", () => "const INDEX = " + JSON.stringify(INDEX) + ";");

  /* <!--__BANQUE:dossier__--> : inline TOUS les .js du dossier, sans liste à tenir à jour */
  html = html.replace(/<!--__BANQUE:([a-z]+)__-->/g, (m, dossier) => {
    const fichiers = fichiersDe(dossier);
    console.log(`    ${dossier}/ : ${fichiers.length} fichiers de questions inlinés`);
    return fichiers.map(p =>
      `<script>\n/* ${dossier}/${path.basename(p)} */\n${fs.readFileSync(p, "utf8")}\n</script>`
    ).join("\n");
  });

  html = html.replace(/<script src="([^"]+\.js)"><\/script>\s*/g, (m, rel) => {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) { console.warn("  ! introuvable, ignoré :", rel); return ""; }
    return `<script>\n/* ${rel} */\n${fs.readFileSync(p, "utf8")}\n</script>\n`;
  });

  fs.writeFileSync(path.join(root, sortie), html, "utf8");
  const ko = (fs.statSync(path.join(root, sortie)).size / 1024).toFixed(0);
  console.log(`  ✓ ${sortie} (${ko} Ko)`);
}

console.log("Génération des fichiers autonomes :");
build("quiz.html", "quiz.html");
build("qcm.html", "qcm.html");
build("etude.html", "etude.html");
build("formations.html", "formations.html");

/* ---------- Rapport de couverture ---------- */
console.log("\nCouverture par formation (niveaux non vides / 10) :");
INDEX.forEach(f => {
  const nq = f.qcm.filter(a => a.length).length;
  const nl = f.libre.filter(a => a.length).length;
  const tot = f.qcm.flat().length + f.libre.flat().length;
  const alerte = (nq < 10 || nl < 10) ? "  ← trous" : "";
  console.log(`  ${f.titre.padEnd(24)} ${String(tot).padStart(4)} questions · QCM ${nq}/10 · libre ${nl}/10${alerte}`);
});
console.log(`\nTotal : ${LIBRE.length} questions libres, ${QCM.length} QCM.`);
