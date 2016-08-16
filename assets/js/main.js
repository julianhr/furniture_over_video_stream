'use strict';

// VARIABLES
var 
  canvas = document.querySelector('#canvas'),
  video = document.querySelector('#stream'),
  wrapper = document.querySelector('#user-ui'),
  windowWidth = window.innerWidth,
  windowHeight = window.innerHeight,
  videoLeftOffset = 0,
  videoTopOffset = 0,
  stream,

  imgCapture = document.querySelector('#capture'),
  btnCapture = document.querySelector('#btn-capture'),
  aSave = document.querySelector('#btn-save'),
  btnAgain = document.querySelector('#btn-again'),

  fabricCanvas = new fabric.Canvas(canvas),
  fabricItem = new fabric.Image(document.querySelector('#item'));


// SET VIDEO
function getVideoStream() {
  var constraints = function() {
    if (stream) {
      stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    return {video: true, audio: false};
  }();

  var successCallback = function(mediaStream) {
    window.stream = mediaStream;
    video.srcObject = mediaStream;
    video.play();

    console.log("Video stream from the mobile device successfully obtained.");
  }

  var errorCallback = function(error) {
    var errorName = 'getUserMedia name: ' + error.name;

    console.log(errorName);
    console.log(error);
  }

  // execute getUserMedia Promise
  navigator.mediaDevices.getUserMedia(constraints)
    .then(successCallback)
    .catch(errorCallback);
}
getVideoStream();


function resizeVideoTag() {
  var 
    videoRatioWidthToHeight = video.videoWidth / video.videoHeight,
    windowRatioWidthToHeiht = windowWidth / windowHeight,
    orientation = (windowWidth / windowHeight >= 1) ? 'horizontal' : 'vertical';

  // window aspect is narrower than video
  if (videoRatioWidthToHeight < windowRatioWidthToHeiht) {
      var heightDiff = Math.round(windowWidth / videoRatioWidthToHeight) - windowHeight;

      video.width = windowWidth;
      video.height = Math.round(windowWidth / videoRatioWidthToHeight);

      if (heightDiff > 0) {
        videoTopOffset = Math.round(heightDiff / 2);
        video.style.marginTop = "-" + videoTopOffset + "px";
      }
  // window aspect is wider than video
  } else if (videoRatioWidthToHeight > windowRatioWidthToHeiht) {
      var widthDiff = Math.round(windowHeight * videoRatioWidthToHeight) - windowWidth;

      video.height = windowHeight;
      video.width = Math.round(windowHeight * videoRatioWidthToHeight);

      if (widthDiff > 0) {
        videoLeftOffset = Math.round(widthDiff / 2)
        video.style.marginLeft = "-" + videoLeftOffset + "px";
      }
  // window has same aspect as video
  } else {
    video.width = windowWidth;
    video.height = windowHeight;
  }
}

function resizeFabricCanvas() {
  fabricCanvas.setWidth(windowWidth);
  fabricCanvas.setHeight(windowHeight);
}

function setFabricItem() {
  fabricItem.set({top: 50, left: 50});

  fabricCanvas
    .add(fabricItem)
    .setActiveObject(fabricItem);

  fabricCanvas.renderAll();
}

function combineElements() {
  wrapper.style.width = windowWidth + "px";
  wrapper.style.height = windowHeight + "px";

  resizeVideoTag();
  resizeFabricCanvas();
  setFabricItem();
}

// combineElements();
video.onloadedmetadata = combineElements;

function uiButtons(state) {
  if (state === 'capture') {
    btnCapture.style.display = 'inline';
    aSave.style.display = 'none';
    btnAgain.style.display = 'none';
  } else if (state === 'save') {
    btnCapture.style.display = 'none';
    aSave.style.display = 'inline';
    btnAgain.style.display = 'inline';
  }
}


// EVENT LISTENERS
btnCapture.onclick = function(event) {
  var 
    upperCanvas = document.querySelector('.upper-canvas'),
    ctx = upperCanvas.getContext('2d'),
    screenshot = new fabric.Image(imgCapture);

  // grab video frame and overlay the furniture
  fabricCanvas.deactivateAll().renderAll();
  ctx.drawImage(video, -videoLeftOffset, -videoTopOffset, video.width, video.height);
  ctx.drawImage(canvas, 0, 0);
  imgCapture.src = upperCanvas.toDataURL();
  aSave.href = imgCapture.src;
  aSave.download = "visualizacion.png"
  ctx.clearRect(0, 0, windowWidth, windowHeight);

  uiButtons('save');
  fabricCanvas.add(screenshot);
  fabricCanvas.renderAll();
};

btnAgain.onclick = function(event) {
  imgCapture.src = "";
  uiButtons('capture');
  fabricCanvas.setActiveObject(fabricItem);
};
