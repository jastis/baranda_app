import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { SubscriptionPlan } from '../types';

const ManageSubscriptionPlansScreen: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [duration, setDuration] = useState('30');
  const [maxRequests, setMaxRequests] = useState('');
  const [maxFeaturedItems, setMaxFeaturedItems] = useState('3');
  const [prioritySupport, setPrioritySupport] = useState(false);
  const [verifiedBadge, setVerifiedBadge] = useState(false);
  const [analyticsAccess, setAnalyticsAccess] = useState(false);
  const [customBranding, setCustomBranding] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('1');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansQuery = query(collection(db, 'subscriptionPlans'), orderBy('displayOrder'));
      const snapshot = await getDocs(plansQuery);
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as SubscriptionPlan[];
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingPlan(null);
    setModalVisible(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price.toString());
    setCurrency(plan.currency);
    setDuration(plan.duration.toString());
    setMaxRequests(plan.features.maxRequests?.toString() || '');
    setMaxFeaturedItems(plan.features.maxFeaturedItems?.toString() || '3');
    setPrioritySupport(plan.features.prioritySupport);
    setVerifiedBadge(plan.features.verifiedBadge);
    setAnalyticsAccess(plan.features.analyticsAccess);
    setCustomBranding(plan.features.customBranding || false);
    setIsActive(plan.isActive);
    setDisplayOrder(plan.displayOrder.toString());
    setEditingPlan(plan);
    setModalVisible(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCurrency('NGN');
    setDuration('30');
    setMaxRequests('');
    setMaxFeaturedItems('3');
    setPrioritySupport(false);
    setVerifiedBadge(false);
    setAnalyticsAccess(false);
    setCustomBranding(false);
    setIsActive(true);
    setDisplayOrder((plans.length + 1).toString());
  };

  const handleSavePlan = async () => {
    if (!name.trim() || !description.trim() || !price || !duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const planData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency,
        duration: parseInt(duration),
        features: {
          maxRequests: maxRequests ? parseInt(maxRequests) : undefined,
          maxFeaturedItems: maxFeaturedItems ? parseInt(maxFeaturedItems) : undefined,
          prioritySupport,
          verifiedBadge,
          analyticsAccess,
          customBranding,
        },
        isActive,
        displayOrder: parseInt(displayOrder),
        updatedAt: Timestamp.now(),
      };

      if (editingPlan) {
        // Update existing plan
        await updateDoc(doc(db, 'subscriptionPlans', editingPlan.id), planData);
        Alert.alert('Success', 'Plan updated successfully');
      } else {
        // Create new plan
        await addDoc(collection(db, 'subscriptionPlans'), {
          ...planData,
          createdAt: Timestamp.now(),
        });
        Alert.alert('Success', 'Plan created successfully');
      }

      setModalVisible(false);
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save subscription plan');
    }
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'subscriptionPlans', plan.id));
            Alert.alert('Success', 'Plan deleted');
            loadPlans();
          } catch (error) {
            console.error('Error deleting plan:', error);
            Alert.alert('Error', 'Failed to delete plan');
          }
        },
      },
    ]);
  };

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      await updateDoc(doc(db, 'subscriptionPlans', plan.id), {
        isActive: !plan.isActive,
      });
      loadPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      Alert.alert('Error', 'Failed to update plan status');
    }
  };

  const renderPlan = ({ item }: { item: SubscriptionPlan }) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planPrice}>
            {item.currency} {item.price.toLocaleString()} / {item.duration} days
          </Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => togglePlanStatus(item)}
          trackColor={{ false: '#ccc', true: '#667eea' }}
        />
      </View>

      <Text style={styles.planDescription}>{item.description}</Text>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features:</Text>
        {item.features.maxRequests && (
          <Text style={styles.featureItem}>• {item.features.maxRequests} requests/month</Text>
        )}
        {!item.features.maxRequests && (
          <Text style={styles.featureItem}>• Unlimited requests</Text>
        )}
        {item.features.maxFeaturedItems && (
          <Text style={styles.featureItem}>• {item.features.maxFeaturedItems} featured items</Text>
        )}
        {item.features.prioritySupport && (
          <Text style={styles.featureItem}>• Priority support</Text>
        )}
        {item.features.verifiedBadge && (
          <Text style={styles.featureItem}>• Verified badge</Text>
        )}
        {item.features.analyticsAccess && (
          <Text style={styles.featureItem}>• Analytics access</Text>
        )}
        {item.features.customBranding && (
          <Text style={styles.featureItem}>• Custom branding</Text>
        )}
      </View>

      <View style={styles.planActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePlan(item)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subscription plans yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Plan Name *"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description *"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Price *"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Currency"
                  value={currency}
                  onChangeText={setCurrency}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Duration (days) *"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />

              <Text style={styles.sectionTitle}>Features</Text>

              <TextInput
                style={styles.input}
                placeholder="Max Requests per Month (empty = unlimited)"
                value={maxRequests}
                onChangeText={setMaxRequests}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Max Featured Items"
                value={maxFeaturedItems}
                onChangeText={setMaxFeaturedItems}
                keyboardType="numeric"
              />

              <View style={styles.switchRow}>
                <Text>Priority Support</Text>
                <Switch value={prioritySupport} onValueChange={setPrioritySupport} />
              </View>

              <View style={styles.switchRow}>
                <Text>Verified Badge</Text>
                <Switch value={verifiedBadge} onValueChange={setVerifiedBadge} />
              </View>

              <View style={styles.switchRow}>
                <Text>Analytics Access</Text>
                <Switch value={analyticsAccess} onValueChange={setAnalyticsAccess} />
              </View>

              <View style={styles.switchRow}>
                <Text>Custom Branding</Text>
                <Switch value={customBranding} onValueChange={setCustomBranding} />
              </View>

              <View style={styles.switchRow}>
                <Text>Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Display Order"
                value={displayOrder}
                onChangeText={setDisplayOrder}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSavePlan}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 5,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  featureItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  planActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 50,
    minHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
  saveButton: {
    backgroundColor: '#667eea',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ManageSubscriptionPlansScreen;
