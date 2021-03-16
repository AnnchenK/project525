//размытость


//psnr - peak signal to noise ratio
const psnr = `
    
    
    img1 = io.imread(data1)

    MAX = np.iinfo(img1.dtype).max

    mse_value = mse(img2, img1)

    if mse_value == 0.:
        print(np.inf)

    print(10 * np.log10(MAX**2 / mse_value))
`;

//mse - mean square error


/*const mse = `
    import numpy as np

    return np.mean((deformed.astype(np.float64) - origin.astype(np.float64))**2)
`;*/

const snr = `
    import numpy as np

    Arr = mse(deformed, origin)
    
    me = Arr.mean()
    
    sd = Arr.std()
    
    return np.where(sd == 0, 0, me/sd)
`;

//rmse - root mean square error


/*const rmse = `
    import numpy as np

    return np.sqrt(mse(deformed, origin))
`;*/

//snr - signal to noise ratio


//ssim - values of the SSIM metric
const ssim = `
    from skimage.measure import compare_ssim

    imageA = cv2.imread(deformed)
    imageB = cv2.imread(origin)

    grayA = cv2.cvtColor(imageA, cv2.COLOR_BGR2GRAY)
    grayB = cv2.cvtColor(imageB, cv2.COLOR_BGR2GRAY)

    (score, diff) = compare_ssim(grayA, grayB, full=True)
    diff = (diff * 255).astype("uint8")

    return score, diff
`;