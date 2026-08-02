/**
 * Petit serveur statique sans dépendance, pour accéder au quiz depuis le téléphone.
 *
 *   node serve.js          (port 8080 par défaut)
 *   node serve.js 3000     (autre port)
 *
 * Ctrl+C pour arrêter.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.argv[2]) || 8080;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel === "/") rel = "/index.html";

  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) {           // anti path traversal
    res.writeHead(403).end("Interdit");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Introuvable : " + rel);
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter(i => i.family === "IPv4" && !i.internal)
    .map(i => i.address);

  console.log("\n  Serveur démarré.\n");
  console.log("  Sur ce PC       : http://localhost:" + PORT);
  ips.forEach(ip => console.log("  Depuis le mobile : http://" + ip + ":" + PORT));
  console.log("\n  (même réseau Wi-Fi requis — Ctrl+C pour arrêter)\n");
});
