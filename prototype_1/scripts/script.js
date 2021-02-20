let video;
let webcamStream;
let timer

function startCam() {
 
    navigator.mediaDevices.getUserMedia({
        video: true
    }).then((stream) => {
    
    video = document.createElement('video');
    document.getElementById('camera').append(video);
    
    let bttn = document.createElement('button');
    bttn.innerHTML = 'Stop Cam';
    bttn.setAttribute('onclick', 'stopCam()');
    bttn.setAttribute('id', 'bttn');
    document.getElementById('buttns').append(bttn);
    
    video.srcObject = stream;
    video.play();
 
    webcamStream = stream;

    timer = setInterval(() => {
        doMetrics()
    }, 20000);

    if (document.getElementById('table').style.height == 0)
        createTable()

    }).catch((error) => {
    console.log('navigator.getUserMedia error: ', error);
    });
}

function stopCam() {
    webcamStream.getTracks()[0].stop();
    clearInterval(timer)
    document.getElementById('camera').removeChild(video)
    let bttn = document.getElementById('bttn');
    bttn.innerHTML = 'Restart Cam';
    bttn.setAttribute('onclick', 'startCam(); document.getElementById("buttns").removeChild(bttn)')
}

async function doMetrics() {
    img1 = snapshot()
    pause(1000)
    img2 = snapshot()
    let c = await loadAndPredict(img2)
    let br = brightness(img2)

    tf.tidy(() => {
        let t1 = tf.browser.fromPixels(img1);
        let t2 = tf.browser.fromPixels(img2);

        let mse1 = mse(t1, t2).mean().dataSync(0)
        let rmse1 = rmse(mse1).dataSync(0)
        let psnr1 = psnr(mse1)
        let snr1 = snr(t1, t2)
        let ssim1 = ssim(t1, t2)

        let data = {
            'mse': parseFloat(mse1).toFixed(6),
            'rmse': ' ' + parseFloat(rmse1).toFixed(6),
            'psnr': ' ' + parseFloat(psnr1).toFixed(6),
            'snr': ' ' + parseFloat(snr1).toFixed(6),
            'ssim': ' ' + parseFloat(ssim1).toFixed(6),
            'br': ' ' + br,
            'count': ' ' + c
        }

        appendRow(data)
    })
}

function pause(milliseconds) {
    var dt = new Date();
    while ((new Date()) - dt <= milliseconds) { }
}

function snapshot() {
    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    document.body.removeChild(canvas);
    return canvas;
}

function createTable() {
    let tableHeaders = ['mse', 'rmse', 'snr', 'psnr', 'ssim', 'brithness', 'count of faces']
    let table = document.createElement('table')
    table.setAttribute('id', 'table')
    let tableHead = document.createElement('thead')
    let tableRow = document.createElement('tr')
    
    tableHeaders.forEach(header => {
        let th = document.createElement('th')
        th.innerText = header
        tableRow.append(th)
    })
    
    tableHead.append(tableRow)
    table.append(tableHead)

    let tableBody = document.createElement('tbody')
    table.append(tableBody)

    document.getElementById('table').append(table)
}

function appendRow(data) {
    let table = document.getElementById('table')
    let newRow = document.createElement('tr')
    let mse = document.createElement('td').innerText = data.mse
    let rmse = document.createElement('td').innerText = data.rmse
    let snr = document.createElement('td').innerText = data.snr
    let psnr = document.createElement('td').innerText = data.psnr
    let ssim = document.createElement('td').innerText = data.ssim
    let br = document.createElement('td').innerText = data.br
    let count = document.createElement('td').innerText = data.count

    newRow.append(mse, rmse, snr, psnr, ssim, br, count)
    table.append(newRow)
}