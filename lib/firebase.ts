import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// User's provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAhf_kfjil-0CIzfrSZIVV7ED3ysJsMLc",
  authDomain: "subhu-2cfeb.firebaseapp.com",
  projectId: "subhu-2cfeb",
  storageBucket: "subhu-2cfeb.firebasestorage.app",
  messagingSenderId: "193656938778",
  appId: "1:193656938778:web:f0a49719ddb7e10edb8ca3"
}

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
