import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDiHSz-cD_Oh4zSjZi4dkcHo_BW2hykZpo",
  authDomain: "taskmate-e48a0.firebaseapp.com",
  projectId: "taskmate-e48a0",
  storageBucket: "taskmate-e48a0.firebasestorage.app",
  messagingSenderId: "352768078438",
  appId: "1:352768078438:web:627accec6cf2a300cdb3a7",
  measurementId: "G-3X8S52451X"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
