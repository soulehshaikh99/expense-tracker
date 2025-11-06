'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [testDocId, setTestDocId] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const testFirestoreConnection = async () => {
    try {
      setStatus('checking');
      setMessage('Testing Firestore connection...');
      
      // Add a timeout to catch hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout - Firestore may not be enabled')), 10000);
      });
      
      // Try to read from the collection with timeout
      const testQueryPromise = getDocs(collection(db, 'expenses'));
      const testQuery = await Promise.race([testQueryPromise, timeoutPromise]) as any;
      
      setMessage('✅ Read test successful');
      
      // Try to write a test document
      const testDocPromise = addDoc(collection(db, 'expenses'), {
        title: 'Firestore Connection Test',
        amount: 0,
        paymentMode: 'Cash',
        forWhom: 'self',
        date: Timestamp.now(),
        paymentReceived: false,
        paymentReceivedDate: null,
      });
      
      const testDoc = await Promise.race([testDocPromise, timeoutPromise]) as any;
      
      setTestDocId(testDoc.id);
      setMessage('✅ Write test successful! Firestore is working correctly.');
      setStatus('success');
      
      // Clean up test document after 2 seconds
      setTimeout(async () => {
        try {
          await deleteDoc(doc(db, 'expenses', testDoc.id));
          console.log('Test document cleaned up');
        } catch (e) {
          console.error('Failed to clean up test document:', e);
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Firestore connection test failed:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
      setStatus('error');
      
      let errorMsg = '❌ Firestore connection failed.\n\n';
      
      // Check for various error conditions
      const errorCode = error?.code;
      const errorMessage = error?.message || '';
      const is400Error = errorMessage.includes('400') || 
                        errorMessage.includes('Bad Request') ||
                        errorMessage.includes('timeout') ||
                        errorCode === 'unavailable' ||
                        errorCode === 'unauthenticated' ||
                        errorCode === 'deadline-exceeded';
      
      if (errorCode === 'permission-denied') {
        errorMsg += 'Permission denied.\n\n' +
          'Please go to Firebase Console → Firestore Database → Rules\n' +
          'And set: allow read, write: if true;';
      } else if (is400Error) {
        errorMsg += '🚨 Firestore is NOT enabled in your Firebase project!\n\n' +
          'The 400 Bad Request error means Firestore database does not exist.\n\n' +
          '📋 You MUST enable Firestore first:\n\n' +
          '1. Click the "Open Firebase Console" button below\n' +
          '2. Click "Create database" (if you see this button)\n' +
          '3. ⚠️ IMPORTANT: Choose "Native mode" (NOT Datastore mode)\n' +
          '4. Choose "Start in test mode"\n' +
          '5. Select a location (choose closest to you)\n' +
          '6. Click "Enable"\n\n' +
          'After enabling, set security rules:\n' +
          '- Go to "Rules" tab\n' +
          '- Replace with:\n' +
          '  allow read, write: if true;\n' +
          '- Click "Publish"\n\n' +
          'Then refresh this page and click "Retry Connection Test"';
      } else {
        errorMsg += `Error: ${errorMessage || errorCode || 'Unknown error'}\n\n` +
          'If you see 400 errors in the browser console, Firestore is not enabled.\n' +
          'Please enable Firestore in Firebase Console first.';
      }
      
      setMessage(errorMsg);
    }
  };

  if (status === 'checking') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <p className="text-sm text-yellow-800">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-green-800 whitespace-pre-line">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-4">
      <p className="text-sm text-red-900 whitespace-pre-line font-bold mb-3 text-base">🚨 Firestore Connection Error</p>
      <p className="text-sm text-red-800 whitespace-pre-line mb-4">{message}</p>
      <div className="flex gap-3">
        <a
          href="https://console.firebase.google.com/project/expense-tracker-90971/firestore"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
        >
          Open Firebase Console
        </a>
        <button
          onClick={testFirestoreConnection}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry Connection Test
        </button>
      </div>
    </div>
  );
}

