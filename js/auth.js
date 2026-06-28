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

        if (this.initialized) return;

        this.initialized = true;

        console.log("Lexora Auth Initialized");

        this.bindEvents();
this.initializeFirebase();
    },

    bindEvents() {

        console.log("Auth Events Ready");

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

    this.firebase.ready = true;

    console.log("Firebase Authentication Ready");

};

/* ==========================================
   Check Authentication
========================================== */

Auth.isReady = function () {

    return this.firebase.ready;

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

        const userCredential =
            await createUserWithEmailAndPassword(
                this.firebase.auth,
                email,
                password
            );

        console.log("Account Created");

        return userCredential;

    } catch (error) {

        console.error(error);

        return false;

    }

};

