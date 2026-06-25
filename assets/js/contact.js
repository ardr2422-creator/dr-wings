/* =====================================================================
   C'EST MON DESSERT — Formulaire de contact (POST /api/contact)
   ===================================================================== */
(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var feedback = document.getElementById("contact-feedback");

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ""); }
  function setError(name, msg) {
    var field = form.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle("field--error", !!msg);
    var err = field.querySelector(".field__error");
    if (err && msg) err.textContent = msg;
  }
  function show(kind, html) {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.className = "form__success is-shown" + (kind === "error" ? " is-error" : "");
    feedback.innerHTML = html;
    if (feedback.scrollIntoView) feedback.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.3rem;height:1.3rem;flex:none"><path d="M20 6 9 17l-5-5"/></svg>';

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ["sujet", "nom", "email", "message"].forEach(function (n) { setError(n, ""); });
    if (feedback) { feedback.hidden = true; feedback.className = "form__success"; }

    var fd = new FormData(form);
    var data = {
      sujet: (fd.get("sujet") || "").trim(),
      nom: (fd.get("nom") || "").trim(),
      email: (fd.get("email") || "").trim(),
      tel: (fd.get("tel") || "").trim(),
      message: (fd.get("message") || "").trim()
    };

    var errors = {};
    if (!data.sujet) errors.sujet = "Choisissez un sujet.";
    if (data.nom.length < 2) errors.nom = "Indiquez votre nom.";
    if (!isEmail(data.email)) errors.email = "Email invalide.";
    if (data.message.length < 5) errors.message = "Votre message est un peu court.";
    if (Object.keys(errors).length) {
      Object.keys(errors).forEach(function (k) { setError(k, errors[k]); });
      var first = form.querySelector(".field--error input, .field--error select, .field--error textarea");
      if (first) first.focus();
      return;
    }

    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;

    var fallback =
      '<div><strong>Message prêt à partir.</strong><br>Le mail n\'est pas encore branché ici. Écrivez-nous sur ' +
      '<a href="https://www.instagram.com/cestmondessertofficiel/" target="_blank" rel="noopener">Instagram</a>, on répond vite.</div>';

    function done(ok, mailErr) {
      if (btn) btn.disabled = false;
      if (ok) {
        show("ok", check + '<div><strong>Message envoyé&nbsp;!</strong><br>On vous répond dans les meilleurs délais.</div>');
        form.reset();
      } else if (mailErr === "mail_not_configured") {
        show("error", fallback);
      } else {
        show("error", '<div><strong>Oups.</strong><br>L\'envoi a échoué. Réessayez ou écrivez-nous sur Instagram.</div>');
      }
    }

    if (!window.fetch) { done(false, "mail_not_configured"); return; }
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, body: j }; }).catch(function () { return { status: r.status, body: {} }; });
    }).then(function (res) {
      if (res.body && res.body.ok) return done(true);
      done(false, res.body && res.body.error);
    }).catch(function () { done(false, "network"); });
  });
})();
