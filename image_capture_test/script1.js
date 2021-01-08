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
    
    let canvas1 = document.createElement('canvas');
canvas1.id = 'myCanvas1';
document.body.appendChild(canvas1);
mycanvas1 = document.getElementById('myCanvas1');

    bodyPix.drawMask(
      mycanvas1, img, coloredPartImage, opacity, maskBlurAmount,
      flipHorizontal);
  }

  let canvas = document.createElement('canvas');
  canvas.id = 'myCanvas';
  document.body.appendChild(canvas);
 
function snapshot() {
  var mycanvas = document.getElementById('myCanvas');
    mycanvas.width = video.videoWidth;
    mycanvas.height = video.videoHeight;
    var ctx = mycanvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const img = document.getElementById('myCanvas');
  loadAndPredict(img);
}