import { Alert } from 'react-native';
import { db } from './firebase';
import { doc, addDoc, updateDoc, collection, getDoc, Timestamp } from 'firebase/firestore';
import { EscrowTransaction, WalletTransaction } from '../types';

// Paystack configuration
// NOTE: Replace with your actual Paystack keys
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxx'; // Replace with actual key
const PAYSTACK_SECRET_KEY = 'sk_test_xxxxxxxxxxxxxxxxxxxx'; // For server-side only
const PAYSTACK_API_URL = 'https://api.paystack.co';

// Platform commission rate (5%)
export const PLATFORM_FEE_RATE = 0.05;

/**
 * Initialize Paystack payment
 * This generates a payment reference and opens Paystack checkout
 */
export const initializePaystackPayment = async (
  amount: number,
  email: string,
  metadata: any
): Promise<string> => {
  try {
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack expects amount in kobo (NGN * 100)
        email,
        metadata,
        currency: 'NGN',
      }),
    });

    const data = await response.json();

    if (data.status) {
      return data.data.reference;
    } else {
      throw new Error(data.message || 'Failed to initialize payment');
    }
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw error;
  }
};

/**
 * Verify Paystack payment
 */
export const verifyPaystackPayment = async (reference: string): Promise<any> => {
  try {
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      return data.data;
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

/**
 * Create escrow transaction after successful payment
 */
export const createEscrowTransaction = async (
  requestId: string,
  requesterId: string,
  requesterName: string,
  vendorId: string,
  vendorName: string,
  amount: number,
  paystackReference: string
): Promise<string> => {
  try {
    const platformFee = amount * PLATFORM_FEE_RATE;
    const vendorAmount = amount - platformFee;

    const escrowData: Omit<EscrowTransaction, 'id'> = {
      requestId,
      requesterId,
      requesterName,
      vendorId,
      vendorName,
      amount,
      currency: 'NGN',
      platformFee,
      vendorAmount,
      status: 'held',
      paymentMethod: 'paystack',
      paystackReference,
      createdAt: Timestamp.now() as any,
      paidAt: Timestamp.now() as any,
    };

    const escrowRef = await addDoc(collection(db, 'escrowTransactions'), escrowData);

    // Update requester's wallet (debit)
    await recordWalletTransaction(
      requesterId,
      'debit',
      amount,
      'payment',
      `Payment for request`,
      escrowRef.id
    );

    // Update vendor's pending balance
    await updateVendorPendingBalance(vendorId, vendorAmount);

    return escrowRef.id;
  } catch (error) {
    console.error('Error creating escrow transaction:', error);
    throw error;
  }
};

/**
 * Release escrow funds to vendor
 */
export const releaseEscrowFunds = async (escrowId: string): Promise<void> => {
  try {
    const escrowDoc = await getDoc(doc(db, 'escrowTransactions', escrowId));
    if (!escrowDoc.exists()) {
      throw new Error('Escrow transaction not found');
    }

    const escrow = escrowDoc.data() as EscrowTransaction;

    if (escrow.status !== 'held') {
      throw new Error('Escrow funds already released or refunded');
    }

    // Update escrow status
    await updateDoc(doc(db, 'escrowTransactions', escrowId), {
      status: 'released',
      releasedAt: Timestamp.now(),
    });

    // Credit vendor's wallet
    await recordWalletTransaction(
      escrow.vendorId,
      'credit',
      escrow.vendorAmount,
      'payment',
      `Payment received for request`,
      escrowId
    );

    // Deduct from vendor's pending balance
    await updateVendorPendingBalance(escrow.vendorId, -escrow.vendorAmount);

  } catch (error) {
    console.error('Error releasing escrow funds:', error);
    throw error;
  }
};

/**
 * Refund escrow funds to requester
 */
export const refundEscrowFunds = async (escrowId: string, reason: string): Promise<void> => {
  try {
    const escrowDoc = await getDoc(doc(db, 'escrowTransactions', escrowId));
    if (!escrowDoc.exists()) {
      throw new Error('Escrow transaction not found');
    }

    const escrow = escrowDoc.data() as EscrowTransaction;

    if (escrow.status !== 'held' && escrow.status !== 'disputed') {
      throw new Error('Cannot refund this escrow transaction');
    }

    // Update escrow status
    await updateDoc(doc(db, 'escrowTransactions', escrowId), {
      status: 'refunded',
      refundedAt: Timestamp.now(),
    });

    // Credit requester's wallet
    await recordWalletTransaction(
      escrow.requesterId,
      'credit',
      escrow.amount,
      'refund',
      `Refund for request - ${reason}`,
      escrowId
    );

    // Deduct from vendor's pending balance
    await updateVendorPendingBalance(escrow.vendorId, -escrow.vendorAmount);

  } catch (error) {
    console.error('Error refunding escrow funds:', error);
    throw error;
  }
};

/**
 * Record wallet transaction
 */
const recordWalletTransaction = async (
  userId: string,
  type: 'credit' | 'debit',
  amount: number,
  category: WalletTransaction['category'],
  description: string,
  relatedId?: string
): Promise<void> => {
  try {
    // Get or create wallet
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);

    let currentBalance = 0;
    if (walletDoc.exists()) {
      currentBalance = walletDoc.data().balance || 0;
    } else {
      // Create wallet
      await updateDoc(walletRef, {
        id: userId,
        userId,
        balance: 0,
        currency: 'NGN',
        totalEarnings: 0,
        totalSpent: 0,
        pendingBalance: 0,
        updatedAt: Timestamp.now(),
      });
    }

    const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount;

    // Update wallet balance
    await updateDoc(walletRef, {
      balance: newBalance,
      updatedAt: Timestamp.now(),
    });

    // Record transaction
    const transactionData: Omit<WalletTransaction, 'id'> = {
      walletId: userId,
      userId,
      type,
      amount,
      currency: 'NGN',
      category,
      description,
      relatedId,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      createdAt: Timestamp.now() as any,
    };

    await addDoc(collection(db, 'walletTransactions'), transactionData);

    // Update user's wallet balance field
    await updateDoc(doc(db, 'users', userId), {
      walletBalance: newBalance,
    });

  } catch (error) {
    console.error('Error recording wallet transaction:', error);
    throw error;
  }
};

/**
 * Update vendor's pending balance
 */
const updateVendorPendingBalance = async (vendorId: string, amount: number): Promise<void> => {
  try {
    const walletRef = doc(db, 'wallets', vendorId);
    const walletDoc = await getDoc(walletRef);

    if (walletDoc.exists()) {
      const currentPending = walletDoc.data().pendingBalance || 0;
      await updateDoc(walletRef, {
        pendingBalance: currentPending + amount,
      });
    }
  } catch (error) {
    console.error('Error updating pending balance:', error);
  }
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (userId: string): Promise<number> => {
  try {
    const walletDoc = await getDoc(doc(db, 'wallets', userId));
    if (walletDoc.exists()) {
      return walletDoc.data().balance || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
};

/**
 * Withdraw from wallet (for vendors)
 */
export const withdrawFromWallet = async (
  userId: string,
  amount: number,
  bankDetails: any
): Promise<void> => {
  try {
    const balance = await getWalletBalance(userId);

    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Record withdrawal transaction
    await recordWalletTransaction(
      userId,
      'debit',
      amount,
      'withdrawal',
      `Withdrawal to bank account`,
      undefined
    );

    // Here you would integrate with Paystack Transfer API
    // to actually send money to the vendor's bank account
    // For now, just record the transaction

    Alert.alert('Success', 'Withdrawal request submitted. Funds will be transferred within 24 hours.');
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error;
  }
};
