import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCAhf_kfjil-0CIzfrSZIVV7ED3ysJsMLc",
  authDomain: "subhu-2cfeb.firebaseapp.com",
  projectId: "subhu-2cfeb",
  storageBucket: "subhu-2cfeb.firebasestorage.app",
  messagingSenderId: "193656938778",
  appId: "1:193656938778:web:f0a49719ddb7e10edb8ca3"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
