'use strict';

function FabricjsOverVideo() {
  // PRIVATE VARIABLES
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
    fabricItem = null;


  // PRIVATE FUNCTIONS
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

  function setInitialState() {
    video.play();

    if (fabricItem !== null) {
      fabricItem.set({selectable: true});
      fabricCanvas.setActiveObject(fabricItem).renderAll();
    }

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

    // important, otherwise the offset won't be updated correctly on the 'onresize' event
    videoTopOffset = videoLeftOffset = 0;

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

    // Firefox mobile requires this hack
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function resize_imgCanvas() {
    imgCanvas.width = window.innerWidth;
    imgCanvas.height = window.innerHeight;
  }

  function setFabricItem() {
    var 
      imgItem = null,
      coord = fabricCanvas.getCenter();

    coord.top += 50;
    fabricCanvas.clear();

    // create the item image and the fabric object on 'onload' event
    if (fabricCanvas.isEmpty()) {
      imgItem = new Image();
      imgItem.src = 'img/sofa1.png';

      imgItem.onload = function() {
        // condition required because Firefox mobile fires 'onload' and 'onresize' events
        // on start, which triggers this function twice and therefore creates two instances
        if (fabricCanvas.isEmpty()) {
          fabricItem = new fabric.Image(imgItem);

          fabricItem.set({
            originX: 'center',
            originY: 'center',
            top: coord.top,
            left: coord.left,
            borderColor: 'green',
            borderDashArray: [10, 10],
            cornerStyle: 'circle',
            cornerSize: 60,
            borderScaleFactor: 0.15,
            cornerColor: 'orange',
            lockUniScaling: true
          });

          fabricCanvas
            .add(fabricItem)
            .setActiveObject(fabricItem)
            .renderAll();
        }
      };
    } else {
      fabricItem.set({
        top: coord.top,
        left: coord.left
      }).setCoords(coord);

      fabricCanvas.setActiveObject(fabricItem).renderAll();
    }
  }

function resumeVideo() {
  if (video.srcObject) {
    video.play();
  }

  fabricItem.set({selectable: true});
  fabricCanvas.setActiveObject(fabricItem).renderAll();

  imgCapture.src = "";
  uiButtons('capture');
};


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
    aSave.download = "alameda_visualizacion.png";
  };

  btnAgain.onclick = setInitialState;

  // PUBLIC API
  this.onload = function() {
    getVideoStream();
    setInitialState();
    resizeWrapper();
    resizeVideoTag();
    resizeFabricCanvas();
    resize_imgCanvas();
    setFabricItem();

    video.onloadedmetadata = function() {
      resizeVideoTag();
    };
  };

  this.onresize = function() {
    setInitialState();
    resizeWrapper();
    resizeVideoTag();
    resizeFabricCanvas();
    resize_imgCanvas();
    setFabricItem();
  };
}

var module = new FabricjsOverVideo();

window.onload = module.onload;
window.onresize = module.onresize;
