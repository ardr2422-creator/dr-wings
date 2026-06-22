(function () {
  "use strict";

  var prefersReduced = false;

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var toggle = document.querySelector(".nav-toggle");
  var overlay = document.querySelector(".nav-overlay");

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  function openNav() {
    document.body.classList.add("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
  if (toggle && overlay) {
    toggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) closeNav();
      else openNav();
    });
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    var closeBtn = overlay.querySelector(".nav-overlay__close");
    if (closeBtn) closeBtn.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  var nav = document.querySelector(".site-nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var lenis = null;
  if (!prefersReduced && typeof window.Lenis === "function") {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    document.documentElement.classList.add("lenis");
  }

  /* Liens d'ancrage internes : scroll fluide + fermeture du menu */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var id = link.getAttribute("href");
    if (id.length < 2) return;
    link.addEventListener("click", function (e) {
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      if (lenis) lenis.scrollTo(target, { offset: -90 });
      else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var i = 0;
    group.querySelectorAll(".reveal").forEach(function (el) {
      el.style.setProperty("--i", i++);
    });
  });

  var revealEls = document.querySelectorAll(".reveal, .reveal-img");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;
    if (prefersReduced) {
      el.textContent = target.toFixed(decimals).replace(".", ",") + suffix;
      return;
    }
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = (target * eased).toFixed(decimals).replace(".", ",");
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  document.querySelectorAll(".marquee__track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  document.querySelectorAll(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq__item");
      if (!item) return;
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* Parallaxe désactivée sur mobile/tactile : un transform recalculé à chaque scroll
     sur une grande image saccade les petits téléphones. On garde le léger zoom CSS. */
  var allowParallax = !prefersReduced &&
    window.matchMedia("(min-width: 861px) and (pointer: fine)").matches;
  if (allowParallax) {
    var parallaxEls = document.querySelectorAll("[data-parallax]");
    if (parallaxEls.length) {
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          parallaxEls.forEach(function (el) {
            var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
            el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0) scale(1.08)";
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* Fluidité : décodage asynchrone de toutes les images (évite les à-coups au scroll) */
  document.querySelectorAll("img:not([decoding])").forEach(function (img) {
    img.decoding = "async";
  });
})();
