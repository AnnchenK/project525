//mse - mean square error
function mse(t1, t2) {
  return tf.metrics.meanSquaredError(t1, t2).mean();
}

//psnr - peak signal to noise ratio
function psnr(mse) {
  let MAX = 255;
  if (mse == 0) return MAX;

  return 10 * Math.log10(tf.square(MAX).dataSync(0) / mse);
}

//snr - signal to noise ratio
function snr(t1, t2) {
  return (
    tf.moments(t1).mean.dataSync(0) / tf.moments(t2).variance.sqrt().dataSync(0)
  );
}

//ssim - values of the SSIM metric
function ssim(t1, t2) {
  let c1 = 0.01 * 256 * 256 * 256;
  let c2 = 0.03 * 256 * 256 * 256;
  let m1 = tf.moments(t1).mean.dataSync(0)[0];
  let m2 = tf.moments(t2).mean.dataSync(0)[0];
  let s1 = tf.moments(t1).variance.dataSync(0)[0];
  let s2 = tf.moments(t2).variance.dataSync(0)[0];
  let s = 0.5 * (tf.moments(tf.add(t1, t2)).variance.dataSync(0) - s1 - s2);

  return (
    ((2 * m1 * m2 + c1) * (2 * s + c2)) /
    ((Math.pow(m1, 2) + Math.pow(m2, 2) + c1) * (s1 + s2 + c2))
  );
}

function brightness(img1) {
  let img = cv.imread(img1);
  let hsv = new cv.Mat();
  cv.cvtColor(img, hsv, cv.COLOR_RGBA2GRAY);
  let mat = new cv.Mat();
  let rgbaPlanes = new cv.MatVector();
  cv.split(hsv, rgbaPlanes);
  let R = rgbaPlanes.get(0);
  var total = 0;
  for (var i = 0; i < R.data.length; i++) {
    total += R.data[i];
  }
  var avg = total / R.data.length;
  return parseInt(avg / 23);
}

function blured_1(imgl) {
  // Решейп изображения к (1, ширина, высота, 1)

  let _grayscaleFrame = imgl.mean(2).toFloat().expandDims(0).expandDims(-1);

  // окно для свертки с исходным изображением
  let laplaceFilter = tf
    .tensor2d([
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ])
    .expandDims(-1)
    .expandDims(-1); // [filter_height, filter_width, in_channels, out_channels]

  // приведение к серому и вычисление свертки
  let _laplacian = _grayscaleFrame.conv2d(laplaceFilter, 1, "valid").squeeze();
  
  return (_tensor_sum = _laplacian.sum().dataSync(0)[0]);
}

function blured_2(imgl) {
  let src = cv.imread(imgl);
  let dst = new cv.Mat();
  let men = new cv.Mat();
  let menO = new cv.Mat();
  // приведение к серому
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  // лаплассиан
  var t = cv.Laplacian(src, dst, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
  console.log(t,cv.meanStdDev(dst, menO, men),menO.data64F[0], men.data64F[0]);
  return menO.data64F[0];
}

function rms_flat(a) {   
  //Return the root mean square of all the elements of *a*, flattened out
  return tf.sqrt(tf.mean(tf.abs(a).mul(tf.abs(a)))).dataSync(0)[0];
}

function uppermin(f, x) {
  //Find range between nearest local minima from peak at index x
  //f = f.arraySync(0);
  f.dataSync(20)
  for (var i = x + 1 ; i < f.shape[0]; i++) {
      if (f.dataSync(i + 1) >= f.dataSync(i)){
          return i;
      }
  }
}

function lowermin(f, x) {
  for (var i = x - 1; i > 0; i--) {
      if (f.dataSync(i) <= f.dataSync(i - 1)) {
          return i + 1;
      }
  }
}

function thdn(signal, sample_rate) {
  //
  //Measure the THD+N for a signal and print the results
  //Get rid of DC and window the signal
  tf.tidy(() => {
  const mean = signal.mean(0);
  console.log("mean ", mean.dataSync(0));
  signal = signal.sub(mean);
  const win = tf.signal.hammingWindow(signal.shape[0]);
  const windowed = signal.mul(win);
  // Measure the total signal before filtering but after windowing
  const total_rms = rms_flat(windowed);

  // Find the peak of the frequency spectrum (fundamental frequency), and
  // filter the signal by throwing away values between the nearest local
  // minima
  let f = tf.spectral.rfft(windowed);
  tf.abs(f).print()
  const i = tf.argMax(tf.abs(f));

  //Not exact
  console.log('Frequency: %f Hz', (sample_rate * (i.dataSync(0)[0] / windowed.shape[0])));
  const low = uppermin(tf.abs(f), i.dataSync(0)[0]);
  const upp = lowermin(tf.abs(f), i.dataSync(0)[0]);
  console.log(low, upp);
  //my_var = my_var[4:8].assign(tf.zeros(4))
  console.log(f);
  // Create a buffer and set values at particular indices.
  // Multiplicate by 2 for store real and comlex part of a value
  const real_buffer = tf.buffer(f.shape, 'float32', tf.real(f).dataSync());
  const imag_buffer = tf.buffer(f.shape, 'float32', tf.imag(f).dataSync());
  //f = f.arraySync();
  for (var j = low ; j < upp; j++) {
    real_buffer.set(j, 0);
    imag_buffer.set(j, 0);
  };
  const f_zero = tf.complex(real_buffer.toTensor(), imag_buffer.toTensor());
  // Convert the buffer back to a tensor.
  //const f_zero = tf.tensor(x);
  // Transform noise back into the signal domain and measure it
  noise = tf.spectral.irfft(f_zero);
  THDN = rms_flat(noise) / total_rms;
  console.log("THD+N: " + THDN * 100);
  })
 return parseFloat(THDN * 100).toFixed(5);
}

//bodypix API
async function loadAndPredict(img) {
  const net = await bodyPix.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 1.0,
    quantBytes: 2,
  });
  const segmentation = await net.segmentPerson(img);

  return segmentation.allPoses.length;
}