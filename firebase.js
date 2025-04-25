// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {

    apiKey: "AIzaSyCDT0KXhkBDaFMlpFtTMRg-GIe5p9kcCuw",
  
    authDomain: "taskheros0-2.firebaseapp.com",
  
    projectId: "taskheros0-2",
  
    storageBucket: "taskheros0-2.firebasestorage.app",
  
    messagingSenderId: "502026970434",
  
    appId: "1:502026970434:web:1b67523e81e1eb88ebd4db"
  
  };
  

// initialize firebase app
const app = initializeApp(firebaseConfig);

// initialize auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
