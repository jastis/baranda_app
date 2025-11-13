import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { SubscriptionPlan, SubscriptionSettings, SubscriptionTransaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

const VendorSubscriptionScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<SubscriptionSettings | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load subscription settings
      const settingsDoc = await getDoc(doc(db, 'subscriptionSettings', 'main'));
      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data() as SubscriptionSettings;
        setSettings(settingsData);

        // Only load plans if subscriptions are enabled or not allowing free access
        if (settingsData.subscriptionEnabled && !settingsData.allowFreeAccess) {
          const plansQuery = query(
            collection(db, 'subscriptionPlans'),
            where('isActive', '==', true),
            orderBy('displayOrder')
          );
          const snapshot = await getDocs(plansQuery);
          const plansData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as SubscriptionPlan[];
          setPlans(plansData);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscriptionEndDate) {
      return { status: 'none', daysRemaining: 0 };
    }

    const now = new Date();
    const endDate = user.subscriptionEndDate instanceof Date
      ? user.subscriptionEndDate
      : user.subscriptionEndDate.toDate();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: 'expired', daysRemaining: 0 };
    } else if (daysRemaining <= (settings?.gracePeriodDays || 3)) {
      return { status: 'expiring', daysRemaining };
    } else {
      return { status: 'active', daysRemaining };
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentModalVisible(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;

    // For manual payment, require reference ID
    if (!referenceId.trim()) {
      Alert.alert('Required', 'Please enter a payment reference ID');
      return;
    }

    setProcessingPayment(true);

    try {
      // Create transaction record
      const transaction: Omit<SubscriptionTransaction, 'id'> = {
        userId: user!.id,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        paymentMethod: 'manual',
        status: 'pending',
        transactionDate: Timestamp.now() as any,
        referenceId: referenceId.trim(),
      };

      await addDoc(collection(db, 'subscriptionTransactions'), transaction);

      Alert.alert(
        'Subscription Request Submitted',
        'Your subscription request has been submitted for verification. You will be notified once it is approved.',
        [{ text: 'OK', onPress: () => {
          setPaymentModalVisible(false);
          setReferenceId('');
        }}]
      );
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to process subscription request');
    } finally {
      setProcessingPayment(false);
    }
  };

  const renderCurrentSubscription = () => {
    const { status, daysRemaining } = getSubscriptionStatus();

    if (settings?.allowFreeAccess) {
      return (
        <View style={[styles.statusCard, styles.freeAccessCard]}>
          <Text style={styles.statusTitle}>🎉 Free Access Enabled</Text>
          <Text style={styles.statusText}>
            The admin has enabled free access for all vendors. Enjoy unlimited features!
          </Text>
        </View>
      );
    }

    if (status === 'none') {
      return (
        <View style={[styles.statusCard, styles.noSubscriptionCard]}>
          <Text style={styles.statusTitle}>⚠️ No Active Subscription</Text>
          <Text style={styles.statusText}>
            Subscribe to a plan to access premium features and grow your business.
          </Text>
        </View>
      );
    }

    if (status === 'expired') {
      return (
        <View style={[styles.statusCard, styles.expiredCard]}>
          <Text style={styles.statusTitle}>❌ Subscription Expired</Text>
          <Text style={styles.statusText}>
            Your subscription has expired. Renew now to continue enjoying premium features.
          </Text>
        </View>
      );
    }

    if (status === 'expiring') {
      return (
        <View style={[styles.statusCard, styles.expiringCard]}>
          <Text style={styles.statusTitle}>⏰ Subscription Expiring Soon</Text>
          <Text style={styles.statusText}>
            Your subscription expires in {daysRemaining} days. Renew now to avoid interruption.
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusCard, styles.activeCard]}>
        <Text style={styles.statusTitle}>✓ Active Subscription</Text>
        <Text style={styles.statusText}>
          Your subscription is active for {daysRemaining} more days.
        </Text>
        {user?.subscriptionPlanId && (
          <Text style={styles.planName}>Current Plan: {getPlanName(user.subscriptionPlanId)}</Text>
        )}
      </View>
    );
  };

  const getPlanName = (planId: string): string => {
    const plan = plans.find(p => p.id === planId);
    return plan?.name || 'Unknown';
  };

  const renderPlan = (plan: SubscriptionPlan) => {
    const isCurrentPlan = user?.subscriptionPlanId === plan.id;

    return (
      <View key={plan.id} style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {isCurrentPlan && <Text style={styles.currentBadge}>Current</Text>}
        </View>

        <Text style={styles.planPrice}>
          {plan.currency} {plan.price.toLocaleString()}
        </Text>
        <Text style={styles.planDuration}>{plan.duration} days</Text>

        <Text style={styles.planDescription}>{plan.description}</Text>

        <View style={styles.featuresContainer}>
          {plan.features.maxRequests && (
            <Text style={styles.featureItem}>✓ {plan.features.maxRequests} requests/month</Text>
          )}
          {!plan.features.maxRequests && (
            <Text style={styles.featureItem}>✓ Unlimited requests</Text>
          )}
          {plan.features.maxFeaturedItems && (
            <Text style={styles.featureItem}>✓ {plan.features.maxFeaturedItems} featured items</Text>
          )}
          {plan.features.prioritySupport && (
            <Text style={styles.featureItem}>✓ Priority support</Text>
          )}
          {plan.features.verifiedBadge && (
            <Text style={styles.featureItem}>✓ Verified badge</Text>
          )}
          {plan.features.analyticsAccess && (
            <Text style={styles.featureItem}>✓ Analytics access</Text>
          )}
          {plan.features.customBranding && (
            <Text style={styles.featureItem}>✓ Custom branding</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, isCurrentPlan && styles.renewButton]}
          onPress={() => handleSelectPlan(plan)}
        >
          <Text style={styles.subscribeButtonText}>
            {isCurrentPlan ? 'Renew' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!settings?.subscriptionEnabled || settings?.allowFreeAccess) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {renderCurrentSubscription()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderCurrentSubscription()}

        <Text style={styles.sectionTitle}>Available Plans</Text>

        {plans.map(plan => renderPlan(plan))}

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Contact our support team if you have questions about subscriptions.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Subscription</Text>

            {selectedPlan && (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>{selectedPlan.name}</Text>
                  <Text style={styles.summaryPrice}>
                    {selectedPlan.currency} {selectedPlan.price.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryDuration}>{selectedPlan.duration} days</Text>
                </View>

                <Text style={styles.paymentInstructions}>
                  Make a payment of {selectedPlan.currency} {selectedPlan.price.toLocaleString()} to our account
                  and enter the transaction reference below:
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Payment Reference ID *"
                  value={referenceId}
                  onChangeText={setReferenceId}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setPaymentModalVisible(false);
                      setReferenceId('');
                    }}
                    disabled={processingPayment}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmSubscription}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  scrollContainer: {
    padding: 15,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  freeAccessCard: {
    backgroundColor: '#4caf50',
  },
  noSubscriptionCard: {
    backgroundColor: '#ff9800',
  },
  expiredCard: {
    backgroundColor: '#f44336',
  },
  expiringCard: {
    backgroundColor: '#ff9800',
  },
  activeCard: {
    backgroundColor: '#4caf50',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  planName: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentBadge: {
    backgroundColor: '#667eea',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  planDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  renewButton: {
    backgroundColor: '#4caf50',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  summaryDuration: {
    fontSize: 14,
    color: '#666',
  },
  paymentInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#667eea',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default VendorSubscriptionScreen;
