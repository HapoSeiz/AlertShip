import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXNBIyCWTYavM1d4m5bWEkjd0RBWwIgEo",
  authDomain: "alertship-3a49e.firebaseapp.com",
  databaseURL: "https://alertship-3a49e-default-rtdb.firebaseio.com",
  projectId: "alertship-3a49e",
  storageBucket: "alertship-3a49e.firebasestorage.app",
  messagingSenderId: "868697532708",
  appId: "1:868697532708:web:fc90417dce178a802cebb1",
  measurementId: "G-9BCR5HQ2GC"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a reference to the Realtime Database
export const db = getFirestore(app);

export { app }; 