"use strict";

/* =====================================================================
   C'EST MON DESSERT — Réception de commande (serverless)
   Valide la commande côté serveur, recalcule le total à partir d'une
   table de prix de référence (le total client n'est jamais fait foi),
   puis envoie un email récap via Resend. La confirmation client passe
   aussi par WhatsApp (lien construit côté navigateur).
   ===================================================================== */

const https = require("https");

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "contact@cestmondessert.fr";
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "C'est Mon Dessert <commande@cestmondessert.fr>";

/* Table de prix de référence (source de vérité côté serveur) */
const PRICES = {
  "tira-bueno-white": { nom: "Tiramisu Bueno White", prix: 8.90 },
  "tira-chocobon-nutella": { nom: "Tiramisu Chocobon Nutella", prix: 8.90 },
  "tira-speculoos-nutella": { nom: "Tiramisu Spéculoos Nutella", prix: 8.90 },
  "tira-kinder-country": { nom: "Tiramisu Kinder Country", prix: 8.90 },
  "tira-speculoos-caramel": { nom: "Tiramisu Spéculoos Caramel", prix: 8.90 },
  "tira-bueno-bueno": { nom: "Tiramisu Bueno Bueno", prix: 12.90 },
  "box-kinder-cream": { nom: "Box Kinder Cream", prix: 14.90 },
  "box-american-cream": { nom: "Box American Cream", prix: 14.90 },
  "kinder-maxi-duo": { nom: "Kinder Maxi Duo", prix: 12.90 },
  "box-xl-nutella-white": { nom: "Box XL Nutella White", prix: 15.90 },
  "bubble-fraise-peche": { nom: "Bubble Tea Fraise Pêche", prix: 5.90 },
  "bubble-mangue-passion": { nom: "Bubble Tea Mangue Passion", prix: 5.90 },
  "red-velvet": { nom: "Red Velvet Fruits Rouges", prix: 5.90 },
  "do-brazil": { nom: "Do Brazil Curaçao Passion", prix: 5.90 },
  "coffret-bleus": { nom: "Coffret Allez les Bleus !", prix: 29.90 }
};

const IDF_PREFIXES = ["75", "77", "78", "91", "92", "93", "94", "95"];
const MAX_QTY = 30;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req, callback) {
  let raw = "";
  req.on("data", function (chunk) {
    raw += chunk;
    if (raw.length > 64 * 1024) req.destroy();
  });
  req.on("end", function () {
    try { callback(null, raw ? JSON.parse(raw) : {}); }
    catch (err) { callback(err); }
  });
  req.on("error", callback);
}

function cleanText(value, maxLength) {
  return String(value == null ? "" : value).replace(/[\r\n]+/g, " ").trim().slice(0, maxLength);
}
function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}
function isPhoneFr(value) {
  return /^(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}$/.test(String(value || "").trim());
}
function isIdfPostal(value) {
  var cp = String(value || "").trim();
  return /^\d{5}$/.test(cp) && IDF_PREFIXES.indexOf(cp.slice(0, 2)) !== -1;
}
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function eur(n) { return n.toFixed(2).replace(".", ",") + " €"; }

/* Valide et normalise les lignes ; recalcule le total côté serveur */
function buildOrder(rawItems) {
  if (!Array.isArray(rawItems) || !rawItems.length) return null;
  var lines = [];
  var total = 0;
  for (var i = 0; i < rawItems.length; i++) {
    var it = rawItems[i] || {};
    var ref = PRICES[String(it.id)];
    var qty = parseInt(it.qty, 10);
    if (!ref || !(qty > 0)) continue;
    qty = Math.min(qty, MAX_QTY);
    var lineTotal = ref.prix * qty;
    total += lineTotal;
    lines.push({ nom: ref.nom, qty: qty, prix: ref.prix, lineTotal: lineTotal });
    if (lines.length > 60) break;
  }
  if (!lines.length) return null;
  return { lines: lines, total: Math.round(total * 100) / 100 };
}

