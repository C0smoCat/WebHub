function atvImg() {
    let d = document;
    let de = d.documentElement;
    let bd = d.getElementsByTagName('body')[0];
    let htm = d.getElementsByTagName('html')[0];
    let win = window;
    let imgs = d.querySelectorAll('.atvImg');
    let totalImgs = imgs.length;
    let supportsTouch = 'ontouchstart' in win || navigator.msMaxTouchPoints;

    if (totalImgs <= 0)
        return;

    for (let l = 0; l < totalImgs; l++) {
        let thisImg = imgs[l];
        let layerElems = thisImg.querySelectorAll('.atvImg-layer');
        let totalLayerElems = layerElems.length;

        if (totalLayerElems <= 0)
            continue;

        let containerHTML = d.createElement('div');
        let shineHTML = d.createElement('div');
        let shadowHTML = d.createElement('div');
        let layersHTML = d.createElement('div');
        let layers = [];

        thisImg.id = `atvImg__${l}`;
        containerHTML.className = 'atvImg-container';
        shineHTML.className = 'atvImg-shine';
        shadowHTML.className = 'atvImg-shadow';
        layersHTML.className = 'atvImg-layers';

        for (let i = 0; i < totalLayerElems; i++)
            while (thisImg.childNodes.length > 0)
                layersHTML.appendChild(thisImg.childNodes[0]);

        containerHTML.appendChild(shadowHTML);
        containerHTML.appendChild(layersHTML);
        containerHTML.appendChild(shineHTML);
        thisImg.appendChild(containerHTML);

        let w = thisImg.clientWidth || thisImg.offsetWidth || thisImg.scrollWidth;
        thisImg.style.transform = `perspective(${w * 3}px)`;

        if (supportsTouch) {
            win.preventScroll = false;

            (function (_thisImg, _layers, _totalLayers, _shine) {
                thisImg.addEventListener('touchmove', function (e) {
                    if (win.preventScroll)
                        e.preventDefault();
                    processMovement(e, true, _thisImg, _layers, _totalLayers, _shine);
                });
                thisImg.addEventListener('touchstart', function (e) {
                    win.preventScroll = true;
                    processEnter(e, _thisImg);
                });
                thisImg.addEventListener('touchend', function (e) {
                    win.preventScroll = false;
                    processExit(e, _thisImg, _layers, _totalLayers, _shine);
                });
            })(thisImg, layers, totalLayerElems, shineHTML);
        } else {
            (function (_thisImg, _layers, _totalLayers, _shine) {
                thisImg.addEventListener('mousemove', function (e) {
                    processMovement(e, false, _thisImg, _layers, _totalLayers, _shine);
                });
                thisImg.addEventListener('mouseenter', function (e) {
                    processEnter(e, _thisImg);
                });
                thisImg.addEventListener('mouseleave', function (e) {
                    processExit(e, _thisImg, _layers, _totalLayers, _shine);
                });
            })(thisImg, layers, totalLayerElems, shineHTML);
        }
    }

    function processMovement(e, touchEnabled, elem, layers, totalLayers, shine) {
        let bdst = bd.scrollTop || htm.scrollTop,
            bdsl = bd.scrollLeft,
            pageX = (touchEnabled) ? e.touches[0].pageX : e.pageX,
            pageY = (touchEnabled) ? e.touches[0].pageY : e.pageY,
            offsets = elem.getBoundingClientRect(),
            w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth,
            h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight,
            wMultiple = 320 / w,
            offsetX = 0.52 - (pageX - offsets.left - bdsl) / w,
            offsetY = 0.52 - (pageY - offsets.top - bdst) / h,
            dy = (pageY - offsets.top - bdst) - h / 2,
            dx = (pageX - offsets.left - bdsl) - w / 2,
            yRotate = (offsetX - dx) * (0.07 * wMultiple),
            xRotate = (dy - offsetY) * (0.1 * wMultiple),
            imgCSS = `rotateX(${xRotate}deg) rotateY(${yRotate}deg)`,
            arad = Math.atan2(dy, dx),
            angle = arad * 180 / Math.PI - 90;

        if (angle < 0)
            angle = angle + 360;

        if (elem.firstChild.classList.contains("over"))
            imgCSS += ' scale3d(1.03,1.03,1.03)';
        elem.firstChild.style.transform = imgCSS;

        shine.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,${(pageY - offsets.top - bdst) / h * 0.4}) 0%,rgba(255,255,255,0) 80%)`;
        shine.style.transform = `translateX(${offsetX * totalLayers}` - 0.1 + 'px) translateY(' + (offsetY * totalLayers) - 0.1 + 'px)';
    }

    function processEnter(e, elem) {
        elem.firstChild.className += ' over';
    }

    function processExit(e, elem, layers, totalLayers, shine) {
        let container = elem.firstChild;
        container.className = container.className.replace(' over', '');
        container.style.transform = '';
        shine.style.cssText = '';
    }
}

window.addEventListener("load", atvImg);