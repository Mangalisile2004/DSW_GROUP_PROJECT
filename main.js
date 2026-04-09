async function validateSignupUser(event) {
  event.preventDefault();

  const fullName = document.getElementById("seeker-name").value;
  const email = document.getElementById("seeker-email").value;
  const studentNumber = document.getElementById("seeker-student-number").value;
  const password = document.getElementById("seeker-password").value;
  const servicesNeeded = document.getElementById("seeker-needs").value;

  const response = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, studentNumber, password, servicesNeeded })
  });

  const result = await response.json();

  if (result.success) {
    alert("Sign-up successful!");
    // Redirect to dashboard with email in query string
    window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
  } else {
    alert("Error: " + result.message);
  }
}