function sendOrderEmail(payload, order, callback) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return callback(new Error("mail_not_configured"));

  const linesText = order.lines.map(function (l) {
    return "  " + l.qty + " x " + l.nom + "  (" + eur(l.lineTotal) + ")";
  }).join("\n");

  const text = [
    "Nouvelle commande — C'est Mon Dessert",
    "",
    "CLIENT",
    "Nom : " + payload.nom,
    "Téléphone : " + payload.tel,
    payload.email ? "Email : " + payload.email : "",
    "",
    "LIVRAISON",
    "Adresse : " + payload.adresse,
    "Ville : " + payload.ville + " (" + payload.codePostal + ")",
    "Créneau souhaité : " + payload.creneau,
    payload.note ? "Note : " + payload.note : "",
    "",
    "COMMANDE",
    linesText,
    "",
    "TOTAL : " + eur(order.total)
  ].filter(Boolean).join("\n");

  const linesHtml = order.lines.map(function (l) {
    return "<tr><td style=\"padding:4px 12px 4px 0\">" + l.qty + " ×</td><td style=\"padding:4px 12px 4px 0\">" +
      escapeHtml(l.nom) + "</td><td style=\"padding:4px 0;text-align:right\">" + eur(l.lineTotal) + "</td></tr>";
  }).join("");

  const html = [
    "<h2>Nouvelle commande — C'est Mon Dessert</h2>",
    "<h3>Client</h3>",
    "<p><strong>Nom :</strong> " + escapeHtml(payload.nom) + "<br>",
    "<strong>Téléphone :</strong> " + escapeHtml(payload.tel) + (payload.email ? "<br><strong>Email :</strong> " + escapeHtml(payload.email) : "") + "</p>",
    "<h3>Livraison</h3>",
    "<p><strong>Adresse :</strong> " + escapeHtml(payload.adresse) + "<br>",
    "<strong>Ville :</strong> " + escapeHtml(payload.ville) + " (" + escapeHtml(payload.codePostal) + ")<br>",
    "<strong>Créneau :</strong> " + escapeHtml(payload.creneau) + "</p>",
    payload.note ? "<p><strong>Note :</strong> " + escapeHtml(payload.note) + "</p>" : "",
    "<h3>Commande</h3>",
    "<table style=\"border-collapse:collapse\">" + linesHtml + "</table>",
    "<p style=\"font-size:18px\"><strong>Total : " + eur(order.total) + "</strong></p>"
  ].filter(Boolean).join("");

  const body = JSON.stringify({
    from: CONTACT_FROM_EMAIL,
    to: [CONTACT_TO_EMAIL],
    reply_to: payload.email && isEmail(payload.email) ? payload.email : undefined,
    subject: "[Commande] " + payload.nom + " — " + eur(order.total),
    text: text,
    html: html
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
      if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) return callback(null);
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

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  readJsonBody(req, function (err, body) {
    if (err) return sendJson(res, 400, { ok: false, error: "invalid_json" });

    const payload = {
      nom: cleanText(body.nom, 120),
      tel: cleanText(body.tel, 40),
      email: cleanText(body.email, 180),
      adresse: cleanText(body.adresse, 200),
      ville: cleanText(body.ville, 120),
      codePostal: cleanText(body.codePostal, 10),
      creneau: cleanText(body.creneau, 120),
      note: cleanText(body.note, 600)
    };

    const errors = {};
    if (payload.nom.length < 2) errors.nom = "Nom requis.";
    if (!isPhoneFr(payload.tel)) errors.tel = "Téléphone français invalide.";
    if (payload.email && !isEmail(payload.email)) errors.email = "Email invalide.";
    if (payload.adresse.length < 5) errors.adresse = "Adresse requise.";
    if (payload.ville.length < 2) errors.ville = "Ville requise.";
    if (!isIdfPostal(payload.codePostal)) errors.codePostal = "Livraison en Île-de-France uniquement.";
    if (!payload.creneau) errors.creneau = "Créneau requis.";

    const order = buildOrder(body.items);
    if (!order) errors.items = "Panier vide ou invalide.";

    if (Object.keys(errors).length) {
      return sendJson(res, 400, { ok: false, error: "invalid_fields", fields: errors });
    }

    sendOrderEmail(payload, order, function (sendErr) {
      if (!sendErr) return sendJson(res, 200, { ok: true, mailed: true, total: order.total });
      if (sendErr.message === "mail_not_configured") {
        // L'email n'est pas configuré : la commande reste valide (confirmation WhatsApp côté client).
        return sendJson(res, 200, { ok: true, mailed: false, total: order.total });
      }
      console.error("Erreur envoi commande:", sendErr.statusCode || "", sendErr.responseBody || sendErr.message);
      return sendJson(res, 200, { ok: true, mailed: false, total: order.total });
    });
  });
};
