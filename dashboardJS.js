/* ================================================================
   dashboardJS.js — Campus Connect Dashboard (Full Functionality)
   ================================================================ */

/* ===== TOAST ===== */
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = "toast show";
  if (type === "error") toast.style.background = "#dc2626";
  else if (type === "warn") toast.style.background = "#d97706";
  else toast.style.background = "";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ===== LOADER ===== */
function showLoader() {
  let loader = document.getElementById("globalLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "globalLoader";
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(loader);
  }
  loader.style.display = "flex";
}
function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "none";
}

/* ===== SIDEBAR ===== */
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const isOpen = sidebar.classList.contains("active");
  if (isOpen) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  } else {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    loadProfileFromLocalStorage();
  }
};
window.closeSidebar = function () {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
};

/* ===== LOGOUT ===== */
window.logout = function () {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("privacyMode");
    window.location.href = "login.html";
  }
};

/* ===== SEARCH ===== */
window.handleKeyPress = function (event) {
  if (event.key === "Enter") window.searchServices();
};

window.searchServices = function () {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    showToast("Please enter a search term.", "warn");
    return;
  }
  showLoader();
  setTimeout(() => {
    hideLoader();
    const matches = allProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.service.toLowerCase().includes(query.toLowerCase())
    );
    renderProviders(matches, `Results for "${query}"`);
  }, 800);
};

window.resetToAllProviders = function () {
  document.getElementById("searchInput").value = "";
  renderProviders(allProviders);
  showToast("Showing all providers");
};

/* ===== PROVIDERS DATA ===== */
const allProviders = [
  { id: "john",   name: "John Mokoena",   service: "Math Tutor",         rating: 4.8, experience: "3 years",  about: "Passionate about helping students excel in mathematics.", icon: "fa-calculator" },
  { id: "lerato", name: "Lerato Dlamini",  service: "Writing Coach",      rating: 4.7, experience: "5 years",  about: "Helps students improve essays, reports, and creative writing.", icon: "fa-pen-fancy" },
  { id: "sam",    name: "Sam Nkosi",       service: "Fitness Trainer",    rating: 4.9, experience: "4 years",  about: "Dedicated to building strength and healthy habits.", icon: "fa-dumbbell" },
  { id: "jane",   name: "Jane Sithole",    service: "Graphic Designer",   rating: 4.6, experience: "2 years",  about: "Creates stunning visual identities and marketing materials.", icon: "fa-paint-brush" },
  { id: "mike",   name: "Mike van Wyk",    service: "Photographer",       rating: 4.8, experience: "6 years",  about: "Professional photography for events, portraits, and products.", icon: "fa-camera" },
  { id: "aisha",  name: "Aisha Mahlangu",  service: "Hair Stylist",       rating: 4.9, experience: "4 years",  about: "Specialises in natural hair, braids, and protective styles.", icon: "fa-cut" },
];

function starsFromRating(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = "";
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<i class="fas fa-star"></i>';
    else if (i === full && half) html += '<i class="fas fa-star-half-alt"></i>';
    else html += '<i class="far fa-star"></i>';
  }
  return html;
}

