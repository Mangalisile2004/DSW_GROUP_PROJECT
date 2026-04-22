const carMakes = ["VW", "BMW", "Benz", "Audi", "Ford", "Toyota"];

const cars = [
  { name: "Cabriolet", type: "Convertible", make: "Ford", img: "images/Convertible Ford.png" },
  { name: "Golf", type: "Hatchback", make: "VW", img: "images/Golf VW.png" },
  { name: "C-Class", type: "Sedan", make: "Benz", img: "images/C Class Benz.png" },
  { name: "Supra", type: "Sports", make: "Toyota", img: "images/Supra Sport Toyota.png" },
  { name: "A4", type: "Sedan", make: "Audi", img: "images/A4 Sedan Audi.png" },
  { name: "M3", type: "Coupe", make: "BMW", img: "images/M3 Coupe BMW.png" },
  { name: "Skyline", type: "Sports", make: "Nissan", img: "images/Skyline Sport.png" },
  { name: "Mustang", type: "Muscle", make: "Ford", img: "images/Mustang Ford.png" }
];

let correctCount = 0;
let totalCount = 0;
let currentCar = null;

window.onload = function () {
  const makeList = document.getElementById("make-list");
  carMakes.forEach((make, index) => {
    let option = document.createElement("option");
    option.value = index; 
    option.textContent = make;
    makeList.appendChild(option);
  });

  pickRandomCar();
  document.getElementById("guess-btn").classList.remove("disabled");
};

function pickRandomCar() {
  const randomIndex = Math.floor(Math.random() * cars.length);
  currentCar = cars[randomIndex];

  document.getElementById("car-name").textContent = currentCar.name;
  document.getElementById("car-type").textContent = currentCar.type;
  const img = document.getElementById("car-img");
  img.src = currentCar.img;
  img.classList.remove("hidden");
}

document.getElementById("guess-btn").addEventListener("click", function () {
  this.classList.add("disabled");

  const selectedMake = document.getElementById("make-list").value;
  if (selectedMake == currentCar.make) { 
    correctCount++;
    document.getElementById("correct").textContent = correctCount;
  }

  totalCount++;
  document.getElementById("total").textContent = totalCount;

  pickRandomCar();
  this.classList.remove("disabled");
});
