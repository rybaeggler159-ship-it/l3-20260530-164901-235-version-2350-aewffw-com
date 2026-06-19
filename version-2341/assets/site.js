(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  const normalize = (value) => String(value || "").toLowerCase().trim();

  ready(() => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach((hero) => {
      const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
      const prev = hero.querySelector("[data-hero-prev]");
      const next = hero.querySelector("[data-hero-next]");
      let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
      let timer = null;

      const show = (target) => {
        if (!slides.length) {
          return;
        }

        index = (target + slides.length) % slides.length;

        slides.forEach((slide, current) => {
          const active = current === index;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });

        dots.forEach((dot, current) => {
          dot.classList.toggle("active", current === index);
        });
      };

      const restart = () => {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(() => show(index + 1), 5200);
      };

      prev?.addEventListener("click", () => {
        show(index - 1);
        restart();
      });

      next?.addEventListener("click", () => {
        show(index + 1);
        restart();
      });

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          show(Number(dot.dataset.heroDot || 0));
          restart();
        });
      });

      show(index);
      restart();
    });

    document.querySelectorAll(".filter-scope").forEach((scope) => {
      const input = scope.querySelector("[data-filter-input]");
      const typeSelect = scope.querySelector("[data-type-filter]");
      const categorySelect = scope.querySelector("[data-category-filter]");
      const cards = Array.from(scope.querySelectorAll("[data-filter-card]"));

      if (!cards.length) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q");

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      const apply = () => {
        const query = normalize(input?.value);
        const type = normalize(typeSelect?.value);
        const category = normalize(categorySelect?.value);

        cards.forEach((card) => {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.category,
            card.dataset.year,
            card.dataset.type,
            card.dataset.tags
          ].join(" "));
          const typeOk = !type || normalize(card.dataset.type).includes(type);
          const categoryOk = !category || normalize(card.dataset.category).includes(category);
          const queryOk = !query || haystack.includes(query);
          card.classList.toggle("is-hidden", !(typeOk && categoryOk && queryOk));
        });
      };

      input?.addEventListener("input", apply);
      typeSelect?.addEventListener("change", apply);
      categorySelect?.addEventListener("change", apply);
      apply();
    });

    document.querySelectorAll("[data-video-player]").forEach((player) => {
      const video = player.querySelector("video");
      const overlay = player.querySelector(".play-overlay");
      const stream = player.dataset.stream;
      let hls = null;
      let loaded = false;

      if (!video || !stream) {
        return;
      }

      const load = () => {
        if (loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
        video.load();
      };

      const play = () => {
        load();
        overlay?.classList.add("hidden");
        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            overlay?.classList.remove("hidden");
          });
        }
      };

      overlay?.addEventListener("click", play);
      video.addEventListener("click", () => {
        if (!loaded) {
          play();
        }
      });
      video.addEventListener("play", () => overlay?.classList.add("hidden"));
      video.addEventListener("ended", () => overlay?.classList.remove("hidden"));
      window.addEventListener("pagehide", () => {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
