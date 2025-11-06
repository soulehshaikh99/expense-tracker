# Firestore Setup Instructions

If you're getting a **400 Bad Request** error when trying to add expenses, follow these steps:

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **expense-tracker-90971**
3. Click on **"Firestore Database"** in the left sidebar
4. If you see "Create database", click it
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose the closest to you)
7. Click **"Enable"**

## Step 2: Set Up Firestore Security Rules

1. In Firestore Database, click on the **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"** to save the rules

⚠️ **Note**: These rules allow anyone to read/write. For production, you should add authentication and restrict access.

## Step 3: Create Firestore Index (if needed)

If you get an error about missing index:

1. Check the browser console for an error message
2. The error will include a link to create the index
3. Click the link and create the index in Firebase Console
4. Wait for the index to be created (usually takes a few minutes)

## Step 4: Verify Your Setup

1. Make sure your `.env.local` file has all the Firebase configuration values
2. Restart your development server: `npm run dev`
3. Try adding an expense again

## Common Issues

### 400 Bad Request
- **Cause**: Firestore security rules blocking access
- **Solution**: Follow Step 2 above to set up security rules

### Permission Denied
- **Cause**: Security rules are too restrictive
- **Solution**: Update rules to allow read/write (see Step 2)

### Missing Index
- **Cause**: Firestore needs an index for the `orderBy('date')` query
- **Solution**: Check console for the link to create the index, or follow Step 3

### Database Not Found
- **Cause**: Firestore database not created
- **Solution**: Follow Step 1 to create the database

## Testing Your Setup

After completing the steps above:

1. Open your app at `http://localhost:3000`
2. Try adding a test expense
3. Check the browser console for any errors
4. If successful, you should see the expense appear in the list
5. Check Firebase Console → Firestore Database → Data tab to see your expenses

