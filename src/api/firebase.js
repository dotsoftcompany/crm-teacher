import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

//main firebase database api
const firebaseConfig = {
  apiKey: 'AIzaSyAPEZ6iRuFA9fDtLO2xE3iQOpbpW8NljJ4',
  authDomain: 'crm-system-4fefe.firebaseapp.com',
  projectId: 'crm-system-4fefe',
  storageBucket: 'crm-system-4fefe.appspot.com',
  messagingSenderId: '209900564275',
  appId: '1:209900564275:web:43f0514d09305d7dd15846',
};

const firebaseApp1 = initializeApp(firebaseConfig, 'app1');

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(firebaseApp1);

let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const storage = getStorage();