function renderProviders(list, title) {
  const container = document.getElementById("providers-list");
  if (!container) return;
  if (title) {
    const h = document.querySelector(".providers-section h3");
    if (h) h.innerHTML = `<i class="fas fa-star"></i> ${title}`;
  }
  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="no-results-message">
        <i class="fas fa-search-minus"></i>
        <h3>No providers found</h3>
        <p>Try a different search term or category.</p>
        <button class="btn-primary" onclick="resetToAllProviders()" style="width:auto;padding:10px 22px;margin-top:8px;border-radius:25px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:white;border:none;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;">
          Show All Providers
        </button>
      </div>`;
    return;
  }
  container.innerHTML = list.map((p) => `
    <div class="provider-card" onclick="viewProfile('${p.id}')">
      <div class="provider-icon"><i class="fas ${p.icon}"></i></div>
      <h4>${p.name}</h4>
      <p>${p.service}</p>
      <div class="rating">${starsFromRating(p.rating)} <small style="color:var(--text-muted);font-size:11px;margin-left:4px;">(${p.rating})</small></div>
      <button class="btn-view" onclick="event.stopPropagation();viewProfile('${p.id}')">View Profile</button>
    </div>`).join("");
}

/* ===== CATEGORY FILTER ===== */
window.filterByCategory = function (category) {
  const categoryMap = {
    tutoring: ["tutor", "math", "writing", "coach", "fitness"],
    photography: ["photo"],
    design: ["design"],
    beauty: ["hair", "beauty", "style"],
  };
  const keywords = categoryMap[category] || [category];
  const matches = allProviders.filter((p) =>
    keywords.some((k) => p.service.toLowerCase().includes(k))
  );
  renderProviders(matches, `${category.charAt(0).toUpperCase() + category.slice(1)} Providers`);
  showToast(`Filtered by: ${category}`);
};

/* ===== BROWSE ALL MODAL ===== */
window.browseAllProviders = function () {
  const modal = document.getElementById("providersModal");
  const list = document.getElementById("modalProvidersList");
  if (!modal || !list) return;
  modal.style.display = "flex";
  list.innerHTML = allProviders.map((p) => `
    <div class="provider-card" style="margin-bottom:12px;">
      <div>
        <h4><i class="fas ${p.icon}" style="color:var(--accent);margin-right:8px;"></i>${p.name}</h4>
        <p>${p.service} · ${starsFromRating(p.rating)}</p>
      </div>
      <button class="btn-view" onclick="viewProfile('${p.id}');closeProvidersModal();">View</button>
    </div>`).join("");
};
window.closeProvidersModal = function () {
  document.getElementById("providersModal").style.display = "none";
};

/* ===== PROFILE MODAL ===== */
window.viewProfile = function (providerId) {
  const profile = allProviders.find((p) => p.id === providerId);
  if (!profile) { showToast("Profile not found.", "error"); return; }
  const modal = document.getElementById("profile-modal");
  if (!modal) return;
  document.getElementById("provider-name").textContent = profile.name;
  document.getElementById("provider-service").textContent = profile.service;
  document.getElementById("provider-rating").innerHTML = starsFromRating(profile.rating) + ` <span style="color:var(--text-muted);font-size:12px;">${profile.rating}/5</span>`;
  document.getElementById("provider-experience").textContent = profile.experience;
  document.getElementById("provider-about").textContent = profile.about;

  // Add favourite & book buttons if not already present
  if (!modal.querySelector(".profile-action-btns")) {
    const actions = document.createElement("div");
    actions.className = "profile-action-btns";
    actions.style.cssText = "display:flex;gap:10px;margin-top:20px;";
    actions.innerHTML = `
      <button onclick="addFavorite()" style="flex:1;padding:12px;border-radius:10px;background:var(--accent-light);color:var(--accent-dark);border:none;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;">
        <i class="fas fa-heart"></i> Save
      </button>
      <button onclick="bookProvider()" style="flex:1;padding:12px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:white;border:none;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;">
        <i class="fas fa-calendar-plus"></i> Book
      </button>`;
    modal.querySelector(".modal-content").appendChild(actions);
  }
  modal.style.display = "flex";
};
window.closeProfile = function () {
  document.getElementById("profile-modal").style.display = "none";
};

/* ===== BOOK PROVIDER ===== */
window.bookProvider = function () {
  const name = document.getElementById("provider-name").textContent;
  window.closeProfile();
  openBookingForm(name);
};

/* ===== EDIT PROFILE ===== */
window.editProfile = function () {
  const saved = getProfileData();
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "editProfileModal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2><i class="fas fa-user-edit"></i> Edit Profile</h2>
      <div style="text-align:center;margin-bottom:18px;">
        <img id="profilePreview" src="${document.getElementById('profileImage').src}"
          style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--accent);display:block;margin:0 auto 10px;">
        <label for="editImage" style="cursor:pointer;color:var(--accent);font-size:13px;font-weight:600;">
          <i class="fas fa-camera"></i> Change Photo
        </label>
        <input type="file" id="editImage" accept="image/*" style="display:none;">
      </div>
      <form id="editProfileForm">
        <label>Full Name</label>
        <input type="text" id="editName" value="${saved.name}" placeholder="Your full name" required>
        <label>Student ID</label>
        <input type="text" id="editID" value="${saved.studentId}" placeholder="e.g. STU2024001">
        <label>Email Address</label>
        <input type="email" id="editEmail" value="${saved.email}" placeholder="your@email.com">
        <label>Service Needed</label>
        <input type="text" id="editService" value="${saved.service}" placeholder="e.g. Tutoring, Photography...">
        <button type="submit"><i class="fas fa-save"></i> Save Changes</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = "flex";

  // Image preview
  modal.querySelector("#editImage").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      modal.querySelector("#profilePreview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Save handler
  modal.querySelector("#editProfileForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name    = document.getElementById("editName").value.trim();
    const id      = document.getElementById("editID").value.trim();
    const email   = document.getElementById("editEmail").value.trim();
    const service = document.getElementById("editService").value.trim();

    document.getElementById("full-name").textContent = name || "User";
    document.getElementById("student-id").textContent = "Student ID: " + (id || "N/A");
    document.getElementById("user-email").textContent = email || "Not set";
    document.getElementById("service-needed").textContent = service || "Not specified";

    // Update avatar URL with new name
    const avatarUrl = `https://ui-avatars.com/api/?background=2eb997&color=fff&size=120&name=${encodeURIComponent(name || "User")}`;

    // Handle uploaded image
    const fileInput = document.getElementById("editImage");
    if (fileInput && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById("profileImage").src = ev.target.result;
        localStorage.setItem("profileImage", ev.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      document.getElementById("profileImage").src = avatarUrl;
      localStorage.setItem("profileImage", avatarUrl);
    }

    // Save to localStorage
    localStorage.setItem("profileName",    name);
    localStorage.setItem("profileId",      id);
    localStorage.setItem("profileEmail",   email);
    localStorage.setItem("profileService", service);

    modal.remove();
    showToast("Profile updated successfully!");
  });
};

