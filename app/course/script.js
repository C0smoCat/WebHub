function extendedLessonClick(el) {
    console.log(el);
    let display;
    let btn = el.parentElement.querySelector(".lNext").firstChild;
    if (el.parentElement.querySelector(".extended-lesson").style.display === "unset") {
        display = "none";
        btn.innerText = ">";
    } else {
        display = "unset";
        btn.innerText = "<";
    }
    el.parentElement.querySelectorAll(".extended-lesson")
        .forEach(obj => obj.style.display = display);
}