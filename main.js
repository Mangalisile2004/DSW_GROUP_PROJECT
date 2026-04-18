// Open modal when Sign Up button is clicked
function openModal() {
  document.getElementById("signupModal").style.display = "block";
}

// Close modal
function closeModal() {
  document.getElementById("signupModal").style.display = "none";
}

// Handle form submission
document.getElementById("popupSignupForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const servicesNeeded = document.getElementById("servicesNeeded").value;

  // Show loading message
  const responseMsg = document.getElementById("responseMessage");
  responseMsg.innerText = "Signing up...";
  responseMsg.style.color = "blue";

  try {
    console.log("Sending signup request...");
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, surname, email, password, servicesNeeded })
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);
    
    if (data.success) {
      responseMsg.innerText = data.message;
      responseMsg.style.color = "green";
      setTimeout(() => {
        closeModal();
        alert("Sign-up successful!");
        window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
      }, 1000);
    } else {
      responseMsg.innerText = data.message || "Signup failed";
      responseMsg.style.color = "red";
    }
  } catch (error) {
    console.error("Error details:", error);
    responseMsg.innerText = "Error signing up. Check if server is running.";
    responseMsg.style.color = "red";
  }
});

// Close modal if clicked outside
window.onclick = function(event) {
  const modal = document.getElementById("signupModal");
  if (event.target == modal) {
    closeModal();
  }
}

// Show alert for other buttons
function showAlert(message) {
  alert(message + " feature coming soon!");
}

function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  nav.classList.toggle('active');
}