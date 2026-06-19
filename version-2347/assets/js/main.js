(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;
  var heroTimer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    slideIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('active', index === slideIndex);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('active', index === slideIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero') || 0));
      startHero();
    });
  });

  startHero();

  var searchInput = document.getElementById('site-search');
  var resultWrap = document.getElementById('search-results');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-row] button'));
  var activeFilter = 'all';

  function applyQueryFromUrl() {
    if (!searchInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
  }

  function filterCards() {
    if (!resultWrap) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(resultWrap.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var year = (card.getAttribute('data-year') || '').toLowerCase();
      var type = (card.getAttribute('data-type') || '').toLowerCase();
      var text = card.textContent.toLowerCase() + ' ' + title + ' ' + year + ' ' + type;
      var category = card.getAttribute('data-category') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = activeFilter === 'all' || category === activeFilter;
      card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
    });
  }

  applyQueryFromUrl();

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-stream') || '';
    var hls = null;
    var ready = false;

    function bindStream() {
      if (!video || ready || !stream) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      bindStream();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        if (hls && typeof hls.recoverMediaError === 'function') {
          hls.recoverMediaError();
        }
      });
    }
  });
})();
