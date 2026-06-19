(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupHeroSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "./search.html";
        var url = value ? target + "?q=" + encodeURIComponent(value) : target;
        window.location.href = url;
      });
    });
  }

  function setupStaticFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-region]"));
    var count = document.querySelector("[data-result-count]");
    if (!panel || !cards.length) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");

    function contains(text, value) {
      return !value || String(text || "").toLowerCase().indexOf(value.toLowerCase()) !== -1;
    }

    function apply() {
      var q = keyword ? keyword.value.trim() : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var textOk = !q
          || contains(card.getAttribute("data-title"), q)
          || contains(card.getAttribute("data-genre"), q);
        var typeOk = !t
          || card.getAttribute("data-type") === t
          || card.getAttribute("data-type-group") === t
          || card.getAttribute("data-type").indexOf(t) !== -1;
        var ok = textOk
          && (!r || card.getAttribute("data-region") === r)
          && typeOk
          && (!y || card.getAttribute("data-year") === y);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [keyword, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '<a href="./videos/video-' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '<figure class="poster-frame">',
      '<img src="./' + movie.imageNo + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
      '<span class="play-hover">▶</span>',
      '</figure>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<div class="tag-row">' + movie.genres.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIES) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var genre = page.querySelector("[data-search-genre]");
    var region = page.querySelector("[data-search-region]");
    var type = page.querySelector("[data-search-type]");
    var results = page.querySelector("[data-search-results]");
    var count = page.querySelector("[data-search-count]");
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function fill(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fill(genre, Array.from(new Set(window.MOVIES.flatMap(function (movie) { return movie.genres; }))).slice(0, 80));
    fill(region, Array.from(new Set(window.MOVIES.map(function (movie) { return movie.region; }))));
    fill(type, Array.from(new Set(window.MOVIES.map(function (movie) { return movie.type; }))));

    function matchText(movie, value) {
      if (!value) {
        return true;
      }
      var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year]
        .concat(movie.genres)
        .concat(movie.tags)
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(value.toLowerCase()) !== -1;
    }

    function apply() {
      var q = input ? input.value.trim() : "";
      var g = genre ? genre.value : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var matched = window.MOVIES.filter(function (movie) {
        return matchText(movie, q)
          && (!g || movie.genres.indexOf(g) !== -1)
          && (!r || movie.region === r)
          && (!t || movie.type === t);
      }).slice(0, 120);
      results.innerHTML = matched.map(cardTemplate).join("") || '<div class="empty-state">没有找到匹配影片</div>';
      count.textContent = "当前显示 " + matched.length + " 部影片";
    }

    [input, genre, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupHeroSearch();
    setupStaticFilters();
    setupSearchPage();
  });
})();
