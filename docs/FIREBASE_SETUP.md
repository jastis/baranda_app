# Firebase Setup Guide for Aswani App

This comprehensive guide will walk you through setting up Firebase for the Aswani marketplace app. The app uses multiple Firebase services including Authentication, Firestore, Storage, and Cloud Messaging.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Firebase Authentication Setup](#firebase-authentication-setup)
4. [Firestore Database Setup](#firestore-database-setup)
5. [Firebase Storage Setup](#firebase-storage-setup)
6. [Firebase Cloud Messaging Setup](#firebase-cloud-messaging-setup)
7. [iOS Configuration](#ios-configuration)
8. [Android Configuration](#android-configuration)
9. [Environment Variables](#environment-variables)
10. [Testing Firebase Setup](#testing-firebase-setup)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

- Google account
- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS: Xcode installed (Mac only)
- Android: Android Studio installed
- Firebase CLI installed: `npm install -g firebase-tools`

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `aswani-marketplace` (or your preferred name)
4. Click **Continue**
5. Enable/Disable Google Analytics (recommended: **Enable**)
6. If enabled, select or create a Google Analytics account
7. Click **Create project**
8. Wait for project creation (usually 30-60 seconds)
9. Click **Continue** when ready

### Step 2: Register Your Apps

#### For iOS:
1. In Firebase Console, click the **iOS** icon
2. Enter iOS bundle ID: `com.yourcompany.aswani` (use your actual bundle ID from app.json)
3. Enter App nickname: `Aswani iOS`
4. Enter App Store ID: (leave empty for now)
5. Click **Register app**
6. Download `GoogleService-Info.plist`
7. Save it to your project root (we'll move it later)

#### For Android:
1. In Firebase Console, click the **Android** icon
2. Enter Android package name: `com.yourcompany.aswani` (use your actual package from app.json)
3. Enter App nickname: `Aswani Android`
4. Enter Debug signing certificate SHA-1: (optional for now)
5. Click **Register app**
6. Download `google-services.json`
7. Save it to your project root (we'll move it later)

## Firebase Authentication Setup

### Step 1: Enable Email/Password Authentication

1. In Firebase Console, navigate to **Authentication** from left sidebar
2. Click **Get started** (if first time)
3. Click on **Sign-in method** tab
4. Click on **Email/Password** provider
5. Toggle **Enable** to ON
6. Click **Save**

### Step 2: Configure Authorized Domains

1. In **Sign-in method** tab, scroll down to **Authorized domains**
2. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (e.g., `aswani.app`)
   - Your Expo domain (for development)

### Step 3: Email Templates (Optional but Recommended)

1. Click on **Templates** tab
2. Customize these templates:
   - **Email address verification**
   - **Password reset**
   - **Email address change**
3. Update sender name to "Aswani Team"
4. Customize email content with your branding

## Firestore Database Setup

### Step 1: Create Firestore Database

1. Navigate to **Firestore Database** from left sidebar
2. Click **Create database**
3. Select **Start in production mode** (we'll add custom rules next)
4. Choose location: Select closest to your users (e.g., `us-central` for US/Americas, `europe-west` for Europe)
5. Click **Enable**
6. Wait for database creation (usually 1-2 minutes)

### Step 2: Set Up Security Rules

1. Click on **Rules** tab
2. Replace existing rules with the following comprehensive security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';
    }

    function isVendor() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'vendor';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Requests collection
    match /requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() &&
                      (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if resource.data.userId == request.auth.uid || isAdmin();
    }

    // Responses collection
    match /responses/{responseId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isVendor();
      allow update: if resource.data.vendorId == request.auth.uid || isAdmin();
      allow delete: if resource.data.vendorId == request.auth.uid || isAdmin();
    }

    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() &&
                    request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated() &&
                      request.auth.uid in request.resource.data.participants;
      allow update: if isAuthenticated() &&
                      request.auth.uid in resource.data.participants;
      allow delete: if isAdmin();
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.resource.data.senderId == request.auth.uid;
      allow update: if resource.data.senderId == request.auth.uid || isAdmin();
      allow delete: if isAdmin();
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if resource.data.userId == request.auth.uid;
      allow delete: if resource.data.userId == request.auth.uid || isAdmin();
    }

    // Escrow Transactions
    match /escrowTransactions/{transactionId} {
      allow read: if isAuthenticated() &&
                    (resource.data.requesterId == request.auth.uid ||
                     resource.data.vendorId == request.auth.uid ||
                     isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAdmin() ||
                      resource.data.requesterId == request.auth.uid;
      allow delete: if isAdmin();
    }

    // Wallet Transactions
    match /walletTransactions/{transactionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Wallets
    match /wallets/{walletId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }

    // User Verifications
    match /userVerifications/{verificationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(verificationId);
      allow update: if isOwner(verificationId) || isAdmin();
      allow delete: if isAdmin();
    }

    // User Reports
    match /userReports/{reportId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Blocked Users
    match /blockedUsers/{blockId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAuthenticated() || isAdmin();
    }

    // Referrals
    match /referrals/{referralId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Enhanced Reviews
    match /enhancedReviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if resource.data.reviewerId == request.auth.uid ||
                      resource.data.revieweeId == request.auth.uid ||
                      isAdmin();
      allow delete: if resource.data.reviewerId == request.auth.uid || isAdmin();
    }

    // Portfolio Items
    match /portfolioItems/{itemId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isVendor();
      allow update: if resource.data.vendorId == request.auth.uid || isAdmin();
      allow delete: if resource.data.vendorId == request.auth.uid || isAdmin();
    }

    // Favorites
    match /favorites/{favoriteId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if resource.data.userId == request.auth.uid;
      allow delete: if resource.data.userId == request.auth.uid || isAdmin();
    }

    // Advertisements (Admin only create/update)
    match /advertisements/{adId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Subscription Plans (Admin only create/update)
    match /subscriptionPlans/{planId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Vendor Subscriptions
    match /vendorSubscriptions/{subscriptionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isVendor();
      allow update: if resource.data.vendorId == request.auth.uid || isAdmin();
      allow delete: if isAdmin();
    }

    // Product Alerts
    match /productAlerts/{alertId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if resource.data.userId == request.auth.uid || isAdmin();
      allow delete: if resource.data.userId == request.auth.uid || isAdmin();
    }
  }
}
```

3. Click **Publish**

### Step 3: Create Indexes

Create composite indexes for better query performance:

1. Click on **Indexes** tab
2. Click **Add index**
3. Create the following indexes:

**Index 1: Requests by userId and status**
- Collection ID: `requests`
- Fields:
  - `userId` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Index 2: Responses by vendorId and status**
- Collection ID: `responses`
- Fields:
  - `vendorId` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)

**Index 3: Messages by conversationId**
- Collection ID: `messages`
- Fields:
  - `conversationId` (Ascending)
  - `createdAt` (Ascending)

**Index 4: Notifications by userId and read status**
- Collection ID: `notifications`
- Fields:
  - `userId` (Ascending)
  - `read` (Ascending)
  - `createdAt` (Descending)

**Index 5: Escrow by vendorId and status**
- Collection ID: `escrowTransactions`
- Fields:
  - `vendorId` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)

Note: You can also let Firebase automatically create indexes when needed. The app will show errors in the console with links to create missing indexes.

## Firebase Storage Setup

### Step 1: Enable Firebase Storage

1. Navigate to **Storage** from left sidebar
2. Click **Get started**
3. Review security rules (we'll customize them next)
4. Click **Next**
5. Select same location as your Firestore database
6. Click **Done**

### Step 2: Configure Storage Security Rules

1. Click on **Rules** tab
2. Replace existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isImageFile() {
      return request.resource.contentType.matches('image/.*');
    }

    function isPDFFile() {
      return request.resource.contentType == 'application/pdf';
    }

    function isValidSize() {
      // Max 10MB for images, 5MB for documents
      return request.resource.size < 10 * 1024 * 1024;
    }

    // Profile images
    match /profile_images/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImageFile() && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Request images
    match /request_images/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImageFile() && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Response images
    match /response_images/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImageFile() && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Portfolio images
    match /portfolio/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImageFile() && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Review images
    match /reviews/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImageFile() && isValidSize();
      allow delete: if isOwner(userId);
    }

    // ID verification documents
    match /id_documents/{userId}/{fileName} {
      allow read: if isOwner(userId); // Only owner can read their ID docs
      allow write: if isOwner(userId) && (isImageFile() || isPDFFile()) && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Business verification documents
    match /business_documents/{userId}/{fileName} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && (isImageFile() || isPDFFile()) && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Chat images
    match /chat_images/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImageFile() && isValidSize();
      allow delete: if isOwner(userId);
    }

    // Advertisement images (admin only)
    match /advertisements/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Will check admin status in Firestore
      allow delete: if isAuthenticated();
    }
  }
}
```

3. Click **Publish**

### Step 3: Configure CORS

Storage CORS is needed for web preview:

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Create a `cors.json` file in your project root:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  }
]
```

3. Run:
```bash
gsutil cors set cors.json gs://your-project-id.appspot.com
```

## Firebase Cloud Messaging Setup

### Step 1: Enable Cloud Messaging

1. Navigate to **Project Settings** (gear icon) > **Cloud Messaging** tab
2. Under **Cloud Messaging API (Legacy)**, note your **Server key** (we'll need this)
3. Cloud Messaging should already be enabled

### Step 2: Configure iOS Push Notifications

1. You need an Apple Developer Account ($99/year)
2. Create an APNs Authentication Key:
   - Go to [Apple Developer Console](https://developer.apple.com/account/)
   - Navigate to **Certificates, Identifiers & Profiles**
   - Click on **Keys** > **+** button
   - Enter Key Name: "Aswani APNs Key"
   - Check **Apple Push Notifications service (APNs)**
   - Click **Continue** > **Register**
   - Download the `.p8` file (save it securely, can't download again)
   - Note the **Key ID**
3. Upload to Firebase:
   - In Firebase Console > **Project Settings** > **Cloud Messaging**
   - Under **Apple app configuration**, click **Upload**
   - Upload your `.p8` file
   - Enter your **Key ID** and **Team ID** (from Apple Developer Account)
   - Click **Upload**

### Step 3: Configure Android Push Notifications

Android is automatically configured through `google-services.json`. No additional setup needed.

### Step 4: Set Up Cloud Functions for Notifications (Optional but Recommended)

1. Install Firebase Functions:
```bash
firebase login
firebase init functions
```

2. Select your Firebase project
3. Choose JavaScript or TypeScript
4. Install dependencies

5. Create notification function in `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Send notification when new response is created
exports.sendResponseNotification = functions.firestore
  .document('responses/{responseId}')
  .onCreate(async (snap, context) => {
    const response = snap.data();
    const requesterId = response.requesterId;

    // Get user's FCM token
    const userDoc = await admin.firestore().collection('users').doc(requesterId).get();
    const fcmToken = userDoc.data().fcmToken;

    if (!fcmToken) return;

    const message = {
      notification: {
        title: 'New Response Received!',
        body: `${response.vendorName} responded to your request`,
      },
      data: {
        type: 'new_response',
        responseId: context.params.responseId,
        requestId: response.requestId,
      },
      token: fcmToken,
    };

    return admin.messaging().send(message);
  });

// Send notification when payment is received
exports.sendPaymentNotification = functions.firestore
  .document('escrowTransactions/{transactionId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Check if status changed to 'held'
    if (oldData.status !== 'held' && newData.status === 'held') {
      const vendorDoc = await admin.firestore().collection('users').doc(newData.vendorId).get();
      const fcmToken = vendorDoc.data().fcmToken;

      if (!fcmToken) return;

      const message = {
        notification: {
          title: 'Payment Received!',
          body: `₦${newData.amount.toLocaleString()} has been deposited in escrow`,
        },
        data: {
          type: 'payment_received',
          transactionId: context.params.transactionId,
        },
        token: fcmToken,
      };

      return admin.messaging().send(message);
    }
  });

// Send notification for new messages
exports.sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const conversationDoc = await admin.firestore()
      .collection('conversations')
      .doc(message.conversationId)
      .get();

    const conversation = conversationDoc.data();
    const recipientId = conversation.participants.find(id => id !== message.senderId);

    const userDoc = await admin.firestore().collection('users').doc(recipientId).get();
    const fcmToken = userDoc.data().fcmToken;

    if (!fcmToken) return;

    const senderDoc = await admin.firestore().collection('users').doc(message.senderId).get();
    const senderName = senderDoc.data().name;

    const notification = {
      notification: {
        title: senderName,
        body: message.text,
      },
      data: {
        type: 'new_message',
        conversationId: message.conversationId,
      },
      token: fcmToken,
    };

    return admin.messaging().send(notification);
  });
```

6. Deploy functions:
```bash
firebase deploy --only functions
```

## iOS Configuration

### Step 1: Install Required Packages

```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/messaging
```

### Step 2: Configure app.json

Add Firebase configuration to `app.json`:

```json
{
  "expo": {
    "name": "Aswani",
    "slug": "aswani",
    "ios": {
      "bundleIdentifier": "com.yourcompany.aswani",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to upload profile and product images.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photo library to upload images.",
        "NSLocationWhenInUseUsageDescription": "This app uses your location to show nearby vendors."
      }
    },
    "android": {
      "package": "com.yourcompany.aswani",
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      "@react-native-firebase/storage",
      [
        "@react-native-firebase/messaging",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

### Step 3: Move Configuration Files

```bash
# iOS
mkdir -p ios/aswani
cp GoogleService-Info.plist ios/aswani/

# Android
mkdir -p android/app
cp google-services.json android/app/
```

### Step 4: Enable Push Notifications Capability

For iOS (requires Mac):
1. Open project in Xcode: `open ios/aswani.xcworkspace`
2. Select your project in the navigator
3. Select your target
4. Go to **Signing & Capabilities**
5. Click **+ Capability**
6. Add **Push Notifications**
7. Add **Background Modes** and check:
   - Remote notifications
   - Background fetch

## Android Configuration

### Step 1: Get SHA-1 Certificate

```bash
cd android
./gradlew signingReport
```

Copy the SHA-1 from the output.

### Step 2: Add SHA-1 to Firebase

1. Go to Firebase Console > Project Settings
2. Scroll down to **Your apps** section
3. Click on your Android app
4. Click **Add fingerprint**
5. Paste the SHA-1
6. Click **Save**

### Step 3: Update build.gradle

Ensure `android/build.gradle` includes:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

And `android/app/build.gradle` includes:

```gradle
apply plugin: 'com.google.gms.google-services'
```

## Environment Variables

Create `.env` file in project root (add to `.gitignore`):

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Cloud Messaging
FCM_SERVER_KEY=your_fcm_server_key

# Paystack (for payments)
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
```

Get these values from:
1. Firebase Console > Project Settings > General
2. Scroll down to **Your apps**
3. Click on **Web app** (or create one)
4. Copy the config values

Update `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

## Testing Firebase Setup

### Test 1: Authentication

```javascript
// Test email/password signup
import { auth } from './src/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const testAuth = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'test@example.com',
      'password123'
    );
    console.log('✅ Auth working! User ID:', userCredential.user.uid);
  } catch (error) {
    console.error('❌ Auth error:', error);
  }
};
```

### Test 2: Firestore

```javascript
// Test Firestore write
import { db } from './src/config/firebase';
import { collection, addDoc } from 'firebase/firestore';

const testFirestore = async () => {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firestore!',
      timestamp: new Date()
    });
    console.log('✅ Firestore working! Doc ID:', docRef.id);
  } catch (error) {
    console.error('❌ Firestore error:', error);
  }
};
```

### Test 3: Storage

```javascript
// Test Storage upload
import { storage } from './src/config/firebase';
import { ref, uploadString } from 'firebase/storage';

const testStorage = async () => {
  try {
    const storageRef = ref(storage, 'test/test.txt');
    await uploadString(storageRef, 'Hello Storage!');
    console.log('✅ Storage working!');
  } catch (error) {
    console.error('❌ Storage error:', error);
  }
};
```

### Test 4: Cloud Messaging

```javascript
// Test FCM token retrieval
import messaging from '@react-native-firebase/messaging';

const testFCM = async () => {
  try {
    const token = await messaging().getToken();
    console.log('✅ FCM working! Token:', token);
  } catch (error) {
    console.error('❌ FCM error:', error);
  }
};
```

## Troubleshooting

### Common Issues

#### Issue 1: "Default app has not been initialized"
**Solution:**
- Ensure `firebase.initializeApp()` is called before any Firebase usage
- Check that config values are correct
- Verify `GoogleService-Info.plist` or `google-services.json` is in correct location

#### Issue 2: "Permission denied" in Firestore
**Solution:**
- Check Firestore security rules
- Ensure user is authenticated
- Verify user has proper permissions in rules

#### Issue 3: Storage upload fails
**Solution:**
- Check Storage security rules
- Verify file size is within limits
- Check file type is allowed
- Ensure user is authenticated

#### Issue 4: iOS push notifications not working
**Solution:**
- Verify APNs certificate is uploaded to Firebase
- Check that Push Notifications capability is enabled in Xcode
- Ensure app is registered for remote notifications
- Test on physical device (not simulator)

#### Issue 5: Android push notifications not working
**Solution:**
- Verify `google-services.json` is in `android/app/`
- Check SHA-1 is added to Firebase Console
- Ensure Google Play Services is updated on device
- Check notification permissions are granted

#### Issue 6: Build errors after adding Firebase
**Solution:**
- Clear cache: `expo start -c`
- Reinstall node modules: `rm -rf node_modules && npm install`
- Clean build: `expo prebuild --clean`

### Debug Mode

Enable Firebase debug logging:

```javascript
// For development
import { setLogLevel } from 'firebase/firestore';
setLogLevel('debug');
```

### Check Firebase Status

Visit [Firebase Status Dashboard](https://status.firebase.google.com/) to check if there are any ongoing issues.

## Next Steps

After completing this setup:

1. ✅ Create your first admin user in Firebase Console
2. ✅ Test authentication flow in the app
3. ✅ Configure Paystack for payments
4. ✅ Set up monitoring and analytics
5. ✅ Configure custom email templates
6. ✅ Set up backup strategy for Firestore
7. ✅ Enable Firebase App Check for security
8. ✅ Set up Firebase Performance Monitoring

## Security Best Practices

1. **Never commit sensitive keys** - Add `.env` to `.gitignore`
2. **Use environment variables** - Different configs for dev/staging/prod
3. **Enable App Check** - Protect against abuse
4. **Review security rules regularly** - Audit access patterns
5. **Monitor usage** - Set up billing alerts
6. **Enable audit logging** - Track admin actions
7. **Implement rate limiting** - Prevent abuse
8. **Use reCAPTCHA** - For sensitive operations

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community Slack](https://firebase.community/)

---

**Document Version:** 1.0
**Last Updated:** 2024
**Maintained by:** Aswani Development Team
