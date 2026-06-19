(function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      menuToggle.textContent = opened ? '×' : '☰';
    });
  }

  var topButton = document.querySelector('.back-to-top');

  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 320);
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-filter]');
    var sort = scope.querySelector('[data-sort-cards]');
    var count = scope.querySelector('[data-visible-count]');
    var grid = document.querySelector('[data-card-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = !query || textOf(card).indexOf(query) !== -1;
        card.classList.toggle('is-hidden-card', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }

      var value = sort.value;
      var sorted = cards.slice();

      if (value === 'heat') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
        });
      }

      if (value === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (value === 'title') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }

      if (value === 'default') {
        sorted = cards.slice();
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }

    applySort();
    applyFilter();
  });
})();
