import { Share, Alert } from 'react-native';
import { Request } from '../types';

/**
 * Share a request via social media, messaging apps, etc.
 */
export const shareRequest = async (request: Request): Promise<void> => {
  try {
    const message = `
🛍️ Service Request on Aswani

${request.title}

${request.description}

Category: ${request.category}
${request.budget?.max ? `Budget: ₦${request.budget.min || 0} - ₦${request.budget.max}` : ''}

View and respond to this request on Aswani app!
Download: https://aswani.app
    `.trim();

    const result = await Share.share({
      message,
      title: `Service Request: ${request.title}`,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with activity type of result.activityType
        console.log('Shared via:', result.activityType);
      } else {
        // Shared
        console.log('Request shared successfully');
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
      console.log('Share cancelled');
    }
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

/**
 * Share vendor profile
 */
export const shareVendorProfile = async (
  vendorName: string,
  rating: number,
  description?: string
): Promise<void> => {
  try {
    const message = `
👨‍💼 Check out this vendor on Aswani!

${vendorName}
⭐ Rating: ${rating.toFixed(1)}/5.0

${description || 'Quality service provider on Aswani'}

Find great service providers on Aswani app!
Download: https://aswani.app
    `.trim();

    await Share.share({
      message,
      title: `Vendor: ${vendorName}`,
    });
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

/**
 * Share app referral link
 */
export const shareReferralLink = async (referralCode: string, userName: string): Promise<void> => {
  try {
    const message = `
🎁 Join Aswani and get ₦500!

${userName} invites you to join Aswani - Nigeria's best marketplace for services and products!

Use referral code: ${referralCode}

👉 Download now: https://aswani.app/join/${referralCode}

🎉 Both of us get ₦500 when you complete your first transaction!
    `.trim();

    await Share.share({
      message,
      title: 'Join Aswani - Get ₦500 Bonus!',
    });
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

/**
 * Share app download link
 */
export const shareAppLink = async (): Promise<void> => {
  try {
    const message = `
📱 Download Aswani App

Find trusted service providers and get the best quotes for any service or product!

🔹 Post your request
🔹 Get multiple quotes
🔹 Choose the best vendor
🔹 Secure payment with escrow

Download now: https://aswani.app
    `.trim();

    await Share.share({
      message,
      title: 'Aswani - Connect with Service Providers',
    });
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
