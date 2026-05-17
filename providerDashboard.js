(function() {
  // ========== DOM ELEMENTS ==========
  const drawerOverlay = document.getElementById('drawerOverlay');
  const menuToggle = document.getElementById('menuToggle');
  const profileBtn = document.getElementById('profileCircleBtn');
  const profileModal = document.getElementById('profileModal');
  const passwordModal = document.getElementById('passwordModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const saveAllBtn = document.getElementById('saveAllBtn');
  const changePwBtn = document.getElementById('changePwBtn');
  const closePwModal = document.getElementById('closePwModalBtn');
  const cancelPwBtn = document.getElementById('cancelPwBtn');
  const submitPw = document.getElementById('submitPwBtn');
  const viewBookingsBtn = document.getElementById('viewBookingsBtn');
  const addServiceBtnDashboard = document.getElementById('addServiceBtn');
  const checkNotifBtn = document.getElementById('checkNotifBtn');
  const logoutBtnTop = document.getElementById('logoutBtnTop');
  const clearNotifBtn = document.getElementById('clearNotifBtn');
  const newMsgBtn = document.getElementById('newMsgBtn');

  // Profile fields
  const fullNameInput = document.getElementById('fullNameInput');
  const emailInput = document.getElementById('emailInput');
  const editNameIcon = document.getElementById('editNameIcon');
  const editEmailIcon = document.getElementById('editEmailIcon');
  const uploadPicBtn = document.getElementById('uploadPicBtn');
  const profilePicInput = document.getElementById('profilePicInput');
  const largeAvatarPlaceholder = document.getElementById('largeAvatarPlaceholder');
  const largeAvatarImg = document.getElementById('largeAvatarImg');

  // ========== DATA STATE ==========
  let bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
  let services = JSON.parse(localStorage.getItem('userServices')) || [];
  let notifications = JSON.parse(localStorage.getItem('liveNotifications')) || [];

  // Sample default data if empty
  if (services.length === 0) {
    services = [
      { id: 1, name: "Math Tutoring", category: "Tutoring", price: "$25/hr" },
      { id: 2, name: "Photography", category: "Photography", price: "$35/session" }
    ];
    localStorage.setItem('userServices', JSON.stringify(services));
  }

  if (bookings.length === 0) {
    bookings = [
      { id: 1, service: "Math Tutoring", client: "Emily Chen", date: "2024-01-20", time: "2:00 PM", status: "confirmed" },
      { id: 2, service: "Photography", client: "Marcus Williams", date: "2024-01-21", time: "4:00 PM", status: "pending" }
    ];
    localStorage.setItem('userBookings', JSON.stringify(bookings));
  }

  if (notifications.length === 0) {
    notifications = [
      { id: 1, message: "📘 Welcome to Campus Connect!", time: "Just now", read: false },
      { id: 2, message: "✨ Complete your profile to get more clients", time: "Just now", read: false }
    ];
    localStorage.setItem('liveNotifications', JSON.stringify(notifications));
  }

  // ========== HELPER FUNCTIONS ==========
  function saveAllData() {
    localStorage.setItem('userBookings', JSON.stringify(bookings));
    localStorage.setItem('userServices', JSON.stringify(services));
    localStorage.setItem('liveNotifications', JSON.stringify(notifications));
  }

  function showToast(message, type = "success") {
    let toast = document.getElementById('successToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'successToast';
      toast.className = 'toast-message';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.background = type === "error" ? "#dc3545" : type === "warn" ? "#ffc107" : "#1f6392";
    toast.style.color = type === "warn" ? "#333" : "white";
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  function updateStatsUI() {
    document.getElementById('bookingsCount').innerText = bookings.length;
    document.getElementById('servicesCount').innerText = services.length;
    updateProgress();
  }

  function updateProgress() {
    let score = 0;
    let total = 0;
    
    total += 30;
    score += Math.min(services.length * 10, 30);
    
    total += 40;
    score += Math.min(bookings.length * 10, 40);
    
    let percent = Math.min(Math.floor((score / total) * 100), 100);
    
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressMsg = document.getElementById('progressMessage');
    
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressPercent) progressPercent.innerText = percent + '%';
    
    if (progressMsg) {
      if (percent >= 80) {
        progressMsg.innerText = "🏆 Excellent progress! Keep it up.";
      } else if (percent >= 50) {
        progressMsg.innerText = "🎯 You're on track with your goals!";
      } else {
        progressMsg.innerText = "📚 Add more services to boost progress!";
      }
    }
  }

  // Update Notifications Display
  function updateNotificationsUI() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.innerText = unreadCount + ' new';
      badge.style.background = unreadCount > 0 ? '#f59e0b' : '#ffedd5';
    }
    
    if (notifications.length === 0) {
      container.innerHTML = '<div class="empty-message">✨ No new notifications</div>';
      return;
    }
    
    const recentNotifs = notifications.slice(0, 8);
    container.innerHTML = recentNotifs.map(notif => `
      <div class="notif-item ${!notif.read ? 'unread' : ''}" data-id="${notif.id}">
        <p>${notif.message}</p>
        <div class="notif-time">${notif.time}</div>
      </div>
    `).join('');
    
    document.querySelectorAll('#notificationsList .notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.id);
        const notif = notifications.find(n => n.id === id);
        if (notif && !notif.read) {
          notif.read = true;
          saveAllData();
          updateNotificationsUI();
          showToast('Marked as read');
        }
      });
    });
  }

  function addNotification(message) {
    const newNotif = {
      id: Date.now(),
      message: message,
      time: "Just now",
      read: false
    };
    notifications.unshift(newNotif);
    if (notifications.length > 20) notifications.pop();
    saveAllData();
    updateNotificationsUI();
    showToast(message);
  }

  function clearAllNotifications() {
    notifications = [];
    saveAllData();
    updateNotificationsUI();
    showToast("✨ All notifications cleared");
  }

  // ========== SETTINGS FUNCTIONS ==========
  function renderSettingsPage() {
    const darkOn = localStorage.getItem("darkMode") === "true";
    const notifOn = localStorage.getItem("notifications") !== "false";
    const largeText = localStorage.getItem("largeText") === "true";
    const privacy = localStorage.getItem("privacyMode") === "true";
    const themeColor = localStorage.getItem("themeColor") || "#1f6392";
    const language = localStorage.getItem("language") || "en";

    return `
      <div class="settings-container">
        <h2 style="margin-bottom: 1.5rem;"><i class="fas fa-cog"></i> Settings</h2>
        
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
              <button type="button" id="resetColorBtn" class="action-btn" style="padding:6px 12px;">Reset</button>
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
            <select id="langSelect" class="input-field" style="width: auto; padding: 8px 14px;">
              <option value="en" ${language === "en" ? "selected" : ""}>English</option>
              <option value="xh" ${language === "xh" ? "selected" : ""}>isiXhosa</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>Account</h3>
          <div style="margin-bottom: 16px;">
            <label>Current Password</label>
            <input type="password" id="oldPass" class="input-field" placeholder="Enter current password" style="margin-bottom: 10px;">
            <label>New Password</label>
            <input type="password" id="newPass" class="input-field" placeholder="At least 6 characters" style="margin-bottom: 10px;">
            <label>Confirm New Password</label>
            <input type="password" id="confirmPass" class="input-field" placeholder="Repeat new password" style="margin-bottom: 10px;">
            <button type="button" id="updatePwdBtn" class="btn-save" style="width:100%;">Update Password</button>
          </div>
          <button type="button" id="exportDataBtn" class="action-btn" style="width:100%;">
            <i class="fas fa-download"></i> Export My Data
          </button>
        </div>
      </div>
    `;
  }

  function attachSettingsEventListeners() {
    // Dark Mode Toggle
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
      darkToggle.addEventListener('change', function () {
        document.body.classList.toggle("dark-mode", this.checked);
        localStorage.setItem("darkMode", this.checked);
        showToast("Dark mode " + (this.checked ? "enabled" : "disabled"));
      });
    }

    // Large Text Toggle
    const largeTextToggle = document.getElementById('largeTextToggle');
    if (largeTextToggle) {
      largeTextToggle.addEventListener('change', function () {
        document.body.classList.toggle("large-text", this.checked);
        localStorage.setItem("largeText", this.checked);
        showToast("Large text " + (this.checked ? "enabled" : "disabled"));
      });
    }

    // Notifications Toggle
    const notifToggle = document.getElementById('notifToggle');
    if (notifToggle) {
      notifToggle.addEventListener('change', function () {
        localStorage.setItem("notifications", this.checked);
        showToast("Notifications " + (this.checked ? "enabled" : "disabled"));
      });
    }

    // Privacy Mode Toggle
    const privacyToggle = document.getElementById('privacyToggle');
    if (privacyToggle) {
      privacyToggle.addEventListener('change', function () {
        localStorage.setItem("privacyMode", this.checked);
        showToast("Privacy mode " + (this.checked ? "enabled" : "disabled"));
      });
    }

    // Theme Color Picker
    const colorPicker = document.getElementById('themeColorPicker');
    if (colorPicker) {
      colorPicker.addEventListener('input', function () {
        updateThemeColor(this.value);
      });
    }

    // Reset Color Button
    const resetColorBtn = document.getElementById('resetColorBtn');
    if (resetColorBtn) {
      resetColorBtn.addEventListener('click', function () {
        resetThemeColor();
      });
    }

    // Language Select
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', function () {
        changeLanguage(this.value);
      });
    }

    // Update Password Button
    const updatePwdBtn = document.getElementById('updatePwdBtn');
    if (updatePwdBtn) {
      updatePwdBtn.addEventListener('click', function () {
        handlePasswordChange();
      });
    }

    // Export Data Button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', function () {
        exportData();
      });
    }
  }

  function handlePasswordChange() {
    const oldPass = document.getElementById("oldPass")?.value || "";
    const newPass = document.getElementById("newPass")?.value || "";
    const confirmPass = document.getElementById("confirmPass")?.value || "";
    const stored = localStorage.getItem("password") || "1234";
    
    if (!oldPass || !newPass || !confirmPass) { 
      showToast("Please fill in all password fields.", "warn"); 
      return; 
    }
    if (oldPass !== stored) { 
      showToast("Current password is incorrect.", "error"); 
      return; 
    }
    if (newPass.length < 6) { 
      showToast("New password must be at least 6 characters.", "warn"); 
      return; 
    }
    if (newPass !== confirmPass) { 
      showToast("Passwords do not match.", "error"); 
      return; 
    }
    localStorage.setItem("password", newPass);
    showToast("Password updated successfully!");
    
    const oldPassInput = document.getElementById("oldPass");
    const newPassInput = document.getElementById("newPass");
    const confirmPassInput = document.getElementById("confirmPass");
    if (oldPassInput) oldPassInput.value = "";
    if (newPassInput) newPassInput.value = "";
    if (confirmPassInput) confirmPassInput.value = "";
  }

  function exportData() {
    const data = {
      darkMode: localStorage.getItem("darkMode"),
      notifications: localStorage.getItem("notifications"),
      largeText: localStorage.getItem("largeText"),
      privacyMode: localStorage.getItem("privacyMode"),
      themeColor: localStorage.getItem("themeColor"),
      language: localStorage.getItem("language"),
      profileName: localStorage.getItem("profileName"),
      profileEmail: localStorage.getItem("profileEmail"),
      bookings: bookings.length,
      services: services.length
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "campus_connect_data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully!");
  }

  function updateThemeColor(color) {
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--accent-dark", color);
    localStorage.setItem("themeColor", color);
    showToast("Accent color updated");
  }

  function resetThemeColor() {
    updateThemeColor("#1f6392");
    const picker = document.getElementById("themeColorPicker");
    if (picker) picker.value = "#1f6392";
    showToast("Accent color reset.");
  }

  function changeLanguage(lang) {
    localStorage.setItem("language", lang);
    if (lang === "xh") {
      showToast("Ulwimi lutshintshile (isiXhosa - demo)");
    } else {
      showToast("Language changed to English");
    }
  }

  function loadSettings() {
    const darkOn = localStorage.getItem("darkMode") === "true";
    const largeText = localStorage.getItem("largeText") === "true";
    const themeColor = localStorage.getItem("themeColor") || "#1f6392";
    
    if (darkOn) document.body.classList.add("dark-mode");
    if (largeText) document.body.classList.add("large-text");
    updateThemeColor(themeColor);
  }

  // ========== MODAL FUNCTIONS ==========
  function showModal(modal) { 
    if (modal) modal.style.display = 'flex'; 
  }
  
  function hideModal(modal) { 
    if (modal) modal.style.display = 'none'; 
  }

  // ========== PROFILE FUNCTIONS ==========
  function handleSaveProfile() {
    const newName = fullNameInput.value.trim();
    const newEmail = emailInput.value.trim();
    if (newName) {
      localStorage.setItem("profileName", newName);
      localStorage.setItem("profileEmail", newEmail);
      showToast(`✅ Profile updated!`);
    } else {
      showToast("Please enter a valid name", "warn");
    }
    hideModal(profileModal);
  }

  function loadProfileData() {
    const savedName = localStorage.getItem("profileName");
    const savedEmail = localStorage.getItem("profileEmail");
    if (savedName) fullNameInput.value = savedName;
    if (savedEmail) emailInput.value = savedEmail;
  }

  function loadAvatar() {
    const savedAvatar = localStorage.getItem("profileAvatar");
    if (savedAvatar && largeAvatarImg) {
      largeAvatarImg.src = savedAvatar;
      largeAvatarImg.style.display = 'block';
      if (largeAvatarPlaceholder) largeAvatarPlaceholder.style.display = 'none';
    }
  }

  // Image Upload
  if (uploadPicBtn) {
    uploadPicBtn.addEventListener('click', () => profilePicInput.click());
  }
  if (profilePicInput) {
    profilePicInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          const imgUrl = ev.target.result;
          if (largeAvatarImg) {
            largeAvatarImg.src = imgUrl;
            largeAvatarImg.style.display = 'block';
          }
          if (largeAvatarPlaceholder) largeAvatarPlaceholder.style.display = 'none';
          localStorage.setItem("profileAvatar", imgUrl);
          showToast("Profile picture updated!");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (editNameIcon) {
    editNameIcon.addEventListener('click', () => showToast(`✏️ Name updated to: ${fullNameInput.value}`));
  }
  if (editEmailIcon) {
    editEmailIcon.addEventListener('click', () => showToast(`✉️ Email updated to: ${emailInput.value}`));
  }

  // ========== PASSWORD MODAL ==========
  if (changePwBtn) {
    changePwBtn.addEventListener('click', () => { 
      hideModal(profileModal); 
      showModal(passwordModal); 
    });
  }
  
  function closePasswordModal() { 
    hideModal(passwordModal);
    const currentPw = document.getElementById('currentPassword');
    const newPw = document.getElementById('newPassword');
    const confirmPw = document.getElementById('confirmPassword');
    if (currentPw) currentPw.value = '';
    if (newPw) newPw.value = '';
    if (confirmPw) confirmPw.value = '';
  }
  
  if (closePwModal) closePwModal.addEventListener('click', closePasswordModal);
  if (cancelPwBtn) cancelPwBtn.addEventListener('click', closePasswordModal);
  
  if (submitPw) {
    submitPw.addEventListener('click', () => {
      const cur = document.getElementById('currentPassword')?.value || '';
      const newPw = document.getElementById('newPassword')?.value || '';
      const confirm = document.getElementById('confirmPassword')?.value || '';
      
      if (!cur) { 
        showToast("❌ Please enter current password", "error"); 
        return; 
      }
      if (newPw.length < 6) { 
        showToast("⚠️ New password must be at least 6 characters", "warn"); 
        return; 
      }
      if (newPw !== confirm) { 
        showToast("❌ Passwords do not match", "error"); 
        return; 
      }
      localStorage.setItem("password", newPw);
      showToast("🔐 Password changed successfully!");
      closePasswordModal();
    });
  }

  // ========== BUTTON EVENT LISTENERS ==========

  // Add Service Button - Redirect to startHustle.html
  if (addServiceBtnDashboard) {
    addServiceBtnDashboard.addEventListener('click', () => {
      window.location.href = "startHustle.html";
    });
  }

  // View Bookings Button - Show modal with bookings
  if (viewBookingsBtn) {
    viewBookingsBtn.addEventListener('click', () => {
      const container = document.getElementById('bookingsListModal');
      if (!container) return;
      
      if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-message">No bookings yet. Add a booking!</div>';
      } else {
        container.innerHTML = bookings.map(b => `
          <div class="booking-item">
            <div class="booking-title">📖 ${b.service}</div>
            <div>👤 Client: ${b.client}</div>
            <div>📅 ${b.date} at ${b.time}</div>
            <div>📌 Status: ${b.status}</div>
          </div>
        `).join('');
      }
      document.getElementById('viewBookingsModal').style.display = 'flex';
    });
  }

  // Check Notifications Button
  if (checkNotifBtn) {
    checkNotifBtn.addEventListener('click', () => {
      const unreadCount = notifications.filter(n => !n.read).length;
      showToast(`🔔 You have ${unreadCount} new notifications!`);
    });
  }

  // Clear Notifications Button
  if (clearNotifBtn) {
    clearNotifBtn.addEventListener('click', () => {
      clearAllNotifications();
    });
  }

  // New Message Button
  if (newMsgBtn) {
    newMsgBtn.addEventListener('click', () => {
      const receiver = prompt("Enter recipient name:");
      if (receiver) {
        const message = prompt("Enter your message:");
        if (message) {
          addNotification(`💬 Message sent to ${receiver}: "${message.substring(0, 30)}..."`);
        }
      }
    });
  }

  // Logout Button - Redirect to homepage (index.html)
  if (logoutBtnTop) {
    logoutBtnTop.addEventListener('click', () => {
      if (confirm("🚪 Are you sure you want to logout?")) {
        showToast("Logged out successfully!");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      }
    });
  }

  // Profile Button
  if (profileBtn) {
    profileBtn.addEventListener('click', () => { 
      loadProfileData();
      loadAvatar();
      showModal(profileModal); 
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', () => hideModal(profileModal));
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => hideModal(profileModal));
  if (saveAllBtn) saveAllBtn.addEventListener('click', handleSaveProfile);

  // ========== DRAWER NAVIGATION ==========
  function closeDrawer() { 
    if (drawerOverlay) drawerOverlay.classList.remove('open'); 
  }
  
  function openDrawer() { 
    if (drawerOverlay) drawerOverlay.classList.add('open'); 
  }
  
  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      openDrawer(); 
    });
  }
  
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', (e) => { 
      if (e.target === drawerOverlay) closeDrawer(); 
    });
  }

  const dashboardGrid = document.getElementById('dashboardGrid');
  const mainContentDiv = document.getElementById('mainContent');

  function setActiveSection(sectionId) {
    if (sectionId === 'dashboard') {
      if (dashboardGrid) dashboardGrid.style.display = 'grid';
      if (mainContentDiv) mainContentDiv.style.display = 'none';
      closeDrawer();
      updateStatsUI();
      return;
    }
    
    if (dashboardGrid) dashboardGrid.style.display = 'none';
    if (mainContentDiv) mainContentDiv.style.display = 'block';
    closeDrawer();

    if (sectionId === 'settings') {
      mainContentDiv.innerHTML = renderSettingsPage();
      attachSettingsEventListeners();
    } 
    else if (sectionId === 'favorites') {
      mainContentDiv.innerHTML = `
        <div class="actions-card" style="max-width: 600px; margin: 0 auto;">
          <h2 style="margin-bottom: 1rem;">❤️ Favorites</h2>
          <p>Your saved services: "Group Study Session", "Web Dev Workshop", "Math Tutoring"</p>
          <button id="clearFavDemo" class="action-btn" style="margin-top: 1rem;">Clear Favorites</button>
          <button id="backToDashboard" class="action-btn" style="margin-top: 1rem;">Back to Dashboard</button>
        </div>
      `;
      const clearBtn = document.getElementById('clearFavDemo');
      if (clearBtn) {
        clearBtn.onclick = () => { 
          const p = mainContentDiv.querySelector('p');
          if (p) p.innerHTML = 'No favorites yet. Start exploring!'; 
          showToast("🗑️ Favorites cleared"); 
        };
      }
      document.getElementById('backToDashboard')?.addEventListener('click', () => setActiveSection('dashboard'));
    }
    else if (sectionId === 'myservices') {
      mainContentDiv.innerHTML = `
        <div class="actions-card" style="max-width: 600px; margin: 0 auto;">
          <h2 style="margin-bottom: 1rem;">🛠️ My Services</h2>
          <div id="myServicesList"></div>
          <button id="backToDashboard" class="action-btn" style="margin-top: 1rem;">Back to Dashboard</button>
        </div>
      `;
      const listContainer = document.getElementById('myServicesList');
      if (listContainer) {
        if (services.length === 0) {
          listContainer.innerHTML = '<p>No services yet. Click "Add New Service" to get started!</p>';
        } else {
          listContainer.innerHTML = services.map(s => `
            <div class="booking-item" style="margin-bottom: 10px;">
              <div class="booking-title">${s.name}</div>
              <div>${s.category} | ${s.price}</div>
            </div>
          `).join('');
        }
      }
      document.getElementById('backToDashboard')?.addEventListener('click', () => setActiveSection('dashboard'));
    }
    else if (sectionId === 'help') {
      mainContentDiv.innerHTML = `
        <div class="actions-card" style="max-width: 600px; margin: 0 auto;">
          <h2 style="margin-bottom: 1rem;">📞 Help & Support</h2>
          <p>📧 Email: support@campusconnect.edu</p>
          <p>📍 Campus Connect Help Center</p>
          <button id="backToDashboard" class="action-btn" style="margin-top: 1rem;">Back to Dashboard</button>
        </div>
      `;
      document.getElementById('backToDashboard')?.addEventListener('click', () => setActiveSection('dashboard'));
    }
    else if (sectionId === 'bookings') {
      mainContentDiv.innerHTML = `
        <div class="actions-card" style="max-width: 600px; margin: 0 auto;">
          <h2 style="margin-bottom: 1rem;">📅 My Bookings</h2>
          <div id="myBookingsList"></div>
          <button id="backToDashboard" class="action-btn" style="margin-top: 1rem;">Back to Dashboard</button>
        </div>
      `;
      const listContainer = document.getElementById('myBookingsList');
      if (listContainer) {
        if (bookings.length === 0) {
          listContainer.innerHTML = '<p>No bookings yet.</p>';
        } else {
          listContainer.innerHTML = bookings.map(b => `
            <div class="booking-item" style="margin-bottom: 10px;">
              <div class="booking-title">📖 ${b.service}</div>
              <div>👤 Client: ${b.client}</div>
              <div>📅 ${b.date} at ${b.time}</div>
              <div>📌 Status: ${b.status}</div>
            </div>
          `).join('');
        }
      }
      document.getElementById('backToDashboard')?.addEventListener('click', () => setActiveSection('dashboard'));
    }
    else {
      mainContentDiv.innerHTML = `
        <div class="actions-card" style="max-width: 600px; margin: 0 auto;">
          <h2>${sectionId}</h2>
          <p>This page is coming soon!</p>
          <button id="backToDashboard" class="action-btn" style="margin-top: 1rem;">Back to Dashboard</button>
        </div>
      `;
      document.getElementById('backToDashboard')?.addEventListener('click', () => setActiveSection('dashboard'));
    }
  }

  const drawerItems = document.querySelectorAll('.drawer-nav-item');
  drawerItems.forEach(item => {
    const section = item.getAttribute('data-section');
    if (section) {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveSection(section);
      });
    }
  });

  // ========== AUTO RANDOM NOTIFICATIONS ==========
  let notificationInterval;
  function startAutoNotifications() {
    if (notificationInterval) clearInterval(notificationInterval);
    notificationInterval = setInterval(() => {
      const messagesList = [
        "⭐ Someone liked your service!",
        "💬 New message waiting for you",
        "📅 Upcoming booking tomorrow",
        "🎉 Your profile was viewed 5 times",
        "💰 New earning opportunity available",
        "👥 Join the campus networking event"
      ];
      const randomMsg = messagesList[Math.floor(Math.random() * messagesList.length)];
      addNotification(randomMsg);
    }, 60000);
  }

  // ========== CLOSE MODAL FUNCTION (global) ==========
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  };

  // ========== INITIALIZE ==========
  function init() {
    updateStatsUI();
    updateNotificationsUI();
    loadSettings();
    startAutoNotifications();
  }

  init();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (notificationInterval) clearInterval(notificationInterval);
  });
})();