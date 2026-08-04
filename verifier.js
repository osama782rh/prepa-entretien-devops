/** Contrôle d'intégrité des deux banques. Usage : node verifier.js */
const fs = require("fs"), path = require("path");

function load(dir, key) {
  const s = {};
  global.window = s;
  fs.readdirSync(path.join(__dirname, dir)).filter(f => f.endsWith(".js")).sort()
    .forEach(f => {
      const p = path.join(__dirname, dir, f);
      delete require.cache[require.resolve(p)];
      require(p);
    });
  const b = s[key] || [];
  delete global.window;
  return b;
}

const L = load("data", "QBANK"), Q = load("qcm", "QCM");

const ids = [...L, ...Q].map(q => q.id);
const dbl = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];

const koQ = Q.filter(q => !Array.isArray(q.choix) || q.choix.length < 3
  || typeof q.bonne !== "number" || q.bonne < 0 || q.bonne >= q.choix.length
  || new Set(q.choix.map(String)).size !== q.choix.length
  || q.choix.some(c => !String(c).trim()));

const koL = L.filter(q => !q.q || (!(q.accept && q.accept.length) && !(q.must && q.must.length)) || !q.lvl || !q.dom);
const sansExpl = [...L, ...Q].filter(q => !String(q.explain || "").trim());

let biais = 0;
Q.forEach(q => {
  const b = String(q.choix[q.bonne]).length;
  const a = q.choix.filter((_, i) => i !== q.bonne).map(c => String(c).length);
  if (b / Math.max(...a) >= 1.6) biais++;
});

console.log(`libres : ${L.length}   QCM : ${Q.length}   total : ${L.length + Q.length}`);
console.log(`ids dupliqués    : ${dbl.length}`, dbl.slice(0, 5));
console.log(`structure KO     : QCM ${koQ.length}, libres ${koL.length}`);
if (koQ.length) console.log("   ", koQ.slice(0, 5).map(q => q.id).join(", "));
if (koL.length) console.log("   ", koL.slice(0, 5).map(q => q.id).join(", "));
console.log(`sans explication : ${sansExpl.length}`);
console.log(`biais de longueur avant rééquilibrage : ${biais} (${Math.round(biais / Q.length * 100)} %)`);

const parNiveau = b => [1,2,3,4,5,6,7,8,9,10].map(l => String(b.filter(q => q.lvl === l).length).padStart(4)).join("");
console.log("\nrépartition par niveau (1→10)");
console.log("  libres" + parNiveau(L));
console.log("  QCM   " + parNiveau(Q));