/* ===== PROFILE HELPERS ===== */
function getProfileData() {
  return {
    name:      localStorage.getItem("profileName")    || "",
    studentId: localStorage.getItem("profileId")      || "",
    email:     localStorage.getItem("profileEmail")   || "",
    service:   localStorage.getItem("profileService") || "",
  };
}
function loadProfileFromLocalStorage() {
  const d = getProfileData();
  if (d.name)    document.getElementById("full-name").textContent    = d.name;
  if (d.studentId) document.getElementById("student-id").textContent = "Student ID: " + d.studentId;
  if (d.email)   document.getElementById("user-email").textContent   = d.email;
  if (d.service) document.getElementById("service-needed").textContent = d.service;
  const img = localStorage.getItem("profileImage");
  if (img) document.getElementById("profileImage").src = img;
}

/* ===== FAVORITES ===== */
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavBadge();
}
function updateFavBadge() {
  const btns = document.querySelectorAll('[onclick="viewFavorites()"]');
  btns.forEach(btn => {
    let badge = btn.querySelector(".sidebar-badge");
    if (favorites.length > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "sidebar-badge";
        btn.appendChild(badge);
      }
      badge.textContent = favorites.length;
    } else if (badge) {
      badge.remove();
    }
  });
}

window.addFavorite = function () {
  const name    = document.getElementById("provider-name").textContent;
  const service = document.getElementById("provider-service").textContent;
  if (favorites.find((f) => f.name === name)) {
    showToast(`${name} is already in favourites.`, "warn");
    return;
  }
  favorites.push({ name, service });
  saveFavorites();
  showToast(`${name} added to favourites!`);
};

