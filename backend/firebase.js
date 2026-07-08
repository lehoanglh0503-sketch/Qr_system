const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let db = null;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  
  initializeApp({
    credential: cert(serviceAccount)
  });

  db = getFirestore();
  console.log('Firebase Admin initialized successfully.');
} else {
  console.warn('⚠️ WARNING: serviceAccountKey.json not found in backend folder!');
  console.warn('⚠️ Firestore will not work until you add your Firebase credentials.');
  // Create a dummy db object to prevent immediate crashes before setup
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async () => ({}),
        update: async () => ({}),
        delete: async () => ({})
      }),
      get: async () => ({ docs: [], empty: true, forEach: () => {} }),
      add: async () => ({ id: 'dummy-id' }),
      where: function() { return this; }
    })
  };
}

module.exports = { db };
