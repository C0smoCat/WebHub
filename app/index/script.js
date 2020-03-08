function MakeSlider() {
    tns({
        axis: "horizontal",
        mode: "carousel",
        container: '.slider2',
        controls: false,
        slideBy: 'page',
        nav: false,
        arrowKeys: true,
        autoplayHoverPause: true,
        autoplayButton: false,
        loop: true,
        autoplay: false,
        touch: true,
        mouseDrag: true,
        fixedWidth: 250
    });
}

window.addEventListener("load", MakeSlider);