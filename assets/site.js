(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        function update() {
            button.classList.toggle('visible', window.scrollY > 500);
        }
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupCategoryFilter() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!panel || !grid) {
            return;
        }
        var cards = selectAll('[data-movie-card]', grid);
        var counter = document.querySelector('[data-visible-count]');
        selectAll('[data-filter-value]', panel).forEach(function (button) {
            button.addEventListener('click', function () {
                var value = normalize(button.getAttribute('data-filter-value'));
                selectAll('[data-filter-value]', panel).forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var match = value === 'all' || haystack.indexOf(value) !== -1;
                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (counter) {
                    counter.textContent = String(visible);
                }
            });
        });
    }

    function setupSearch() {
        var grid = document.querySelector('[data-search-grid]');
        if (!grid) {
            return;
        }
        var cards = selectAll('[data-movie-card]', grid);
        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector('[data-search-input]');
        var counter = document.querySelector('[data-search-count]');
        var filters = selectAll('[data-search-filter]');
        var initialQuery = params.get('q') || '';
        if (input) {
            input.value = initialQuery;
        }

        function apply() {
            var query = normalize(input ? input.value : initialQuery);
            var selected = {};
            filters.forEach(function (filter) {
                selected[filter.getAttribute('data-search-filter')] = filter.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchType = !selected.type || selected.type === 'all' || card.getAttribute('data-type') === selected.type;
                var matchYear = !selected.year || selected.year === 'all' || card.getAttribute('data-year') === selected.year;
                var matchRegion = !selected.region || selected.region === 'all' || card.getAttribute('data-region') === selected.region;
                var match = matchQuery && matchType && matchYear && matchRegion;
                card.classList.toggle('is-hidden', !match);
                if (match) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = String(visible);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener('change', apply);
        });
        apply();
    }

    function setupPlayers() {
        selectAll('[data-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var message = shell.querySelector('[data-player-message]');
            var source = shell.getAttribute('data-video-src');
            var hls = null;
            var initialized = false;

            function setMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text || '';
                message.classList.toggle('show', Boolean(text));
            }

            function attachSource() {
                if (initialized || !video || !source) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载异常，请稍后重试');
                        }
                    });
                } else {
                    video.src = source;
                    setMessage('当前浏览器可能不支持该播放格式');
                }
            }

            function play() {
                attachSource();
                var promise = video.play();
                shell.classList.add('playing');
                setMessage('');
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('playing');
                        setMessage('点击视频区域继续播放');
                    });
                }
            }

            if (button && video) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('play', function () {
                    shell.classList.add('playing');
                });
                video.addEventListener('pause', function () {
                    if (video.currentTime === 0 || video.ended) {
                        shell.classList.remove('playing');
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupBackTop();
        setupHero();
        setupCategoryFilter();
        setupSearch();
        setupPlayers();
    });
}());
