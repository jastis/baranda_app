# Aswani - Service Request & Vendor Matching App

Aswani is a React Native mobile application built with Expo that connects service requesters with vendors. Users can request items or services, and vendors can respond with their offerings. The app includes real-time chat, location-based matching, and rating systems.

## Features

### For Requesters
- Create service/item requests with location
- View and compare vendor responses
- Accept vendor responses and start conversations
- Real-time chat with chosen vendors
- Rate and review vendors
- Track request status

### For Vendors
- Browse available service requests
- View requests sorted by distance
- Submit detailed responses with pricing and features
- Real-time chat with requesters
- Build reputation through ratings

### Shared Features
- User authentication (Email/Password)
- Real-time messaging
- Location-based services
- Push notifications
- Profile management
- Rating and review system

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase
  - Firestore (Database)
  - Firebase Authentication
  - Firebase Storage
- **Navigation**: React Navigation v6
- **Location Services**: Expo Location
- **Maps**: React Native Maps
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio (for Android Emulator)
- Expo Go app on your physical device (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd baranda_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   Follow the detailed Firebase setup guide in `FIREBASE_SETUP.md` to:
   - Create a Firebase project
   - Enable Authentication
   - Set up Firestore Database
   - Configure Firebase Storage
   - Get your Firebase configuration credentials

4. **Configure Firebase credentials**

   Open `src/services/firebase.ts` and replace the placeholder values with your Firebase project credentials:

   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## Running the App

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will open the Expo DevTools in your browser. From here you can:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app on your physical device

### Run on iOS

```bash
npm run ios
```

**Note**: Requires macOS with Xcode installed

### Run on Android

```bash
npm run android
```

**Note**: Requires Android Studio and Android SDK

### Run on Web

```bash
npm run web
```

## Project Structure

```
baranda_app/
├── src/
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts (Auth)
│   ├── navigation/          # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CreateRequestScreen.tsx
│   │   ├── RequestDetailsScreen.tsx
│   │   ├── VendorDashboardScreen.tsx
│   │   ├── RespondToRequestScreen.tsx
│   │   ├── ConversationsScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/           # External services (Firebase)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, etc.
├── App.tsx                 # Root component
├── app.json               # Expo configuration
└── package.json           # Dependencies

```

## Firestore Database Structure

### Collections

**users**
```
{
  id: string
  email: string
  displayName: string
  userType: 'requester' | 'vendor'
  phoneNumber?: string
  profileImage?: string
  rating?: number
  reviewCount?: number
  location?: { latitude, longitude, address }
  createdAt: timestamp
  isOnline?: boolean
}
```

**requests**
```
{
  id: string
  requesterId: string
  requesterName: string
  title: string
  description: string
  category: string
  location: { latitude, longitude, address }
  status: 'open' | 'pending' | 'accepted' | 'completed' | 'cancelled'
  createdAt: timestamp
  chosenVendorId?: string
  budget?: { min, max }
}
```

**responses**
```
{
  id: string
  requestId: string
  vendorId: string
  vendorName: string
  vendorRating: number
  vendorReviewCount: number
  price: number
  description: string
  features: string[]
  deliveryOptions: string[]
  estimatedDeliveryTime?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp
}
```

**conversations**
```
{
  id: string
  requestId: string
  participants: string[]
  participantDetails: { [userId]: { name, profileImage, userType } }
  lastMessage?: string
  lastMessageTime?: timestamp
  unreadCount: { [userId]: number }
}
```

**messages**
```
{
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  type: 'text' | 'image' | 'call-request'
  timestamp: timestamp
  read: boolean
}
```

## Firestore Security Rules

Add these security rules to your Firebase project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Requests collection
    match /requests/{requestId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.requesterId == request.auth.uid ||
         resource.data.chosenVendorId == request.auth.uid);
      allow delete: if request.auth != null &&
        resource.data.requesterId == request.auth.uid;
    }

    // Responses collection
    match /responses/{responseId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        resource.data.vendorId == request.auth.uid;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        resource.data.senderId == request.auth.uid;
    }
  }
}
```

## Environment Variables

For production, consider using environment variables:

1. Install expo-constants:
   ```bash
   npx expo install expo-constants
   ```

2. Create `app.config.js`:
   ```javascript
   export default {
     expo: {
       // ... other config
       extra: {
         firebaseApiKey: process.env.FIREBASE_API_KEY,
         firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
         // ... other Firebase config
       }
     }
   };
   ```

3. Access in code:
   ```typescript
   import Constants from 'expo-constants';
   const apiKey = Constants.expoConfig.extra.firebaseApiKey;
   ```

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

For more details, see [Expo Build Documentation](https://docs.expo.dev/build/introduction/)

## Common Issues

### Location permissions not working
- Make sure location permissions are enabled in your device settings
- For iOS, check Info.plist for location usage descriptions
- For Android, ensure permissions are declared in app.json

### Firebase authentication errors
- Verify your Firebase configuration is correct
- Check that Email/Password authentication is enabled in Firebase Console
- Ensure your app's package name matches Firebase configuration

### Build errors
- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Expo CLI: `npm install -g expo-cli@latest`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Roadmap

- [ ] Image upload for requests and responses
- [ ] Voice/Video calling integration
- [ ] Payment gateway integration
- [ ] Advanced search and filters
- [ ] Push notifications
- [ ] In-app reviews system
- [ ] Analytics dashboard
- [ ] Multi-language support

## Acknowledgments

- Expo team for the amazing development platform
- Firebase for backend services
- React Navigation for navigation solution
- All contributors and supporters
