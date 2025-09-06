import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'apexvest-2jp25',
  appId: '1:430948091820:web:fafe4a0393251c1aab5c09',
  storageBucket: 'apexvest-2jp25.firebasestorage.app',
  apiKey: 'AIzaSyA8vEkftJaDguw8JDhkWH_Tm8aR-TRYMi4',
  authDomain: 'apexvest-2jp25.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '430948091820',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
