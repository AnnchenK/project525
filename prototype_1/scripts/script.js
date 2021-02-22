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

    if (getComputedStyle(document.getElementById('table')).height == '0px')
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
    img1 = snapshot(0)
    pause(1000)
    img2 = snapshot(1)
    let c = await loadAndPredict(img2)
    let br = brightness(img2)
    let bl_2 = blured_2(img2)

    tf.tidy(() => {
        let t1 = tf.browser.fromPixels(img1);
        let t2 = tf.browser.fromPixels(img2);

        let mse1 = mse(t1, t2).mean().dataSync(0)
        let rmse1 = rmse(mse1).dataSync(0)
        let psnr1 = psnr(mse1)
        let snr1 = snr(t1, t2)
        let ssim1 = ssim(t1, t2)
        let bl_1 = blured_1(t1)

        let data = {
            'mse': parseFloat(mse1).toFixed(2),
            'rmse': parseFloat(rmse1).toFixed(2),
            'psnr': parseFloat(psnr1).toFixed(2),
            'snr': parseFloat(snr1).toFixed(2),
            'ssim': parseFloat(ssim1).toFixed(2),
            'br': br,
            'count': c,
            'is_blur_1': parseFloat(bl_1).toFixed(2),
            'is_blur_2': parseFloat(bl_2).toFixed(2)
        }

        appendRow(data)
    })
}

function pause(milliseconds) {
    var dt = new Date();
    while ((new Date()) - dt <= milliseconds) { }
}

function snapshot(i) {
    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    document.body.removeChild(canvas);
    if (i == 0)
    {
        let im = document.getElementById('img1')
        im.style.display = 'inline'
        im.src = canvas.toDataURL()
    }
    else
    {
        let im = document.getElementById('img2')
        im.style.display = 'inline'
        im.src = canvas.toDataURL()
    }
    return canvas;
}

function createTable() {
    let tableHeaders = ['mse', 'rmse', 'snr', 'psnr', 'ssim', 'brithness', 'count of faces', 'blur_tf', 'blur_cv']
    let table = document.createElement('table')
    table.setAttribute('id', 'tbl')
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
    let newRow = document.createElement('tr')
    let mse = document.createElement('td')
    mse.innerText = data.mse
    let rmse = document.createElement('td')
    rmse.innerText = data.rmse
    let snr = document.createElement('td')
    snr.innerText = data.snr
    let psnr = document.createElement('td')
    psnr.innerText = data.psnr
    let ssim = document.createElement('td')
    ssim.innerText = data.ssim
    let br = document.createElement('td')
    br.innerText = data.br
    let count = document.createElement('td')
    count.innerText = data.count
    let bl1 = document.createElement('td')
    bl1.innerText = data.is_blur_1
    let bl2 = document.createElement('td')
    bl2.innerText = data.is_blur_2

    let table = document.getElementById('tbl')
    
    if (table.rows.length == 3)
        table.deleteRow(1)

    newRow.append(mse, rmse, snr, psnr, ssim, br, count, bl1, bl2)
    table.append(newRow)
}