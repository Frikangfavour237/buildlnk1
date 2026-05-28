import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXhbjtMCxeS9eMZeoTfSVf6vH9OH7l3FU",
  authDomain: "buildin-1dd4d.firebaseapp.com",
  projectId: "buildin-1dd4d",
  storageBucket: "buildin-1dd4d.firebasestorage.app",
  messagingSenderId: "155039505258",
  appId: "1:155039505258:web:68daa7581c11bb28a16313"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
