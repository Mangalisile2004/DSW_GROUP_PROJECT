async function loadUser() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");

  if (!email) return;

  const response = await fetch(`http://localhost:3000/user/${email}`);
  const user = await response.json();

  if (user) {
    document.getElementById("user-name").textContent = user.FullName;
    document.getElementById("full-name").textContent = user.FullName;
    document.getElementById("student-id").textContent = `Student ID: ${user.StudentNumber}`;
  }
}

loadUser();

// Example provider data for all services
const providers = {
  tutoring: [
    { name: "Buhle Tutoring", description: "Math & Science support", price: "R200" },
    { name: "Campus Tutors", description: "Exam prep specialists", price: "R180" }
  ],
  "language-tutoring": [
    { name: "Lingua Hub", description: "French & Spanish lessons", price: "R150" },
    { name: "Campus Language Club", description: "Conversational practice", price: "R120" }
  ],
  "graphic-design": [
    { name: "Creative Edge", description: "Logos & Branding", price: "R500" },
    { name: "Vision Designs", description: "Flyers & Posters", price: "R350" }
  ],
  "hair-beauty": [
    { name: "Campus Glam", description: "Hair styling & makeup", price: "R250" },
    { name: "Beauty Studio", description: "Professional salon services", price: "R300" }
  ],
  laundry: [
    { name: "Fresh Laundry", description: "Wash & fold service", price: "R100" },
    { name: "Campus Cleaners", description: "Affordable laundry", price: "R80" }
  ],
  bags: [
    { name: "Campus Bags", description: "Stylish handbags", price: "R400" },
    { name: "Student Essentials", description: "Affordable backpacks", price: "R350" }
  ],
  nails: [
    { name: "Thandi's Nails", description: "Gel & Acrylic Specialist", price: "R150" },
    { name: "Luxury Tips", description: "Premium manicure services", price: "R200" }
  ],
  cleaning: [
    { name: "Campus Cleaning", description: "Affordable cleaning solutions", price: "R150" },
    { name: "Fresh Spaces", description: "Deep cleaning services", price: "R250" }
  ],
  "custom-merchandise": [
    { name: "Merch Hub", description: "Personalized hoodies & mugs", price: "R300" },
    { name: "Campus Merch", description: "Affordable custom gear", price: "R250" }
  ],
  "study-essentials": [
    { name: "Stationery World", description: "Pens, notebooks, kits", price: "R50+" },
    { name: "Campus Supplies", description: "Affordable study packs", price: "R100" }
  ],
  catering: [
    { name: "Campus Catering", description: "Student events catering", price: "R500+" },
    { name: "Foodies", description: "Affordable meals", price: "R350+" }
  ],
  photography: [
    { name: "Vision Capture", description: "Photo & video services", price: "R600" },
    { name: "Campus Lens", description: "Affordable shoots", price: "R400" }
  ],
  printing: [
    { name: "Print Hub", description: "Assignments & posters", price: "R50+" },
    { name: "Campus Print", description: "Affordable printing", price: "R30+" }
  ],
  bedding: [
    { name: "Sleep Well", description: "Comfortable bedding sets", price: "R500+" },
    { name: "Campus Bedding", description: "Affordable student bedding", price: "R400+" }
  ]
};

// Get service from URL
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get("service");

// Render providers
function renderProviders(service) {
  const container = document.getElementById("providersContainer");
  container.innerHTML = "";

  if (providers[service]) {
    providers[service].forEach(p => {
      const card = document.createElement("div");
      card.className = "provider-card";
      card.innerHTML = `
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p><strong>Price:</strong> ${p.price}</p>
        <button class="book-btn">Book</button>
        <button class="contact-btn">Contact</button>
      `;
      container.appendChild(card);
    });
  } else {
    container.innerHTML = "<p>No providers available for this service yet.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProviders(service);
});
