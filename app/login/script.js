function openCity(cityName, elmnt, butname) {
    let tabcontent = document.getElementsByClassName("tabcontent");
    let tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "#8d8d8d";
        tablinks[i].style.color = "#353534";
        tablinks[i].style.boxShadow = 'none';
    }
    document.getElementById(cityName).style.display = "grid";
    document.getElementById(butname).style.backgroundColor = "#353534";
    document.getElementById(butname).style.color = "#eee";
    document.getElementById(elmnt).style.boxShadow = "rgba(0, 0, 0, 0.333) 0px -15px 10px -5px inset";
}

function updateAvatar(input) {
    let preview = document.getElementById("avatar-preview");
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

document.querySelector(".auto_click").click();