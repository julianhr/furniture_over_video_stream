'use strict';

// variables
var canvas = document.querySelector('#canvas');
var video = document.querySelector('#stream');
var stream;

var imgCapture = document.querySelector('#capture');
var btnCapture = document.querySelector('#btnCapture');
var btnSave = document.querySelector('#btnSave');
var btnAgain = document.querySelector('#btnAgain');

var fabricCanvas = new fabric.Canvas(canvas);
var fabricVideo = new fabric.Image(video);
var fabricItem = new fabric.Image(document.querySelector('#item'));


function fire_getUserMedia() {
  var streamConstraints = function() {
    if (stream) {
      stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    return {video: true, audio: false};
  }();

  var streamSuccessCallback = function(mediaStream) {
    window.stream = mediaStream;
    video.srcObject = mediaStream;
  }

  var streamErrorCallback = function(error) {
    var errorName = 'getUserMedia name: ' + error.name;
    console.log(errorName);
  }

  // execute getUserMedia Promise
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then(streamSuccessCallback)
    .catch(streamErrorCallback);
}
// fire_getUserMedia();


// functions for setting canvas and video
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style = null;
/*  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.style.background = 'pink';*/
}

function setFabricVideo() {
  var videoRatioWidthToHeight = video.videoWidth / video.videoHeight;
  var orientation = (window.innerWidth / window.innerHeight >= 1) ? 'horizontal' : 'vertical';
  var videoWidth;
  var videoHeight;
  var videoTop;
  var videoLeft;

  switch (orientation) {
    case 'horizontal':
      videoWidth = canvas.width;
      videoHeight = Math.ceil(videoWidth / videoRatioWidthToHeight);
      videoTop = -Math.floor((videoHeight - window.innerHeight) / 2);
      videoLeft = 0;      
      break;
    case 'vertical':
      videoHeight = canvas.height;
      videoWidth = Math.floor(videoHeight * videoRatioWidthToHeight);
      videoTop = 0;
      videoLeft = -Math.floor((videoWidth - window.innerWidth) / 2);
      break;
  }
  
  fabricVideo.set({
    top: videoTop, 
    left: videoLeft, 
    width: videoWidth, 
    height: videoHeight, 
    selectable: false
  });

  fabricCanvas.add(fabricVideo);

  // request video stream animation
  fabric.util.requestAnimFrame(function render() {
    fabricCanvas.renderAll();
    fabric.util.requestAnimFrame(render);
  });

  console.log("Video stream from the mobile device successfully obtained.");
}

function setFabricItem() {
  fabricItem.set({top: 100, left: 100});

  fabricCanvas
    .add(fabricItem)
    .setActiveObject(fabricItem);

  fabricCanvas.renderAll();
}

function combineFabricElements() {
  resizeCanvas();
  // setFabricVideo();
  setFabricItem();
}

video.onloadedmetadata = combineFabricElements;
combineFabricElements();

function uiButtons(state) {
  if (state === 'capture') {
    btnCapture.style.display = 'inline';
    btnSave.style.display = 'none';
    btnAgain.style.display = 'none';
  } else if (state === 'save') {
    btnCapture.style.display = 'none';
    btnSave.style.display = 'inline';
    btnAgain.style.display = 'inline';
  }
}

// event listeners
btnSave.onclick = function(event) {
};

btnAgain.onclick = function(event) {
  uiButtons('capture');
};

btnCapture.onclick = function(event) {
  fabricCanvas.deactivateAll().renderAll();
  imgCapture.src = canvas.toDataURL();
  var screenshot = new fabric.Image(imgCapture);
  uiButtons('save');
  fabricCanvas.add(screenshot);
  fabricCanvas.renderAll();
};
