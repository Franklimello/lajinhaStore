// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCPOsZYAXUzdEZ_wQV7HpON_cZ0QGJpTqI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "compreaqui-324df.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "compreaqui-324df",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "compreaqui-324df.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "821962501479",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:821962501479:web:2dbdb1744b7d5849a913c2",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-B5WBJYR1YT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (browser only)
let analytics = null;
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.warn("⚠️ Analytics não inicializado:", e?.message || e);
}

// Initialize Firestore (usando API estável)
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// Log para verificar se o Storage foi inicializado corretamente
console.log("🔥 Firebase Storage inicializado:", storage);
console.log("📦 Storage Bucket:", firebaseConfig.storageBucket);

// Enable offline persistence to leverage IndexedDB and reduce network reads
// If multiple tabs are open, this may fail with a persistence error; ignore gracefully
// IMPORTANTE: Apenas uma instância pode usar persistência por vez
let persistenceEnabled = false;
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      persistenceEnabled = true;
      console.log("✅ Persistência IndexedDB habilitada");
    })
    .catch((error) => {
      // Erros esperados: failed-precondition (múltiplas abas) ou unimplemented
      if (error.code === 'failed-precondition') {
        console.warn("⚠️ Persistência IndexedDB: Múltiplas abas abertas (esperado)");
      } else if (error.code === 'unimplemented') {
        console.warn("⚠️ Persistência IndexedDB não implementada neste ambiente");
      } else {
        console.warn("⚠️ Persistência IndexedDB não disponível:", error.message);
      }
    });
} catch (e) {
  console.warn("⚠️ Erro ao tentar habilitar persistência:", e.message);
}

export { app, db, storage, messaging, analytics };
