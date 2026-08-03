/**
 * Importe les questions des quiz existants de ../ (terraform-quiz, cka-trainer,
 * az204-quiz, az400-quiz, az900-quiz, aws-devops-quiz, clf-quiz, jour1/2-quiz)
 * vers les banques de ce projet.
 *
 *   node import-quiz.js            (rapport seulement)
 *   node import-quiz.js --ecrire   (génère data/import-*.js et qcm/import-*.js)
 *
 * Les questions déjà présentes (texte normalisé identique) sont ignorées.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const parent = path.join(root, "..");
const ECRIRE = process.argv.includes("--ecrire");

/* ---------- Sources : quiz d'origine → domaine par défaut ---------- */
const SOURCES = [
  { dossier:"terraform-quiz",  prefixe:"tf",   domDefaut:"Terraform" },
  { dossier:"cka-trainer",     prefixe:"cka",  domDefaut:"Kubernetes" },
  { dossier:"az204-quiz",      prefixe:"az204",domDefaut:"Azure" },
  { dossier:"az400-quiz",      prefixe:"az400",domDefaut:"CI/CD" },
  { dossier:"az900-quiz",      prefixe:"az900",domDefaut:"Azure" },
  { dossier:"aws-devops-quiz", prefixe:"awsd", domDefaut:"AWS" },
  { dossier:"clf-quiz",        prefixe:"clf",  domDefaut:"AWS" },
  { dossier:"jour1-quiz",      prefixe:"j1",   domDefaut:"AWS" },
  { dossier:"jour2-quiz",      prefixe:"j2",   domDefaut:"AWS" }
];

/* ---------- Domaines d'origine → domaines de ce projet ----------
   On ne redirige que les cas non ambigus ; sinon on garde le domaine du quiz. */
const REDIRECTION = {
  "Git":"Git", "GitHub":"Git",
  "Réseau":"Réseau", "Network":"Réseau", "Networking":"Réseau",
  "Sécurité":"Sécurité", "Secrets":"Sécurité", "IAM":"Sécurité", "Identité":"Sécurité",
  "Conformité":"Sécurité", "Gouvernance":"Sécurité", "RBAC":"Sécurité",
  "Monitoring":"Observabilité", "Surveillance":"Observabilité", "Observabilité":"Observabilité",
  "SRE":"SRE", "Reprise":"SRE", "Fiabilité":"SRE",
  "Conteneurs":"Docker", "Docker":"Docker", "Images":"Docker",
  "IaC":"Terraform", "CloudFormation":"Terraform", "Bicep":"Terraform", "ARM":"Terraform",
  "Cosmos":"SQL", "Bases":"SQL", "SQL":"SQL", "Storage":"SQL",
  "Pipelines":"CI/CD", "Déploiement":"CI/CD", "Agents":"CI/CD", "Packages":"CI/CD",
  "CodePipeline":"CI/CD", "CodeBuild":"CI/CD", "CodeDeploy":"CI/CD",
  "Coûts":"SRE", "Tarification":"SRE"
};

/* ---------- Niveau d'origine (1-3) → niveaux de ce projet (1-9) ---------- */
function niveauCible(niveauOrigine, compteur) {
  const bandes = { 1:[1,2,3], 2:[4,5,6], 3:[7,8,9] };
  const bande = bandes[niveauOrigine] || bandes[2];
  return bande[compteur % bande.length];
}

/* ---------- Extraction du tableau JS depuis le HTML ---------- */
function extraire(html) {
  for (const marqueur of ["const QUESTIONS = [", "const Q = ["]) {
    const debut = html.indexOf(marqueur);
    if (debut === -1) continue;
    const ouvrante = debut + marqueur.length - 1;
    const fin = html.indexOf("\n];", ouvrante);
    if (fin === -1) continue;
    const code = html.slice(ouvrante, fin + 2);
    try {
      return Function('"use strict"; return (' + code + ");")();
    } catch (e) {
      console.warn("  ! évaluation impossible :", e.message);
      return null;
    }
  }
  return null;
}

