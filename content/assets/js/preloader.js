document.getElementById("preloader").style.display = "flex";
setTimeout(() => {
  fetch('/assets/3DotsLoader/index.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('preloader').innerHTML = html;
    })
    .catch(error => console.error('Error fetching embedded content:', error));
}, 300);

window.addEventListener("load", function() {
  setTimeout(function() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.display = "none";
    }
  }, 5000);
});
