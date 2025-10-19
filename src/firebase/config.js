// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPOsZYAXUzdEZ_wQV7HpON_cZ0QGJpTqI",
  authDomain: "compreaqui-324df.firebaseapp.com",
  projectId: "compreaqui-324df",
  storageBucket: "compreaqui-324df.firebasestorage.app",
  messagingSenderId: "821962501479",
  appId: "1:821962501479:web:2dbdb1744b7d5849a913c2",
  measurementId: "G-B5WBJYR1YT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (usando API estável)
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Log para verificar se o Storage foi inicializado corretamente
console.log("🔥 Firebase Storage inicializado:", storage);
console.log("📦 Storage Bucket:", storage.bucket);

// Enable offline persistence to leverage IndexedDB and reduce network reads
// If multiple tabs are open, this may fail with a persistence error; ignore gracefully
try {
  enableIndexedDbPersistence(db);
  console.log("✅ Persistência IndexedDB habilitada");
} catch (e) {
  // ignore persistence errors (e.g., failed-precondition / unimplemented)
  console.warn("⚠️ Persistência IndexedDB não disponível:", e.message);
}

export { app, db, storage };
