# Expense Tracker

A modern expense tracking web application built with Next.js, TypeScript, and Firebase.

## Features

- ✅ Add, edit, and delete expenses
- ✅ Track expenses by person (self or others)
- ✅ Filter by payment mode (Credit Card, Debit Card, UPI, Cash)
- ✅ Calculate monthly totals
- ✅ Track payments received from others
- ✅ Responsive design for desktop and mobile
- ✅ Monthly summary with breakdowns

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database (start in test mode)
   - Create a `.env.local` file in the root directory with your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   - You can find these values in Firebase Console → Project Settings → Your apps → Web app config

### 3. Run the development server:
```bash
npm run dev
```

### 4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding Sample Data

To add the sample expenses you provided, you can manually add them through the app:

1. Recharge - ₹489 - UPI - Self
2. Bharatgas - ₹860 - Debit Card - Self
3. Medicine - ₹555.96 - Cash - Self
4. Face Wash - ₹414 - Credit Card - Self
5. Amazon (Spray Bottle, Scalp Massager) - ₹323 - Credit Card - Self
6. Electricity Bill - ₹2854 - UPI - Self

Or use the app's interface to add them one by one.

## Data Structure

Each expense contains:
- **Title**: Purchase purpose/expense title
- **Amount**: Amount spent/received
- **Payment Mode**: Credit Card, Debit Card, UPI, or Cash
- **For Whom**: "self" or person's name
- **Date**: Date of expense
- **Payment Received**: Boolean flag (only for expenses not for self)

## Features Breakdown

### Monthly Summary
- Total spent by you this month
- Amount spent for others (with received/pending breakdown)
- Net amount (your expenses + pending from others)
- Breakdown by payment mode
- Quick stats

### Filtering
- Filter by month (with navigation arrows)
- Filter by payment mode (All, Credit Card, Debit Card, UPI, Cash)
- Filter by "For Whom" (All, Self, or specific person)

### Expense Management
- Add new expenses with all required fields
- Edit existing expenses
- Delete expenses (with confirmation)
- Mark payment received for expenses made for others

## Deployment to Vercel

1. Push your code to GitHub
2. Import your project in Vercel
3. Add all the Firebase environment variables in Vercel's project settings (Environment Variables)
4. Deploy!

The app is fully configured for Vercel deployment with the `vercel.json` file included.

