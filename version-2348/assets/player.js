import { H as Hls } from './hls-vendor-dru42stk.js';

function setStatus(box, message) {
  var status = box.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function startPlayer(box) {
  var video = box.querySelector('video');
  var button = box.querySelector('[data-player-start]');
  var source = box.getAttribute('data-video-url');

  if (!video || !source) {
    setStatus(box, '未找到播放源');
    return;
  }

  setStatus(box, '正在初始化 HLS 播放源');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      video.play().catch(function () {
        setStatus(box, '请再次点击播放按钮');
      });
    }, { once: true });
  } else if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(box, '播放源加载完成');
      video.play().catch(function () {
        setStatus(box, '浏览器阻止自动播放，请手动点击播放');
      });
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus(box, '播放源加载失败，可刷新页面后重试');
      }
    });
    box.hlsInstance = hls;
  } else {
    video.src = source;
    setStatus(box, '当前浏览器不支持 HLS.js，已尝试使用原生播放');
  }

  if (button) {
    button.classList.add('is-hidden');
  }
  video.controls = true;
}

Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), function (box) {
  var button = box.querySelector('[data-player-start]');
  if (button) {
    button.addEventListener('click', function () {
      startPlayer(box);
    });
  }
});
