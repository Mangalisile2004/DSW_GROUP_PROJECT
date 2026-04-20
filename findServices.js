function filterServices() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const services = document.getElementById("servicesGrid").getElementsByClassName("service");
  let found = false;

  for (let i = 0; i < services.length; i++) {
    const title = services[i].getElementsByTagName("h3")[0].innerText.toLowerCase();
    if (title.includes(input)) {
      services[i].style.display = "";
      found = true;
    } else {
      services[i].style.display = "none";
    }
  }

  
  let message = document.getElementById("notFoundMessage");
  if (!message) {
    message = document.createElement("p");
    message.id = "notFoundMessage";
    message.style.textAlign = "center";
    message.style.color = "#F97316"; 
    message.style.fontWeight = "600";
    message.style.marginTop = "20px";
    document.querySelector(".services").appendChild(message);
  }

  if (!found && input.trim() !== "") {
    message.textContent = `No services found for "${input}".`;
  } else {
    message.textContent = "";
  }
}
// Simulated login state
let isLoggedIn = false;
let userRole = null; // "serviceSeeker"

// Handle "View More" clicks
function handleViewMore(serviceName) {
  if (!isLoggedIn || userRole !== "serviceSeeker") {
    showLoginPopup(serviceName);
  } else {
    window.location.href = `dashboard.html?service=${serviceName}`;
  }
}

// Create and show popup
function showLoginPopup(serviceName) {
  const modal = document.createElement("div");
  modal.className = "popup-overlay"; // match CSS
  modal.innerHTML = `
    <div class="popup-box">
      <h3>Continue to Login</h3>
      <p>You need to log in or sign up as a Service Seeker to view more details.</p>
      <div class="popup-actions">
        <button id="loginBtn">Login</button>
        <button id="signupBtn">Sign Up</button>
        <button id="cancelBtn">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Button actions
  document.getElementById("loginBtn").onclick = () => {
    window.location.href = `seeker.html?mode=login&redirect=dashboard.html&service=${serviceName}`;
  };
  document.getElementById("signupBtn").onclick = () => {
    window.location.href = `seeker.html?mode=signup&redirect=dashboard.html&service=${serviceName}`;
  };
  document.getElementById("cancelBtn").onclick = () => {
    document.body.removeChild(modal);
  };
}

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".view-more-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const service = btn.dataset.service;
      handleViewMore(service);
    });
  });
});
