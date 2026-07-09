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

    this.uiEventsRegistered = true;

    const bindClick = (id, handler) => {

        const el = document.getElementById(id);

        if (!el) return;

        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);

        clone.addEventListener("click", handler);

    };

    bindClick("loginBtn", () => {
        this.openModal("loginModal");
    });

    bindClick("signupBtn", () => {
        this.openModal("signupModal");
    });

    bindClick("createAccountBtn", () => {
        this.openModal("signupModal");
    });

    bindClick("startBtn", () => {
        this.openModal("signupModal");
    });

    bindClick("closeLogin", () => {
        this.closeModal("loginModal");
    });

    bindClick("closeSignup", () => {
        this.closeModal("signupModal");
    });

    bindClick("upgradeBtn", async () => {

        try {

            this.showLoader();

            if (
                !window.Payment ||
                typeof window.Payment.startPayment !== "function"
            ) {
                throw new Error("Payment module missing");
            }

            await window.Payment.startPayment("PRO");

            this.showToast("Payment Successful", "success");

        } catch (err) {

            console.error(err);

            this.showToast(err.message || "Payment Failed", "error");

        } finally {

            this.hideLoader();

        }

    });
/* ---------- Navigation ---------- */

document.querySelectorAll('header nav a').forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const text = link.textContent.trim().toLowerCase();

        const map = {
            home: ".hero",
            features: ".features",
            pricing: ".pricing",
            contact: ".contact"
        };

        const target = document.querySelector(map[text]);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

});


/* ---------- Feature Cards ---------- */

document.querySelectorAll(".feature-card").forEach(card => {

    card.style.cursor = "pointer";

    card.addEventListener("click", () => {

        this.showToast(
            card.querySelector("h3")?.textContent + " Coming Soon",
            "info"
        );

    });

});


/* ---------- Dashboard Cards ---------- */

document.querySelectorAll(".dashboard-card").forEach(card => {

    card.style.cursor = "pointer";

    card.addEventListener("click", () => {

        if (!this.isLoggedIn()) {

            this.openModal("loginModal");
            return;

        }

        this.showToast("Dashboard module opening...", "success");

});
};

/* ==========================================
Extend registerEvents
========================================== */



/* ==========================================
Session Manager
========================================== */

Lexora.session = {

    KEY: "lexora_current_user",

    save(user) {

        if (!user) return;

        try {

            localStorage.setItem(
                this.KEY,
                JSON.stringify(user)
            );

        } catch (e) {

            console.error("Session save failed", e);

        }

    },

    get() {

        try {

            const raw = localStorage.getItem(this.KEY);

            return raw ? JSON.parse(raw) : null;

        } catch (e) {

            console.error("Session read failed", e);

            return null;

        }

    },

    clear() {

        try {

            localStorage.removeItem(this.KEY);

        } catch (e) {

            console.error("Session clear failed", e);

        }

    }

};

/* =====================================================
   Current User
===================================================== */

Lexora.getCurrentUser = function () {

    if (
        window.Auth &&
        typeof window.Auth.currentUser === "function"
    ) {

        return window.Auth.currentUser();

    }

    return this.session.get();

};
/* =====================================================
   Login State
===================================================== */

Lexora.isLoggedIn = function () {

    const user = this.getCurrentUser();

    return !!(user && (user.uid || user.email));

};

/* =====================================================
   Logout
===================================================== */

Lexora.logout = async function () {

    try {

        this.session.clear();

        if (
            window.Auth &&
            typeof window.Auth.logout === "function"
        ) {
            await window.Auth.logout();
        }

        this.showToast("Logged out successfully", "success");

        window.location.reload();

    } catch (err) {

        console.error(err);

        this.showToast("Logout failed", "error");

    }

};

/* =====================================================
   Export
===================================================== */
/* =====================================================
   Generic Button Actions
===================================================== */

Lexora.initializeActions = function () {

    const bind = (id, fn) => {

        const el = document.getElementById(id);

        if (!el) return;

        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);

        clone.addEventListener("click", fn);
    };

    // Ask AI
    bind("askAiBtn", () => {

        const prompt = document.getElementById("aiPrompt")?.value.trim();

        if (!prompt) {
            this.showToast("Please enter your question.", "warning");
            return;
        }

        this.showToast("AI Assistant is processing...", "info");

        const chat = document.getElementById("aiChatWindow");
        if (chat) chat.classList.remove("hidden");
    });

    // Newsletter
    bind("subscribeBtn", () => {

        const email = document.getElementById("newsletterEmail")?.value.trim();

        if (!email) {
            this.showToast("Enter your email.", "warning");
            return;
        }

        this.showToast("Subscribed successfully.", "success");
    });

    // Install App
    bind("installAppBtn", () => {

        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
        } else {
            this.showToast("Install prompt unavailable.", "info");
        }

    });

    // Share
    bind("shareAppBtn", async () => {

        try {

            if (navigator.share) {

                await navigator.share({

                    title: document.title,
                    text: "Lexora AI Platform",
                    url: location.href

                });

            } else {

                navigator.clipboard.writeText(location.href);

                this.showToast("Link copied.", "success");

            }

        } catch (e) {

            console.error(e);

        }

    });

};
    Lexora.initializeActions = function () {

    const bind = (id, fn) => {

        const el = document.getElementById(id);

        if (!el) return;

        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);

        clone.addEventListener("click", fn);

    };

    // Ask AI
    bind("askAiBtn", () => {

        const prompt = document.getElementById("aiPrompt")?.value.trim();

        if (!prompt) {
            this.showToast("Please enter your question.", "warning");
            return;
        }

        if (window.AI && typeof window.AI.ask === "function") {
            window.AI.ask(prompt);
        } else {
            this.showToast("AI module not loaded.", "error");
        }

    });

    // Newsletter
    bind("subscribeBtn", async () => {

        const email = document.getElementById("newsletterEmail")?.value.trim();

        if (!email) {
            this.showToast("Enter your email.", "warning");
            return;
        }

        if (window.Notifications &&
            typeof window.Notifications.subscribe === "function") {

            await window.Notifications.subscribe(email);

        } else {

            this.showToast("Subscribed successfully.", "success");

        }

    });

    // Install App
    bind("installAppBtn", async () => {

        if (window.deferredPrompt) {

            window.deferredPrompt.prompt();

            const choice =
                await window.deferredPrompt.userChoice;

            console.log(choice);

            window.deferredPrompt = null;

        } else {

            this.showToast("Install not available.", "info");

        }

    });

    // Share App
    bind("shareAppBtn", async () => {

        try {

            if (navigator.share) {

                await navigator.share({
                    title: document.title,
                    text: "Lexora AI Platform",
                    url: location.href
                });

            } else {

                await navigator.clipboard.writeText(location.href);

                this.showToast("Link copied.", "success");

            }

        } catch (e) {

            console.error(e);

        }

    });

};
    /* =========================================
   Part 3C - Template / CTA Actions
========================================= */

