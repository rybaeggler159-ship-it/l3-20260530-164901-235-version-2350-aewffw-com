(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-card-search]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var resultCount = document.querySelector('[data-result-count]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));

  function getValue(element) {
    return element ? element.value.trim().toLowerCase() : '';
  }

  function filterCards() {
    var keyword = getValue(searchInput);
    var type = getValue(typeFilter);
    var region = getValue(regionFilter);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.category,
        card.dataset.tags
      ].join(' ').toLowerCase();

      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchType = !type || (card.dataset.type || '').toLowerCase() === type;
      var matchRegion = !region || (card.dataset.region || '').toLowerCase() === region;
      var matched = matchKeyword && matchType && matchRegion;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visibleCount + ' 部内容';
    }
  }

  [searchInput, typeFilter, regionFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterCards);
      element.addEventListener('change', filterCards);
    }
  });
}());
