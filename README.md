# Aswani - Service Request & Vendor Marketplace

A comprehensive React Native mobile application built with Expo that connects service requesters with vendors. A full-featured marketplace platform for service discovery, quotations, secure payments, and communication.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

## Features

### For Requesters
- Create service/item requests with automatic location detection
- Browse request history with status filters (open, active, completed)
- View and compare vendor responses sorted by rating
- Accept vendor responses and start conversations
- Real-time chat with chosen vendors
- Rate and review vendors
- Track request status with detailed views
- Receive push notifications for new responses
- Save favorite vendors for future requests
- View complete request and conversation history
- **Product availability alerts** - Get notified when specific products/services become available
- Browse **featured products/services** from vendors
- See relevant advertisements (can be disabled per user)

### For Vendors
- Register and manage service/product categories (20+ categories)
- Browse available requests sorted by distance
- Advanced search and filter system:
  - Filter by category
  - Filter by distance radius
  - Filter by budget range
  - Search by keywords
- Submit detailed responses with:
  - Pricing
  - Features list
  - Delivery options
  - Estimated delivery time
- View service history with status tracking
- Real-time chat with requesters after acceptance
- Build reputation through ratings and reviews
- Set service area radius
- Business profile with description
- **Create featured items** - Promote up to 3 products/services (limited duration)
- **Service availability alerts** - Get notified when matching requests are posted
- See relevant advertisements (can be disabled per user)
- **Secure Payments**: Pay vendors via Paystack with escrow protection
- **Enhanced Reviews**: Leave detailed reviews with photos
- **Favorites**: Save trusted vendors for quick access
- **Wallet Management**: Track earnings and withdraw funds
- **Dark Mode**: Choose between Light, Dark, or Auto themes

### For Vendors (Continued)
- **Payment System**:
  - Receive payments securely via escrow
  - Wallet system for managing earnings
  - Withdraw funds to bank account
  - View transaction history
- **Trust & Safety**:
  - Multi-level verification (Phone, Email, ID, Business)
  - Verification score (0-100)
  - Display verification badges on profile
- **Portfolio Management**:
  - Showcase past work with photo galleries
  - Feature best projects
  - Organize by categories and tags
- **Analytics Dashboard**:
  - Track quotes submitted and conversion rate
  - Monitor revenue and earnings trends
  - View rating breakdowns and reviews
  - Analyze response times
  - Identify top performing categories
- **Subscription System**:
  - Choose from multiple subscription tiers
  - Access premium features
  - Enhanced visibility in search results

### Shared Features
- User authentication (Email/Password with Firebase)
- Dual user types (Requester/Vendor) with role-based interfaces
- Real-time messaging with read receipts
- Location-based matching and distance calculation
- Push notifications for important updates
- Comprehensive profile management
- Rating and review system
- Settings and preferences management
- Notifications center with read/unread tracking
- 4-tab bottom navigation for quick access
- **Dark Mode**: Light, Dark, and Auto (system) theme options
- **Referral Program**: Earn rewards for inviting friends (₦500 per successful referral)
- **Share Functionality**: Share requests and vendor profiles via WhatsApp, SMS, etc.
- **Trust & Safety**:
  - Report and block users
  - Evidence upload for reports
  - Multi-level verification system
- **Enhanced Reviews**:
  - 5-star rating system
  - Photo uploads in reviews
  - Vendor responses to reviews
  - Helpful voting on reviews
  - Verified purchase badges

### For Admins
- **User Management**:
  - View and manage all users
  - Handle verification requests
  - Review user reports
  - Suspend or activate accounts
- **Content Management**:
  - Create and manage advertisements
  - Set up subscription plans
  - Configure featured items
  - Moderate reviews and content
- **Platform Analytics**:
  - Track platform-wide metrics
  - Monitor revenue and transactions
  - View user growth trends
  - Export reports

### Monetization & Marketing Features
- **Advertisement System**:
  - Manual ads from Firebase backend
  - Banner ads on home screens
  - Per-user ad control (enable/disable for individual users)
  - Global ad toggle from dashboard
  - Premium users see no ads
  - Ad impression and click tracking

- **Featured Items System**:
  - Vendors can feature up to 3 items simultaneously
  - Customizable duration (default 30 days)
  - Featured items shown prominently in carousel
  - Click and impression tracking
  - Automatic expiration management

