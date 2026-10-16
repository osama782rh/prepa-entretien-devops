/**
 * 1. Recopie les simulateurs de certification autonomes de ../<dossier>/index.html
 *    vers certifs/<id>/index.html pour qu'ils soient servis par le site en ligne.
 * 2. Génère certifications.html (le menu de choix) à partir de src/certifications.html,
 *    en y injectant les compteurs réels de questions et de labs.
 *
 * Usage :  node sync-certifs.js
 * À relancer après chaque modification d'un simulateur, puis incrémenter
 * VERSION dans sw.js pour forcer la mise à jour du cache.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const source = path.resolve(root, "..");

/* L'ordre de ce tableau est l'ordre d'affichage sur la page. */
const CERTIFS = [
  { id:"az104", dossier:"az104-quiz", famille:"azure", etat:"focus",
    code:"AZ-104", titre:"Azure Administrator Associate", domaines:5,
    examen:"40 à 60 questions · ~100 min · 700/1000 requis",
    desc:"Identités et gouvernance, stockage, compute, réseau, supervision. L'examen d'administration Azure le plus large.",
    miseEnAvant:"Créneau d'examen réservé. La banque couvre les 5 domaines officiels avec 3 niveaux, du vocabulaire aux diagnostics réseau, plus les commandes az, le Bicep, le KQL et 10 labs sur ton abonnement." },

  { id:"az204", dossier:"az204-quiz", famille:"azure", etat:"", etatTexte:"à venir",
    code:"AZ-204", titre:"Azure Developer Associate", domaines:5,
    examen:"40 à 60 questions · ~120 min · 700/1000 requis",
    desc:"App Service, Functions, conteneurs, Cosmos DB, Key Vault, Service Bus, Event Grid et APIM." },

  { id:"az400", dossier:"az400-quiz", famille:"azure", etat:"", etatTexte:"après l'AZ-204",
    code:"AZ-400", titre:"Azure DevOps Engineer Expert", domaines:5,
    examen:"40 à 60 questions · ~150 min · 700/1000 requis",
    desc:"Pipelines, IaC, stratégie de branches, artefacts, sécurité de la chaîne et observabilité." },

  { id:"aws-devops", dossier:"aws-devops-quiz", famille:"aws", etat:"", etatTexte:"bon d'examen en main",
    code:"DOP-C02", titre:"AWS DevOps Engineer – Professional", domaines:6,
    examen:"75 questions · 180 min · 750/1000 requis",
    desc:"CI/CD, IaC CloudFormation et CDK, résilience, supervision, sécurité et gouvernance multi-comptes." },

  /* Parcours sans simulateur autonome : servi par le Certif Trainer (13-certifications/quiz.html).
     `externe` = pas de copie ; questions et labs sont fixés ici. */
  { id:"gcp-devops", externe:true, famille:"gcp", etat:"", etatTexte:"cours + questions",
    code:"PCDE", titre:"Google Cloud Professional Cloud DevOps Engineer", domaines:5,
    examen:"~50 questions · 120 min · niveau Professional",
    desc:"SRE, CI/CD sur Cloud Build et Cloud Deploy, GKE, Cloud Logging et Monitoring, gestion d'incidents. Cours, approfondissement et questions avancées dans le Certif Trainer.",
    url:"13-certifications/quiz.html#/course/gcp/Cours", questions:82, labs:0 },

  { id:"cka", dossier:"cka-trainer", famille:"k8s", etat:"", etatTexte:"plus tard",
    code:"CKA", titre:"Certified Kubernetes Administrator", domaines:5,
    examen:"15 à 20 tâches 100 % pratiques · 2 h · 66 % requis",
    desc:"Format à part : des drills de commandes kubectl à taper, pas des QCM, plus des labs sur cluster réel." },

  { id:"terraform", dossier:"terraform-quiz", famille:"hashi", etat:"obtenue",
    code:"HCTA-004", titre:"HashiCorp Terraform Associate", domaines:9,
    examen:"57 questions · 60 min · closed book",
    desc:"Obtenue le 27 juillet 2026, valable jusqu'en juillet 2028. À garder sous le coude pour l'IaC de l'AZ-400." },

  { id:"az900", dossier:"az900-quiz", famille:"azure", etat:"", etatTexte:"fondamentaux",
    code:"AZ-900", titre:"Azure Fundamentals", domaines:3,
    examen:"40 à 60 questions · 45 min · 700/1000 requis",
    desc:"Le socle cloud et Azure : modèles de service, régions, coûts, gouvernance. Idéal pour réviser les bases avant l'AZ-104." },

  { id:"clf", dossier:"clf-quiz", famille:"aws", etat:"", etatTexte:"fondamentaux",
    code:"CLF-C02", titre:"AWS Cloud Practitioner", domaines:4,
    examen:"65 questions · 90 min · 700/1000 requis",
    desc:"Le socle AWS : concepts, sécurité partagée, services clés, facturation et support." }
];

