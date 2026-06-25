"use strict";

const https = require("https");

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "contact@cestmondessert.fr";
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "C'est Mon Dessert <contact@cestmondessert.fr>";

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache"
  });
  res.end(JSON.stringify(payload));
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
};
