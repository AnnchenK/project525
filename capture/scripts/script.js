let video;
let webcamStream;
 
function startWebcam() {
 
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then((stream) => {
    
    video = document.querySelector('#video');
    video.srcObject = stream;
    video.play();

    const mediaRecorder = new MediaRecorder(stream);

    document.querySelector('#start').addEventListener('click', function(){
        mediaRecorder.start();
    });
    let audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", function(event) {
        audioChunks.push(event.data);
    });

    document.querySelector('#stop').addEventListener('click', function(){
        mediaRecorder.stop();
    });

    mediaRecorder.addEventListener("stop", function() {
        const audioBlob = new Blob(audioChunks, {
            type: 'audio/wav'
        });

        let audio = document.createElement('audio');
        console.log(audioBlob.type);
        audio.src = audioBlob.stream();
        audio.controls = true;
        audio.autoplay = true;
        document.body.appendChild(audio);
        audioChunks = [];
    });
 
    webcamStream = stream;
    }).catch((error) => {
    console.log('navigator.getUserMedia error: ', error);
    });
}
    
function stopWebcam() {
      webcamStream.getTracks()[0].stop();
      webcamStream.getTracks()[1].stop(); 
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