// src/firebase.js

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZvhdDJ2QYRwD-W13jL1qYw3qYr__PZVg",
  authDomain: "gibilance.firebaseapp.com",
  projectId: "gibilance",
  storageBucket: "gibilance.firebasestorage.app",
  messagingSenderId: "940783638232",
  appId: "1:940783638232:web:3089e56df2b9d68f2da9ad",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);