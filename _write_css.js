const fs = require('fs');
const path = require('path');

/* ============================================================
   NEUTRAL PALETTE
   #171717 near-black  |  #262626 dark  |  #404040 medium
   #737373 secondary   |  #a3a3a3 muted |  #e5e5e5 border
   #f5f5f5 hover-bg    |  #fafafa page  |  #ffffff surface
   #f59e0b amber (ratings only)  |  #ef4444 danger
   ============================================================ */

const dashboardCSS = `/* ===========================================================
   Campus Connect – Seeker Dashboard  |  Neutral Design
   =========================================================== */

/* ---------- Variables ---------- */
:root {
  --ink:        #171717;
  --ink-2:      #262626;
  --ink-3:      #404040;
  --mid:        #737373;
  --muted:      #a3a3a3;
  --border:     #e5e5e5;
  --hover:      #f5f5f5;
  --bg:         #fafafa;
  --surface:    #ffffff;
  --amber:      #f59e0b;
  --danger:     #ef4444;
  /* JS-settable accents – fallback to neutral */
  --accent:         #262626;
  --accent-color:   #262626;
  --bg-surface:     #ffffff;
  --text-primary:   #171717;
  --text-secondary: #737373;
  --text-muted:     #a3a3a3;
}

/* ---------- Reset ---------- */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Poppins', 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ===========================================================
   HEADER
   =========================================================== */
.dashboard-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 2rem;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.left-header { display: flex; align-items: center; gap: 1rem; }

.hamburger {
  background: none;
  border: none;
  color: var(--ink-3);
  font-size: 1.15rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.hamburger:hover { background: var(--hover); color: var(--ink); }

.brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-logo { width: 28px; height: 28px; object-fit: contain; border-radius: 5px; }
.brand-name { font-size: 1rem; color: var(--ink-3); font-weight: 400; }
.brand-name strong { color: var(--ink); font-weight: 700; }

/* Retain h1 selector used in older HTML */
.dashboard-header h1 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.header-actions { display: flex; align-items: center; gap: 0.65rem; }

.btn-notification {
  position: relative;
  background: none;
  border: 1px solid var(--border);
  color: var(--mid);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-notification:hover { background: var(--hover); color: var(--ink); }

.notification-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: var(--danger);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface);
}

.btn-logout {
  background: var(--ink);
  color: #fff;
  border: none;
  padding: 0 1rem;
  height: 34px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}
.btn-logout:hover { background: var(--ink-3); }

/* ===========================================================
   SIDEBAR
   =========================================================== */
.sidebar {
  position: fixed;
  top: 0; left: -300px;
  width: 280px;
  height: 100%;
  background: var(--surface);
  border-right: 1px solid var(--border);
  z-index: 999;
  overflow-y: auto;
  transition: left 0.28s cubic-bezier(0.4,0,0.2,1);
}
.sidebar.active { left: 0; }

.sidebar-inner { padding-bottom: 2rem; }

.sidebar-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 998;
}
.sidebar-overlay.active { display: block; }

/* Sidebar – profile header */
.profile-header {
  background: var(--ink);
  padding: 2rem 1.5rem 1.5rem;
  color: #fff;
  text-align: center;
}
.profile-header img,
.profile-avatar-wrap img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: 0.75rem;
  border: 2px solid rgba(255,255,255,0.25);
  object-fit: cover;
}
.profile-header h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem; }
.profile-header p  { font-size: 0.72rem; color: rgba(255,255,255,0.55); }

.profile-avatar-wrap { margin: 0 auto; }

/* Info rows */
.profile-info { padding: 0.5rem 1.25rem; }

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--mid);
}
.info-row:last-child { border-bottom: none; }
.info-row i { width: 16px; color: var(--ink-3); font-size: 0.8rem; flex-shrink: 0; }
.info-label { font-weight: 600; color: var(--mid); }
.info-value  { color: var(--ink); }

/* Sidebar buttons */
.profile-info button,
.sidebar-btn {
  width: 100%;
  margin: 5px 0;
  padding: 0.65rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--ink-2);
  font-size: 0.82rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: background 0.15s, border-color 0.15s;
}
.profile-info button:hover,
.sidebar-btn:hover {
  background: var(--hover);
  border-color: #d4d4d4;
  color: var(--ink);
}
.profile-info button i,
.sidebar-btn i { color: var(--ink-3); font-size: 0.82rem; width: 15px; }

.sidebar-actions { padding: 0.75rem 1.25rem 0; display: flex; flex-direction: column; gap: 4px; }

.tip {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #92400e;
  margin-top: 12px;
  text-align: center;
}

/* ===========================================================
   MAIN LAYOUT
   =========================================================== */
.dashboard-container {
  display: flex;
  gap: 1.5rem;
  padding: 1.75rem 2rem 5.5rem;
  max-width: 1380px;
  margin: 0 auto;
}

/* ===========================================================
   CENTER PANEL
   =========================================================== */
.dashboard-center {
  flex: 2.5;
  min-width: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.75rem;
}

.welcome-section { margin-bottom: 1.5rem; }
.welcome-section h2 {
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.3rem;
}
.welcome-section p { color: var(--mid); font-size: 0.85rem; }

/* ── Search ── */
.search-wrapper { position: relative; margin-bottom: 1.5rem; }
.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 4px 4px 1rem;
  gap: 0.5rem;
  transition: border-color 0.15s;
}
.search-bar:focus-within { border-color: #a3a3a3; }
.search-bar > i, .search-bar i { color: var(--muted); font-size: 0.85rem; flex-shrink: 0; align-self: center; margin-left: 0; }
.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.65rem 0.5rem;
  font-size: 0.88rem;
  outline: none;
  font-family: inherit;
  color: var(--ink);
}
.search-bar input::placeholder { color: var(--muted); }
.search-bar button, .btn-search {
  background: var(--ink);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.55rem 1.15rem;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.search-bar button:hover, .btn-search:hover { background: var(--ink-3); }
.btn-clear, .clear-search-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.78rem;
  font-family: inherit;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.btn-clear:hover, .clear-search-btn:hover { background: var(--hover); color: var(--ink); }

/* Search dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 4px); left: 0; right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 200;
  overflow: hidden;
  max-height: 340px;
  overflow-y: auto;
  display: none;
}
.search-dropdown.open { display: block; }

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover { background: var(--hover); }

.dropdown-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.dropdown-info h5 { font-size: 0.85rem; color: var(--ink); }
.dropdown-info span { font-size: 0.73rem; color: var(--muted); }
.dropdown-badge {
  margin-left: auto;
  background: var(--hover);
  color: var(--ink-3);
  border: 1px solid var(--border);
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.dropdown-no-results { padding: 18px; text-align: center; color: var(--muted); font-size: 0.85rem; }

/* ── Section titles ── */
.section-title,
.categories-section h3,
.providers-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-title i { color: var(--ink-3); }

/* ── Categories ── */
.categories-section { margin: 0 0 1.5rem; }

.service-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.85rem;
}
.service-categories .card {
  border-radius: 10px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 155px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
}
.service-categories .card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.52);
  z-index: 1;
  transition: background 0.2s;
}
.service-categories .card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); }
.service-categories .card:hover::before { background: rgba(0,0,0,0.35); }
.service-categories .card i,
.service-categories .card h4,
.service-categories .card p { position: relative; z-index: 2; color: #fff; }
.service-categories .card i  { font-size: 1.8rem; margin-bottom: 0.55rem; }
.service-categories .card h4 { font-size: 0.88rem; font-weight: 700; margin-bottom: 0.25rem; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.service-categories .card p  { font-size: 0.72rem; opacity: 0.88; }

.service-categories .card.tutoring    { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('tutoring.webp');       background-size:cover; background-position:center; }
.service-categories .card.photography { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('Photography.jpg');     background-size:cover; background-position:center; }
.service-categories .card.design      { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('design.webp');         background-size:cover; background-position:center; }
.service-categories .card.beauty      { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('beauty.jpg');          background-size:cover; background-position:center; }
.service-categories .card.music       { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('music.jpg');           background-size:cover; background-position:center; }
.service-categories .card.fitness     { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('fitness.jpg');         background-size:cover; background-position:center; }
.service-categories .card.webdev      { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('webdev.jpg');          background-size:cover; background-position:center; }
.service-categories .card.it          { background-image: linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url('informationtech.jpg'); background-size:cover; background-position:center; }

/* ── Provider cards ── */
.providers-section { margin: 0 0 1.25rem; }

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1rem;
}

.provider-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.25rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
}
.provider-card:hover {
  border-color: #a3a3a3;
  box-shadow: 0 4px 14px rgba(0,0,0,0.07);
  transform: translateY(-2px);
}
.provider-icon i {
  font-size: 2.5rem;
  color: var(--ink-3);
  margin-bottom: 0.65rem;
  display: block;
}
.provider-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  margin: 0 auto 0.65rem;
}
.provider-card h4 { font-size: 0.88rem; font-weight: 600; color: var(--ink); margin-bottom: 0.3rem; }
.provider-card p, .provider-service {
  font-size: 0.72rem;
  color: var(--mid);
  background: var(--hover);
  border: 1px solid var(--border);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.5rem;
}
.rating, .provider-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--muted);
  margin-bottom: 0.75rem;
}
.rating i, .provider-rating i { color: var(--amber); }
.available-badge {
  position: absolute; top: 8px; right: 8px;
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;
  font-size: 0.62rem; font-weight: 600; padding: 2px 7px; border-radius: 4px;
}
.unavailable-badge {
  position: absolute; top: 8px; right: 8px;
  background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
  font-size: 0.62rem; font-weight: 600; padding: 2px 7px; border-radius: 4px;
}
.btn-view, .btn-view-profile {
  background: var(--ink);
  color: #fff;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  width: 100%;
  transition: background 0.15s;
}
.btn-view:hover, .btn-view-profile:hover { background: var(--ink-3); }

/* Browse all */
.btn-browse {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  background: var(--bg);
  color: var(--ink);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-browse:hover { background: var(--hover); border-color: #a3a3a3; }

/* Loading / error */
.loading, .error, .no-results {
  text-align: center;
  padding: 2.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}
.loading i { color: var(--ink-3); font-size: 1.25rem; }

.no-results-message {
  text-align: center; padding: 3rem 1.5rem;
  background: var(--surface);
  border-radius: 10px; border: 1px solid var(--border);
}
.no-results-message i { color: var(--ink-3); font-size: 1.75rem; margin-bottom: 0.75rem; display: block; }
.no-results-message h3 { font-size: 1.1rem; color: var(--ink); margin-bottom: 0.5rem; }
.no-results-message p  { color: var(--muted); font-size: 0.85rem; margin-bottom: 0.75rem; }
.suggestion-btn {
  padding: 5px 14px;
  background: var(--hover);
  border: 1px solid var(--border);
  color: var(--ink-2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: background 0.15s;
}
.suggestion-btn:hover { background: var(--ink); color: #fff; }

/* ===========================================================
   RIGHT SIDEBAR
   =========================================================== */
.dashboard-right {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}
.side-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem 1.4rem;
}
.side-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid var(--border);
}
.side-card-header i { color: var(--ink-3); font-size: 0.9rem; }
.side-card-header h3 { font-size: 0.88rem; font-weight: 600; color: var(--ink); }

.recommended ul, .updates ul { list-style: none; padding: 0; }

.recommended li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--mid);
}
.recommended li:last-child { border-bottom: none; }
.rec-icon {
  width: 28px; height: 28px;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ink-3);
  font-size: 0.75rem;
}
.rec-name { flex: 1; }
.recommended li button {
  background: var(--hover);
  color: var(--ink-2);
  border: 1px solid var(--border);
  padding: 3px 9px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}
.recommended li button:hover { background: var(--ink); color: #fff; border-color: var(--ink); }

.see-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 0.65rem;
  color: var(--mid);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.78rem;
  transition: color 0.15s;
}
.see-all:hover { color: var(--ink); }

.updates li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--mid);
}
.updates li:last-child { border-bottom: none; }
.updates li i { color: var(--ink-3); margin-top: 2px; flex-shrink: 0; font-size: 0.8rem; }

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border);
}
.stat-item:last-child { border-bottom: none; }
.stat-item span { font-size: 0.8rem; color: var(--mid); display: flex; align-items: center; gap: 0.45rem; }
.stat-item span i { color: var(--ink-3); font-size: 0.78rem; }
.stat-item strong { font-size: 1.2rem; font-weight: 700; color: var(--ink); }

/* ===========================================================
   FOOTER
   =========================================================== */
.dashboard-footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 50;
}
.dashboard-footer button {
  background: var(--ink);
  color: #fff;
  border: none;
  padding: 0.5rem 1.35rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.15s;
}
.dashboard-footer button:hover { background: var(--ink-3); }
.badge {
  background: var(--danger);
  color: #fff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
}

/* ===========================================================
   MODALS
   =========================================================== */
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 1100;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal.open { display: flex; }

.modal-content {
  background: var(--surface);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 16px 48px rgba(0,0,0,0.14);
  border: 1px solid var(--border);
  animation: modalIn 0.18s ease;
}
@keyframes modalIn {
  from { opacity:0; transform: scale(0.97) translateY(8px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}
.modal-content h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.modal-content h2 i { color: var(--ink-3); }
.modal-content p {
  font-size: 0.85rem;
  color: var(--mid);
  margin-bottom: 0.6rem;
  line-height: 1.65;
}
.modal-content p strong { color: var(--ink); }

.close, .close-btn, .modal-close-btn {
  position: absolute; top: 1rem; right: 1rem;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--mid);
  font-size: 0.82rem;
  transition: background 0.15s, color 0.15s;
  line-height: 1;
}
.close:hover, .close-btn:hover, .modal-close-btn:hover { background: #fee2e2; color: var(--danger); border-color: #fca5a5; }
.modal-close { position: absolute; top: 14px; right: 14px; background: var(--hover); border: 1px solid var(--border); color: var(--mid); width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; transition: all 0.15s; }
.modal-close:hover { background: #fee2e2; color: var(--danger); }

.modal-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--ink); color: #fff; font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.9rem; }
.modal-name { font-size: 1.1rem; font-weight: 700; text-align: center; color: var(--ink); }
.modal-service-badge { display: block; text-align: center; margin: 7px auto 1.1rem; background: var(--hover); color: var(--ink-2); border: 1px solid var(--border); padding: 3px 12px; border-radius: 4px; font-size: 0.8rem; width: fit-content; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 1.1rem; }

/* ===========================================================
   COOKIE BANNER
   =========================================================== */
.cookie-banner {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--ink);
  border-top: 1px solid #262626;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  flex-wrap: wrap;
  z-index: 9999;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
}
.cookie-banner.hidden { display: none; }
.cookie-banner-icon { font-size: 1.5rem; color: rgba(255,255,255,0.5); flex-shrink: 0; }
.cookie-banner-text { flex: 1; min-width: 200px; }
.cookie-banner-text h4 { font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-bottom: 3px; font-weight: 600; }
.cookie-banner-text p { font-size: 0.75rem; color: rgba(255,255,255,0.45); line-height: 1.5; }
.cookie-banner-text p a { color: rgba(255,255,255,0.7); text-decoration: underline; }
.cookie-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; flex-shrink: 0; }
.btn-accept {
  background: #fff; color: var(--ink);
  border: none; padding: 0.5rem 1.1rem;
  border-radius: 6px; font-weight: 600; font-size: 0.78rem; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; gap: 5px;
  transition: background 0.15s;
}
.btn-accept:hover { background: #e5e5e5; }
.btn-decline {
  background: transparent; color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 0.5rem 1.1rem; border-radius: 6px;
  font-size: 0.78rem; font-family: inherit; cursor: pointer;
  display: flex; align-items: center; gap: 5px;
  transition: color 0.15s, border-color 0.15s;
}
.btn-decline:hover { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.4); }

/* ===========================================================
   SCROLLBAR
   =========================================================== */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }

/* ===========================================================
   RESPONSIVE
   =========================================================== */
@media (max-width:1024px) {
  .dashboard-container { flex-direction: column; padding: 1.25rem 1.25rem 5.5rem; }
  .dashboard-right { flex-direction: row; flex-wrap: wrap; }
  .side-card { flex: 1 1 260px; }
}
@media (max-width:768px) {
  .dashboard-header { padding: 0 1rem; }
  .brand-name { display: none; }
  .btn-logout span { display: none; }
  .dashboard-container { padding: 1rem 1rem 5rem; gap: 1rem; }
  .dashboard-center { padding: 1.25rem; }
  .service-categories { grid-template-columns: repeat(auto-fill, minmax(130px,1fr)); }
  .providers-grid { grid-template-columns: 1fr 1fr; }
  .dashboard-right { flex-direction: column; }
  .dashboard-footer { gap: 0.4rem; padding: 0.6rem 0.75rem; }
  .dashboard-footer button { padding: 0.5rem 0.85rem; font-size: 0.75rem; }
}
@media (max-width:480px) {
  .providers-grid { grid-template-columns: 1fr; }
  .service-categories { grid-template-columns: 1fr 1fr; }
  .modal-grid { grid-template-columns: 1fr; }
}
`;

