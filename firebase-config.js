// js/firebase-config.js
// 1) Replace the placeholders inside firebaseConfig with YOUR project config from Firebase Console.
// 2) Replace COLLEGE_DOMAIN (e.g., '@skasc.ac.in').
// 3) This module exports { app, auth, db } for use in other scripts.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const COLLEGE_DOMAINS = [
  "@skasc.ac.in",
  "@student.skasc.ac.in",
  "@skasc.edu.in"
];

export const COLLEGE_DOMAIN = COLLEGE_DOMAINS[0];

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