window.viewFavorites = function () {
  createModal("favoritesModal", `<i class="fas fa-heart"></i> My Favourites`, `
    <div id="favoritesList"></div>
  `, "closeFavorites");
  renderFavorites();
};
window.closeFavorites = function () {
  const m = document.getElementById("favoritesModal");
  if (m) m.remove();
};

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  if (!list) return;
  if (favorites.length === 0) {
    list.innerHTML = `<div class="loading" style="padding:30px;">No favourites yet. Browse providers and save ones you like!</div>`;
    return;
  }
  list.innerHTML = favorites.map((f) => `
    <div class="booking-item">
      <div>
        <strong>${f.name}</strong>
        <span style="font-size:12px;color:var(--text-muted);">${f.service}</span>
      </div>
      <div style="display:flex;gap:8px;">
        <button onclick="viewProfile('${allProviders.find(p=>p.name===f.name)?.id||'john'}');closeFavorites();"
          style="background:var(--accent-light);color:var(--accent-dark);border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;">
          View
        </button>
        <button onclick="removeFavorite('${f.name}')"
          style="background:rgba(239,68,68,0.1);color:#dc2626;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;">
          Remove
        </button>
      </div>
    </div>`).join("");
}

window.removeFavorite = function (name) {
  favorites = favorites.filter((f) => f.name !== name);
  saveFavorites();
  renderFavorites();
  showToast(`${name} removed from favourites.`);
};

/* ===== BOOKINGS ===== */
let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

// Pre-seed demo bookings if empty
if (bookings.length === 0) {
  bookings = [
    { provider: "John Mokoena",  service: "Math Tutoring Session", date: "2026-04-25", time: "15:00" },
    { provider: "Sam Nkosi",     service: "Fitness Training",      date: "2026-04-27", time: "10:00" },
  ];
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
  updateStatCard();
}

window.viewBookings = function () {
  createModal("bookingsModal", `<i class="fas fa-calendar-alt"></i> My Bookings`, `
    <div id="bookingsList"></div>
    <div class="modal-divider"></div>
    <h3 style="font-size:15px;font-weight:700;margin-bottom:14px;color:var(--text-primary);">Book a New Session</h3>
    <form id="bookingForm">
      <label>Provider Name</label>
      <input type="text" id="bookProvider" placeholder="e.g. John Mokoena" required>
      <label>Service</label>
      <input type="text" id="bookService" placeholder="e.g. Math Tutoring" required>
      <label>Date</label>
      <input type="date" id="bookDate" required>
      <label>Time</label>
      <input type="time" id="bookTime" required>
      <button type="submit"><i class="fas fa-calendar-plus"></i> Confirm Booking</button>
    </form>
  `, "closeBookings");
  renderBookings();

  const form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const booking = {
        provider: document.getElementById("bookProvider").value.trim(),
        service:  document.getElementById("bookService").value.trim(),
        date:     document.getElementById("bookDate").value,
        time:     document.getElementById("bookTime").value,
      };
      bookings.push(booking);
      saveBookings();
      renderBookings();
      form.reset();
      showToast("Booking confirmed!");
    });
  }
};
window.closeBookings = function () {
  const m = document.getElementById("bookingsModal");
  if (m) m.remove();
};

function openBookingForm(providerName) {
  window.viewBookings();
  setTimeout(() => {
    const inp = document.getElementById("bookProvider");
    if (inp) inp.value = providerName;
  }, 100);
}

function renderBookings() {
  const list = document.getElementById("bookingsList");
  if (!list) return;
  if (bookings.length === 0) {
    list.innerHTML = `<div class="loading" style="padding:20px;">No bookings yet.</div>`;
    return;
  }
  list.innerHTML = bookings.map((b, i) => `
    <div class="booking-item">
      <div>
        <strong>${b.service}</strong>
        <span style="font-size:12px;color:var(--text-muted);">with ${b.provider} · ${formatDate(b.date)} at ${b.time}</span>
      </div>
      <button onclick="cancelBooking(${i})"
        style="background:rgba(239,68,68,0.1);color:#dc2626;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;white-space:nowrap;">
        Cancel
      </button>
    </div>`).join("");
}

