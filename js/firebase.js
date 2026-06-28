"use strict";

/* ==========================================
   Firebase v12 Configuration
========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ==========================================
   Firebase Config
========================================== */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"

};

/* ==========================================
   Initialize Firebase
========================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

window.auth = auth;
window.db = db;
window.doc = doc;
window.getDoc = getDoc;
window.collection = collection;
window.query = query;
window.orderBy = orderBy;
window.limit = limit;
window.onSnapshot = onSnapshot;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;

console.log("Firebase Initialized");
