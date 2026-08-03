/** Audit de la banque : trous de couverture et biais de longueur des QCM. */
const fs = require("fs"), path = require("path");
const root = __dirname;

function load(dir, key) {
  const s = {};
  global.window = s;
  fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith(".js")).sort()
    .forEach(f => {
      const fp = path.join(root, dir, f);
      delete require.cache[fp];
      require(fp);
    });
  const b = s[key] || [];
  delete global.window;
  return b;
}

const L = load("data", "QBANK"), Q = load("qcm", "QCM");

const BLOCS = { "Linux & Bash": ["Linux"], "Docker & Git": ["Docker", "Git"] };

console.log("=== TROUS À COMBLER ===");
for (const [t, ds] of Object.entries(BLOCS)) {
  const l = [], q = [];
  for (let n = 1; n <= 10; n++) {
    l.push(L.filter(x => x.lvl === n && ds.includes(x.dom)).length);
    q.push(Q.filter(x => x.lvl === n && ds.includes(x.dom)).length);
  }
  console.log(t);
  console.log("  libre :", l.map((v, i) => `${i + 1}:${v}`).join("  "));
  console.log("  qcm   :", q.map((v, i) => `${i + 1}:${v}`).join("  "));
}

console.log("\n=== BIAIS DE LONGUEUR (QCM) ===");
let total = 0, sep = 0, exemples = [];
Q.forEach(x => {
  const b = String(x.choix[x.bonne]);
  const autres = x.choix.filter((_, i) => i !== x.bonne).map(c => String(c).length);
  if (b.length / Math.max(...autres) >= 1.6) {
    total++;
    if (/\s[:—–]\s/.test(b)) { sep++; if (exemples.length < 5) exemples.push(x.id + " | " + b.slice(0, 90)); }
  }
});
console.log("  questions biaisées :", total, "/", Q.length);
console.log("  dont bonne réponse avec séparateur ( : ou — ) :", sep, `(${Math.round(sep / total * 100)}%)`);
exemples.forEach(e => console.log("   ·", e));

/* Répartition du biais par niveau, pour prioriser */
console.log("\n  par niveau :");
for (let n = 1; n <= 10; n++) {
  const qq = Q.filter(x => x.lvl === n);
  let b = 0;
  qq.forEach(x => {
    const lb = String(x.choix[x.bonne]).length;
    const a = x.choix.filter((_, i) => i !== x.bonne).map(c => String(c).length);
    if (lb / Math.max(...a) >= 1.6) b++;
  });
  console.log(`    niveau ${String(n).padStart(2)} : ${String(b).padStart(3)} / ${String(qq.length).padStart(4)}`);
}
