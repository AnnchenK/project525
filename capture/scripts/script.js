URL = window.URL || window.webkitURL;

let video;
let webcamStream;

var gumStream;
var rec;
var input;
var AudioContext;
 
function startWebcam() {
 
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then((stream) => {
    
    video = document.querySelector('#video');
    video.srcObject = stream;
    video.play();
 
    webcamStream = stream;
    gumStream = stream;

    }).catch((error) => {
    console.log('navigator.getUserMedia error: ', error);
    });
}
    
function stopWebcam() {
      webcamStream.getTracks()[0].stop();
      webcamStream.getTracks()[1].stop(); 
      gumStream.getTracks()[0].stop();
      gumStream.getTracks()[1].stop();
} 

function snapshot() {
    let canvas = document.getElementById('canvas');
    console.log('snapshot');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    //document.body.removeChild(canvas);
    //const img = document.getElementById('myCanvas');
    //loadAndPredict(img);
    //return getTensor()
}

function getTensor() {

    return tf.tidy(function() {
      return tf.browser.fromPixels(document.getElementById('canvas'));
      //const batchedImage = image.expandDims(0);
      //return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
  }

function startRecording() {
    
    AudioContext = window.AudioContext || window.webkitAudioContext;
    
    var audioContext = new AudioContext;
    input = audioContext.createMediaStreamSource(gumStream);
    rec = new Recorder(input, {
        numChannels: 2
    })
    rec.record()
}

function stopRecording() { 
    rec.stop();
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    au.controls = true;
    au.src = url;
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.innerHTML = link.download;
    li.appendChild(au);
    li.appendChild(link); 
    recordingsList.appendChild(li);
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
  
      let a = Math.floor(Math.random() * (60 - 50 + 1)) + 50;
      bodyPix.drawMask(
        mycanvas1, img, coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal);
      const test = segmentation.allPoses.length;
      
      if(test == 1)
        alert(`1 лицо, качество ${a}`);
        else if (test == 0)
            alert(`Нет человека в кадре`);
                else
                    alert(`Более 1 лица, качество ${a}`);
}

languagePluginLoader.then(function(){
    let btn = document.createElement('button');
            btn.setAttribute('id', 'btn');
            btn.innerHTML = 'Start checking';
            btn.setAttribute('onclick', 'Checking()');
            document.body.appendChild(btn);
})

function Preparation() {
    var a1 = document.createElement('a');
    a1.setAttribute('download', 'img1.png')
    a1.setAttribute('href', snapshot())
    a1.innerHTML = 'img1'
    document.body.appendChild(a1)
}

function Checking() {
    snapshot()
    tf.tidy(() => {
    t1 = getTensor()
    pause(4000)
    snapshot()
    t2 = getTensor()
    myMse = mse(t1, t2)
    myMse.print()
    //rmse(myMse).print()
    
    })
    /*data1 = snapshot();
    pause(4000)
    data2 = snapshot() 
    

    pyodide.loadPackage(['numpy', 'scikit-image']).then(() => {
        
        pyodide.runPythonAsync(psnr);
    })*/

    //document.removeChild(document.getElementsByTagName('canvas')[0])
    //document.removeChild(document.getElementsByTagName('canvas')[0])
}

function pause(milliseconds) {
    var dt = new Date();
    while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function mse(t1, t2) {
    console.log('mse')
    console.log(t1.dtype)
    return tf.mean(tf.metrics.mse(t1, t2))
}

function rmse(mse) {
    console.log('rmse')
    return tf.sqrt(mse)
}