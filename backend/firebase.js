// firebase.js (Backend)
import admin from 'firebase-admin';

const serviceAccount = require('/Users/lakshyaduhoon/Documents/razorpay_project/backend/razorpay-login-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;