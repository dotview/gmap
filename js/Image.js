var HMImage = {};

function SetMiddle(image, height) {
    if (typeof (image) == 'string') image = document.images[image] || document.getElementById(image);
    var div = image.parentNode;

    if (div.nodeName != "DIV") {

        div = div.parentNode;
    }
    if (image.height > 0 && image.height < height) {
        //var marginTopVal = (height - image.height) / 2;
        //image.style.marginTop = parseInt(marginTopVal) + "px";
    }
    else {
        image.height = height;
        image.style.marginTop = "0px";
    }
}

HMImage.Resize1 = function(image, width, height) {
    if (width == null || height == null)
        return;
    image.removeAttribute('width');
    image.removeAttribute('height');
    var w = image.width, h = image.height;
    var scalingW = w / width, scalingH = h / height;
    var scaling = w / h;
    if (scalingW >= scalingH) {
        image.width = width;
        image.height = width / scaling;
    }
    else {
        image.height = height;
        image.width = height * scaling;
    }
}

function imgReSize(imgObj, w, h) {
    HMImage.Resize1(imgObj, w, h); //SetMiddle(imgObj, h);
}


ImgError = function(image, w, h) {
var width = w==null?"150":w;
var height = h==null?"100":h;

image.src = '/static/cn/images/null_120.jpg';
//imgReSize(image,w,h);
}