"use strict";

/*
Lexora AI Platform v20
Main Application Controller
*/

const Lexora = {

version: "21.0.0",
initialized: false,
    networkEventsRegistered: false,
init() {
    if (this.initialized) return;

    this.initialized = true;

    console.log("Lexora AI Started v21");

    this.loadTheme();
    this.restoreLanguage();
    this.restoreCountry();

    this.loadCountry();
    this.loadLanguage();
    this.loadPurposes();

    this.registerEvents();

    this.showToast("Lexora Ready", "success");
    const loadingScreen = document.getElementById("loading-screen");

if (loadingScreen) {
    loadingScreen.style.display = "none";
}
},

registerEvents() {

console.log("Events Registered");

if (typeof this.registerUIEvents === "function") {
this.registerUIEvents();
}

if (!this.networkEventsRegistered) {

    window.addEventListener("online", () => {
        this.handleOnline();
    });

    window.addEventListener("offline", () => {
        this.handleOffline();
    });

    this.networkEventsRegistered = true;

}
},

loadCountry() {
console.log("Countries Loaded");
},

loadLanguage() {
console.log("Languages Loaded");
},

loadPurposes() {
console.log("Purposes Loaded");
}

};

document.addEventListener("DOMContentLoaded", () => {
Lexora.init();
});

/* ==========================================
Local Storage Manager
========================================== */

Lexora.storage = {

save(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
} catch (e) {
console.error("Storage Save Error:", e);
}
},

load(key, defaultValue = null) {
try {
const value = localStorage.getItem(key);
return value ? JSON.parse(value) : defaultValue;
} catch (e) {
return defaultValue;
}
},

remove(key) {
localStorage.removeItem(key);
}

};

/* ==========================================
Theme Manager
========================================== */

Lexora.loadTheme = function () {

const savedTheme = this.storage.load("theme", "dark");

document.documentElement.setAttribute("data-theme", savedTheme);

console.log("Theme Loaded:", savedTheme);

};

Lexora.toggleTheme = function () {

const current =
document.documentElement.getAttribute("data-theme") || "dark";

const next = current === "dark" ? "light" : "dark";

document.documentElement.setAttribute("data-theme", next);

this.storage.save("theme", next);

};

/* ==========================================
Language
========================================== */

Lexora.restoreLanguage = function () {

const lang = this.storage.load("language", "en");

console.log("Language:", lang);

};

/* ==========================================
Country
========================================== */

Lexora.restoreCountry = function () {

const country = this.storage.load("country", "IN");

console.log("Country:", country);

};


/* ==========================================
Toast Notification System
========================================== */

Lexora.showToast = function (message, type = "info") {

let toast = document.getElementById("lexora-toast");

if (!toast) {

toast = document.createElement("div");
toast.id = "lexora-toast";
document.body.appendChild(toast);

}

toast.className = "toast toast-" + type;
toast.textContent = String(message ?? "");
toast.style.display = "block";
toast.setAttribute("role", "alert");
toast.setAttribute("aria-live", "polite");
clearTimeout(toast.hideTimer);

toast.hideTimer = setTimeout(() => {

toast.style.display = "none";
toast.removeAttribute("aria-live");
}, 3000);

};

/* ==========================================
Network Status
========================================== */

Lexora.handleOnline = function () {

console.log("Internet Connected");

this.showToast("Internet Connected", "success");

};

Lexora.handleOffline = function () {

console.log("Internet Disconnected");

this.showToast("No Internet Connection", "error");

};

/* ==========================================
Register Network Events
========================================== */



/* ==========================================
Utility
========================================== */

Lexora.isOnline = function () {

return navigator.onLine;

};

/* ==========================================
Modal Manager
========================================== */

Lexora.openModal = function (id) {

const modal = document.getElementById(id);

if (!modal) return;

modal.classList.remove("hidden");
modal.setAttribute("aria-hidden", "false");
document.body.classList.add("modal-open");
};

Lexora.closeModal = function (id) {

const modal = document.getElementById(id);

if (!modal) return;

modal.classList.add("hidden");
modal.setAttribute("aria-hidden", "true");
document.body.classList.remove("modal-open");
};

/* ==========================================
Loading Manager
========================================== */

Lexora.showLoader = function () {

const loader = document.getElementById("globalLoader");

if (loader) {

loader.classList.remove("hidden");
loader.setAttribute("aria-hidden", "false");
document.body.classList.add("loading");
}

};

Lexora.hideLoader = function () {

const loader = document.getElementById("globalLoader");

if (loader) {

loader.classList.add("hidden");
loader.setAttribute("aria-hidden", "true");
document.body.classList.remove("loading");
}

};

/* ==========================================
Helpers
========================================== */

Lexora.$ = function(selector){

    return document.querySelector(selector);

};

Lexora.$$ = function(selector){

    return document.querySelectorAll(selector);

};

/* ==========================================
Register UI Events
========================================== */

Lexora.registerUIEvents = function () {

    if (this.uiEventsRegistered) return;

    const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {

loginBtn.addEventListener("click", () => {

this.openModal("loginModal");

});

}

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {

signupBtn.addEventListener("click", () => {

this.openModal("signupModal");

});

}
   const createAccountBtn = document.getElementById("createAccountBtn");

if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
        this.openModal("signupModal");
    });
} 
const startBtn = document.getElementById("startBtn");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    this.openModal("signupModal");
  });
}
const closeLogin = document.getElementById("closeLogin");

if (closeLogin) {

closeLogin.addEventListener("click", () => {

this.closeModal("loginModal");

});

}

const closeSignup = document.getElementById("closeSignup");

if (closeSignup) {

    closeSignup.addEventListener("click", () => {
        this.closeModal("signupModal");
    });

}
const upgradeBtn = document.getElementById("upgradeBtn");

if (upgradeBtn) {
  upgradeBtn.addEventListener("click", async () => {
    try {
      Lexora.showLoader();

      await Payment.startPayment("PRO");

      Lexora.hideLoader();

      Lexora.showToast("Payment Successful", "success");

    } catch (err) {

      Lexora.hideLoader();

      Lexora.showToast("Payment Failed", "error");

    }
  });
}
this.uiEventsRegistered = true;

};

/* ==========================================
Extend registerEvents
========================================== */



/* ==========================================
Session Manager
========================================== */

Lexora.session = {

saveUser(user) {

Lexora.storage.save("currentUser", user);

},

getUser() {

return Lexora.storage.load("currentUser", null);

},

clear() {

Lexora.storage.remove("currentUser");

}

};

/* ==========================================
Current User
========================================== */

Lexora.getCurrentUser = function () {

return this.session.getUser();

};

/* ==========================================
Authentication Check
========================================== */

Lexora.isLoggedIn = function () {

    if (window.Auth && typeof Auth.isReady === "function" && Auth.isReady()) {
        return !!Auth.currentUser;
    }

    return false;
};

/* ==========================================
Logout
========================================== */

Lexora.logout = function () {

    this.session.clear();

    if (window.Auth && typeof window.Auth.logout === "function") {
        window.Auth.logout().catch(console.error);
    }

    this.showToast("Logged out successfully", "success");

    console.log("User Logged Out");

};
window.Lexora = Lexora;
