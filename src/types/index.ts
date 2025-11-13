export type UserType = 'requester' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  userType: UserType;
  phoneNumber?: string;
  profileImage?: string;
  rating?: number;
  reviewCount?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  isOnline?: boolean;
  // Vendor-specific fields
  vendorCategories?: string[];
  businessName?: string;
  businessDescription?: string;
  serviceArea?: number; // radius in km
  featuredItemsCount?: number; // number of featured items vendor has
  // Requester-specific fields
  favoriteVendors?: string[];
  // Advertisement settings
  adsDisabled?: boolean; // individual user ad disable
  isPremium?: boolean; // premium users see no ads
  // Subscription fields (for vendors)
  subscriptionStatus?: 'active' | 'expired' | 'trial' | 'none';
  subscriptionPlanId?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  subscriptionAutoRenew?: boolean;
}

export interface VendorCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const VENDOR_CATEGORIES = [
  'Electronics & Gadgets',
  'Home Services & Repairs',
  'Food & Catering',
  'Transportation & Delivery',
  'Health & Wellness',
  'Beauty & Personal Care',
  'Education & Tutoring',
  'Professional Services',
  'Event Planning',
  'Cleaning Services',
  'IT & Tech Support',
  'Photography & Video',
  'Construction & Renovation',
  'Legal Services',
  'Financial Services',
  'Pet Services',
  'Automotive Services',
  'Real Estate',
  'Marketing & Advertising',
  'Other'
];

export interface Request {
  id: string;
  requesterId: string;
  requesterName: string;
  title: string;
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'open' | 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
  chosenVendorId?: string;
  budget?: {
    min?: number;
    max?: number;
  };
}

export interface Response {
  id: string;
  requestId: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorReviewCount: number;
  price: number;
  description: string;
  features: string[];
  deliveryOptions: string[];
  estimatedDeliveryTime?: string;
  images?: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'image' | 'call-request';
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  requestId: string;
  participants: string[];
  participantDetails: {
    [userId: string]: {
      name: string;
      profileImage?: string;
      userType: UserType;
    };
  };
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: {
    [userId: string]: number;
  };
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  requestId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

// Advertisement System
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  type: 'banner' | 'interstitial' | 'featured';
  isActive: boolean;
  targetUserType?: UserType | 'all';
  impressions: number;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AdSettings {
  id: string;
  adsEnabled: boolean; // global ad toggle
  admobEnabled: boolean; // use AdMob
  manualAdsEnabled: boolean; // use manual ads from Firebase
  admobBannerId?: string;
  admobInterstitialId?: string;
  showAdEveryNScreens: number; // show interstitial every N screens
  createdAt: Date;
  updatedAt: Date;
}

// Product Availability Alerts
export interface ProductAlert {
  id: string;
  userId: string;
  userName: string;
  categories: string[]; // categories to watch
  keywords: string[]; // keywords to match
  location?: {
    latitude: number;
    longitude: number;
    maxDistance: number; // in km
  };
  isActive: boolean;
  notificationCount: number;
  createdAt: Date;
  lastTriggered?: Date;
}

// Featured Products/Services
export interface FeaturedItem {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  title: string;
  description: string;
  category: string;
  price?: number;
  imageUrl?: string;
  contactInfo?: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

// Subscription System
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: {
    maxRequests?: number; // max requests per month (undefined = unlimited)
    maxFeaturedItems?: number;
    prioritySupport: boolean;
    verifiedBadge: boolean;
    analyticsAccess: boolean;
    customBranding?: boolean;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionSettings {
  id: string;
  subscriptionEnabled: boolean; // global toggle for subscription system
  trialPeriodDays: number; // default trial period
  allowFreeAccess: boolean; // if true, vendors can use app without subscription
  gracePeriodDays: number; // days after expiry before restricting access
  paymentMethods: string[]; // e.g., ['manual', 'stripe', 'paystack']
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionTransaction {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionDate: Date;
  referenceId?: string;
  metadata?: any;
}

// Admin Settings (Master Control)
export interface AdminSettings {
  id: string;
  // Advertisement Controls
  adsEnabled: boolean;
  // Subscription Controls
  subscriptionEnabled: boolean;
  // App Controls
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  // Feature Flags
  chatEnabled: boolean;
  reviewsEnabled: boolean;
  notificationsEnabled: boolean;
  updatedAt: Date;
  updatedBy: string;
}
