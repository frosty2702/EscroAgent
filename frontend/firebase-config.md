# Firebase Configuration Guide

To complete the Firebase integration, you need to create a `.env.local` file in the frontend directory with your Firebase configuration:

```env
# Firebase Configuration
# Get these values from your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## How to get these values:

1. Go to your Firebase Console (https://console.firebase.google.com)
2. Select your TrustFlow project
3. Click on the gear icon (Settings) → Project Settings
4. Scroll down to "Your apps" section
5. If you haven't added a web app yet, click "Add app" and select the web icon (</>)
6. Copy the config values from the Firebase SDK snippet

## Steps to set up:

1. Create the `.env.local` file in the `frontend/` directory
2. Copy the template above and replace with your actual values
3. Restart your development server
4. The Firebase integration should now work properly

## Database Setup:

Make sure your Firestore database is set up with the security rules from the `firestore.rules` file in the project root. 