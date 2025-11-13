export type UserType = 'requester' | 'vendor';

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
}

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
