const admin = require('firebase-admin');
const serviceAccount = require('./razorpay-login-firebase-adminsdk.json');

// Initialize Firebase Admin SDK for authentication
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount) // Only credential is needed for auth
});

module.exports = admin;