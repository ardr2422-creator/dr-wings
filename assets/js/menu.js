/* =====================================================================
   C'EST MON DESSERT — Rendu de la carte (catalogue filtrable + ajout panier)
   Dépend de products.js (window.CMD_CATEGORIES, window.CMD_FORMAT).
   À charger AVANT main.js pour que les .reveal injectés soient observés.
   ===================================================================== */
(function () {
  "use strict";

  var cats = window.CMD_CATEGORIES || [];
  var fmt = (window.CMD_FORMAT && window.CMD_FORMAT.price) || function (n) {
    return n.toFixed(2).replace(".", ",") + " €";
  };
  var root = document.getElementById("menu-root");
  var filters = document.getElementById("menu-filters");
  if (!root || !cats.length) return;

  var TAGS = { star: "Best-seller", xl: "Format XL", veg: "Végé", "new": "Nouveau" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var plus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  function dishHtml(p) {
    var tagHtml = (p.tags || []).map(function (t) {
      var cls = t === "star" ? "star" : (t === "xl" || t === "new") ? "new" : t;
      return '<span class="tag tag--' + cls + '">' + (TAGS[t] || t) + "</span>";
    }).join("");
    return '<article class="dish reveal">' +
      '<div class="dish__img">' +
      (p.img ? '<img src="' + p.img + '" alt="' + esc(p.nom) + '" loading="lazy" />' : '') +
      (tagHtml ? '<div class="dish__tags">' + tagHtml + '</div>' : '') +
      '</div>' +
      '<div class="dish__body">' +
      '<div class="dish__head">' +
      '<h3 class="dish__name">' + esc(p.nom) + '</h3>' +
      '<span class="dish__price">' + fmt(p.prix) + '</span>' +
      '</div>' +
      '<p class="dish__desc">' + esc(p.desc) + '</p>' +
      '<div class="dish__cta">' +
      '<button class="add-btn" type="button" data-add="' + p.id + '">' + plus + '<span data-add-label>Ajouter</span></button>' +
      '</div>' +
      '</div>' +
      '</article>';
  }

  function categoryHtml(cat) {
    var count = cat.items.length;
    return '<section class="menu-category" id="' + cat.id + '" data-cat="' + cat.id + '">' +
      '<div class="menu-category__head">' +
      '<h2>' + esc(cat.nom) + '</h2>' +
      '<span class="menu-category__count">' + count + (count > 1 ? " références" : " référence") + '</span>' +
      '</div>' +
      (cat.tagline ? '<p class="menu-note" style="margin:-0.6rem 0 1.6rem">' + esc(cat.tagline) + '</p>' : '') +
      '<div class="dish-grid" data-stagger>' + cat.items.map(dishHtml).join("") + '</div>' +
      '</section>';
  }

  /* Rendu du catalogue */
  root.innerHTML = cats.map(categoryHtml).join("");

  /* Barre de filtres (sticky) */
  if (filters) {
    var btns = '<button class="menu-nav__btn is-active" type="button" data-filter="all">Tout</button>';
    btns += cats.map(function (c) {
      return '<button class="menu-nav__btn" type="button" data-filter="' + c.id + '">' + esc(c.nom) + '</button>';
    }).join("");
    filters.innerHTML = btns;

    var sections = Array.prototype.slice.call(root.querySelectorAll(".menu-category"));
    var pills = Array.prototype.slice.call(filters.querySelectorAll(".menu-nav__btn"));

    function applyFilter(id) {
      sections.forEach(function (s) {
        s.hidden = (id !== "all" && s.getAttribute("data-cat") !== id);
      });
      pills.forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-filter") === id);
      });
    }
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      applyFilter(b.getAttribute("data-filter"));
    });

    /* Lien entrant menu.html#categorie : pré-sélectionne le filtre */
    var hash = (location.hash || "").replace("#", "");
    if (hash && cats.some(function (c) { return c.id === hash; })) {
      applyFilter(hash);
    }
  }
})();
