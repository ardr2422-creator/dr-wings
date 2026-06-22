(function () {
  "use strict";

  var carousel = document.getElementById("reviews-carousel");
  if (!carousel) return;

  var cards = Array.prototype.slice.call(carousel.querySelectorAll(".review-card"));
  if (!cards.length) return;

  var dotsWrap = carousel.querySelector(".carousel__dots");
  var prevBtn = carousel.querySelector(".carousel__nav--prev");
  var nextBtn = carousel.querySelector(".carousel__nav--next");
  var active = Math.floor(cards.length / 2);
  var timer = null;
  var dots = [];

  if (dotsWrap) {
    cards.forEach(function (_, i) {
      var d = document.createElement("button");
      d.className = "carousel__dot";
      d.type = "button";
      d.setAttribute("aria-label", "Aller à l'avis " + (i + 1));
      d.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  function render() {
    cards.forEach(function (card, i) {
      var off = i - active;
      var abs = Math.abs(off);
      card.style.transform =
        "translateX(calc(-50% + " + (off * 56) + "%)) scale(" + (off === 0 ? 1 : 0.82) + ") rotateY(" + (off * -9) + "deg)";
      card.style.opacity = abs <= 1 ? (off === 0 ? "1" : "0.4") : "0";
      card.style.filter = off === 0 ? "none" : "blur(3px)";
      card.style.zIndex = String(20 - abs);
      card.style.pointerEvents = off === 0 ? "auto" : "none";
      card.style.cursor = off === 0 && card.getAttribute("data-href") ? "pointer" : "default";
      card.setAttribute("aria-hidden", off === 0 ? "false" : "true");
    });
    dots.forEach(function (d, i) { d.classList.toggle("is-active", i === active); });
  }

  function go(i) {
    active = (i + cards.length) % cards.length;
    render();
    restart();
  }
  function next() { go(active + 1); }
  function prev() { go(active - 1); }
  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 5500);
  }

  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);
  carousel.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
  carousel.addEventListener("mouseleave", restart);
  cards.forEach(function (card, i) {
    card.addEventListener("click", function () {
      if (i !== active) {
        go(i);
      } else {
        var url = card.getAttribute("data-href");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  });

  /* Swipe tactile : un seul avis par geste, et seulement si le geste est
     clairement horizontal (sinon on laisse la page défiler verticalement). */
  var tStartX = null, tStartY = null, swiping = false;
  carousel.addEventListener("touchstart", function (e) {
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    swiping = false;
  }, { passive: true });
  carousel.addEventListener("touchmove", function (e) {
    if (tStartX === null) return;
    var dx = e.touches[0].clientX - tStartX;
    var dy = e.touches[0].clientY - tStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) swiping = true;
  }, { passive: true });
  carousel.addEventListener("touchend", function (e) {
    if (tStartX === null) return;
    var dx = e.changedTouches[0].clientX - tStartX;
    var dy = e.changedTouches[0].clientY - tStartY;
    if (swiping && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    tStartX = tStartY = null;
  }, { passive: true });

  render();
  restart();
})();
