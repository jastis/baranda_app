import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Paystack } from 'react-native-paystack-webview';
import { useAuth } from '../contexts/AuthContext';
import {
  initializePaystackPayment,
  verifyPaystackPayment,
  createEscrowTransaction,
  PLATFORM_FEE_RATE,
} from '../services/paystack';
import { db } from '../services/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

interface PaymentScreenProps {
  route: any;
  navigation: any;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { request, response, vendor } = route.params;
  const [loading, setLoading] = useState(false);
  const paystackWebViewRef = useRef<any>();

  const amount = response.price;
  const platformFee = amount * PLATFORM_FEE_RATE;
  const totalAmount = amount;

  const handlePayWithPaystack = () => {
    // Open Paystack WebView
    if (paystackWebViewRef.current) {
      paystackWebViewRef.current.startTransaction();
    }
  };

  const handlePayWithWallet = async () => {
    Alert.alert('Coming Soon', 'Wallet payment will be available in the next update.');
  };

  const handlePaymentSuccess = async (reference: string) => {
    setLoading(true);

    try {
      // Verify payment
      const paymentData = await verifyPaystackPayment(reference);

      if (paymentData.status === 'success') {
        // Create escrow transaction
        const escrowId = await createEscrowTransaction(
          request.id,
          user!.id,
          user!.displayName,
          vendor.id,
          vendor.name,
          amount,
          reference
        );

        // Update request status to accepted
        await updateDoc(doc(db, 'requests', request.id), {
          status: 'accepted',
          chosenVendorId: vendor.id,
          acceptedAt: Timestamp.now(),
          escrowId,
        });

        // Update response status
        await updateDoc(doc(db, 'responses', response.id), {
          status: 'accepted',
        });

        Alert.alert(
          'Payment Successful',
          `Your payment has been secured in escrow. The vendor will be notified and can start working on your request.`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('RequestDetails', { requestId: request.id });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert('Payment Cancelled', 'You cancelled the payment.');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Processing payment...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Payment Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <Text style={styles.headerSubtitle}>
            Your payment is protected by escrow
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Request:</Text>
            <Text style={styles.summaryValue}>{request.title}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vendor:</Text>
            <Text style={styles.summaryValue}>{vendor.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee:</Text>
            <Text style={styles.summaryValue}>
              ₦{amount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelSmall}>
              Platform Fee ({(PLATFORM_FEE_RATE * 100).toFixed(0)}%):
            </Text>
            <Text style={styles.summaryValueSmall}>
              ₦{platformFee.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              ₦{totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Escrow Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 How Escrow Works</Text>
          <View style={styles.infoStep}>
            <Text style={styles.infoStepNumber}>1.</Text>
            <Text style={styles.infoStepText}>
              Your payment is held securely in escrow
            </Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.infoStepNumber}>2.</Text>
            <Text style={styles.infoStepText}>
              Vendor completes your request
            </Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.infoStepNumber}>3.</Text>
            <Text style={styles.infoStepText}>
              You confirm completion and release payment
            </Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.infoStepNumber}>4.</Text>
            <Text style={styles.infoStepText}>
              Vendor receives payment in their wallet
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.paymentMethodsTitle}>Choose Payment Method</Text>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handlePayWithPaystack}
          >
            <View style={styles.paymentButtonContent}>
              <Text style={styles.paymentButtonIcon}>💳</Text>
              <View style={styles.paymentButtonText}>
                <Text style={styles.paymentButtonTitle}>
                  Pay with Card/Bank
                </Text>
                <Text style={styles.paymentButtonSubtitle}>
                  Powered by Paystack
                </Text>
              </View>
            </View>
            <Text style={styles.paymentButtonArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentButton, styles.walletButton]}
            onPress={handlePayWithWallet}
          >
            <View style={styles.paymentButtonContent}>
              <Text style={styles.paymentButtonIcon}>👛</Text>
              <View style={styles.paymentButtonText}>
                <Text style={styles.paymentButtonTitle}>
                  Pay from Wallet
                </Text>
                <Text style={styles.paymentButtonSubtitle}>
                  Balance: ₦{(user?.walletBalance || 0).toLocaleString()}
                </Text>
              </View>
            </View>
            <Text style={styles.paymentButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>
            🔐 All transactions are encrypted and secure
          </Text>
        </View>
      </View>

      {/* Hidden Paystack WebView */}
      <Paystack
        paystackKey="pk_test_xxxxxxxxxxxxxxxxxxxx" // Replace with your actual key
        billingEmail={user?.email || ''}
        amount={totalAmount}
        channels={['card', 'bank', 'ussd', 'bank_transfer']}
        onCancel={handlePaymentCancel}
        onSuccess={(res: any) => {
          handlePaymentSuccess(res.transactionRef.reference);
        }}
        ref={paystackWebViewRef}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  summaryLabelSmall: {
    fontSize: 13,
    color: '#999',
  },
  summaryValueSmall: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoStep: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoStepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 10,
  },
  infoStepText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  paymentMethodsContainer: {
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  paymentButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletButton: {
    borderWidth: 1,
    borderColor: '#667eea',
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  paymentButtonText: {
    flex: 1,
  },
  paymentButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  paymentButtonSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  paymentButtonArrow: {
    fontSize: 24,
    color: '#667eea',
  },
  securityInfo: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 13,
    color: '#999',
  },
});

export default PaymentScreen;
