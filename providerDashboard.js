(function() {
  // DOM Elements
  const drawerOverlay = document.getElementById('drawerOverlay');
  const menuToggle = document.getElementById('menuToggle');
  const profileBtn = document.getElementById('profileCircleBtn');
  const profileModal = document.getElementById('profileModal');
  const passwordModal = document.getElementById('passwordModal');
  const bookingsModal = document.getElementById('bookingsModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const saveAllBtn = document.getElementById('saveAllBtn');
  const changePwBtn = document.getElementById('changePwBtn');
  const closePwModal = document.getElementById('closePwModalBtn');
  const cancelPwBtn = document.getElementById('cancelPwBtn');
  const submitPw = document.getElementById('submitPwBtn');
  const viewBookingsBtn = document.getElementById('viewBookingsBtn');
  const closeBookingsModal = document.getElementById('closeBookingsModalBtn');
  const closeBookingsFooter = document.getElementById('closeBookingsFooterBtn');
  const addServiceBtnDashboard = document.getElementById('addServiceBtn');
  const checkNotifBtn = document.getElementById('checkNotifBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Profile fields
  const fullNameInput = document.getElementById('fullNameInput');
  const emailInput = document.getElementById('emailInput');
  const editNameIcon = document.getElementById('editNameIcon');
  const editEmailIcon = document.getElementById('editEmailIcon');
  const uploadPicBtn = document.getElementById('uploadPicBtn');
  const profilePicInput = document.getElementById('profilePicInput');
  const largeAvatarPlaceholder = document.getElementById('largeAvatarPlaceholder');
  const largeAvatarImg = document.getElementById('largeAvatarImg');
  const avatarPreviewText = document.getElementById('avatarPreviewText');
  const avatarImage = document.getElementById('avatarImage');

  // Data state
  let bookingCount = 3;
  let servicesCount = 2;

  // Toast function
  function showToast(message, type = "success") {
    // Remove existing toast if any
    const existingToast = document.getElementById('toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.id = "toast";
    toast.className = "toast";
    toast.textContent = message;
    toast.style.background = type === "error" ? "#dc3545" : type === "warn" ? "#ffc107" : "var(--accent)";
    toast.style.color = type === "warn" ? "#333" : "white";
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Helper Functions
  function updateStatsUI() {
    document.getElementById('bookingsCount').innerText = bookingCount;
    document.getElementById('servicesCount').innerText = servicesCount;
    updateProgress();
  }

  function updateProgress() {
    let completed = (bookingCount * 5 + servicesCount * 7);
    let progress = Math.min(100, Math.floor(completed / 2.5));
    if (progress < 10) progress = 35;
    progress = Math.min(100, progress);
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressMsg = document.getElementById('progressMessage');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressPercent) progressPercent.innerText = progress + '%';
    
    if (progressMsg) {
      if (progress >= 80) {
        progressMsg.innerText = "🏆 Excellent progress! Keep it up.";
      } else if (progress >= 50) {
        progressMsg.innerText = "🎯 You're on track with your goals!";
      } else {
        progressMsg.innerText = "📚 Add more services to boost progress!";
      }
    }
  }

  function showModal(modal) { 
    if (modal) modal.style.display = 'flex'; 
  }
  
  function hideModal(modal) { 
    if (modal) modal.style.display = 'none'; 
  }

  // Profile Save Handler
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

  // Load saved profile data
  function loadProfileData() {
    const savedName = localStorage.getItem("profileName");
    const savedEmail = localStorage.getItem("profileEmail");
    if (savedName) fullNameInput.value = savedName;
    if (savedEmail) emailInput.value = savedEmail;
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
          if (avatarImage) {
            avatarImage.src = imgUrl;
            avatarImage.style.display = 'block';
          }
          if (avatarPreviewText) avatarPreviewText.style.display = 'none';
          localStorage.setItem("profileAvatar", imgUrl);
          showToast("Profile picture updated!");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load saved avatar
  function loadAvatar() {
    const savedAvatar = localStorage.getItem("profileAvatar");
    if (savedAvatar && largeAvatarImg && avatarImage) {
      largeAvatarImg.src = savedAvatar;
      largeAvatarImg.style.display = 'block';
      if (largeAvatarPlaceholder) largeAvatarPlaceholder.style.display = 'none';
      avatarImage.src = savedAvatar;
      avatarImage.style.display = 'block';
      if (avatarPreviewText) avatarPreviewText.style.display = 'none';
    }
  }

  if (editNameIcon) {
    editNameIcon.addEventListener('click', () => showToast(`✏️ Name updated to: ${fullNameInput.value}`));
  }
  if (editEmailIcon) {
    editEmailIcon.addEventListener('click', () => showToast(`✉️ Email updated to: ${emailInput.value}`));
  }

  // Password Modal Flow
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


  document.getElementById("addServiceBtn").onclick = function () {
    window.location.href = "startHustle.html"; // replace with your page
  };

  document.getElementById("viewBookingsBtn").onclick = function () {
    window.location.href = "bookings.html"; // replace with your page
  };

  


  
  
  

  function addNewService() {
    servicesCount++;
    updateStatsUI();
    showToast(`✨ New service added! Total: ${servicesCount}`);
  }
  
  if (addServiceBtnDashboard) {
    addServiceBtnDashboard.addEventListener('click', addNewService);
  }

  if (checkNotifBtn) {
    checkNotifBtn.addEventListener('click', () => {
      showToast("🔔 You have 5 new notifications!");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm("🚪 Logout from Campus Connect?")) {
        showToast("Logged out successfully");
      }
    });
  }

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

  // ===== SETTINGS FUNCTIONS - Direct page render =====
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
      bookings: bookingCount,
      services: servicesCount
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

  // DRAWER Navigation Logic
  function closeDrawer() { 
    drawerOverlay.classList.remove('open'); 
  }
  
  function openDrawer() { 
    drawerOverlay.classList.add('open'); 
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
      // Render settings page directly
      mainContentDiv.innerHTML = renderSettingsPage();
      attachSettingsEventListeners();
    } 
    else if (sectionId === 'bookings') {
      mainContentDiv.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">📅 My Bookings</h2>
        <div id="detailedBookingList"></div>
        <button id="simulateBookingBtn" class="action-btn" style="margin-top:1rem;">+ Simulate Booking</button>
      `;
      const listDiv = document.getElementById('detailedBookingList');
      
      function renderBookingList() {
        if (!listDiv) return;
        listDiv.innerHTML = '';
        if (bookingCount === 0) { 
          listDiv.innerHTML = '<p>No bookings yet. Add a service or request.</p>'; 
          return; 
        }
        const items = ["Math Tutoring (Tomorrow 2pm)", "Resume Review (Friday 3pm)", "Group Study (Sat 10am)"];
        for (let i = 0; i < Math.min(bookingCount, items.length); i++) {
          const card = document.createElement('div'); 
          card.className = 'service-card'; 
          card.innerHTML = `<strong>📖 ${items[i]}</strong><div class="notif-time">Confirmed</div>`;
          listDiv.appendChild(card);
        }
      }
      renderBookingList();
      
      const simulateBtn = document.getElementById('simulateBookingBtn');
      if (simulateBtn) {
        simulateBtn.onclick = () => { 
          bookingCount++; 
          updateStatsUI(); 
          renderBookingList(); 
          showToast("➕ New booking added");
        };
      }
    } 
    else if (sectionId === 'favorites') {
      mainContentDiv.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">❤️ Favorites</h2>
        <p>Your saved services: "Group Study Session", "Web Dev Workshop", "Math Tutoring"</p>
        <button id="clearFavDemo" class="action-btn" style="margin-top: 1rem;">Clear Favorites</button>
      `;
      const clearBtn = document.getElementById('clearFavDemo');
      if (clearBtn) {
        clearBtn.onclick = () => { 
          const p = mainContentDiv.querySelector('p');
          if (p) p.innerHTML = 'No favorites yet. Start exploring!'; 
          showToast("🗑️ Favorites cleared"); 
        };
      }
    }
    else if (sectionId === 'myservices') {
      mainContentDiv.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">🛠️ My Services</h2>
        <div id="serviceListRender"></div>
        <button id="quickAddServiceBtn" class="action-btn" style="margin-top:1rem;">+ Quick Service</button>
      `;
      
      function renderServices() {
        const container = document.getElementById('serviceListRender');
        if (!container) return;
        container.innerHTML = '';
        const servicesList = ["📚 Math Tutoring (⭐4.9)", "💻 Web Dev Help (⭐5.0)", "📝 Essay Review (⭐4.7)"];
        for (let i = 0; i < servicesCount && i < servicesList.length; i++) {
          const card = document.createElement('div'); 
          card.className = 'service-card'; 
          card.innerHTML = servicesList[i];
          container.appendChild(card);
        }
        if (servicesCount > servicesList.length) {
          container.innerHTML += `<div class="service-card">+ ${servicesCount - servicesList.length} more services</div>`;
        }
      }
      renderServices();
      
      const quickAdd = document.getElementById('quickAddServiceBtn');
      if (quickAdd) {
        quickAdd.onclick = () => { 
          servicesCount++; 
          updateStatsUI(); 
          renderServices(); 
          showToast("✨ New service added!"); 
        };
      }
    }
    else if (sectionId === 'help') {
  mainContentDiv.innerHTML = `
    <h2 style="margin-bottom: 1.5rem;">📞 Help & Support</h2>
    <div class="faq">
      <h3>❓ FAQs</h3>
      <ul style="margin-left:1rem; line-height:1.6;">
        <li>How to book a service?</li>
        <li>How to rate a provider?</li>
        <li>How to reset my password?</li>
      </ul>
    </div>
    <p style="margin-top:1rem;">📧 Email: support@campusconnect.edu</p>
    <button id="contactSupportBtn" class="action-btn" style="margin-top: 1rem;">Contact Support</button>
    <button id="reportIssueBtn" class="action-btn" style="margin-top: 0.5rem;">Report an Issue</button>
    <button id="feedbackBtn" class="action-btn" style="margin-top: 0.5rem;">Send Feedback</button>
  `;

  // Contact Support → opens a modal form
  const supportBtn = document.getElementById('contactSupportBtn');
  if (supportBtn) {
    supportBtn.onclick = () => {
      openModal(`
        <h3>Contact Support</h3>
        <p>Describe your issue below:</p>
        <textarea id="supportMessage" rows="4" style="width:100%;"></textarea>
        <button id="sendSupportMsg" class="action-btn" style="margin-top:1rem;">Send</button>
      `);
      document.getElementById('sendSupportMsg').onclick = () => {
        const msg = document.getElementById('supportMessage').value;
        if (msg.trim()) {
          showToast("Support request sent! We'll reply within 24h.");
          closeModal();
        } else {
          showToast("Please enter a message before sending.");
        }
      };
    };
  }

  // Report Issue → logs issue locally (could be sent to backend)
  const issueBtn = document.getElementById('reportIssueBtn');
  if (issueBtn) {
    issueBtn.onclick = () => {
      const issue = prompt("Please describe the issue you encountered:");
      if (issue) {
        console.log("Issue reported:", issue); // placeholder for backend call
        showToast("Issue reported! Our team will investigate.");
      }
    };
  }

  // Feedback → collects rating + comment
  const feedbackBtn = document.getElementById('feedbackBtn');
  if (feedbackBtn) {
    feedbackBtn.onclick = () => {
      openModal(`
        <h3>Send Feedback</h3>
        <label>Rate your experience:</label>
        <select id="feedbackRating" style="width:100%; margin-bottom:1rem;">
          <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
          <option value="4">⭐⭐⭐⭐ Good</option>
          <option value="3">⭐⭐⭐ Average</option>
          <option value="2">⭐⭐ Poor</option>
          <option value="1">⭐ Very Poor</option>
        </select>
        <textarea id="feedbackMessage" rows="3" style="width:100%;" placeholder="Your comments..."></textarea>
        <button id="sendFeedback" class="action-btn" style="margin-top:1rem;">Submit</button>
      `);
      document.getElementById('sendFeedback').onclick = () => {
        const rating = document.getElementById('feedbackRating').value;
        const msg = document.getElementById('feedbackMessage').value;
        console.log("Feedback submitted:", { rating, msg }); // placeholder for backend call
        showToast("Thanks for your feedback!");
        closeModal();
      };
    };
  }
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
  
  // Initialize
  setActiveSection('dashboard');
  loadSettings();
  updateStatsUI();
})();