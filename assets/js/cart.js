/* =====================================================================
   C'EST MON DESSERT — Panier (localStorage) + drawer + toast
   Dépend de products.js (window.CMD_PRODUCT_MAP, window.CMD_FORMAT).
   Expose window.CMDCart : add, setQty, remove, items, count, total,
   clear, open, close, subscribe.
   ===================================================================== */
(function () {
  "use strict";

  var KEY = "cmd_cart_v1";
  var MAP = window.CMD_PRODUCT_MAP || {};
  var fmt = (window.CMD_FORMAT && window.CMD_FORMAT.price) || function (n) {
    return n.toFixed(2).replace(".", ",") + " €";
  };
  var MAX_QTY = 30;
  var listeners = [];

  /* ---------- État ---------- */
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : {};
      var clean = {};
      Object.keys(data).forEach(function (id) {
        var q = parseInt(data[id], 10);
        if (MAP[id] && q > 0) clean[id] = Math.min(q, MAX_QTY);
      });
      return clean;
    } catch (e) {
      return {};
    }
  }
  var state = read();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function emit() {
    persist();
    renderBadge();
    renderDrawer();
    listeners.forEach(function (cb) { try { cb(api); } catch (e) {} });
    document.dispatchEvent(new CustomEvent("cmd:cart-change"));
  }

  /* ---------- API ---------- */
  function items() {
    return Object.keys(state).map(function (id) {
      var p = MAP[id];
      return { id: id, nom: p.nom, prix: p.prix, img: p.img, cat: p.cat, qty: state[id] };
    });
  }
  function count() {
    return Object.keys(state).reduce(function (n, id) { return n + state[id]; }, 0);
  }
  function total() {
    return Object.keys(state).reduce(function (s, id) {
      return s + (MAP[id] ? MAP[id].prix * state[id] : 0);
    }, 0);
  }
  function add(id, qty) {
    if (!MAP[id]) return;
    var q = (state[id] || 0) + (qty || 1);
    state[id] = Math.max(1, Math.min(q, MAX_QTY));
    emit();
  }
  function setQty(id, qty) {
    if (!MAP[id]) return;
    qty = parseInt(qty, 10);
    if (!qty || qty < 1) { delete state[id]; }
    else state[id] = Math.min(qty, MAX_QTY);
    emit();
  }
  function remove(id) { delete state[id]; emit(); }
  function clear() { state = {}; emit(); }
  function subscribe(cb) { listeners.push(cb); return function () {
    listeners = listeners.filter(function (f) { return f !== cb; });
  }; }

  var api = {
    add: add, setQty: setQty, remove: remove, clear: clear,
    items: items, count: count, total: total,
    open: openDrawer, close: closeDrawer, subscribe: subscribe
  };
  window.CMDCart = api;

  /* ---------- Icônes ---------- */
  var bagSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>';

  /* ---------- Bouton panier dans la nav ---------- */
  var badgeEl = null, cartBtn = null;
  function mountNavButton() {
    var navCta = document.querySelector(".nav-cta");
    if (!navCta || navCta.querySelector(".cart-btn")) return;
    cartBtn = document.createElement("button");
    cartBtn.type = "button";
    cartBtn.className = "cart-btn";
    cartBtn.setAttribute("data-cart-open", "");
    cartBtn.setAttribute("aria-label", "Ouvrir le panier");
    cartBtn.innerHTML = bagSvg + '<span class="cart-btn__badge" aria-hidden="true">0</span>';
    navCta.insertBefore(cartBtn, navCta.firstChild);
    badgeEl = cartBtn.querySelector(".cart-btn__badge");
  }
  function renderBadge() {
    if (!badgeEl) return;
    var c = count();
    badgeEl.textContent = c > 99 ? "99+" : String(c);
    badgeEl.classList.toggle("is-shown", c > 0);
    if (cartBtn && c > 0) {
      cartBtn.setAttribute("aria-label", "Ouvrir le panier, " + c + " article" + (c > 1 ? "s" : ""));
    }
  }
  function bump() {
    if (!cartBtn) return;
    cartBtn.classList.remove("is-bump");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("is-bump");
  }

  /* ---------- Drawer ---------- */
  var drawer = null, drawerBody = null, drawerFoot = null, drawerTotal = null, lastFocus = null;
  function mountDrawer() {
    drawer = document.createElement("div");
    drawer.className = "cart-drawer";
    drawer.id = "cart-drawer";
    drawer.innerHTML =
      '<div class="cart-drawer__backdrop" data-cart-close></div>' +
      '<aside class="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Votre panier">' +
      '<div class="cart-drawer__head">' +
      '<span class="cart-drawer__title">Votre panier</span>' +
      '<button class="cart-drawer__close" type="button" data-cart-close aria-label="Fermer le panier">' + closeSvg + '</button>' +
      '</div>' +
      '<div class="cart-drawer__body" id="cart-drawer-body"></div>' +
      '<div class="cart-drawer__foot" id="cart-drawer-foot">' +
      '<div class="cart-total"><span class="cart-total__label">Sous-total</span><span class="cart-total__val" id="cart-drawer-total">' + fmt(0) + '</span></div>' +
      '<p class="cart-drawer__note">Livraison selon le magasin le plus proche &middot; Île-de-France uniquement</p>' +
      '<a class="btn btn--gold" href="panier.html"><span>Passer commande</span><span class="btn__icon" aria-hidden="true">' + arrowSvg + '</span></a>' +
      '</div>' +
      '</aside>';
    document.body.appendChild(drawer);
    drawerBody = drawer.querySelector("#cart-drawer-body");
    drawerFoot = drawer.querySelector("#cart-drawer-foot");
    drawerTotal = drawer.querySelector("#cart-drawer-total");

    drawer.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cart-close]");
      if (t) closeDrawer();
    });
    drawerBody.addEventListener("click", onLineClick);
  }

  function lineHtml(it) {
    return '<div class="cart-line" data-id="' + it.id + '">' +
      '<div class="cart-line__img">' + (it.img ? '<img src="' + it.img + '" alt="" loading="lazy" />' : "") + '</div>' +
      '<div class="cart-line__main">' +
      '<span class="cart-line__name">' + esc(it.nom) + '</span>' +
      '<span class="cart-line__opt">' + esc(it.cat) + " &middot; " + fmt(it.prix) + '</span>' +
      '<div class="cart-line__row">' +
      '<span class="qty">' +
      '<button class="qty__btn" type="button" data-act="dec" aria-label="Retirer un">−</button>' +
      '<span class="qty__val">' + it.qty + '</span>' +
      '<button class="qty__btn" type="button" data-act="inc" aria-label="Ajouter un">+</button>' +
      '</span>' +
      '<span class="cart-line__price">' + fmt(it.prix * it.qty) + '</span>' +
      '</div>' +
      '<button class="cart-line__remove" type="button" data-act="remove">Retirer</button>' +
      '</div>' +
      '</div>';
  }

  function renderDrawer() {
    if (!drawerBody) return;
    var list = items();
    if (!list.length) {
      drawerBody.innerHTML =
        '<div class="cart-empty">' + bagSvg +
        '<strong>Votre panier est vide</strong>' +
        '<p>Un tiramisu, un donut, un bubble tea&nbsp;? La carte vous attend.</p>' +
        '<a class="btn btn--ghost" href="menu.html"><span>Voir la carte</span></a>' +
        '</div>';
      if (drawerFoot) drawerFoot.hidden = true;
      return;
    }
    drawerBody.innerHTML = list.map(lineHtml).join("");
    if (drawerFoot) drawerFoot.hidden = false;
    if (drawerTotal) drawerTotal.textContent = fmt(total());
  }

  function onLineClick(e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var line = btn.closest(".cart-line");
    if (!line) return;
    var id = line.getAttribute("data-id");
    var act = btn.getAttribute("data-act");
    var current = items().filter(function (i) { return i.id === id; })[0];
    if (act === "remove" || !current) { remove(id); return; }
    if (act === "inc") setQty(id, current.qty + 1);
    if (act === "dec") setQty(id, current.qty - 1);
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var close = drawer.querySelector(".cart-drawer__close");
    if (close) close.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = checkSvg + "<span>" + esc(msg) + "</span>";
    void toastEl.offsetWidth;
    toastEl.classList.add("is-shown");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-shown"); }, 2400);
  }

  /* ---------- Délégation : boutons « Ajouter » ---------- */
  function onAddClick(e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    var id = btn.getAttribute("data-add");
    if (!MAP[id]) return;
    add(id);
    bump();
    toast(MAP[id].nom + " ajouté");
    btn.classList.add("is-added");
    var label = btn.querySelector("[data-add-label]");
    var prev = label ? label.textContent : null;
    if (label) label.textContent = "Ajouté";
    setTimeout(function () {
      btn.classList.remove("is-added");
      if (label && prev !== null) label.textContent = prev;
    }, 1100);
  }
  function onOpenClick(e) {
    if (e.target.closest("[data-cart-open]")) openDrawer();
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- Init ---------- */
  function init() {
    mountNavButton();
    mountDrawer();
    renderBadge();
    renderDrawer();
    document.addEventListener("click", onAddClick);
    document.addEventListener("click", onOpenClick);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) closeDrawer();
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
