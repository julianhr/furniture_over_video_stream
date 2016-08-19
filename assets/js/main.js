'use strict';

function FabricjsOverVideo() {
  // PRIVATE VARIABLES
  var 
    videoInputs = [],
    videoInput_i = 0,

    wrapper = document.querySelector('div#user-ui'),
    canvas = document.querySelector('canvas#canvas'),
    imgCanvas = document.querySelector('canvas#composite'),
    imgCapture = document.querySelector('img#capture'),
    
    video = document.querySelector('video#stream'),
    videoLeftOffset = 0,
    videoTopOffset = 0,

    btnCapture = document.querySelector('button#btn-capture'),
    aSave = document.querySelector('a#btn-save'),
    btnAgain = document.querySelector('button#btn-again'),
    btnVideoInput = document.querySelector('button#btn-video-input'),

    fabricCanvas = new fabric.Canvas(canvas),
    fabricItem = null;


  // PRIVATE FUNCTIONS
  function getVideoInputs() {
    var gotVideoInputs = function(videoInputsInfo) {
      videoInputsInfo.forEach(function(device) {
        if (device.kind === 'videoinput') {
          videoInputs.push(device);
        }
      });

      if (videoInputs.length > 1) {
        btnVideoInput.style.display = 'inline';
      }
    };

    var handleError = function(error) {
      var errorName = 'enumerateDevices name: ' + error.name;

      console.log(errorName);
      console.log(error);
    };

    navigator.mediaDevices.enumerateDevices()
      .then(gotVideoInputs)
      .catch(handleError);
  }

  function getVideoStream(deviceId) {
    // important!
    // tracks must be stopped before choosing a different video input
    // otherwise, the new input will not be hooked correctly
    if (window.stream && window.stream.getTracks) {
      window.stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    var constraints = {
      video: deviceId ? {deviceId: {exact: deviceId}} : true,
      audio: false,
    };

    console.log(constraints);

    var gotStream = function(mediaStream) {
      window.stream = mediaStream;
      video.srcObject = mediaStream;

      return navigator.mediaDevices.enumerateDevices();
    }

    var handleError = function(error) {
      /*var errorName = 'getUserMedia name: ' + error.name;

      console.log(errorName);*/
      console.log(error);
    }

    // execute getUserMedia Promise
    navigator.mediaDevices.getUserMedia(constraints)
      .then(gotStream)
      .catch(handleError);
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
    if (video.srcObject) {
      video.play();
    }

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

  btnVideoInput.onclick = function() {
    if (videoInput_i < videoInputs.length-1) {
      videoInput_i++;
    } else {
      videoInput_i = 0;
    }

    getVideoStream(videoInputs[videoInput_i].deviceId);

    video.onloadedmetadata = function() {
      resizeVideoTag();
    };
  };

  btnAgain.onclick = setInitialState;


  // PUBLIC API
  this.onload = function() {
    if (Modernizr.getusermedia) {
      getVideoInputs();
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
    } else {
      var notice = document.querySelector('#browser-notice');

      notice.style.display = 'inherit';
      wrapper.style.display = 'none';
    }
  };

  this.onresize = function() {
    if (Modernizr.getusermedia) {
      setInitialState();
      resizeWrapper();
      resizeVideoTag();
      resizeFabricCanvas();
      resize_imgCanvas();
      setFabricItem();
    }
  };
}

var module = new FabricjsOverVideo();

window.onload = module.onload;
window.onresize = module.onresize;
