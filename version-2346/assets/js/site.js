(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var buttons = selectAll('[data-hero-target]', hero);
    var current = 0;
    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      buttons.forEach(function (button, i) {
        button.classList.toggle('active', i === current);
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        showHero(Number(button.getAttribute('data-hero-target')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    var scope = document.querySelector('[data-search-scope]') || document;
    var items = selectAll('[data-title]', scope);
    var empty = document.querySelector('[data-empty-state]');
    searchInput.addEventListener('input', function () {
      var term = searchInput.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var haystack = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
        var matched = !term || haystack.indexOf(term) !== -1;
        item.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    });
  }

  window.initVideoPlayer = function (streamUrl) {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    if (!video || !streamUrl) {
      return;
    }
    var ready = false;
    var hlsInstance = null;
    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
