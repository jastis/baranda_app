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
  // Verification fields
  verificationId?: string;
  verificationScore?: number;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  idVerified?: boolean;
  businessVerified?: boolean;
  // Wallet
  walletId?: string;
  walletBalance?: number;
  // Referral
  referralCode?: string;
  referredBy?: string;
  // Performance (vendors)
  responseTime?: number; // average in minutes
  responseRate?: number; // percentage
  acceptanceRate?: number;
  completionRate?: number;
  // Status
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: Date;
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

// Payment & Escrow System
export interface EscrowTransaction {
  id: string;
  requestId: string;
  requesterId: string;
  requesterName: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: string;
  platformFee: number;
  vendorAmount: number; // amount - platformFee
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  paymentMethod: 'paystack' | 'flutterwave' | 'wallet';
  paystackReference?: string;
  createdAt: Date;
  paidAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  milestones?: EscrowMilestone[];
  disputeId?: string;
}

export interface EscrowMilestone {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved';
  completedAt?: Date;
  approvedAt?: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  totalEarnings?: number; // for vendors
  totalSpent?: number; // for requesters
  pendingBalance?: number; // funds in escrow
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  category: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission' | 'referral';
  description: string;
  reference?: string;
  relatedId?: string; // escrow ID, request ID, etc.
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

// Trust & Safety
export interface UserVerification {
  id: string;
  userId: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  idVerified: boolean;
  idVerifiedAt?: Date;
  idType?: 'nin' | 'bvn' | 'drivers_license' | 'passport';
  idNumber?: string;
  idDocumentUrl?: string;
  businessVerified: boolean;
  businessVerifiedAt?: Date;
  businessRegNumber?: string;
  businessDocumentUrl?: string;
  verificationScore: number; // 0-100
  updatedAt: Date;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: 'spam' | 'fraud' | 'inappropriate' | 'harassment' | 'fake_profile' | 'other';
  description: string;
  evidence?: string[]; // URLs to screenshots
  relatedRequestId?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  actionTaken?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface BlockedUser {
  id: string;
  userId: string; // who blocked
  blockedUserId: string; // who got blocked
  createdAt: Date;
}

export interface Dispute {
  id: string;
  escrowId: string;
  requestId: string;
  requesterId: string;
  vendorId: string;
  initiatedBy: string;
  reason: string;
  description: string;
  evidence: DisputeEvidence[];
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  resolution?: string;
  refundAmount?: number;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface DisputeEvidence {
  id: string;
  submittedBy: string;
  type: 'text' | 'image' | 'document';
  content: string;
  url?: string;
  createdAt: Date;
}

// Enhanced Reviews
export interface EnhancedReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImage?: string;
  revieweeId: string;
  requestId: string;
  rating: number;
  comment: string;
  photos?: string[]; // review photos
  verifiedPurchase: boolean;
  helpful: number; // helpful votes
  notHelpful: number;
  vendorResponse?: VendorResponse;
  status: 'published' | 'pending' | 'flagged' | 'removed';
  createdAt: Date;
  updatedAt?: Date;
}

export interface VendorResponse {
  text: string;
  respondedAt: Date;
}

export interface ReviewVote {
  id: string;
  reviewId: string;
  userId: string;
  voteType: 'helpful' | 'not_helpful';
  createdAt: Date;
}

// Vendor Portfolio
export interface PortfolioItem {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  completionDate: Date;
  clientName?: string; // optional
  price?: number;
  tags: string[];
  featured: boolean;
  createdAt: Date;
}

// Referral System
export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId?: string; // set when referee signs up
  refereeName?: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded';
  rewardAmount: number;
  rewardCurrency: string;
  rewardedAt?: Date;
  createdAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage or fixed amount
  maxDiscount?: number; // max discount for percentage
  minPurchase?: number;
  maxUses: number;
  usedCount: number;
  userType?: UserType; // who can use it
  category?: string; // specific category
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId: string;
  userId: string;
  requestId: string;
  discountAmount: number;
  usedAt: Date;
}

// Analytics
export interface VendorAnalytics {
  id: string;
  vendorId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  // Performance
  quotesViewCount: number;
  quotesSubmitted: number;
  quotesAccepted: number;
  conversionRate: number; // percentage
  // Financial
  revenue: number;
  averageOrderValue: number;
  totalTransactions: number;
  // Engagement
  responseTime: number; // average in minutes
  responseRate: number; // percentage
  // Ratings
  averageRating: number;
  totalReviews: number;
  // Popular
  popularCategories: { category: string; count: number }[];
  updatedAt: Date;
}

// Terms & Compliance
export interface UserConsent {
  id: string;
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedAt: Date;
  ipAddress?: string;
}

// Favorites
export interface Favorite {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  createdAt: Date;
}

// Request Templates
export interface RequestTemplate {
  id: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  budget?: { min?: number; max?: number };
  usageCount: number;
  createdAt: Date;
}