window.cancelBooking = function (index) {
  if (confirm("Cancel this booking?")) {
    bookings.splice(index, 1);
    saveBookings();
    renderBookings();
    showToast("Booking cancelled.");
  }
};

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* ===== STATS CARD UPDATE ===== */
function updateStatCard() {
  const booked  = document.querySelector(".stat-item:nth-child(1) strong");
  const favStat = document.querySelector(".stat-item:nth-child(3) strong");
  if (booked)  booked.textContent  = bookings.length;
  if (favStat) favStat.textContent = favorites.length;
}

/* ===== VIEW ALL RECOMMENDED ===== */
window.viewAllRecommended = function () {
  renderProviders(allProviders, "All Recommended Providers");
  document.querySelector(".providers-section").scrollIntoView({ behavior: "smooth" });
};

/* ===== MESSAGES ===== */
window.openMessages = function () {
  createModal("messagesModal", `<i class="fas fa-comment-dots"></i> Messages`, `
    <div id="messagesList">
      <div class="booking-item">
        <div><strong>John Mokoena</strong><span style="font-size:12px;color:var(--text-muted);">Hey, are you available this weekend for tutoring?</span></div>
        <span style="font-size:11px;color:var(--text-muted);white-space:nowrap;">2h ago</span>
      </div>
      <div class="booking-item">
        <div><strong>Aisha Mahlangu</strong><span style="font-size:12px;color:var(--text-muted);">Your appointment is confirmed for Saturday.</span></div>
        <span style="font-size:11px;color:var(--text-muted);white-space:nowrap;">Yesterday</span>
      </div>
    </div>
    <div class="modal-divider"></div>
    <div style="display:flex;gap:10px;">
      <input type="text" id="newMessage" placeholder="Type a message..." style="flex:1;">
      <button type="button" onclick="sendMessage()" style="width:auto;padding:12px 20px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:white;border:none;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;">Send</button>
    </div>
  `, "closeMessages");
};
window.closeMessages = function () {
  const m = document.getElementById("messagesModal");
  if (m) m.remove();
};
window.sendMessage = function () {
  const input = document.getElementById("newMessage");
  if (!input || !input.value.trim()) return;
  const msgsSent = document.querySelector(".stat-item:nth-child(2) strong");
  if (msgsSent) msgsSent.textContent = parseInt(msgsSent.textContent || 0) + 1;
  showToast("Message sent!");
  input.value = "";
};

/* ===== SAVED LISTINGS ===== */
window.openSaved = function () {
  window.viewFavorites();
};

