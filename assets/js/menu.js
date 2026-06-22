(function () {
  "use strict";

  var DATA = window.KAYANI_MENU || [];
  var navRoot = document.getElementById("menu-nav");
  var root = document.getElementById("menu-root");
  var emptyEl = document.getElementById("menu-empty");
  if (!root) return;

  var PLACEHOLDER_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 11h18"/><path d="M12 3a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8Z"/><path d="M6 16h12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z"/></svg>';

  function imgPath(file) {
    // Les fichiers vivent dans /images ; on encode pour gérer espaces/accents/emojis.
    return "images/" + encodeURIComponent(file);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function dishCard(item) {
    var card = document.createElement("article");
    card.className = "dish reveal";

    card.innerHTML =
      '<div class="dish__img">' +
        '<div class="dish__placeholder">' + PLACEHOLDER_SVG + "</div>" +
        '<img loading="lazy" decoding="async" alt="' + escapeHtml(item.nom) + ' — Kayani Kitchen" ' +
          'src="' + imgPath(item.img) + '" ' +
          'onerror="this.style.display=\'none\'" />' +
      "</div>" +
      '<div class="dish__body">' +
        '<h3 class="dish__name">' + escapeHtml(item.nom) + "</h3>" +
        '<p class="dish__desc">' + escapeHtml(item.desc || "") + "</p>" +
      "</div>";
    return card;
  }

  // --- Rendu des catégories ---
  DATA.forEach(function (cat) {
    var section = document.createElement("section");
    section.className = "menu-category";
    section.id = "cat-" + cat.id;
    section.setAttribute("data-stagger", "");

    var head = document.createElement("div");
    head.className = "menu-category__head reveal";
    head.innerHTML =
      "<div><h2>" + escapeHtml(cat.nom) + "</h2>" +
      (cat.intro ? '<p class="menu-note">' + escapeHtml(cat.intro) + "</p>" : "") +
      "</div>" +
      '<span class="menu-category__count">' + cat.items.length + " plats</span>";
    section.appendChild(head);

    var grid = document.createElement("div");
    grid.className = "dish-grid";
    cat.items.forEach(function (item) { grid.appendChild(dishCard(item)); });
    section.appendChild(grid);
    root.appendChild(section);
  });

  // --- Navigation de catégories ---
  if (navRoot) {
    DATA.forEach(function (cat) {
      var btn = document.createElement("a");
      btn.className = "menu-nav__btn";
      btn.href = "#cat-" + cat.id;
      btn.textContent = cat.nom;
      navRoot.appendChild(btn);
    });
  }

  // --- Scrollspy : surligne la catégorie active dans la nav ---
  if (navRoot && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navRoot.querySelectorAll(".menu-nav__btn").forEach(function (b) {
            b.classList.toggle("is-active", b.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    DATA.forEach(function (cat) {
      var s = document.getElementById("cat-" + cat.id);
      if (s) spy.observe(s);
    });
  }
})();
