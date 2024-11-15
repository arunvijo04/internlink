// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config object (from Firebase Console)
const firebaseConfig = {
  aapiKey: "AIzaSyCD0Qu-oJqMiy-QeFy5WCSGOwSU0oJe2Yk",
  authDomain: "internlink-8bc52.firebaseapp.com",
  databaseURL: "https://internlink-8bc52-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "internlink-8bc52",
  storageBucket: "internlink-8bc52.firebasestorage.app",
  messagingSenderId: "78572110030",
  appId: "1:78572110030:web:f8c1f402c94dda4409909f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it for use in your app
const db = getFirestore(app);

export { db };