/* ===== SETTINGS ===== */
window.openSettings = function () {
  const darkOn = localStorage.getItem("darkMode") === "true";
  const notifOn = localStorage.getItem("notifications") !== "false";
  const largeText = localStorage.getItem("largeText") === "true";
  const privacy = localStorage.getItem("privacyMode") === "true";
  const themeColor = localStorage.getItem("themeColor") || "#3db8b8";

  createModal("settingsModal", `<i class="fas fa-cog"></i> Settings`, `
    <div class="settings-section">
      <h3>Appearance</h3>
      <div class="settings-row">
        <div class="settings-row-label"><i class="fas fa-moon"></i> Dark Mode</div>
        <label class="toggle-switch">
          <input type="checkbox" id="darkModeToggle" ${darkOn ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <div class="settings-row-label"><i class="fas fa-text-height"></i> Large Text</div>
        <label class="toggle-switch">
          <input type="checkbox" id="largeTextToggle" ${largeText ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <div class="settings-row-label"><i class="fas fa-palette"></i> Accent Color</div>
        <div class="color-row">
          <input type="color" id="themeColorPicker" value="${themeColor}">
          <button type="button" onclick="resetThemeColor()" style="background:var(--bg-surface);color:var(--text-secondary);border:1.5px solid var(--border);padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;font-family:'Poppins',sans-serif;">Reset</button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Notifications & Privacy</h3>
      <div class="settings-row">
        <div class="settings-row-label"><i class="fas fa-bell"></i> Notifications</div>
        <label class="toggle-switch">
          <input type="checkbox" id="notifToggle" ${notifOn ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <div class="settings-row-label"><i class="fas fa-user-shield"></i> Privacy Mode</div>
        <label class="toggle-switch">
          <input type="checkbox" id="privacyToggle" ${privacy ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h3>Language</h3>
      <div class="settings-row">
        <div class="settings-row-label"><i class="fas fa-globe"></i> Language</div>
        <select id="langSelect" style="width:auto;padding:8px 14px;border-radius:8px;border:1.5px solid var(--border);font-family:'Poppins',sans-serif;font-size:13px;background:var(--bg-surface);color:var(--text-primary);margin:0;cursor:pointer;">
          <option value="en" ${localStorage.getItem("language") !== "xh" ? "selected" : ""}>English</option>
          <option value="xh" ${localStorage.getItem("language") === "xh" ? "selected" : ""}>isiXhosa</option>
        </select>
      </div>
    </div>

    <div class="settings-section">
      <h3>Account</h3>
      <div style="margin-bottom:16px;">
        <label>Current Password</label>
        <input type="password" id="oldPass" placeholder="Enter current password">
        <label>New Password</label>
        <input type="password" id="newPass" placeholder="At least 6 characters">
        <label>Confirm New Password</label>
        <input type="password" id="confirmPass" placeholder="Repeat new password">
        <button type="button" onclick="handlePasswordChange()" style="background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:white;border:none;padding:12px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;width:100%;margin-top:4px;">Update Password</button>
      </div>
      <button type="button" onclick="exportData()" style="background:var(--bg-surface);color:var(--text-primary);border:1.5px solid var(--border);padding:11px 20px;border-radius:10px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;width:100%;">
        <i class="fas fa-download" style="margin-right:8px;color:var(--accent);"></i>Export My Data
      </button>
    </div>
  `, "closeSettings");

  // Bind toggles
  document.getElementById("darkModeToggle").addEventListener("change", function () {
    document.body.classList.toggle("dark-mode", this.checked);
    localStorage.setItem("darkMode", this.checked);
    showToast("Dark mode " + (this.checked ? "enabled" : "disabled"));
  });
  document.getElementById("largeTextToggle").addEventListener("change", function () {
    document.body.classList.toggle("large-text", this.checked);
    localStorage.setItem("largeText", this.checked);
    showToast("Large text " + (this.checked ? "enabled" : "disabled"));
  });
  document.getElementById("notifToggle").addEventListener("change", function () {
    const badge = document.querySelector(".notification-badge");
    if (badge) badge.style.display = this.checked ? "" : "none";
    localStorage.setItem("notifications", this.checked);
    showToast("Notifications " + (this.checked ? "enabled" : "disabled"));
  });
  document.getElementById("privacyToggle").addEventListener("change", function () {
    togglePrivacyMode(this.checked);
  });
  document.getElementById("themeColorPicker").addEventListener("input", function () {
    updateThemeColor(this.value);
  });
  document.getElementById("langSelect").addEventListener("change", function () {
    changeLanguage(this.value);
  });
};
window.closeSettings = function () {
  const m = document.getElementById("settingsModal");
  if (m) m.remove();
};

