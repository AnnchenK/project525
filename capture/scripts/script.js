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

let canvas = document.createElement('canvas');
canvas.id = 'myCanvas';
var bttn = document.getElementById('bttn');
bttn.after(canvas);

function snapshot() {
    var mycanvas = document.getElementById('myCanvas');
    mycanvas.width = video.videoWidth;
    mycanvas.height = video.videoHeight;
    var ctx = mycanvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
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