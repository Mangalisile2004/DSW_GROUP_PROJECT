function blendSurname() {
  const surname = document.getElementById("surname").value;
  const font = document.getElementById("font").value;
  const output = document.getElementById("output");
  output.innerHTML = ""; 

  let posType = "seq";
  if (document.getElementById("random").checked) posType = "rand";
  else if (document.getElementById("reverse").checked) posType = "rev";

  for (let i = 0; i < surname.length; i++) {
    const letter = document.createElement("span");
    letter.textContent = surname[i];
    letter.style.fontFamily = font;
    letter.style.position = "absolute";

    if (posType === "seq") {
      letter.style.left = (15 * i) + "px";
      letter.style.top = (15 * i) + "px";
    } else if (posType === "rev") {
  
      letter.style.left = (15 * (surname.length - i)) + "px";
      letter.style.top = (15 * (surname.length - i)) + "px";
    } else if (posType === "rand") {
      letter.style.left = Math.floor(Math.random() * 300) + "px";
      letter.style.top = Math.floor(Math.random() * 100) + "px";
    }

    output.appendChild(letter);
  }
}

function applyStyle() {
  const color = document.getElementById("color").value;
  const size = document.getElementById("fontSize").value;

  const letters = document.getElementById("output").children;
  for (let i = 0; i < letters.length; i++) {
    letters[i].style.color = color;
    letters[i].style.fontSize = size + "px";
  }
}

document.getElementById("blend-btn").addEventListener("click", blendSurname);
document.getElementById("style-btn").addEventListener("click", applyStyle);
