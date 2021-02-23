function mse(t1, t2) {
    return tf.metrics.meanSquaredError(t1, t2)
}

function rmse(mse) {
    return tf.sqrt(mse)
}

function psnr(mse) {
    let MAX = 255
    if (mse == 0)
        return MAX

    return 10 * Math.log10(tf.square(MAX).dataSync(0) / mse)
}

function snr(t1, t2) {
    return tf.moments(t1).mean.dataSync(0) / tf.moments(t2).variance.sqrt().dataSync(0)
}

function ssim(t1, t2) {
    let c1 = 0.01 * 256 * 256 * 256
    let c2 = 0.03 * 256 * 256 * 256
    let m1 = tf.moments(t1).mean.dataSync(0)[0]
    let m2 = tf.moments(t2).mean.dataSync(0)[0]
    let s1 = tf.moments(t1).variance.dataSync(0)[0]
    let s2 = tf.moments(t2).variance.dataSync(0)[0]
    let s = 0.5 * (tf.moments(tf.add(t1, t2)).variance.dataSync(0) - s1 - s2)

    return (2 * m1 * m2 + c1) * (2 * s + c2) / ((Math.pow(m1, 2) + Math.pow(m2, 2) + c1) * (s1 + s2 + c2))
}

function brightness(img1) {
    let img = cv.imread(img1);
    let hsv = new cv.Mat();
    cv.cvtColor(img, hsv, cv.COLOR_RGBA2GRAY)
    let mat = new cv.Mat();
    let rgbaPlanes = new cv.MatVector();
    cv.split(hsv, rgbaPlanes);
    let R = rgbaPlanes.get(0);
    var total = 0;
    for(var i = 0; i < R.data.length; i++) {
      total += R.data[i];
    }
    var avg = total / R.data.length;
    return parseInt(avg / 23);
}

function blured_1(imgl) {
    // Решейп изображения к (1, ширина, высота, 1) 
    
    let _grayscaleFrame = imgl.mean(2).toFloat().expandDims(0).expandDims(-1); 

    // окно для свертки с исходным изображением
    let laplaceFilter = tf.tensor2d([
              [0, 1, 0],
              [1, -4, 1],
              [0, 1, 0]
    ]).expandDims(-1).expandDims(-1); // [filter_height, filter_width, in_channels, out_channels]

    // приведение к серому и вычисление свертки
    let _laplacian = _grayscaleFrame.conv2d(laplaceFilter, 1, 'valid').squeeze();
    console.log( _laplacian.sum().dataSync(0))
    return _tensor_sum = _laplacian.sum().dataSync(0)[0]
    // нужно обосновать выбор константы
    if  (_tensor_sum < 60.0)
        return parseInt(0);
    return parseInt(1);
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
    return menO.data64F[0]
    if(menO.data64F[0] < 10)
        return parseInt(0);
    return parseInt(1);

}


async function loadAndPredict(img) {
    const net = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 1.00,
      quantBytes: 2
    });
      const segmentation = await net.segmentPerson(img);
    
      return segmentation.allPoses.length;
}