import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
if (typeof window !== 'undefined') {
  const missingConfig = [];
  if (!firebaseConfig.apiKey) missingConfig.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingConfig.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingConfig.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missingConfig.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missingConfig.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missingConfig.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  
  if (missingConfig.length > 0) {
    console.error('❌ Missing Firebase configuration:', missingConfig);
    console.error('Please check your .env.local file.');
  } else {
    console.log('✅ Firebase configuration loaded:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
  }
}

// Initialize Firebase only if it hasn't been initialized already
let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  
  if (typeof window !== 'undefined') {
    console.log('✅ Firebase initialized successfully');
    console.log('✅ Firestore database initialized');
  }
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error);
  if (typeof window !== 'undefined') {
    alert(`Firebase initialization failed: ${error.message}\n\nPlease check:\n1. Firestore is enabled in Firebase Console\n2. Your .env.local file has all required values\n3. Security rules allow access`);
  }
  // Re-throw to prevent app from running with invalid config
  throw error;
}

export { db };

