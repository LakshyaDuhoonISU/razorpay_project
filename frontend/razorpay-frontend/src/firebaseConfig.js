// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBihoWlKs9Mx1i4PCDA6l5nCQBzj2KeO_Y",
  authDomain: "razorpay-login.firebaseapp.com",
  projectId: "razorpay-login",
  storageBucket: "razorpay-login.firebasestorage.app",
  messagingSenderId: "575733802481",
  appId: "1:575733802481:web:7c36ef2ec08a8c99891050",
  measurementId: "G-FPFE2ZRRNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };