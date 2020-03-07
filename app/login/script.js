function openCity(cityName, elmnt, butname) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "#8d8d8d";
        tablinks[i].style.boxShadow = 'none';
    }
    document.getElementById(cityName).style.display = "grid";
    document.getElementById(butname).style.backgroundColor = "#353534";
    document.getElementById(elmnt).style.boxShadow = "rgba(0, 0, 0, 0.333) 0px -15px 10px -5px inset";


}

// Get the element with id="defaultOpen" and click on it
document.getElementById("auto_but").click();