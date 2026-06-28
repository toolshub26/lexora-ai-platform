/**
 * Lexora AI Platform v20 – Dashboard Module
 * Firebase v12 Modular Compatible
 * Depends on: firebase.js (window.auth, window.db) and auth.js (CustomEvent 'auth-state-changed')
 * All Firebase functions used are globally available (from firebase.js imports).
 */
(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Verify prerequisites
  // -------------------------------------------------------------------------
  if (!window.auth || !window.db) {
    console.error('[Dashboard] window.auth or window.db is missing. Skipping initialisation.');
    return;
  }

  // -------------------------------------------------------------------------
  // 2. Extend / create Dashboard namespace
  // -------------------------------------------------------------------------
  window.Dashboard = window.Dashboard || {};
  const Dash = window.Dashboard;

  // -------------------------------------------------------------------------
  // 3. Internal state
  // -------------------------------------------------------------------------
  let currentUser = null;
  let unsubRecentDocs = null;

  // -------------------------------------------------------------------------
  // 4. DOM helpers (fail-safely)
  // -------------------------------------------------------------------------
  const getEl = (id) => document.getElementById(id);

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function showError(message) {
    const el = getEl('dashboard-error');
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
    } else {
      console.error('[Dashboard]', message);
    }
  }

  function hideError() {
    const el = getEl('dashboard-error');
    if (el) el.style.display = 'none';
  }

  // Smooth counter animation
  function animateCounter(element, target) {
    if (!element) return;
    const start = parseInt(element.textContent, 10) || 0;
    const duration = 600;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.textContent = Math.floor(start + (target - start) * progress).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // -------------------------------------------------------------------------
  // 5. UI update functions (all guarded)
  // -------------------------------------------------------------------------
  function updateBasicUserInfo(user) {
    const nameEl = getEl('user-name');
    const avatarEl = getEl('user-avatar');
    const emailEl = getEl('user-email');

    if (nameEl) nameEl.textContent = user?.displayName || user?.email?.split('@')[0] || 'User';
    if (avatarEl) avatarEl.src = user?.photoURL || '/assets/default-avatar.png';
    if (emailEl) emailEl.textContent = user?.email || '';
  }

  function resetStats() {
    const totalEl = getEl('total-documents');
    const wordsEl = getEl('words-generated');
    const aiEl = getEl('ai-suggestions');
    animateCounter(totalEl, 0);
    animateCounter(wordsEl, 0);
    animateCounter(aiEl, 0);
  }

  function clearDashboard() {
    updateBasicUserInfo({});
    resetStats();
    const recentList = getEl('recent-docs-list');
    if (recentList) recentList.innerHTML = '';
    hideError();
  }

  // -------------------------------------------------------------------------
  // 6. Firestore data loading (modular)
  // -------------------------------------------------------------------------
  async function loadProfile(uid) {
    try {
      // doc(), getDoc() are globally available
      const docRef = doc(window.db, 'users', uid);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Dashboard] Failed to load profile:', err);
      return null;
    }
  }

  async function loadStatistics(uid) {
    try {
      const statsRef = doc(window.db, 'users', uid, 'stats', 'dashboard');
      const snap = await getDoc(statsRef);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Dashboard] Failed to load statistics:', err);
      return null;
    }
  }

  function updateProfileUI(profile) {
    if (!profile) return;
    const nameEl = getEl('user-name');
    const avatarEl = getEl('user-avatar');
    if (nameEl && profile.displayName) nameEl.textContent = profile.displayName;
    if (avatarEl && profile.photoURL) avatarEl.src = profile.photoURL;
  }

  function updateStatsUI(stats) {
    if (!stats) return;
    const totalEl = getEl('total-documents');
    const wordsEl = getEl('words-generated');
    const aiEl = getEl('ai-suggestions');
    animateCounter(totalEl, stats.totalDocuments ?? 0);
    animateCounter(wordsEl, stats.totalWordsGenerated ?? 0);
    animateCounter(aiEl, stats.aiSuggestionsUsed ?? 0);
  }

  // -------------------------------------------------------------------------
  // 7. Real‑time recent documents (modular onSnapshot + query)
  // -------------------------------------------------------------------------
  function listenRecentDocs(uid) {
    if (unsubRecentDocs) {
      unsubRecentDocs();
      unsubRecentDocs = null;
    }

    const recentList = getEl('recent-docs-list');
    if (!recentList) return;

    // Build collection reference and query
    const docsCol = collection(window.db, 'users', uid, 'documents');
    const q = query(docsCol, orderBy('updatedAt', 'desc'), limit(5));

    unsubRecentDocs = onSnapshot(
      q,
      (snapshot) => {
        let html = '';
        if (snapshot.empty) {
          html = '<li class="empty-message">No recent documents. Start writing!</li>';
        } else {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const title = data.title || 'Untitled';
            const updated = data.updatedAt
              ? new Date(data.updatedAt.toDate()).toLocaleDateString()
              : 'Unknown';
            html += `
              <li class="doc-item">
                <a href="/document/${docSnap.id}" class="doc-link">
                  <span class="doc-title">${escapeHTML(title)}</span>
                  <span class="doc-date">${updated}</span>
                </a>
              </li>
            `;
          });
        }
        recentList.innerHTML = html;
      },
      (err) => {
        console.error('[Dashboard] Recent docs listener error:', err);
        recentList.innerHTML = '<li class="error">Failed to load recent documents.</li>';
      }
    );
  }

  // -------------------------------------------------------------------------
  // 8. Dashboard data loader
  // -------------------------------------------------------------------------
  async function loadDashboardData(user) {
    hideError();
    updateBasicUserInfo(user);

    try {
      const [profile, stats] = await Promise.allSettled([
        loadProfile(user.uid),
        loadStatistics(user.uid),
      ]);

      if (profile.status === 'fulfilled' && profile.value) {
        updateProfileUI(profile.value);
      } // else fallback already shown

      if (stats.status === 'fulfilled' && stats.value) {
        updateStatsUI(stats.value);
      } else {
        resetStats();
      }

      listenRecentDocs(user.uid);
    } catch (err) {
      console.error('[Dashboard] Failed to load dashboard data:', err);
      showError('Could not load dashboard data. Please refresh.');
    }
  }

  // -------------------------------------------------------------------------
  // 9. Auth state change handler
  // -------------------------------------------------------------------------
  function handleUserAuth(user) {
    if (unsubRecentDocs) {
      unsubRecentDocs();
      unsubRecentDocs = null;
    }

    if (user) {
      currentUser = user;
      loadDashboardData(user);
    } else {
      currentUser = null;
      clearDashboard();
    }
  }

  // -------------------------------------------------------------------------
  // 10. Logout button (uses window.auth.signOut from auth.js)
  // -------------------------------------------------------------------------
  function setupLogout() {
    const btn = getEl('logout-button');
    if (!btn) return;

    // Avoid duplicate listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', async () => {
      try {
        // signOut() is globally available, we call it with window.auth
        await signOut(window.auth);
        // UI clearing is handled by auth-state-changed listener
      } catch (err) {
        console.error('[Dashboard] Logout failed:', err);
        showError('Logout failed. Please try again.');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 11. Initialisation
  // -------------------------------------------------------------------------
  function init() {
    // Listen for custom auth-state-changed event from auth.js
    document.addEventListener('auth-state-changed', (e) => {
      handleUserAuth(e.detail.user);
    });

    // If auth state already determined before script loaded, catch it
    // (firebase.js sets up auth object, onAuthStateChanged may have fired before this)
    if (window.auth.currentUser) {
      handleUserAuth(window.auth.currentUser);
    }

    setupLogout();
    console.log('[Dashboard] Ready – listening for auth-state-changed');
  }

  // Expose manual refresh
  Dash.refresh = () => {
    if (currentUser) {
      loadDashboardData(currentUser);
    }
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
