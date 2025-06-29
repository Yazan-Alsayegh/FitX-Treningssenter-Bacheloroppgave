const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fitx-b89c4-default-rtdb.europe-west1.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };