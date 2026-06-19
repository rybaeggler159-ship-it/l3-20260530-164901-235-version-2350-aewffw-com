(function () {
  var body = document.body;
  var mobileButton = document.querySelector('[data-mobile-menu]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  var searchModal = document.querySelector('[data-search-modal]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  function openSearch() {
    if (!searchModal) {
      return;
    }
    searchModal.hidden = false;
    body.classList.add('search-open');
    window.setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 60);
  }

  function closeSearch() {
    if (!searchModal) {
      return;
    }
    searchModal.hidden = true;
    body.classList.remove('search-open');
  }

  document.querySelectorAll('[data-search-open]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  document.querySelectorAll('[data-search-close]').forEach(function (button) {
    button.addEventListener('click', closeSearch);
  });

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getRelativePrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/movie/') !== -1 || path.indexOf('/category/') !== -1) {
      return '../';
    }
    return './';
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    var q = normalize(query);
    if (!q) {
      searchResults.innerHTML = '<p class="search-empty">输入关键词后显示匹配影片。</p>';
      return;
    }
    var prefix = getRelativePrefix();
    var items = (window.SEARCH_INDEX || []).filter(function (item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).indexOf(q) !== -1;
    }).slice(0, 30);

    if (!items.length) {
      searchResults.innerHTML = '<p class="search-empty">没有找到匹配影片，请尝试更短的关键词。</p>';
      return;
    }

    searchResults.innerHTML = items.map(function (item) {
      return [
        '<a class="search-result-card" href="' + prefix + item.url + '">',
        '  <img src="' + prefix + item.cover + '" alt="' + item.title + '封面" loading="lazy">',
        '  <span>',
        '    <strong>' + item.title + '</strong>',
        '    <span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span>',
        '  </span>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }
})();
