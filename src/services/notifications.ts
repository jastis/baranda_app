import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from './firebase';
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get push notification token
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Save push token to user profile
 */
export const savePushToken = async (userId: string, token: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      pushToken: token,
      pushTokenUpdatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

/**
 * Send local notification (when app is in foreground)
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

/**
 * Create notification record in Firestore
 */
export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      data,
      read: false,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Send push notification via Firebase Functions
 * Note: This requires a backend function to actually send the notification
 */
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    // Create notification record
    await createNotification(userId, title, body, data);

    // In production, call a Firebase Function to send the actual push notification
    // Example:
    // await fetch('https://your-firebase-function.com/sendNotification', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, title, body, data })
    // });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

/**
 * Notification types and their handlers
 */
export const NotificationTypes = {
  // Request-related
  NEW_RESPONSE: 'new_response',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_COMPLETED: 'request_completed',
  REQUEST_CANCELLED: 'request_cancelled',

  // Payment-related
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_RELEASED: 'payment_released',
  PAYMENT_REFUNDED: 'payment_refunded',
  ESCROW_HELD: 'escrow_held',

  // Verification
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',

  // Subscription
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',

  // Social
  NEW_MESSAGE: 'new_message',
  NEW_REVIEW: 'new_review',
  REFERRAL_COMPLETED: 'referral_completed',

  // Admin
  NEW_REPORT: 'new_report',
  DISPUTE_CREATED: 'dispute_created',
};

/**
 * Send notification for new response
 */
export const notifyNewResponse = async (
  requesterId: string,
  vendorName: string,
  requestTitle: string,
  requestId: string
): Promise<void> => {
  await sendPushNotification(
    requesterId,
    'New Response Received!',
    `${vendorName} responded to your request: ${requestTitle}`,
    {
      type: NotificationTypes.NEW_RESPONSE,
      requestId,
    }
  );
};

/**
 * Send notification for payment received
 */
export const notifyPaymentReceived = async (
  vendorId: string,
  amount: number,
  requestTitle: string
): Promise<void> => {
  await sendPushNotification(
    vendorId,
    'Payment Received!',
    `₦${amount.toLocaleString()} has been deposited in escrow for: ${requestTitle}`,
    {
      type: NotificationTypes.PAYMENT_RECEIVED,
    }
  );
};

/**
 * Send notification for payment released
 */
export const notifyPaymentReleased = async (
  vendorId: string,
  amount: number,
  requestTitle: string
): Promise<void> => {
  await sendPushNotification(
    vendorId,
    'Payment Released!',
    `₦${amount.toLocaleString()} has been released to your wallet for: ${requestTitle}`,
    {
      type: NotificationTypes.PAYMENT_RELEASED,
    }
  );
};

/**
 * Send notification for verification approved
 */
export const notifyVerificationApproved = async (
  userId: string,
  verificationType: string
): Promise<void> => {
  await sendPushNotification(
    userId,
    'Verification Approved!',
    `Your ${verificationType} verification has been approved. Your profile now has a verified badge!`,
    {
      type: NotificationTypes.VERIFICATION_APPROVED,
    }
  );
};

/**
 * Send notification for subscription expiring
 */
export const notifySubscriptionExpiring = async (
  vendorId: string,
  daysRemaining: number
): Promise<void> => {
  await sendPushNotification(
    vendorId,
    'Subscription Expiring Soon',
    `Your subscription expires in ${daysRemaining} days. Renew now to avoid interruption.`,
    {
      type: NotificationTypes.SUBSCRIPTION_EXPIRING,
    }
  );
};

/**
 * Send notification for new message
 */
export const notifyNewMessage = async (
  recipientId: string,
  senderName: string,
  messagePreview: string
): Promise<void> => {
  await sendPushNotification(
    recipientId,
    `New message from ${senderName}`,
    messagePreview,
    {
      type: NotificationTypes.NEW_MESSAGE,
    }
  );
};

/**
 * Send notification for referral completed
 */
export const notifyReferralCompleted = async (
  referrerId: string,
  refereeName: string,
  rewardAmount: number
): Promise<void> => {
  await sendPushNotification(
    referrerId,
    'Referral Reward!',
    `${refereeName} completed their first transaction. You earned ₦${rewardAmount}!`,
    {
      type: NotificationTypes.REFERRAL_COMPLETED,
    }
  );
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
): void => {
  // Handle notifications received while app is in foreground
  Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Handle user interaction with notifications
  Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Badge management
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(count);
  }
};

export const clearBadge = async (): Promise<void> => {
  await setBadgeCount(0);
};
