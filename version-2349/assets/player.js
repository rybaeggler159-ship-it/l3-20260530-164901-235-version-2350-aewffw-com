import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var button = document.getElementById(options.buttonId);
  var source = options.source;
  var prepared = false;
  var hls = null;

  if (!video || !overlay || !source) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  async function start() {
    prepare();
    overlay.classList.add('is-hidden');
    video.controls = true;

    try {
      await video.play();
    } catch (error) {
      overlay.classList.remove('is-hidden');
      video.controls = true;
    }
  }

  overlay.addEventListener('click', start);

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
