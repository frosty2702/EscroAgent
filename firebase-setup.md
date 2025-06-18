# Firebase Setup Guide for TrustFlow

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or select your existing TrustFlow project
3. Enable Google Analytics (optional)

## 2. Set up Firestore Database

1. In the Firebase console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll apply security rules later)
4. Select a location (choose closest to your users)

## 3. Configure Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace the default rules with the content from `firestore.rules` in your project
3. Click **Publish**

## 4. Add Web App

1. In Project Settings, scroll to "Your apps"
2. Click the web icon `</>`
3. Register your app with name "TrustFlow"
4. Copy the Firebase configuration object

## 5. Set up Environment Variables

Create `frontend/.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Test the Integration

1. Start the frontend: `cd frontend && npm run dev`
2. Connect your wallet
3. Try creating a test agreement
4. Check Firestore console to see the data

## 7. Agent Integration

The agent service is already configured to work with Firestore. Make sure:

1. The agent has proper Firebase service account credentials
2. The agent can read from the `agreements` collection
3. The agent can update agreement status when conditions are met

## Collections Structure

### `agreements`
- **Document ID**: Auto-generated
- **Fields**:
  - `payerAddress` (string)
  - `payeeAddress` (string)
  - `amount` (number)
  - `conditionType` (number: 0-4)
  - `description` (string)
  - `status` (string: pending/funded/settled/disputed)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
  - `contractAddress` (string, optional)
  - `transactionHash` (string, optional)
  - Condition-specific fields based on type

### `agent_logs` (for agent monitoring)
- **Document ID**: Auto-generated
- **Fields**: Agent operation logs

### `public/stats` (public statistics)
- **Document ID**: `stats`
- **Fields**: Public platform statistics

## Security Notes

- The current rules allow authenticated users to create/read their own agreements
- The agent service account needs special permissions
- All sensitive operations require authentication
- Input validation is enforced at the database level 