/* Compte les questions et les labs sans exécuter le HTML : on isole les
   tableaux de premier niveau et on compte les objets qui portent un id. */
function statistiques(html) {
  const compte = (nom) => {
    const debut = html.indexOf("const " + nom + " = [");
    if (debut === -1) return 0;
    let i = html.indexOf("[", debut), profondeur = 0, fin = -1;
    for (let j = i; j < html.length; j++) {
      const c = html[j];
      if (c === "[") profondeur++;
      else if (c === "]") { profondeur--; if (profondeur === 0) { fin = j; break; } }
    }
    if (fin === -1) return 0;
    const bloc = html.slice(i, fin);
    return (bloc.match(/(?:^|[\s{,])id\s*:\s*["']/g) || []).length;
  };
  return { questions: compte("QUESTIONS"), labs: compte("LABS") };
}

const rapport = [];
const index = [];

CERTIFS.forEach(c => {
  if (c.externe) {
    index.push({ id:c.id, code:c.code, titre:c.titre, desc:c.desc, famille:c.famille, etat:c.etat,
      etatTexte:c.etatTexte||"", examen:c.examen, domaines:c.domaines, miseEnAvant:"",
      questions:c.questions, labs:c.labs, url:c.url });
    return;
  }
  const src = path.join(source, c.dossier, "index.html");
  if (!fs.existsSync(src)) { console.warn("  ! introuvable, ignoré :", src); return; }

  const html = fs.readFileSync(src, "utf8");
  const cible = path.join(root, "certifs", c.id);
  fs.mkdirSync(cible, { recursive: true });
  fs.writeFileSync(path.join(cible, "index.html"), html, "utf8");

  const s = statistiques(html);
  if (!s.questions) console.warn("  ! aucune question détectée dans", c.dossier);

  rapport.push({ id: c.id, ...s, ko: Math.round(html.length / 1024) });
  index.push({
    id: c.id, code: c.code, titre: c.titre, desc: c.desc, famille: c.famille,
    etat: c.etat, etatTexte: c.etatTexte || "", examen: c.examen, domaines: c.domaines,
    miseEnAvant: c.miseEnAvant || "", questions: s.questions, labs: s.labs,
    url: "certifs/" + c.id + "/index.html"
  });
});

/* Génère certifications.html avec les compteurs réels */
const gabarit = path.join(root, "src", "certifications.html");
if (fs.existsSync(gabarit)) {
  const page = fs.readFileSync(gabarit, "utf8")
    .replace("/*__CERTIFS__*/", () => "const CERTIFS = " + JSON.stringify(index) + ";");
  fs.writeFileSync(path.join(root, "certifications.html"), page, "utf8");
  console.log("  ✓ certifications.html généré\n");
} else {
  console.warn("  ! src/certifications.html introuvable : page non régénérée\n");
}

console.log("Simulateurs synchronisés dans certifs/ :\n");
rapport.forEach(r =>
  console.log(`  ${r.id.padEnd(12)} ${String(r.questions).padStart(4)} questions · ${String(r.labs).padStart(2)} labs · ${r.ko} Ko`));
const total = rapport.reduce((s, r) => s + r.questions, 0);
const labs = rapport.reduce((s, r) => s + r.labs, 0);
console.log(`\nTotal : ${total} questions et ${labs} labs sur ${rapport.length} certifications.`);
console.log("Pense à incrémenter VERSION dans sw.js pour rafraîchir le cache hors ligne.");
