/* =====================================================================
   C'EST MON DESSERT — Page panier + checkout
   Récap éditable (CMDCart), validation client, envoi WhatsApp + /api/order.
   ===================================================================== */
(function () {
  "use strict";

  var Cart = window.CMDCart;
  var CFG = window.CMD_CONFIG || {};
  var fmt = (window.CMD_FORMAT && window.CMD_FORMAT.price) || function (n) {
    return n.toFixed(2).replace(".", ",") + " €";
  };
  if (!Cart) return;

  var elLines = document.getElementById("summary-lines");
  var elTotal = document.getElementById("summary-total");
  var elCount = document.getElementById("summary-count");
  var wrapFilled = document.getElementById("checkout-filled");
  var wrapEmpty = document.getElementById("checkout-empty");
  var form = document.getElementById("order-form");
  var feedback = document.getElementById("order-feedback");

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- Rendu du récapitulatif ---------- */
  function lineHtml(it) {
    return '<div class="summary-line" data-id="' + it.id + '">' +
      '<div class="summary-line__img">' + (it.img ? '<img src="' + it.img + '" alt="" loading="lazy" />' : "") + '</div>' +
      '<div class="summary-line__main">' +
      '<div class="summary-line__name">' + esc(it.nom) + '</div>' +
      '<span class="qty" style="margin-top:.4rem">' +
      '<button class="qty__btn" type="button" data-act="dec" aria-label="Retirer un">−</button>' +
      '<span class="qty__val">' + it.qty + '</span>' +
      '<button class="qty__btn" type="button" data-act="inc" aria-label="Ajouter un">+</button>' +
      '</span>' +
      '</div>' +
      '<span class="summary-line__price">' + fmt(it.prix * it.qty) + '</span>' +
      '</div>';
  }

  function render() {
    var items = Cart.items();
    var hasItems = items.length > 0;
    if (wrapFilled) wrapFilled.hidden = !hasItems;
    if (wrapEmpty) wrapEmpty.hidden = hasItems;
    if (!hasItems) return;
    if (elLines) elLines.innerHTML = items.map(lineHtml).join("");
    if (elTotal) elTotal.textContent = fmt(Cart.total());
    if (elCount) {
      var c = Cart.count();
      elCount.textContent = c + " article" + (c > 1 ? "s" : "");
    }
  }

  if (elLines) {
    elLines.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var line = btn.closest(".summary-line");
      var id = line && line.getAttribute("data-id");
      if (!id) return;
      var cur = Cart.items().filter(function (i) { return i.id === id; })[0];
      if (!cur) return;
      if (btn.getAttribute("data-act") === "inc") Cart.setQty(id, cur.qty + 1);
      else Cart.setQty(id, cur.qty - 1);
    });
  }

  document.addEventListener("cmd:cart-change", render);
  render();

  /* ---------- Validation ---------- */
  var IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];
  function isPhone(v) { return /^(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}$/.test(String(v || "").trim()); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ""); }
  function isIdf(v) {
    var cp = String(v || "").trim();
    return /^\d{5}$/.test(cp) && IDF.indexOf(cp.slice(0, 2)) !== -1;
  }

  function setError(name, msg) {
    var field = form.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle("field--error", !!msg);
    var err = field.querySelector(".field__error");
    if (err && msg) err.textContent = msg;
  }

  function validate(data) {
    var errors = {};
    if (!data.nom || data.nom.length < 2) errors.nom = "Indiquez votre nom.";
    if (!isPhone(data.tel)) errors.tel = "Numéro français invalide (ex. 06 12 34 56 78).";
    if (data.email && !isEmail(data.email)) errors.email = "Email invalide.";
    if (!data.adresse || data.adresse.length < 5) errors.adresse = "Indiquez votre adresse complète.";
    if (!data.ville || data.ville.length < 2) errors.ville = "Indiquez votre ville.";
    if (!isIdf(data.codePostal)) errors.codePostal = "Livraison en Île-de-France uniquement (75, 77, 78, 91 à 95).";
    if (!data.creneau) errors.creneau = "Choisissez un créneau.";
    return errors;
  }

  /* ---------- Message WhatsApp ---------- */
  function buildWhatsappText(data, items, total) {
    var lines = items.map(function (it) {
      return "- " + it.qty + " x " + it.nom + " (" + fmt(it.prix * it.qty) + ")";
    }).join("\n");
    var msg =
      "Bonjour C'est Mon Dessert ! Je souhaite commander :\n" +
      lines + "\n" +
      "Total : " + fmt(total) + "\n\n" +
      "Nom : " + data.nom + "\n" +
      "Tel : " + data.tel + "\n" +
      "Adresse : " + data.adresse + ", " + data.codePostal + " " + data.ville + "\n" +
      "Creneau : " + data.creneau +
      (data.note ? "\nNote : " + data.note : "");
    return msg;
  }

  /* ---------- Soumission ---------- */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ["nom", "tel", "email", "adresse", "ville", "codePostal", "creneau"].forEach(function (n) { setError(n, ""); });
      if (feedback) { feedback.className = "form__success"; feedback.hidden = true; }

      var fd = new FormData(form);
      var data = {
        nom: (fd.get("nom") || "").trim(),
        tel: (fd.get("tel") || "").trim(),
        email: (fd.get("email") || "").trim(),
        adresse: (fd.get("adresse") || "").trim(),
        ville: (fd.get("ville") || "").trim(),
        codePostal: (fd.get("codePostal") || "").trim(),
        creneau: (fd.get("creneau") || "").trim(),
        note: (fd.get("note") || "").trim()
      };

      var items = Cart.items();
      if (!items.length) { render(); return; }

      var errors = validate(data);
      if (Object.keys(errors).length) {
        Object.keys(errors).forEach(function (k) { setError(k, errors[k]); });
        var first = form.querySelector(".field--error input, .field--error select, .field--error textarea");
        if (first) first.focus();
        return;
      }

      var total = Cart.total();
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var payload = {
        nom: data.nom, tel: data.tel, email: data.email,
        adresse: data.adresse, ville: data.ville, codePostal: data.codePostal,
        creneau: data.creneau, note: data.note,
        items: items.map(function (it) { return { id: it.id, qty: it.qty }; })
      };

      /* Enregistrement serveur (best-effort) puis confirmation WhatsApp */
      function finish() {
        if (feedback) {
          feedback.hidden = false;
          feedback.className = "form__success is-shown";
          feedback.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.3rem;height:1.3rem;flex:none"><path d="M20 6 9 17l-5-5"/></svg>' +
            '<div><strong>Commande envoyée&nbsp;!</strong><br>On vous confirme le créneau par WhatsApp. Si la fenêtre ne s\'est pas ouverte, contactez-nous directement.</div>';
        }
        var num = (CFG.whatsapp || "").replace(/\D/g, "");
        if (num) {
          var url = "https://wa.me/" + num + "?text=" + encodeURIComponent(buildWhatsappText(data, items, total));
          window.open(url, "_blank", "noopener");
        }
        Cart.clear();
        if (submitBtn) submitBtn.disabled = false;
        form.reset();
        if (feedback && feedback.scrollIntoView) feedback.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (window.fetch) {
        fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (res) {
            if (res && res.ok === false && res.fields) {
              Object.keys(res.fields).forEach(function (k) { setError(k, res.fields[k]); });
              if (submitBtn) submitBtn.disabled = false;
              return;
            }
            finish();
          })
          .catch(finish);
      } else {
        finish();
      }
    });
  }
})();
