let webcamStream;
 
  function startWebcam() {
    navigator.mediaDevices.getUserMedia({
      video: true
    }).then((stream) => {
      let video = document.querySelector('#video');
      video.srcObject = stream;
      video.play();
 
      webcamStream = stream;
    }).catch((error) => {
        console.log('navigator.getUserMedia error: ', error);
    });
  }
 
  function stopWebcam() {
    webcamStream.getTracks()[0].stop(); // video
  }