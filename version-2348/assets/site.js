(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        autoplay();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        autoplay();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        autoplay();
      });
    }

    show(0);
    autoplay();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var category = scope.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var result = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var selectedCategory = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;
        if (keyword && textOf(card).indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          matched = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          matched = false;
        }
        if (selectedCategory && card.getAttribute('data-category') !== selectedCategory) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '共 ' + visible + ' 部影片';
      }
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  initHero();
  initFilters();
})();
