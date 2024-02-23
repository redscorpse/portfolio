document.addEventListener("DOMContentLoaded", function() { //when you load the document
  var codeFigures = document.querySelectorAll('figure[data-rehype-pretty-code-figure]'); //select all code figures
  codeFigures.forEach(function(figure) {
    // select each heading (i want to only be able to fold those who have a title)
    var codeHeadings = figure.querySelectorAll('figcaption');
    codeHeadings.forEach(function(heading) {
      var foldCodeButton = document.createElement("button");
      foldCodeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevrons-up-down"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></svg>`;
      foldCodeButton.querySelector('svg').style.cssText = 'display:flex; padding-top:2px; color:#d4d4d4';
      foldCodeButton.style.cssText = "float:right; background-color:transparent; border:none;";

      heading.nextElementSibling.querySelector('code').style.cssText = 'max-height:5rem; overflow:scroll;';
      foldCodeButton.onclick = function() {
        var adjacentCode = heading.nextElementSibling.querySelector('code');
        if (adjacentCode) {
          if (foldCodeButton.classList.contains('active')) {
            adjacentCode.style.maxHeight = '5rem';
            foldCodeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevrons-up-down"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></svg>`;
          } else {
            adjacentCode.style.maxHeight = 'none';
            foldCodeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevrons-up-down"><path d="m7 20 5-5 5 5"></path><path d="m7 4 5 5 5-5"></svg>`;
          }
          foldCodeButton.classList.toggle('active');
        }
      };
      heading.appendChild(foldCodeButton);
      heading.style.width = "auto";
    });
  });
});
