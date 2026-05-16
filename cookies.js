/* ================================================================
   cookie_tracking_and_live_search.js
   Cookie consent, activity tracking, and live search
   ================================================================ */

/* ===== COOKIE MANAGER ===== */
window.CookieManager = {
  hasConsent() {
    return localStorage.getItem("cookieConsent") === "accepted";
  },

  acceptCookies() {
    localStorage.setItem("cookieConsent", "accepted");
    this.hideBanner();

    if (typeof showToast === "function") {
      showToast("Cookies accepted. Activity tracking enabled.");
    }

    updateTrackedStats();

    if (typeof renderRecommended === "function") {
      renderRecommended();
    }
  },

  declineCookies() {
    localStorage.setItem("cookieConsent", "declined");
    this.hideBanner();

    if (typeof showToast === "function") {
      showToast("Cookies declined. Tracking disabled.", "warn");
    }
  },

  hideBanner() {
    const banner = document.getElementById("cookie-banner");
    if (banner) banner.style.display = "none";
  },

  showBanner() {
    const banner = document.getElementById("cookie-banner");
    if (banner) banner.style.display = "flex";
  },

  init() {
    const choice = localStorage.getItem("cookieConsent");

    if (choice === "accepted" || choice === "declined") {
      this.hideBanner();
    } else {
      this.showBanner();
    }
  }
};

/* ===== ACTIVITY STATS ===== */
function getActivityStats() {
  return JSON.parse(
    localStorage.getItem("activityStats") ||
      JSON.stringify({
        viewed: 0,
        favorites: 0,
        booked: 0,
        searches: 0
      })
  );
}

function saveActivityStats(stats) {
  localStorage.setItem("activityStats", JSON.stringify(stats));
}

/* ===== TRACK ACTIVITY ===== */
function trackActivity(type, details = {}) {
  // Only track if cookies were accepted
  if (!CookieManager.hasConsent()) return;

  const stats = getActivityStats();

  switch (type) {
    case "viewed":
      stats.viewed++;
      break;

    case "favorites":
      stats.favorites++;
      break;

    case "booked":
      stats.booked++;
      break;

    case "searches":
      stats.searches++;
      break;
  }

  saveActivityStats(stats);

  // Save detailed activity log
  const log = JSON.parse(localStorage.getItem("activityLog") || "[]");

  log.push({
    type,
    details,
    timestamp: new Date().toISOString()
  });

  // Keep only the latest 100 records
  localStorage.setItem(
    "activityLog",
    JSON.stringify(log.slice(-100))
  );

  updateTrackedStats();
}

/* ===== UPDATE STATS CARD ===== */
function updateTrackedStats() {
  const stats = getActivityStats();

  const viewedEl = document.getElementById("stat-viewed");
  const favEl = document.getElementById("stat-favorites");
  const bookedEl = document.getElementById("stat-booked");

  if (viewedEl) viewedEl.textContent = stats.viewed;
  if (favEl) favEl.textContent = stats.favorites;
  if (bookedEl) bookedEl.textContent = stats.booked;
}

/* ================================================================
   LIVE SEARCH
   ================================================================ */
window.onLiveSearch = function (query) {
  const dropdown = document.getElementById("searchDropdown");

  if (!dropdown) return;

  query = query.trim().toLowerCase();

  // Empty search
  if (!query) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
    return;
  }

  // Track search after short delay
  if (CookieManager.hasConsent()) {
    clearTimeout(window.searchDelay);

    window.searchDelay = setTimeout(() => {
      trackActivity("searches", { query });
      saveRecentSearch(query);
    }, 500);
  }

  // Make sure providers exist
  if (typeof allProviders === "undefined") return;

  // Find matching providers
  const matches = allProviders
    .filter(provider =>
      provider.name.toLowerCase().includes(query) ||
      provider.service.toLowerCase().includes(query)
    )
    .slice(0, 6);

  // No matches
  if (matches.length === 0) {
    dropdown.innerHTML =
      '<div class="search-item">No results found</div>';
    dropdown.style.display = "block";
    return;
  }

  // Build dropdown
  dropdown.innerHTML = matches
    .map(provider => `
      <div class="search-item"
           onclick="viewProfile('${provider.id}'); hideSearchDropdown();">
        <strong>${provider.name}</strong><br>
        <small>${provider.service}</small>
      </div>
    `)
    .join("");

  dropdown.style.display = "block";
};