/* ---------- Normalisation pour la déduplication ---------- */
function cle(texte) {
  return String(texte)
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* ---------- Banques déjà présentes ---------- */
function chargerBanque(dossier, cleGlobale, motif) {
  const sandbox = {};
  global.window = sandbox;
  fs.readdirSync(path.join(root, dossier))
    .filter(f => f.endsWith(".js") && motif.test(f))
    .forEach(f => {
      const p = path.join(root, dossier, f);
      delete require.cache[require.resolve(p)];
      require(p);
    });
  const b = sandbox[cleGlobale] || [];
  delete global.window;
  return b;
}

const LIBRE = chargerBanque("data", "QBANK", /^niveau/);
const QCM = chargerBanque("qcm", "QCM", /^niveau/);
const dejaVu = new Set([...LIBRE, ...QCM].map(q => cle(q.q)));
const idsPris = new Set([...LIBRE, ...QCM].map(q => q.id));

console.log(`Banques actuelles : ${LIBRE.length} libres, ${QCM.length} QCM.\n`);

/* ---------- Import ---------- */
const nouvLibre = [], nouvQcm = [];
let ignorees = 0, illisibles = 0;

SOURCES.forEach(src => {
  const f = path.join(parent, src.dossier, "index.html");
  if (!fs.existsSync(f)) { console.log(`  – ${src.dossier} : introuvable`); return; }

  const brut = extraire(fs.readFileSync(f, "utf8"));
  if (!brut) { console.log(`  – ${src.dossier} : extraction impossible`); illisibles++; return; }

  let nL = 0, nQ = 0, dup = 0;
  const compteurs = {};

  brut.forEach((o, i) => {
    if (!o || !o.q) return;
    const k = cle(o.q);
    if (dejaVu.has(k)) { dup++; ignorees++; return; }
    dejaVu.add(k);

    const domOrigine = o.dom || "";
    const dom = REDIRECTION[domOrigine] || src.domDefaut;
    const nivOrigine = Number(o.level) || 2;
    compteurs[nivOrigine] = (compteurs[nivOrigine] || 0) + 1;
    const lvl = niveauCible(nivOrigine, compteurs[nivOrigine]);

    let id = `${src.prefixe}-${o.id || i}`;
    while (idsPris.has(id)) id += "x";
    idsPris.add(id);

    const commun = { id, lvl, dom, q: o.q, explain: o.explain || "" };

    if (Array.isArray(o.choices) && o.choices.length >= 2 && typeof o.answer === "number") {
      nouvQcm.push({ ...commun, choix: o.choices, bonne: o.answer });
      nQ++;
    } else if (Array.isArray(o.accept) && o.accept.length) {
      nouvLibre.push({ ...commun, accept: o.accept });
      nL++;
    }
  });

  console.log(`  ✓ ${src.dossier.padEnd(18)} ${String(brut.length).padStart(4)} lues → ${String(nL).padStart(3)} libres, ${String(nQ).padStart(3)} QCM (${dup} doublons ignorés)`);
});

console.log(`\nÀ importer : ${nouvLibre.length} libres, ${nouvQcm.length} QCM.`);
console.log(`Doublons écartés : ${ignorees}. Fichiers illisibles : ${illisibles}.`);

/* ---------- Écriture ---------- */
function ecrire(fichier, cleGlobale, liste, titre) {
  const lignes = liste.map(o => "  " + JSON.stringify(o)).join(",\n");
  const contenu =
`/* ${titre}
   Généré par import-quiz.js — ne pas éditer à la main.
   ${liste.length} questions importées des quiz existants de ../ */
window.${cleGlobale} = (window.${cleGlobale} || []).concat([
${lignes}
]);
`;
  fs.writeFileSync(path.join(root, fichier), contenu, "utf8");
  console.log(`  ✓ ${fichier} (${(Buffer.byteLength(contenu)/1024).toFixed(0)} Ko)`);
}

if (ECRIRE) {
  console.log("\nÉcriture :");
  ecrire("data/import-existants.js", "QBANK", nouvLibre, "Questions à réponse libre importées");
  ecrire("qcm/import-existants.js", "QCM", nouvQcm, "QCM importés");

  const parNiveau = n => [1,2,3,4,5,6,7,8,9,10].map(l => n.filter(q=>q.lvl===l).length).join(" ");
  console.log("\nRépartition par niveau (1→10)");
  console.log("  libres :", parNiveau(nouvLibre));
  console.log("  QCM    :", parNiveau(nouvQcm));
  const doms = [...new Set([...nouvLibre,...nouvQcm].map(q=>q.dom))].sort();
  console.log("\nDomaines touchés :", doms.join(", "));
} else {
  console.log("\n(relancer avec --ecrire pour générer les fichiers)");
}
