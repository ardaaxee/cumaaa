/* =========================================================
   Tek görev: kalbe dokununca bir kez güçlü atış (bigbeat).
   Sürekli lub-dub animasyonu tamamen CSS ile çalışıyor.
   Canvas, parçacık, küçük kalp, ek element yok.
   ========================================================= */

(function () {
  "use strict";

  var heart = document.getElementById("heart");
  if (!heart) return;

  var lastHit = 0;

  function hit() {
    var now = Date.now();
    if (now - lastHit < 140) return; // Aynı dokunuşun iki kez sayılmasını engelle
    lastHit = now;

    heart.classList.remove("is-hit");
    void heart.getBoundingClientRect(); // Reflow: animasyon baştan başlasın
    heart.classList.add("is-hit");
  }

  // Güçlü atış bitince sürekli lub-dub animasyonuna geri dön.
  heart.addEventListener("animationend", function (ev) {
    if (ev.animationName === "bigbeat") {
      heart.classList.remove("is-hit");
    }
  });

  if (window.PointerEvent) {
    heart.addEventListener("pointerdown", hit);
  } else {
    heart.addEventListener("touchstart", hit, { passive: true });
    heart.addEventListener("mousedown", hit);
  }

  // Klavye: Enter veya Space
  heart.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault();
      hit();
    }
  });
})();
