"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname);
loadEnvFile(ROOT);
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "contact@cestmondessert.fr";
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "C'est Mon Dessert <contact@cestmondessert.fr>";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function send(res, status, body, headers) {
  res.writeHead(status, headers || {});
  res.end(body);
}

function loadEnvFile(root) {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key || process.env[key] !== undefined) return;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache"
  });
}

function readJsonBody(req, callback) {
  let raw = "";
  req.on("data", function (chunk) {
    raw += chunk;
    if (raw.length > 20 * 1024) req.destroy();
  });
  req.on("end", function () {
    try {
      callback(null, raw ? JSON.parse(raw) : {});
    } catch (err) {
      callback(err);
    }
  });
  req.on("error", callback);
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/\r/g, "").trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sendContactEmail(payload, callback) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return callback(new Error("mail_not_configured"));

  const subject = "[Site C'est Mon Dessert] " + payload.sujet + " - " + payload.nom;
  const text = [
    "Nouvelle demande depuis le site C'est Mon Dessert",
    "",
    "Sujet : " + payload.sujet,
    "Nom : " + payload.nom,
    "Email : " + payload.email,
    payload.tel ? "Telephone : " + payload.tel : "",
    "",
    payload.message
  ].filter(Boolean).join("\n");
  const html = [
    "<h2>Nouvelle demande depuis le site C'est Mon Dessert</h2>",
    "<p><strong>Sujet :</strong> " + escapeHtml(payload.sujet) + "</p>",
    "<p><strong>Nom :</strong> " + escapeHtml(payload.nom) + "</p>",
    "<p><strong>Email :</strong> " + escapeHtml(payload.email) + "</p>",
    payload.tel ? "<p><strong>Telephone :</strong> " + escapeHtml(payload.tel) + "</p>" : "",
    "<hr>",
    "<p style=\"white-space:pre-line\">" + escapeHtml(payload.message) + "</p>"
  ].filter(Boolean).join("");
  const body = JSON.stringify({
    from: CONTACT_FROM_EMAIL,
    to: [CONTACT_TO_EMAIL],
    reply_to: payload.email,
    subject,
    text,
    html
  });

  const apiReq = https.request({
    hostname: "api.resend.com",
    path: "/emails",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json",
      "User-Agent": "cest-mon-dessert-site/1.0",
      "Content-Length": Buffer.byteLength(body)
    }
  }, function (apiRes) {
    let responseBody = "";
    apiRes.on("data", function (chunk) { responseBody += chunk; });
    apiRes.on("end", function () {
      if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) return callback(null, responseBody);
      const err = new Error("mail_send_failed");
      err.statusCode = apiRes.statusCode;
      err.responseBody = responseBody;
      callback(err);
    });
  });

  apiReq.on("error", callback);
  apiReq.write(body);
  apiReq.end();
}

function handleContact(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  readJsonBody(req, function (err, body) {
    if (err) return sendJson(res, 400, { ok: false, error: "invalid_json" });

    const payload = {
      sujet: cleanText(body.sujet, 120),
      nom: cleanText(body.nom, 120),
      email: cleanText(body.email, 180),
      tel: cleanText(body.tel, 60),
      message: cleanText(body.message, 4000)
    };

    if (!payload.sujet || !payload.nom || !isEmail(payload.email) || !payload.message) {
      return sendJson(res, 400, { ok: false, error: "invalid_fields" });
    }

    sendContactEmail(payload, function (sendErr) {
      if (!sendErr) return sendJson(res, 200, { ok: true });
      if (sendErr.message === "mail_not_configured") {
        return sendJson(res, 503, { ok: false, error: "mail_not_configured" });
      }
      console.error("Erreur envoi email contact:", sendErr.statusCode || "", sendErr.responseBody || sendErr.message);
      sendJson(res, 502, { ok: false, error: "mail_send_failed" });
    });
  });
}

const server = http.createServer(function (req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (e) {
    return send(res, 400, "400 Bad Request");
  }
  if (urlPath === "/") urlPath = "/index.html";
  if (urlPath === "/api/contact") return handleContact(req, res);
  if (urlPath === "/api/order") {
    try { return require("./api/order.js")(req, res); }
    catch (e) { return sendJson(res, 500, { ok: false, error: "order_handler_error" }); }
  }

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    return send(res, 403, "403 Forbidden");
  }

  fs.stat(filePath, function (err, stat) {
    if (err || stat.isDirectory()) {
      return fs.readFile(path.join(ROOT, "404.html"), function (e, buf) {
        if (e) return send(res, 404, "404 Not Found");
        send(res, 404, buf, { "Content-Type": "text/html; charset=utf-8" });
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on("error", function (err) {
  if (err.code === "EADDRINUSE") {
    console.error("Port " + PORT + " deja utilise — le serveur tourne probablement deja.");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});

server.listen(PORT, HOST, function () {
  console.log("C'est Mon Dessert — serveur en ligne sur http://localhost:" + PORT);
});
