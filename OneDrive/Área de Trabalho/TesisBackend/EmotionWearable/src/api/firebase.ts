import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// --- TUS VALORES REALES PARA TU TESIS ---
const firebaseConfig = {
  apiKey: "AIzaSyC9AqBT1MMDyLkR1GSOG-ZOWJmrHtEYH3Q",
  authDomain: "tesisemocionestet.firebaseapp.com",
  projectId: "tesisemocionestet",
  storageBucket: "tesisemocionestet.firebasestorage.app",
  messagingSenderId: "560078547455",
  appId: "1:560078547455:web:b26d56c2e0805dec0fdfca",
  measurementId: "G-M7F3PPZSXN",
  databaseURL: "https://tesisemocionestet-default-rtdb.firebaseio.com"
};
// -------------------------------------------

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app);
const db = getDatabase(app, "https://tesisemocionestet-default-rtdb.firebaseio.com");

export { app, auth, db };    