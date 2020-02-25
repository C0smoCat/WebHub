const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

async function SelectFile(files, a, b) {
    console.log(await toBase64(files[0]));
}

// window.onload = () => {
//     let a = () => {
//         document.getElementById("kosmo").innerText = (new Date()).getTime().toString();
//         requestAnimationFrame(a);
//     };
//     requestAnimationFrame(a);
// };