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
