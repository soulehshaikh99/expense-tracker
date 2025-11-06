// Script to seed sample data into Firebase
// Run this with: npx ts-node scripts/seed-data.ts
// Make sure you have your Firebase config in .env.local

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const sampleExpenses = [
  {
    title: 'Recharge',
    amount: 489,
    paymentMode: 'UPI' as const,
    forWhom: 'self',
    date: Timestamp.fromDate(new Date()),
    paymentReceived: false,
  },
  {
    title: 'Bharatgas',
    amount: 860,
    paymentMode: 'Debit Card' as const,
    forWhom: 'self',
    date: Timestamp.fromDate(new Date()),
    paymentReceived: false,
  },
  {
    title: 'Medicine',
    amount: 555.96,
    paymentMode: 'Cash' as const,
    forWhom: 'self',
    date: Timestamp.fromDate(new Date()),
    paymentReceived: false,
  },
  {
    title: 'Face Wash',
    amount: 414,
    paymentMode: 'Credit Card' as const,
    forWhom: 'self',
    date: Timestamp.fromDate(new Date()),
    paymentReceived: false,
  },
  {
    title: 'Amazon (Spray Bottle, Scalp Massager)',
    amount: 323,
    paymentMode: 'Credit Card' as const,
    forWhom: 'self',
    date: Timestamp.fromDate(new Date()),
    paymentReceived: false,
  },
  {
    title: 'Electricity Bill',
    amount: 2854,
    paymentMode: 'UPI' as const,
    forWhom: 'self',
    date: Timestamp.fromDate(new Date()),
    paymentReceived: false,
  },
];

async function seedData() {
  try {
    console.log('Seeding sample data...');
    for (const expense of sampleExpenses) {
      await addDoc(collection(db, 'expenses'), expense);
      console.log(`Added: ${expense.title}`);
    }
    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();

