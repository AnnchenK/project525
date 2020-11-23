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

  var canvas, canvas1, ctx;
 
function init() {
  canvas = document.getElementById("myCanvas");
  canvas1 = document.getElementById("myCanvas1");
  ctx = canvas.getContext('2d');
}

async function loadAndPredict(img) {
  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
});
    const segmentation = await net.segmentPerson(img);
    console.log(segmentation);

    const coloredPartImage = bodyPix.toMask(segmentation);
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    
    bodyPix.drawMask(
      canvas1, img, coloredPartImage, opacity, maskBlurAmount,
      flipHorizontal);
  }
 
function snapshot() {
  ctx.drawImage(video, 0,0, canvas.width, canvas.height);
  const img = document.getElementById('myCanvas');
  loadAndPredict(img);
}