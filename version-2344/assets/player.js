import { H as Hls } from "./hls-dru42stk.js";

function setupPlayer() {
  var box = document.querySelector("[data-player]");
  if (!box) {
    return;
  }

  var video = box.querySelector("video");
  var trigger = box.querySelector("[data-player-trigger]");
  var src = video ? video.getAttribute("data-src") : "";
  var hls = null;

  function bindSource() {
    if (!video || !src) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== src) {
        video.src = src;
      }
      return;
    }

    if (Hls && Hls.isSupported()) {
      if (!hls) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      }
      return;
    }

    if (video.src !== src) {
      video.src = src;
    }
  }

  function start() {
    bindSource();
    box.classList.add("is-playing");
    if (video) {
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
  }

  if (trigger) {
    trigger.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

if (document.readyState !== "loading") {
  setupPlayer();
} else {
  document.addEventListener("DOMContentLoaded", setupPlayer);
}
