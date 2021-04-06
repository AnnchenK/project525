let video;
let webcamStream;
let audioContext = window.AudioContext || window.webkitAudioContext;
let timer, analyzer, timer1;
let flag = 1;

//функция запускается при загрузке страницы
function startCam() {
  //получение потока с веб-камеры
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {
      video = document.createElement("video");
      video.muted = true;
      video.autoplay = true;
      document.getElementById("camera").append(video);

      //вспомогательная кнопка для управления
      let bttn = document.createElement("button");
      bttn.innerHTML = "Stop Cam";
      bttn.setAttribute("onclick", "stopCam()");
      bttn.setAttribute("id", "bttn");
      document.getElementById("buttns").append(bttn);

      audioContext = new AudioContext()
      var mic = audioContext.createMediaStreamSource(stream)

      analyzer = Meyda.createMeydaAnalyzer ({
        'audioContext': audioContext,
        'source': mic,
        'bufferSize': 16384,
        'featureExtractors': ['energy', 'zcr', 'loudness'],
        'callback': features => {
          console.log(features)
          let data = {
            loudness: parseFloat(features.loudness.total).toFixed(2),
            zcr: features.zcr,
            energy: parseFloat(features.energy).toFixed(2)
          }
          console.log(data)
          appendSoundRow(data)
          analyzer.stop()
        }
      });
      
      video.srcObject = stream;
      video.play();

      webcamStream = stream;

      //установка интервала (в данном случае 10с) для использования метрик
      timer = setInterval(() => {
        doMetrics();
      }, 10000);

      timer1 = setInterval(() => {
        analyzer.start()
      }, 5000);

      //создание таблицы с метриками (если она еще не создана)
      if (getComputedStyle(document.getElementById("table")).height == "0px")
        createTable();

      if (getComputedStyle(document.getElementById("table_sound")).height == "0px")
        createSoundTable();
    })
    .catch((error) => {
      console.log("navigator.getUserMedia error: ", error);
    });
}

//функция прекращения передачи потока с веб-камеры
function stopCam() {
  webcamStream.getTracks()[0].stop();
  webcamStream.getTracks()[1].stop();
  analyzer.stop()
  //остановка интервала
  clearInterval(timer);
  clearInterval(timer1);
  document.getElementById("camera").removeChild(video);
  let bttn = document.getElementById("bttn");
  bttn.innerHTML = "Restart Cam";
  bttn.setAttribute(
    "onclick",
    'startCam(); document.getElementById("buttns").removeChild(bttn)'
  );
}

//основная функция работы с метриками
async function doMetrics() {
  //получение двух стоп-кадров с интервалом (5с)
  img1 = snapshot(0);
  pause(5000);
  img2 = snapshot(1);
  //передача в функции, которые работают с изображениями
  let c = await loadAndPredict(img2);
  let br = brightness(img2);
  let bl_2 = blured_2(img2);

  //внутри встроенного в tf GC работаем с тензорами изображений
  tf.tidy(() => {
    let t1 = tf.browser.fromPixels(img1);
    let t2 = tf.browser.fromPixels(img2);

    let mse1 = mse(t1, t2).dataSync(0) / 255;
    let psnr1 = psnr(mse1);
    let snr1 = snr(t1, t2);
    let ssim1 = ssim(t1, t2);

    let result = (mse1 + psnr1 + snr1 + ssim1) * 0.2;

    //создание объекта для отражения результатов метрик в таблице
    let data = {
      mse: parseFloat(mse1).toFixed(2),
      psnr: parseFloat(psnr1).toFixed(2),
      snr: parseFloat(snr1).toFixed(2),
      ssim: parseFloat(ssim1).toFixed(2),
      br: br,
      count: c,
      is_blur_2: parseFloat(bl_2).toFixed(5),
      result: parseFloat(result).toFixed(2)
    };

    appendRow(data);
  });
}

function pause(milliseconds) {
  var dt = new Date();
  while (new Date() - dt <= milliseconds) {}
}