function handlePasswordChange() {
  const oldPass     = document.getElementById("oldPass").value;
  const newPass     = document.getElementById("newPass").value;
  const confirmPass = document.getElementById("confirmPass").value;
  const stored      = localStorage.getItem("password") || "1234";
  if (!oldPass || !newPass || !confirmPass) { showToast("Please fill in all password fields.", "warn"); return; }
  if (oldPass !== stored) { showToast("Current password is incorrect.", "error"); return; }
  if (newPass.length < 6)  { showToast("New password must be at least 6 characters.", "warn"); return; }
  if (newPass !== confirmPass) { showToast("Passwords do not match.", "error"); return; }
  localStorage.setItem("password", newPass);
  showToast("Password updated successfully!");
  document.getElementById("oldPass").value = "";
  document.getElementById("newPass").value = "";
  document.getElementById("confirmPass").value = "";
}

/* ===== THEME COLOR ===== */
function updateThemeColor(color) {
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-color", color);
  localStorage.setItem("themeColor", color);
}
window.resetThemeColor = function () {
  updateThemeColor("#3db8b8");
  const picker = document.getElementById("themeColorPicker");
  if (picker) picker.value = "#3db8b8";
  showToast("Accent color reset.");
};
function loadThemeColor() {
  const color = localStorage.getItem("themeColor");
  if (color) updateThemeColor(color);
}

/* ===== LANGUAGE ===== */
function changeLanguage(lang) {
  const input = document.getElementById("searchInput");
  if (!input) return;
  if (lang === "xh") {
    input.placeholder = "Khangela ngegama, inkonzo, ikhampasi...";
    showToast("Ulwimi olusethiwe: isiXhosa");
  } else {
    input.placeholder = "Search by name, service, campus...";
    showToast("Language set to English");
  }
  localStorage.setItem("language", lang);
}

/* ===== PRIVACY MODE ===== */
function togglePrivacyMode(enable) {
  if (enable) {
    document.getElementById("full-name").textContent = "Hidden";
    document.getElementById("student-id").textContent = "Student ID: Hidden";
    document.getElementById("user-email").textContent = "Hidden";
    document.getElementById("service-needed").textContent = "Hidden";
    localStorage.setItem("privacyMode", "true");
    showToast("Privacy mode enabled");
  } else {
    loadProfileFromLocalStorage();
    localStorage.setItem("privacyMode", "false");
    showToast("Privacy mode disabled");
  }
}

/* ===== DATA EXPORT ===== */
function exportData() {
  const data = {
    profile: getProfileData(),
    favorites,
    bookings,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "campus-connect-data.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported successfully!");
}

/* ===== MODAL HELPER ===== */
function createModal(id, titleHtml, bodyHtml, closeFn) {
  // Remove existing if any
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = id;
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="window['${closeFn}']()">&times;</span>
      <h2>${titleHtml}</h2>
      ${bodyHtml}
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = "flex";

  // Close on backdrop click
  modal.addEventListener("click", function (e) {
    if (e.target === modal) window[closeFn]();
  });
}

/* ===== CLOSE MODALS ON BACKDROP CLICK ===== */
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

/* ===== KEYBOARD ESC TO CLOSE ===== */
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((m) => {
      if (m.style.display === "flex" || m.style.display === "block") {
        m.style.display = "none";
        if (!m.id) m.remove();
      }
    });
    closeSidebar();
  }
});

/* ===== ON PAGE LOAD ===== */
document.addEventListener("DOMContentLoaded", function () {
  loadProfileFromLocalStorage();
  loadThemeColor();

  // Dark mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  // Large text
  if (localStorage.getItem("largeText") === "true") {
    document.body.classList.add("large-text");
  }
  // Language
  const lang = localStorage.getItem("language") || "en";
  changeLanguage(lang);

  // Notifications badge
  if (localStorage.getItem("notifications") === "false") {
    const badge = document.querySelector(".notification-badge");
    if (badge) badge.style.display = "none";
  }

  // Privacy mode
  if (localStorage.getItem("privacyMode") === "true") {
    togglePrivacyMode(true);
  }

  // Render top providers
  renderProviders(allProviders.slice(0, 6));

  // Update stats
  updateStatCard();
  updateFavBadge();
});