- **Product/Service Alerts**:
  - Users subscribe to specific categories or keywords
  - Automatic notifications when matching items posted
  - Location-based alerts (distance filtering)
  - Active/inactive toggle
  - Alert statistics tracking

## Tech Stack

### Frontend
- **Framework**: React Native with Expo SDK 49+
- **Language**: TypeScript
- **Navigation**: React Navigation v6 (Stack & Tab)
- **State Management**: React Context API
- **UI Components**: React Native Paper + Custom Components
- **Styling**: StyleSheet with theme support (Dark Mode)
- **Forms**: React Hook Form
- **Location**: Expo Location
- **Image Handling**: Expo Image Picker + Firebase Storage

### Backend Services
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firebase Firestore (Real-time NoSQL)
- **Storage**: Firebase Storage (Images & Documents)
- **Push Notifications**: Firebase Cloud Messaging
- **Cloud Functions**: Firebase Functions (Serverless)
- **Analytics**: Firebase Analytics
- **Performance**: Firebase Performance Monitoring

### Third-Party Integrations
- **Payments**: Paystack (Nigerian payment gateway)
- **Notifications**: Expo Notifications + FCM
- **Image Processing**: Expo Image Manipulator
- **Maps**: React Native Maps (planned)

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

   Follow the comprehensive Firebase setup guide: **[docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)**

   This includes:
   - Creating a Firebase project
   - Enabling Email/Password Authentication
   - Setting up Firestore Database with security rules
   - Configuring Firebase Storage with upload rules
   - Enabling Cloud Messaging for push notifications
   - Creating composite indexes
   - Setting up Cloud Functions
   - iOS and Android configuration

4. **Configure environment variables**

   Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:

   ```bash
   # Firebase Configuration
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FCM_SERVER_KEY=your_fcm_server_key

   # Paystack Configuration
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

   # App Configuration
   PLATFORM_FEE_RATE=0.05
   REFERRAL_REWARD=500
   ```

5. **Place Firebase configuration files**

   ```bash
   # iOS configuration
   cp GoogleService-Info.plist ./

   # Android configuration
   cp google-services.json ./
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
aswani-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Dark mode theme management
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx     # Main app navigator
│   ├── screens/           # All app screens (40+ screens)
│   │   ├── Auth/              # Login, Signup
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── Requester/         # Requester-specific screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CreateRequestScreen.tsx
│   │   │   ├── RequestDetailsScreen.tsx
│   │   │   ├── RequestHistoryScreen.tsx
│   │   │   ├── PaymentScreen.tsx
│   │   │   └── FavoritesScreen.tsx
│   │   ├── Vendor/            # Vendor-specific screens
│   │   │   ├── VendorDashboardScreen.tsx
│   │   │   ├── RespondToRequestScreen.tsx
│   │   │   ├── VendorCategoriesScreen.tsx
│   │   │   ├── SearchRequestsScreen.tsx
│   │   │   ├── ServiceHistoryScreen.tsx
│   │   │   ├── PortfolioScreen.tsx
│   │   │   ├── VendorAnalyticsScreen.tsx
│   │   │   ├── WalletScreen.tsx
│   │   │   └── VendorSubscriptionScreen.tsx
│   │   ├── Admin/             # Admin screens
│   │   │   ├── AdminDashboardScreen.tsx
│   │   │   ├── ManageAdvertisementsScreen.tsx
│   │   │   └── ManageSubscriptionPlansScreen.tsx
│   │   └── Shared/            # Shared screens
│   │       ├── ConversationsScreen.tsx
│   │       ├── ChatScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── NotificationsScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       ├── VerificationScreen.tsx
│   │       ├── ReportUserScreen.tsx
│   │       ├── ReferralScreen.tsx
│   │       ├── EnhancedReviewsScreen.tsx
│   │       ├── ProductAlertsScreen.tsx
│   │       ├── FeaturedItemsScreen.tsx
│   │       ├── TermsScreen.tsx
│   │       └── PrivacyPolicyScreen.tsx
│   ├── services/          # External services
│   │   ├── firebase.ts        # Firebase initialization
│   │   ├── notifications.ts    # Push notification service
│   │   ├── paystack.ts        # Payment & escrow service
│   │   └── imageUpload.ts     # Image upload utilities
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts           # All app types (100+ interfaces)
│   ├── utils/             # Utility functions
│   │   ├── location.ts        # Location services
│   │   └── shareUtils.ts      # Social sharing
│   └── config/            # Configuration files
│       └── firebase.ts        # Firebase config
├── assets/                # Images, fonts, icons
├── docs/                  # Comprehensive documentation
│   ├── FIREBASE_SETUP.md      # Firebase setup guide
│   ├── DARK_MODE.md          # Theme documentation
│   └── PROJECT_SETUP.md      # Complete setup guide
├── App.tsx               # Root component
├── app.json              # Expo configuration
├── package.json          # Dependencies (50+ packages)
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (create this)
└── README.md             # This file
```

