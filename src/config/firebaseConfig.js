const firebase = require("firebase");
const firestore = require("firebase/firestore");
const config = require("./config");
const admin = require("firebase-admin");

const firebaseApp = firebase.initializeApp(config.firebaseConfig);
admin.initializeApp({
  credential: admin.credential.cert(config.firebaseAdminConfig),
});

const db = firebaseApp.firestore();
module.exports = { db, firebaseApp };
