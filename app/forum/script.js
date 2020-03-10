function hide() {
    let tabcontent = document.getElementsByClassName("new_f");
    if (tabcontent[0].style.display == "none") {
        tabcontent[0].style.display = "block";
    } else {
        tabcontent[0].style.display = "none";
    }
}

document.getElementById("add").click();