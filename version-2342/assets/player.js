import { H as Hls } from './hls.js';

function attachPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-video]');

  if (!video) {
    return;
  }

  var source = video.dataset.videoSrc;
  var attached = false;

  function initialize() {
    if (attached || !source) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    initialize();
    shell.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]')).forEach(attachPlayer);