## Database Schema

### Core Collections

#### users
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

#### requests
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

#### responses
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

#### conversations
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

#### messages
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

### Additional Collections

#### escrowTransactions
```
{
  id: string
  requestId: string
  requesterId: string
  vendorId: string
  amount: number
  platformFee: number
  vendorAmount: number
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  paymentMethod: 'paystack' | 'wallet'
  paystackReference?: string
  createdAt: timestamp
  releasedAt?: timestamp
}
```

#### wallets
```
{
  id: string
  userId: string
  balance: number
  totalEarnings: number
  pendingBalance: number
  lastUpdated: timestamp
}
```

#### userVerifications
```
{
  id: string
  userId: string
  phoneVerified: boolean
  emailVerified: boolean
  idVerified: boolean
  businessVerified: boolean
  verificationScore: number // 0-100
  idType?: string
  idNumber?: string
  idDocumentUrl?: string
}
```

#### enhancedReviews
```
{
  id: string
  reviewerId: string
  revieweeId: string
  requestId: string
  rating: number
  comment: string
  photos?: string[]
  verifiedPurchase: boolean
  helpful: number
  vendorResponse?: { text: string, respondedAt: timestamp }
  status: 'published' | 'hidden'
  createdAt: timestamp
}
```

#### portfolioItems
```
{
  id: string
  vendorId: string
  title: string
  description: string
  category: string
  images: string[]
  completionDate: timestamp
  price?: number
  tags: string[]
  featured: boolean
  clicks: number
  createdAt: timestamp
}
```

For complete schema with all 25+ collections, see `src/types/index.ts`

## API Integration

### Paystack Payment Flow

```typescript
// 1. Initialize Payment
const reference = await initializePaystackPayment(
  amount,
  email,
  metadata
);

// 2. Verify Payment
const paymentData = await verifyPaystackPayment(reference);

// 3. Create Escrow
const escrowId = await createEscrowTransaction(
  requestId,
  requesterId,
  vendorId,
  amount,
  reference
);

// 4. Release Funds (after service completion)
await releaseEscrowFunds(escrowId);
```

### Push Notifications

```typescript
// Request permission
const enabled = await requestNotificationPermission();

// Get FCM token
const token = await messaging().getToken();

// Save token
await saveUserFCMToken(userId, token);

// Send notification
await sendPushNotification(userId, title, body, data);
```

### Image Upload

```typescript
// Upload single image
const result = await uploadImage(uri, folder, userId);

// Upload multiple images
const results = await uploadMultipleImages(uris, folder, userId);

// Result includes URL and metadata
console.log(result.url, result.metadata);
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

### Completed Features ✅
- [x] Advanced search and filter system
- [x] Push notifications structure
- [x] Vendor category management
- [x] Request and service history tracking
- [x] Settings and preferences
- [x] Notifications center

### Recently Added Features ✅
- [x] Payment gateway integration with Paystack and Escrow system
- [x] Trust & Safety system with multi-level verification
- [x] Push notifications with Firebase Cloud Messaging
- [x] Enhanced reviews with photos and vendor responses
- [x] Vendor portfolio management with image galleries
- [x] Vendor analytics dashboard with business insights
- [x] Referral and rewards program for viral growth
- [x] Dark mode support (Light, Dark, Auto)
- [x] Favorites system for saving trusted vendors
- [x] Share functionality for requests and profiles
- [x] Admin controls for platform management
- [x] Subscription system for vendors
- [x] Terms of Service and Privacy Policy screens

### Planned Features
- [ ] Voice/Video calling integration
- [ ] Multi-language support (English, Yoruba, Hausa, Igbo)
- [ ] In-app map integration
- [ ] Advanced search with AI-powered matching
- [ ] SMS notifications for critical updates
- [ ] Scheduled and recurring services
- [ ] Background checks for vendors
- [ ] Dispute resolution system

## Acknowledgments

- Expo team for the amazing development platform
- Firebase for backend services
- React Navigation for navigation solution
- All contributors and supporters