//получение стоп-кадра с видео потока
function snapshot(i) {
  let canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  document.body.removeChild(canvas);
  //манипуляции для отображения стоп-кадров для улучшения восприятия метрик
  if (flag) {
    if (i == 0) {
      let im = document.getElementById("img3");
      im.style.display = "inline";
      im.src = canvas.toDataURL();
      let c = document.getElementById("c3");
      c.style.display = "inline";
      c.innerText = "img1";
    } else {
      let im = document.getElementById("img4");
      im.style.display = "inline";
      im.src = canvas.toDataURL();
      flag = 0;
      let c = document.getElementById("c4");
      c.style.display = "inline";
      c.innerText = "img2";
    }
  } else if (!flag) {
    if (i == 0) {
      let old = document.getElementById("img1");
      let im = document.getElementById("img3");
      old.style.display = "inline";
      old.src = im.src;
      let c1 = document.getElementById("c1");
      c1.style.display = "inline";
      c1.innerText = "img1";
      im.style.display = "inline";
      im.src = canvas.toDataURL();
      let c2 = document.getElementById("c3");
      c2.style.display = "inline";
      c2.innerText = "img3";
    } else {
      let old = document.getElementById("img2");
      let im = document.getElementById("img4");
      old.style.display = "inline";
      old.src = im.src;
      let c1 = document.getElementById("c2");
      c1.style.display = "inline";
      c1.innerText = "img2";
      im.style.display = "inline";
      im.src = canvas.toDataURL();
      let c2 = document.getElementById("c4");
      c2.style.display = "inline";
      c2.innerText = "img4";
    }
  }
  return canvas;
}

//создание тега таблицы и отображение заголовка
function createTable() {
  let tableHeaders = [
    "for",
    "mse",
    "snr",
    "psnr",
    "ssim",
    "result",
    "for",
    "brithness",
    "count of faces",
    "blur_cv"
  ];
  let table = document.createElement("table");
  table.setAttribute("id", "tbl");
  let tableHead = document.createElement("thead");
  let tableRow = document.createElement("tr");

  tableHeaders.forEach((header) => {
    let th = document.createElement("th");
    th.innerText = header;
    tableRow.append(th);
  });

  tableRow.setAttribute('class', 'row')
  tableHead.append(tableRow);
  table.append(tableHead);

  let tableBody = document.createElement("tbody");
  table.append(tableBody);

  document.getElementById("table").append(table);
}

function createSoundTable() {
  let tableHeaders = [
    "loudness",
    "energy",
    "zcr"
  ];
  let table = document.createElement("table");
  table.setAttribute("id", "tbl_s");
  let tableHead = document.createElement("thead");
  let tableRow = document.createElement("tr");

  tableHeaders.forEach((header) => {
    let th = document.createElement("th");
    th.innerText = header;
    tableRow.append(th);
  });

  tableRow.setAttribute('class', 'row')
  tableHead.append(tableRow);
  table.append(tableHead);

  let tableBody = document.createElement("tbody");
  table.append(tableBody);

  document.getElementById("table_sound").append(table);
}

//функция для добавления строки в таблицу со значениями метрик
function appendRow(data) {
  let newRow = document.createElement("tr");
  let mse = document.createElement("td");
  mse.innerText = data.mse;
  let snr = document.createElement("td");
  snr.innerText = data.snr;
  let psnr = document.createElement("td");
  psnr.innerText = data.psnr;
  let ssim = document.createElement("td");
  ssim.innerText = data.ssim;
  let br = document.createElement("td");
  br.innerText = data.br;
  let count = document.createElement("td");
  count.innerText = data.count;
  let bl2 = document.createElement("td");
  bl2.innerText = data.is_blur_2;
  let result = document.createElement("td");
  result.innerText = data.result;

  let table = document.getElementById("tbl");

  let for1 = document.createElement("td"),
    for2 = document.createElement("td");

  if (table.rows.length == 1) {
    for1.innerText = "img1-2";
    for2.innerText = "img2";
  } else if (table.rows.length == 2) {
    for1.innerText = "img3-4";
    for2.innerText = "img4";
  } else {
    table.rows[2].cells[0].innerText = "img1-2";
    table.rows[2].cells[6].innerText = "img2";
    for1.innerText = "img3-4";
    for2.innerText = "img4";
  }

  if (table.rows.length == 3) table.deleteRow(1);

  newRow.append(for1, mse, snr, psnr, ssim, result, for2, br, count, bl2);
  table.append(newRow);
}

function appendSoundRow(data) {
  let newRow = document.createElement("tr");
  let loudness = document.createElement("td");
  loudness.innerText = data.loudness;
  let energy = document.createElement("td");
  energy.innerText = data.energy;
  let zcr = document.createElement("td");
  zcr.innerText = data.zcr;

  let table = document.getElementById("tbl_s");

  if (table.rows.length == 3) table.deleteRow(1);

  newRow.append(loudness, energy, zcr);
  table.append(newRow);
}