fs.writeFileSync(path.join(__dirname, 'dashboard.css'), dashboardCSS, 'utf8');
console.log('dashboard.css written:', dashboardCSS.length, 'chars');

/* ============================================================
   NEUTRAL RECOLOR – ALL OTHER CSS FILES
   ============================================================ */
const neutralMap = [
  // Purple/violet → neutral dark
  ['#7c3aed', '#262626'],
  ['#4c1d95', '#171717'],
  ['#5b21b6', '#404040'],
  ['#a78bfa', '#a3a3a3'],
  ['#ede9fe', '#f5f5f5'],
  ['#f5f3ff', '#fafafa'],
  // Rose/pink accents → neutral
  ['#f43f5e', '#171717'],
  ['#be123c', '#404040'],
  ['#fce7f3', '#f9fafb'],
  // Gradient headers → flat dark
  ['linear-gradient(to right, rgba(76, 29, 149, 0.863), #7c3aedd8)', 'linear-gradient(to right, #1a1a1a, #2d2d2d)'],
  ['linear-gradient(to right, rgba(76, 29, 149, 0.863), #262626d8)', 'linear-gradient(to right, #1a1a1a, #2d2d2d)'],
  ['rgba(76, 29, 149, 0.863)', 'rgba(26, 26, 26, 0.96)'],
  ['#7c3aedd8', '#171717d8'],
  ['rgba(124, 58, 237, 0.3)', 'rgba(0,0,0,0.08)'],
  ['rgba(244, 63, 94, 0.3)', 'rgba(0,0,0,0.08)'],
  ['rgba(244,63,94,0.3)', 'rgba(0,0,0,0.08)'],
  ['rgba(124,58,237,0.3)', 'rgba(0,0,0,0.08)'],
  // Provider blue (already replaced but just in case)
  ['#1f6392', '#262626'],
  ['#154e72', '#171717'],
  ['#e8f4f8', '#f5f5f5'],
  ['#61a5c2', '#a3a3a3'],
  ['#2d4a55', '#171717'],
  ['#2f5e6e', '#404040'],
  ['#8daeb9', '#a3a3a3'],
  // teal keyword
  ['background: #7c3aed', 'background: #262626'],
  ['color: #7c3aed', 'color: #262626'],
  // Remaining old teals
  ['#2eb997', '#262626'],
  ['#084d43', '#171717'],
  ['#3a6785', '#404040'],
  ['#f7b63d', '#f59e0b'],
  ['#e5a020', '#f59e0b'],
  // bgs
  ['#eef2f9', '#fafafa'],
  ['#e4e8f0', '#f5f5f5'],
  ['#e0e7ff', '#fafafa'],
  ['#fef3c7', '#fffbeb'],
  // rgb hero
  ['rgb(82, 165, 165)', '#1a1a1a'],
  ['#5b21b6', '#404040'],
  ['rgb(2, 74, 74)', '#171717'],
  // bookings
  ['background: teal', 'background: #262626'],
  ['color: teal', 'color: #262626'],
  ['color: tea;', 'color: #171717;'],
  // orange
  ['background-color: orange', 'background-color: #f59e0b'],
  ['background: orange', 'background: #f59e0b'],
  ['color: orange', 'color: #f59e0b'],
  ['#f97316', '#d97706'],
  ['#ea580c', '#b45309'],
  ['#d97706', '#d97706'],
  ['orange;', '#f59e0b;'],
  ['orange,', '#f59e0b,'],
];

const otherFiles = [
  'dashboardCSS.css','providerDashboard.css','style.css','login.css',
  'contact.css','help.css','bookings.css','findServices.css','startHustle.css'
];

let total = 0;
otherFiles.forEach(file => {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let content = fs.readFileSync(fp, 'utf8');
  let c = 0;
  neutralMap.forEach(([from, to]) => {
    let idx = content.indexOf(from);
    while (idx !== -1) {
      content = content.slice(0, idx) + to + content.slice(idx + from.length);
      c++;
      idx = content.indexOf(from, idx + to.length);
    }
  });
  fs.writeFileSync(fp, content, 'utf8');
  console.log(file + ': ' + c);
  total += c;
});
console.log('Other files total:', total);
