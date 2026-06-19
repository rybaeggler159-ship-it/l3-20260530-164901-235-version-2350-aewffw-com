(function () {
  var video = document.getElementById('video-player');
  var startButton = document.querySelector('[data-player-start]');

  if (!video || !startButton) {
    return;
  }

  var source = video.getAttribute('data-m3u8');
  var hlsInstance = null;
  var initialized = false;

  function initializePlayer() {
    if (initialized) {
      return Promise.resolve();
    }
    initialized = true;

    if (!source) {
      return Promise.reject(new Error('缺少 m3u8 播放地址'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  startButton.addEventListener('click', function () {
    initializePlayer()
      .then(function () {
        startButton.classList.add('is-hidden');
        return video.play();
      })
      .catch(function () {
        startButton.innerHTML = '<span class="play-icon">!</span><strong>播放初始化失败，请检查网络或播放源</strong>';
      });
  });

  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
