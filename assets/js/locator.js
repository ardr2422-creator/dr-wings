/* =====================================================================
   C'EST MON DESSERT — Localisateur de magasins (Île-de-France)
   Dépend de locations-data.js (window.CMD_LOCATIONS).
   ===================================================================== */
(function () {
  var DATA = (window.CMD_LOCATIONS || []).slice();
  DATA.sort(function (a, b) {
    return a.ville.localeCompare(b.ville, "fr");
  });

  var select = document.getElementById("loc-select");
  var chipsWrap = document.getElementById("loc-chips");
  var result = document.getElementById("loc-result");
  if (!select || !chipsWrap || !result) return;

  var ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var ICON_BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
  var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>';

  function enc(s) { return encodeURIComponent(s); }
  function mapEmbed(adresse) {
    return "https://maps.google.com/maps?q=" + enc(adresse) + "&t=&z=16&ie=UTF8&iwloc=&output=embed";
  }
  function mapLink(adresse) {
    return "https://www.google.com/maps/search/?api=1&query=" + enc(adresse);
  }
  function byId(id) {
    for (var i = 0; i < DATA.length; i++) { if (DATA[i].id === id) return DATA[i]; }
    return null;
  }

  function hoursMarkup(loc) {
    if (!loc.horaires) {
      return '<p class="loc-hours-note">Horaires variables selon la période. Les créneaux du jour sont affichés sur Uber Eats.</p>';
    }
    var rows = loc.horaires.map(function (row) {
      var isClosed = /ferm/i.test(row[1]);
      var slots = row[1].split("·").map(function (s) {
        return "<span>" + s.replace(/^\s+|\s+$/g, "") + "</span>";
      }).join("");
      return '<li class="loc-hours__row' + (isClosed ? " loc-hours__row--closed" : "") + '">' +
        '<span class="loc-hours__day">' + row[0] + "</span>" +
        '<span class="loc-hours__slots">' + slots + "</span>" +
        "</li>";
    }).join("");
    return '<ul class="loc-hours">' + rows + "</ul>";
  }

  function ratingMarkup(loc) {
    if (!loc.note) return "";
    var count = loc.avis ? '<span class="loc-rating__count">' + loc.avis + "</span>" : "";
    return '<div class="loc-rating"><span class="loc-rating__star" aria-hidden="true">★</span><strong>' + loc.note + "/5</strong>" + count + "</div>";
  }

  function detailMarkup(loc) {
    var carteNote = loc.carteNote
      ? '<div class="info-item"><span class="info-item__icon" aria-hidden="true">' + ICON_BAG + '</span><div><h4>La carte ici</h4><p>' + loc.carteNote + '</p></div></div>'
      : '<div class="info-item"><span class="info-item__icon" aria-hidden="true">' + ICON_BAG + '</span><div><h4>Livraison</h4><p>À domicile, en soirée et la nuit, autour de ' + loc.ville + '.</p></div></div>';
    return '' +
      '<div class="location-top">' +
        "<div>" +
          '<p class="eyebrow">' + loc.dept + " · " + loc.code + "</p>" +
          '<h3 class="loc-result__title">C\'est Mon Dessert <em>' + loc.ville + "</em></h3>" +
          ratingMarkup(loc) +
          '<div class="info-list">' +
            '<div class="info-item">' +
              '<span class="info-item__icon" aria-hidden="true">' + ICON_PIN + "</span>" +
              "<div><h4>Adresse</h4><p>" + loc.adresse + "</p>" +
              '<a class="link-quiet" href="' + mapLink(loc.adresse) + '" target="_blank" rel="noopener">Voir sur Google Maps →</a></div>' +
            "</div>" +
            '<div class="info-item">' +
              '<span class="info-item__icon" aria-hidden="true">' + ICON_CLOCK + "</span>" +
              "<div><h4>Horaires</h4>" + hoursMarkup(loc) + "</div>" +
            "</div>" +
            carteNote +
          "</div>" +
          '<div class="btn-row" style="margin-top:2rem">' +
            '<a class="btn btn--gold" href="menu.html">' +
              "<span>Composer mon panier</span>" +
              '<span class="btn__icon" aria-hidden="true">' + ICON_ARROW + "</span>" +
            "</a>" +
            '<a class="btn btn--ghost" href="' + loc.commande + '" target="_blank" rel="noopener">' +
              "<span>Voir sur Uber Eats</span>" +
            "</a>" +
          "</div>" +
        "</div>" +
        "<div>" +
          '<div class="map-embed"><iframe title="Carte · C\'est Mon Dessert, ' + loc.ville + '" src="' + mapEmbed(loc.adresse) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' +
          '<div class="btn-row" style="margin-top:1.2rem">' +
            '<a class="link-quiet" href="' + mapLink(loc.adresse) + '" target="_blank" rel="noopener">Ouvrir dans Google Maps →</a>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function emptyMarkup() {
    return '' +
      '<div class="loc-empty">' +
        '<div class="loc-empty__text">' +
          "<h3>Quelle est votre ville&nbsp;?</h3>" +
          "<p>Choisissez un magasin ci-dessus. La carte se cale sur l'adresse exacte et vous repartez avec le bon créneau de livraison.</p>" +
        "</div>" +
        '<div class="map-embed map-embed--france"><iframe title="Les magasins C\'est Mon Dessert en Île-de-France" src="https://maps.google.com/maps?q=' + enc("Île-de-France") + '&t=&z=9&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' +
      "</div>";
  }

  function paintChips(id) {
    Array.prototype.forEach.call(chipsWrap.querySelectorAll(".loc-chip"), function (chip) {
      var on = chip.getAttribute("data-id") === id;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function showCity(id, scroll) {
    var loc = byId(id);
    if (!loc) { showEmpty(); return; }
    result.innerHTML = detailMarkup(loc);
    if (select.value !== id) select.value = id;
    paintChips(id);
    if (scroll) result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showEmpty() {
    result.innerHTML = emptyMarkup();
    select.value = "";
    paintChips("");
  }

  DATA.forEach(function (loc) {
    var option = document.createElement("option");
    option.value = loc.id;
    option.textContent = loc.ville + " · " + loc.code;
    select.appendChild(option);

    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "loc-chip";
    chip.setAttribute("data-id", loc.id);
    chip.setAttribute("aria-pressed", "false");
    chip.innerHTML = '<span class="loc-chip__city">' + loc.ville + '</span><span class="loc-chip__dept">' + loc.dept + " · " + loc.code + "</span>";
    chip.addEventListener("click", function () { showCity(loc.id, true); });
    chipsWrap.appendChild(chip);
  });

  select.addEventListener("change", function () {
    if (!select.value) { showEmpty(); return; }
    showCity(select.value, true);
  });

  showEmpty();
})();
