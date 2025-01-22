
class ImageLoader {
    constructor() {
        this.lstPaths = [];
        this.lstImages = [];
        this.callBack = null;
        this.loadedImageCount = 0;
    }

    add(pPathImage) {
        this.lstPaths.push(pPathImage);
    }

    getTotalImages() {
        return this.lstPaths.length;
    }

    getTotalImagesLoaded() {
        return this.loadedImageCount;
    }

    getLoadedRatio() {
        return this.loadedImageCount / this.getTotalImages();
    }

    getListImages() {
        return this.lstImages;
    }

    start(pCallBack) {
        this.callBack = pCallBack;
        this.lstPaths.forEach(path => {
            let img = new Image();
            img.onload = this.imageLoaded.bind(this);
            img.src = path;
            this.lstImages[path] = img;
        });
    }

    imageLoaded(e) {
        this.loadedImageCount++;
        if (this.loadedImageCount == this.lstPaths.length) {
            this.callBack();
        }
    }

    getImage(pPath) {
        return this.lstImages[pPath];
    }
}