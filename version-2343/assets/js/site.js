(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        play();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    hero.addEventListener("mouseleave", play);
    play();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scope = form.closest("main") || form.parentElement || document;
      var input = form.querySelector("[data-filter-input]");
      var select = form.querySelector("[data-filter-select]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");
      var jumpSelect = form.querySelector("[data-category-jump]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var category = select ? select.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
          var cardCategory = card.getAttribute("data-category") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchCategory = !category || category === cardCategory;
          var show = matchKeyword && matchCategory;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", function () {
          if (jumpSelect && select.value) {
            window.location.href = "category-" + select.value + ".html";
            return;
          }
          apply();
        });
      }
      apply();
    });
  }

  function initPlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function bindStream() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function start() {
      bindStream();
      button.classList.add("hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  window.StaticMovieSite = {
    initPlayer: initPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
