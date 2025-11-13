# Aswani Marketplace - Complete Project Setup Guide

This guide provides step-by-step instructions to set up and run the Aswani marketplace app from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation Steps](#installation-steps)
4. [Firebase Configuration](#firebase-configuration)
5. [Environment Setup](#environment-setup)
6. [Running the App](#running-the-app)
7. [Building for Production](#building-for-production)
8. [Deployment](#deployment)
9. [Common Issues](#common-issues)

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** or **yarn**
   - npm comes with Node.js
   - Yarn (optional): `npm install -g yarn`
   - Verify: `npm --version` or `yarn --version`

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   # or
   yarn global add expo-cli
   ```
   - Verify: `expo --version`

4. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

### For iOS Development (Mac only)

5. **Xcode** (latest version)
   - Download from Mac App Store
   - Install Command Line Tools: `xcode-select --install`

6. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```
   - Verify: `pod --version`

### For Android Development

7. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API 33 or higher)
   - Set up environment variables:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```

### Additional Tools

8. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

9. **Expo Go App** (for testing on physical devices)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

### Accounts Needed

- [ ] Google/Gmail account (for Firebase)
- [ ] Apple Developer Account ($99/year - for iOS production)
- [ ] Google Play Developer Account ($25 one-time - for Android production)
- [ ] Paystack Account (for payment processing)
- [ ] Expo Account (free - for building and deployment)

## Project Structure

```
aswani-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/           # All app screens
│   │   ├── Auth/          # Login, Signup
│   │   ├── Requester/     # Requester screens
│   │   ├── Vendor/        # Vendor screens
│   │   ├── Admin/         # Admin screens
│   │   └── Shared/        # Shared screens
│   ├── services/          # External services
│   │   ├── firebase.ts
│   │   ├── notifications.ts
│   │   └── paystack.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── imageUpload.ts
│   │   └── shareUtils.ts
│   └── config/            # Configuration files
│       └── firebase.ts
├── assets/                # Images, fonts, etc.
├── docs/                  # Documentation
│   ├── FIREBASE_SETUP.md
│   ├── DARK_MODE.md
│   └── PROJECT_SETUP.md
├── App.tsx               # Root component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── .env                  # Environment variables (create this)
```

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourcompany/aswani-app.git
cd aswani-app
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

This will install all required packages including:
- React Native & Expo
- Firebase packages
- Navigation libraries
- UI components
- Payment integrations

### Step 3: Install iOS Pods (Mac only)

```bash
cd ios
pod install
cd ..
```

## Firebase Configuration

**Important:** Complete Firebase setup is required before running the app.

Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) which covers:
- Creating Firebase project
- Setting up Authentication
- Configuring Firestore
- Setting up Storage
- Enabling Cloud Messaging
- Security rules
- Indexes

### Quick Firebase Setup Checklist

- [ ] Create Firebase project
- [ ] Add iOS app to Firebase
- [ ] Add Android app to Firebase
- [ ] Download `GoogleService-Info.plist` (iOS)
- [ ] Download `google-services.json` (Android)
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database
- [ ] Set up Firestore security rules
- [ ] Enable Firebase Storage
- [ ] Set up Storage security rules
- [ ] Enable Cloud Messaging
- [ ] Create composite indexes

## Environment Setup

### Step 1: Create Environment File

Create `.env` file in the project root:

```bash
touch .env
```

### Step 2: Add Configuration

Add the following to `.env`:

```bash
# App Environment
NODE_ENV=development
APP_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Cloud Messaging
FCM_SERVER_KEY=AAAA-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Paystack Configuration (Nigeria)
PAYSTACK_PUBLIC_KEY_TEST=pk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY_LIVE=pk_live_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY_LIVE=sk_live_xxxxxxxxxxxxxxxxxxxx

# API Base URLs
API_BASE_URL_DEV=http://localhost:3000
API_BASE_URL_PROD=https://api.aswani.app

# App Configuration
PLATFORM_FEE_RATE=0.05
REFERRAL_REWARD=500
MAX_IMAGE_SIZE=10485760
```

**Get Firebase values from:**
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click on Web app (or create one)
4. Copy configuration values

**Get Paystack keys from:**
1. Create account at https://paystack.com/
2. Navigate to Settings → API Keys & Webhooks
3. Copy test keys for development
4. Copy live keys for production (after verification)

### Step 3: Update app.json

Update `app.json` with your app details:

```json
{
  "expo": {
    "name": "Aswani",
    "slug": "aswani",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.aswani",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to upload profile and product images.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photo library to upload images.",
        "NSLocationWhenInUseUsageDescription": "This app uses your location to show nearby vendors.",
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
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
    "web": {
      "favicon": "./assets/favicon.png"
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
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "This app uses your photos to upload images.",
          "cameraPermission": "This app uses the camera to take photos."
        }
      ]
    ]
  }
}
```

### Step 4: Place Firebase Config Files

```bash
# For iOS
cp GoogleService-Info.plist ./

# For Android
cp google-services.json ./
```

## Running the App

### Development Mode

#### Method 1: Expo Go (Easiest for testing)

```bash
# Start Expo development server
npm start
# or
expo start
```

Then:
- Scan QR code with Expo Go app (iOS/Android)
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

#### Method 2: Development Build (Recommended for Firebase features)

```bash
# Create development build
expo prebuild

# iOS
npm run ios
# or
expo run:ios

# Android
npm run android
# or
expo run:android
```

### Create First Admin User

After running the app for the first time:

1. Sign up with email and password
2. Go to Firebase Console → Firestore Database
3. Find the user document (users collection)
4. Edit the document and change `userType` from `requester` to `admin`
5. Restart the app
6. You now have admin access

### Testing Features

**Test as Requester:**
1. Sign up with a new email
2. Complete onboarding
3. Create a service request
4. Upload images
5. View responses from vendors

**Test as Vendor:**
1. Sign up with a different email
2. Go to Firebase Console → Update `userType` to `vendor`
3. Restart app
4. Browse requests
5. Submit responses
6. Test chat functionality

**Test as Admin:**
1. Use admin account
2. Create advertisements
3. Create subscription plans
4. Manage users

## Building for Production

### iOS Build

#### Prerequisites:
- Apple Developer Account
- App Store Connect account configured
- Certificates and provisioning profiles set up

#### Build Steps:

```bash
# Login to Expo
expo login

# Configure app
eas build:configure

# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android Build

#### Prerequisites:
- Google Play Console account
- App configured in Play Console
- Release keystore generated

#### Build Steps:

```bash
# Create production build
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Generate App Icons and Splash Screens

```bash
# Place your icon.png (1024x1024) in assets/
# Place your splash.png in assets/

# Generate all required sizes
expo prebuild --clean
```

## Deployment

### Expo Application Services (EAS)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login:**
   ```bash
   eas login
   ```

3. **Configure Project:**
   ```bash
   eas build:configure
   ```

4. **Create Build:**
   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

5. **Submit to Stores:**
   ```bash
   # iOS
   eas submit --platform ios

   # Android
   eas submit --platform android
   ```

### Over-The-Air (OTA) Updates

For minor updates without store review:

```bash
# Publish update
expo publish

# Or with EAS Update
eas update --branch production --message "Bug fixes and improvements"
```

## Common Issues

### Issue 1: "Unable to resolve module"

**Solution:**
```bash
# Clear cache
expo start -c

# Reinstall node modules
rm -rf node_modules
npm install

# Clear watchman (Mac)
watchman watch-del-all
```

### Issue 2: Firebase not initialized

**Solution:**
- Verify `GoogleService-Info.plist` and `google-services.json` are in correct locations
- Check that Firebase config in `.env` is correct
- Ensure Firebase packages are installed

### Issue 3: iOS build fails

**Solution:**
```bash
# Clean iOS build
cd ios
pod deintegrate
pod install
cd ..

# Rebuild
npm run ios
```

### Issue 4: Android build fails

**Solution:**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### Issue 5: Images not uploading

**Solution:**
- Check Firebase Storage rules
- Verify Storage is enabled in Firebase Console
- Check file size limits
- Ensure user is authenticated

### Issue 6: Push notifications not working

**Solution:**
- iOS: Test on physical device (not simulator)
- Android: Check Google Play Services is updated
- Verify FCM setup in Firebase Console
- Check notification permissions are granted

## Development Workflow

### Recommended Development Flow

1. **Branch Strategy:**
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name

   # Make changes and commit
   git add .
   git commit -m "Add feature: description"

   # Push to remote
   git push origin feature/your-feature-name

   # Create pull request on GitHub
   ```

2. **Testing:**
   - Test on iOS simulator
   - Test on Android emulator
   - Test on physical devices
   - Test different screen sizes
   - Test both light and dark modes

3. **Code Review:**
   - Review TypeScript errors
   - Check console for warnings
   - Verify Firebase security rules
   - Test edge cases

4. **Deployment:**
   - Merge to main branch
   - Create production build
   - Test on TestFlight (iOS) or Internal Testing (Android)
   - Submit to stores

## Monitoring and Analytics

### Firebase Analytics

Already integrated. View metrics at:
Firebase Console → Analytics

### Performance Monitoring

```bash
# Install Performance Monitoring
npm install @react-native-firebase/perf

# Import in App.tsx
import perf from '@react-native-firebase/perf';
```

### Crash Reporting

```bash
# Install Crashlytics
npm install @react-native-firebase/crashlytics

# Import in App.tsx
import crashlytics from '@react-native-firebase/crashlytics';
```

## Useful Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Build for production
eas build --platform all

# Clear all caches
expo start -c && watchman watch-del-all && rm -rf node_modules && npm install
```

## Resources

- **Expo Documentation:** https://docs.expo.dev/
- **React Native Documentation:** https://reactnative.dev/
- **Firebase Documentation:** https://firebase.google.com/docs
- **React Navigation:** https://reactnavigation.org/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Paystack Documentation:** https://paystack.com/docs

## Support

For issues or questions:
1. Check documentation in `/docs` folder
2. Review [Common Issues](#common-issues) section
3. Search GitHub issues
4. Create new issue with detailed description

## License

Copyright © 2024 Aswani. All rights reserved.

---

**Document Version:** 1.0
**Last Updated:** 2024
