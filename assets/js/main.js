'use strict';

function furnitureOnVideo() {
  // VARIABLES
  var 
    wrapper = document.querySelector('div#user-ui'),
    canvas = document.querySelector('canvas#canvas'),
    imgCanvas = document.querySelector('canvas#composite'),
    video = document.querySelector('video#stream'),
    videoLeftOffset = 0,
    videoTopOffset = 0,

    imgCapture = document.querySelector('img#capture'),
    btnCapture = document.querySelector('button#btn-capture'),
    aSave = document.querySelector('a#btn-save'),
    btnAgain = document.querySelector('button#btn-again'),

    fabricCanvas = new fabric.Canvas(canvas),
    fabricItem = new fabric.Image(document.querySelector('#item'));


  // FUNCTIONS
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

  function getVideoStream() {
    var constraints = {
      video: true, 
      audio: false,
      facingMode: { exact: "environment" }
    };

    var successCallback = function(mediaStream) {
      window.stream = mediaStream;
      video.srcObject = mediaStream;
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

  function setInitialState() {
    imgCapture.style.display = 'none';
    imgCapture.src = "";
    uiButtons('capture');
  }

  function resizeWrapper() {
    wrapper.style.width = window.innerWidth + "px";
    wrapper.style.height = window.innerHeight + "px";
  }

  function resizeVideoTag() {
    var 
      videoRatioWidthToHeight = video.videoWidth / video.videoHeight,
      windowRatioWidthToHeight = window.innerWidth / window.innerHeight,
      videoWidth = 0,
      videoHeight = 0,
      px = "px",
      minus = "-";

    // window aspect is narrower than video
    if (videoRatioWidthToHeight < windowRatioWidthToHeight) {
        var heightDiff = Math.round(window.innerWidth / videoRatioWidthToHeight) - window.innerHeight;

        videoWidth = window.innerWidth;
        videoHeight = Math.round(window.innerWidth / videoRatioWidthToHeight);

        if (heightDiff > 0) {
          videoTopOffset = Math.round(heightDiff / 2);
        }
    // window aspect is wider than video
    } else if (videoRatioWidthToHeight > windowRatioWidthToHeight) {
        var widthDiff = Math.round(window.innerHeight * videoRatioWidthToHeight) - window.innerWidth;

        videoHeight = window.innerHeight;
        videoWidth = Math.round(window.innerHeight * videoRatioWidthToHeight);

        if (widthDiff > 0) {
          videoLeftOffset = Math.round(widthDiff / 2);
        }
    // window has same aspect as video
    } else {
      videoWidth = window.innerWidth;
      videoHeight = window.innerHeight;
    }

    video.width = videoWidth;
    video.height = videoHeight;
    video.style.width = videoWidth + px;
    video.style.height = videoHeight + px;
    video.style.marginTop = minus + videoTopOffset + px;
    video.style.marginLeft = minus + videoLeftOffset + px;
  }

  function resizeFabricCanvas() {
    fabricCanvas.setWidth(window.innerWidth);
    fabricCanvas.setHeight(window.innerHeight);
  }

  function resizeimgCanvasCanvas() {
    imgCanvas.width = window.innerWidth;
    imgCanvas.height = window.innerHeight;
  }

  function setFabricItem() {
    var coord = fabricCanvas.getCenter();

    fabricItem.set({
      originX: 'center',
      originY: 'center',
      top: coord.top + 50,
      left: coord.left,
      borderColor: 'green',
      borderDashArray: [10, 10],
      cornerStyle: 'circle',
      cornerSize: 44,
      borderScaleFactor: .3,
      cornerColor: 'orange',
      lockUniScaling: true
    });

    fabricCanvas
      .add(fabricItem)
      .setActiveObject(fabricItem)
      .renderAll();
  }

  function main() {
    getVideoStream();
    setInitialState();
    resizeWrapper();
    resizeFabricCanvas();
    resizeimgCanvasCanvas();
    setFabricItem();

    video.onloadedmetadata = function() {
      resizeVideoTag();
    };
  }
  main();


  // EVENT LISTENERS
  btnCapture.onclick = function(event) {
    video.pause();

    fabricItem.set({selectable: false});
    fabricCanvas.deactivateAll().renderAll();
    
    uiButtons('save');
  };

  aSave.onclick = function(event) {
    var ctx = imgCanvas.getContext('2d');

    ctx.drawImage(video, -videoLeftOffset, -videoTopOffset, video.width, video.height);
    ctx.drawImage(canvas, 0, 0);

    // set image for download
    aSave.href = imgCanvas.toDataURL();
    aSave.download = "alameda_visualizacion.png"
  }

  btnAgain.onclick = function(event) {
    video.play();

    fabricItem.set({selectable: true});
    fabricCanvas.setActiveObject(fabricItem).renderAll();

    imgCapture.src = "";
    uiButtons('capture');
  };
}

window.onload = furnitureOnVideo;
window.onresize = furnitureOnVideo;