Lexora.initializeCards = function () {

    // Template Cards
    document.querySelectorAll(".template-card").forEach(card => {

        card.style.cursor = "pointer";

        card.addEventListener("click", () => {

            const title = card.textContent.trim();

            this.showToast(`${title} template opening...`, "success");

        });

    });

    // CTA Button
    const createBtn = document.getElementById("createAccountBtn");

    if (createBtn) {

        const clone = createBtn.cloneNode(true);
        createBtn.parentNode.replaceChild(clone, createBtn);

        clone.addEventListener("click", () => {

            this.openModal("signupModal");

        });

    }

    // Contact Sales
    document.querySelectorAll(".enterprise button").forEach(btn => {

        btn.addEventListener("click", () => {

            this.showToast(
                "Sales team will contact you soon.",
                "info"
            );

        });

    });

    // Free Plan
    document.querySelectorAll(".free button").forEach(btn => {

        btn.addEventListener("click", () => {

            this.openModal("signupModal");

        });

    });

};

    document.addEventListener("DOMContentLoaded", () => {

    if (window.Lexora) {

        window.Lexora.initializeActions();
        window.Lexora.initializeCards();

    }

});
/* =========================================
   Part 3D - Final Production Cleanup
========================================= */

window.addEventListener("error", (e) => {

    console.error("[Lexora Error]", e.error || e.message);

});

window.addEventListener("unhandledrejection", (e) => {

    console.error("[Unhandled Promise]", e.reason);

});

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    window.deferredPrompt = e;

});

window.addEventListener("online", () => {

    if (window.Lexora) {
        window.Lexora.showToast("Internet Connected", "success");
    }

});

window.addEventListener("offline", () => {

    if (window.Lexora) {
        window.Lexora.showToast("Internet Disconnected", "warning");
    }

});

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            await navigator.serviceWorker.register("/sw.js");

            console.log("Service Worker Registered");

        } catch (err) {

            console.error(err);

        }

    });

}
window.Lexora = Lexora;
