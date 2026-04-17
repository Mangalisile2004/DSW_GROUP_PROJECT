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

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, surname, email, password, servicesNeeded })
    });

    const data = await response.json();
    document.getElementById("responseMessage").innerText = data.message;

    if (data.success) {
      closeModal();
      alert("Sign-up successful!");
      window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
    }
  } catch (error) {
    document.getElementById("responseMessage").innerText = "Error signing up.";
    console.error(error);
  }
  
});
