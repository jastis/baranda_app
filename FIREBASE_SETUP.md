# Firebase Setup Guide for Aswani

This guide will walk you through setting up Firebase for the Aswani app. Firebase provides authentication, database, and storage services for free (with limits).

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `aswani` (or your preferred name)
4. (Optional) Enable Google Analytics - you can disable it for development
5. Click "Create project"
6. Wait for the project to be created, then click "Continue"

## Step 2: Register Your App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register app:
   - App nickname: `Aswani Web App`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. Copy the Firebase configuration object. It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

4. **Save these credentials** - you'll need them later

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Select **Email/Password** as a sign-in method
4. Enable **Email/Password**
5. (Optional) Disable **Email link (passwordless sign-in)** for now
6. Click "Save"

### Optional: Add Other Authentication Methods

You can also enable:
- Google Sign-In
- Phone Authentication
- Anonymous Authentication

For this app, Email/Password is sufficient.

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (for development)
   - We'll add security rules later
4. Choose a location closest to your users
   - Example: `us-central` (United States)
   - Example: `europe-west` (Europe)
5. Click "Enable"

### Configure Firestore Security Rules

After creating the database:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if true;  // Anyone can read user profiles
      allow write: if isOwner(userId);  // Only owner can update their profile
    }

    // Requests collection
    match /requests/{requestId} {
      allow read: if true;  // Anyone can read requests
      allow create: if isAuthenticated();  // Any authenticated user can create
      allow update: if isAuthenticated() && (
        resource.data.requesterId == request.auth.uid ||
        resource.data.chosenVendorId == request.auth.uid
      );
      allow delete: if isAuthenticated() &&
        resource.data.requesterId == request.auth.uid;
    }

    // Responses collection
    match /responses/{responseId} {
      allow read: if true;  // Anyone can read responses
      allow create: if isAuthenticated();  // Any authenticated user can create
      allow update: if isAuthenticated() &&
        resource.data.vendorId == request.auth.uid;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() &&
        request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        request.auth.uid in resource.data.participants;
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        resource.data.senderId == request.auth.uid;
    }

    // Reviews collection (for future use)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        resource.data.reviewerId == request.auth.uid;
    }
  }
}
```

3. Click "Publish"

### Create Firestore Indexes

For better query performance, create these composite indexes:

1. Go to **Firestore Database** → **Indexes** tab
2. Click "Add index"

**Index 1: Requests by status and creation time**
- Collection ID: `requests`
- Fields:
  - `status` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Index 2: Requests by requester and creation time**
- Collection ID: `requests`
- Fields:
  - `requesterId` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Index 3: Messages by conversation and timestamp**
- Collection ID: `messages`
- Fields:
  - `conversationId` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection

**Index 4: Conversations by participants and last message time**
- Collection ID: `conversations`
- Fields:
  - `participants` (Array contains)
  - `lastMessageTime` (Descending)
- Query scope: Collection

Alternatively, you can wait for the app to suggest creating indexes when you run queries that need them.

## Step 5: Set Up Firebase Storage

1. In Firebase Console, go to **Build** → **Storage**
2. Click "Get started"
3. Start in **test mode** (for development)
4. Choose the same location as your Firestore database
5. Click "Done"

### Configure Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Profile images
    match /profiles/{userId}/{fileName} {
      allow read: if true;  // Anyone can read profile images
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Request images
    match /requests/{requestId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    // Response images
    match /responses/{responseId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    // Message images
    match /messages/{conversationId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

3. Click "Publish"

## Step 6: Configure Your App

1. Open `src/services/firebase.ts` in your code editor
2. Replace the placeholder configuration with your Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Important**:
- Replace `YOUR_API_KEY_HERE` with your actual API key
- Replace `YOUR_PROJECT_ID` with your Firebase project ID
- Replace `YOUR_MESSAGING_SENDER_ID` with your sender ID
- Replace `YOUR_APP_ID` with your app ID

## Step 7: Test Your Setup

1. Start your Expo app:
   ```bash
   npm start
   ```

2. Try to sign up with a test account:
   - Email: `test@example.com`
   - Password: `password123`

3. Check Firebase Console:
   - Go to **Authentication** → **Users** to see if the user was created
   - Go to **Firestore Database** to see if user data was written

## Step 8: Production Setup (Optional)

For production, you should:

### 1. Update Security Rules

Change from test mode to production mode:

**Firestore**: Update rules to be more restrictive
**Storage**: Update rules to validate file types and sizes

### 2. Set Up Environment Variables

Don't hardcode Firebase credentials in production:

1. Create `.env` file (add to `.gitignore`):
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

2. Use environment variables in your code

### 3. Enable Additional Security

- Set up Firebase App Check (prevents abuse)
- Enable reCAPTCHA for web
- Set up rate limiting
- Monitor usage in Firebase Console

## Troubleshooting

### Error: "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify Firebase credentials are correct
- Check if Firebase services are enabled

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify the user has permission for the operation

### Error: "Firebase: Error (auth/email-already-in-use)"
- The email is already registered
- Try logging in instead of signing up
- Or use a different email

### Queries are slow or failing
- Create the necessary composite indexes
- Check Firebase Console → Firestore → Indexes
- Look for suggested indexes in your console logs

## Free Tier Limits

Firebase offers a generous free tier:

- **Authentication**: Unlimited users
- **Firestore**:
  - 1 GiB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
- **Storage**: 5 GB storage, 1 GB/day downloads
- **Hosting**: 10 GB storage, 360 MB/day bandwidth

These limits are usually sufficient for development and small-scale production apps.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## Support

If you encounter issues:
1. Check the [Firebase Status Dashboard](https://status.firebase.google.com/)
2. Review [Firebase Documentation](https://firebase.google.com/docs)
3. Ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
4. Contact Firebase Support (paid plans only)
