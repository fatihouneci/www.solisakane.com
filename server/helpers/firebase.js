import firebase from "firebase-admin";

let firebaseApp = null;

try {
  // Only initialize Firebase if service account keys are available
  if (process.env.NODE_ENV !== 'staging' || process.env.FIREBASE_ENABLED === 'true') {
    const serviceAccount = await import("./serviceAccountKeys.json", { with: { "type": "json" } });
    
    firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount.default),
    });
  }
} catch (error) {
  console.warn('Firebase initialization skipped:', error.message);
}

export default firebaseApp;
