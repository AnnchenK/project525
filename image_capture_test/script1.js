let video;
let webcamStream;
 
    function startWebcam() {
 
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then((stream) => {
        video = document.querySelector('#video');
        video.srcObject = stream;
        video.play();
 
        webcamStream = stream;
      }).catch((error) => {
        console.log('navigator.getUserMedia error: ', error);
      });
    }
    function stopWebcam() {
          webcamStream.getTracks()[0].stop(); 
    } 

  var canvas, ctx;
 
function init() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext('2d');
}
 
function snapshot() {
  ctx.drawImage(video, 0,0, canvas.width, canvas.height);
}