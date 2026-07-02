"use strict";

/*
=========================================
Lexora AI Platform v20
Authentication Module
=========================================
*/

const Auth = {

    version: "20.0.0",

    initialized: false,

    init() {
        alert("Auth.init");

        if (this.initialized) return;

        this.initialized = true;

        console.log("Lexora Auth Initialized");

        this.bindEvents();
this.initializeFirebase();
   // Start the auth state listener (only once)
if (!this._listenerStarted) {
    this._listenerStarted = true;
    this.onAuthStateChanged((user) => {
        this.currentUser = user;

        document.dispatchEvent(
            new CustomEvent("auth-state-changed", {
                detail: { user }
            })
        );
    });
}     
    },

    bindEvents() {

    console.log("Auth Events Ready");

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            try {
                await this.login(
                    document.getElementById("loginEmail").value,
                    document.getElementById("loginPassword").value
                );

                Lexora.closeModal("loginModal");
                Lexora.showToast("Login Successful", "success");

            } catch (error) {
                Lexora.showToast(error.message, "error");
            }
        });
    }

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            try {
                await this.signUp(
                    document.getElementById("signupEmail").value,
                    document.getElementById("signupPassword").value
                );

                Lexora.closeModal("signupModal");
                Lexora.showToast("Account Created", "success");

            } catch (error) {
                Lexora.showToast(error.message, "error");
            }
        });
    }

}

};

document.addEventListener("DOMContentLoaded", () => {

    Auth.init();

});

/* ==========================================
   Firebase Authentication Reference
========================================== */

Auth.firebase = {

    auth: null,

    ready: false

};

/* ==========================================
   Initialize Firebase Auth
========================================== */

Auth.initializeFirebase = function () {

    if (typeof auth === "undefined") {

        console.warn("Firebase Auth not loaded.");

        return;

    }

    this.firebase.auth = auth;
if (window.auth) {
    this.firebase.auth = window.auth;
}
    this.firebase.ready = true;
    Object.freeze(this.firebase);
window.Auth = Auth;
    console.log("Firebase Authentication Ready");

};

/* ==========================================
   Check Authentication
========================================== */

Auth.isReady = function () {

    return !!(
    this.firebase &&
    this.firebase.ready &&
    this.firebase.auth
);

};

/* ==========================================
   Create Account
========================================== */

Auth.signUp = async function (email, password) {

    if (!this.isReady()) {

        console.error("Firebase Auth is not ready.");

        return false;

    }

    try {
email = String(email).trim().toLowerCase();

if (!email || !password) {
    throw new Error("Email and password are required.");
}
        const userCredential =
            await window.createUserWithEmailAndPassword(
                this.firebase.auth,
                email,
                password
            );

        console.log("Account Created");

        return userCredential;

    } catch (error) {
    console.error("Signup error:", error.message);
    if (window.Lexora?.showToast) {
        window.Lexora.showToast(error.message, "error");
    }
    throw error;
}

        console.error(error);

        return false;

    }

};


Auth.login = async function (email, password) {
    alert("Auth.login called");
    if (!this.isReady()) {
        console.error("Firebase Auth is not ready.");
        return false;
    }
    try {
        email = String(email).trim().toLowerCase();

if (!email || !password) {
    throw new Error("Email and password are required.");
}
        const userCredential = await window.signInWithEmailAndPassword(
            this.firebase.auth,
            email,
            password
        );
        console.log("Login successful");
        return userCredential;
    } catch (error) {
    console.error("Login error:", error.message);
    if (window.Lexora?.showToast) {
        window.Lexora.showToast(error.message, "error");
    }
    throw error;
    }
};

Auth.logout = async function () {
    if (!this.isReady()) {
        console.error("Firebase Auth is not ready.");
        return;
    }
    try {
       await window.signOut(this.firebase.auth);
        console.log("User signed out");
        if (window.Lexora?.showToast) {
    window.Lexora.showToast("Logged out successfully", "success");
      }      
    } catch (error) {
    console.error("Logout error:", error.message);

    if (window.Lexora?.showToast) {
        window.Lexora.showToast(error.message, "error");
    }

    throw error;
     }
};

Auth.resetPassword = async function (email) {
    if (!this.isReady()) {
        console.error("Firebase Auth is not ready.");
        return false;
    }
    try {
        email = String(email).trim().toLowerCase();

if (!email) {
    throw new Error("Email is required.");
}
        await window.sendPasswordResetEmail(this.firebase.auth, email);
        console.log("Password reset email sent");
        return true;
    } catch (error) {
        console.error("Password reset error:", error.message);
        throw error;
    }
};

Auth.onAuthStateChanged = function (callback) {
    if (!this.isReady()) {
        console.error("Firebase Auth is not ready.");
        return () => {};
    }
    return window.onAuthStateChanged(this.firebase.auth, (user) => {
        Auth.currentUser = user;
        if (user) {
    Lexora.session.saveUser({
        uid: user.uid,
        email: user.email
    });
} else {
    Lexora.session.clear();
}
        if (callback) callback(user);
    });
};