/* ===== HIDE SEARCH DROPDOWN ===== */
window.hideSearchDropdown = function () {
  const dropdown = document.getElementById("searchDropdown");

  if (dropdown) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
  }
};

/* ===== KEYBOARD SUPPORT ===== */
window.handleKey = function (event) {
  if (event.key === "Escape") {
    hideSearchDropdown();
  }
};

/* ===== SEARCH BUTTON ===== */
window.commitSearch = function () {
  if (typeof searchServices === "function") {
    searchServices();
  }

  hideSearchDropdown();
};

/* ===== CLEAR BUTTON ===== */
window.clearSearch = function () {
  const input = document.getElementById("searchInput");

  if (input) {
    input.value = "";
  }

  hideSearchDropdown();

  if (typeof resetToAllProviders === "function") {
    resetToAllProviders();
  }
};

/* ===== SAVE RECENT SEARCHES ===== */
function saveRecentSearch(query) {
  let searches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]"
  );

  // Remove duplicates
  searches = searches.filter(item => item !== query);

  // Add new search at the beginning
  searches.unshift(query);

  // Keep only 10 searches
  searches = searches.slice(0, 10);

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(searches)
  );
}

/* ================================================================
   FUNCTION WRAPPER
   Allows us to track actions without modifying your main JS file.
   ================================================================ */
function wrapFunction(functionName, callback) {
  const original = window[functionName];

  if (typeof original !== "function") return;

  window[functionName] = function (...args) {
    callback(...args);
    return original.apply(this, args);
  };
}

/* ===== TRACK PROFILE VIEWS ===== */
wrapFunction("viewProfile", function (providerId) {
  trackActivity("viewed", { providerId });

  // Store view counts per provider
  const viewed = JSON.parse(
    localStorage.getItem("viewedProfiles") || "{}"
  );

  viewed[providerId] = (viewed[providerId] || 0) + 1;

  localStorage.setItem(
    "viewedProfiles",
    JSON.stringify(viewed)
  );
});

/* ===== TRACK FAVORITES ===== */
wrapFunction("addFavorite", function () {
  trackActivity("favorites");
});

/* ===== TRACK BOOKINGS ===== */
wrapFunction("bookProvider", function () {
  trackActivity("booked");
});

/* ================================================================
   PERSONALIZED RECOMMENDATIONS
   ================================================================ */
window.renderRecommended = function () {
  const list = document.getElementById("recommended-list");

  if (!list) return;

  if (typeof allProviders === "undefined") return;

  // If cookies not accepted, do nothing
  if (!CookieManager.hasConsent()) return;

  const viewed = JSON.parse(
    localStorage.getItem("viewedProfiles") || "{}"
  );

  // Sort providers by view count
  const ranked = [...allProviders].sort(
    (a, b) =>
      (viewed[b.id] || 0) - (viewed[a.id] || 0)
  );

  const recommendations = ranked.slice(0, 3);

  list.innerHTML = recommendations
    .map(provider => `
      <li>
        <i class="fas fa-star"></i>
        ${provider.name} – ${provider.service}
        <button onclick="viewProfile('${provider.id}')">
          View Profile
        </button>
      </li>
    `)
    .join("");
};

/* ================================================================
   INITIALIZATION
   ================================================================ */
document.addEventListener("DOMContentLoaded", function () {
  // Show or hide cookie banner
  CookieManager.init();

  // Update activity statistics
  updateTrackedStats();

  // Hide search dropdown when clicking outside
  document.addEventListener("click", function (event) {
    const wrapper = document.getElementById("searchWrapper");

    if (wrapper && !wrapper.contains(event.target)) {
      hideSearchDropdown();
    }
  });
});
