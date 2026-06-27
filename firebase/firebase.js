// Firebase v12 Modular SDK

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCj2Qmie4sM8UN-bFuM8kXZ0aHWnaaaVbM",
  authDomain: "lexora-ai-platform.firebaseapp.com",
  projectId: "lexora-ai-platform",
  storageBucket: "lexora-ai-platform.firebasestorage.app",
  messagingSenderId: "42301263214",
  appId: "1:42301263214:web:96a7d5d1cde032d36d857f",
  measurementId: "G-T32ZZZL7HJ"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  analytics,
  auth,
  db,
  storage
};
