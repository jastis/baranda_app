import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ProductAlert } from '../types';
import { VENDOR_CATEGORIES } from '../types';

interface ProductAlertsScreenProps {
  navigation: any;
}

const ProductAlertsScreen: React.FC<ProductAlertsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ProductAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');
  const [maxDistance, setMaxDistance] = useState('50');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'productAlerts'),
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastTriggered: doc.data().lastTriggered?.toDate()
      })) as ProductAlert[];

      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleCreateAlert = async () => {
    if (selectedCategories.length === 0 && !keywords.trim()) {
      Alert.alert('Error', 'Please select at least one category or add keywords');
      return;
    }

    setCreating(true);
    try {
      const keywordsList = keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k !== '');

      const newAlert: Omit<ProductAlert, 'id'> = {
        userId: user!.id,
        userName: user!.displayName,
        categories: selectedCategories,
        keywords: keywordsList,
        location: user?.location
          ? {
              latitude: user.location.latitude,
              longitude: user.location.longitude,
              maxDistance: parseFloat(maxDistance) || 50
            }
          : undefined,
        isActive: true,
        notificationCount: 0,
        createdAt: serverTimestamp() as any
      };

      await addDoc(collection(db, 'productAlerts'), newAlert);

      // Reset form
      setSelectedCategories([]);
      setKeywords('');
      setMaxDistance('50');
      setShowCreateForm(false);
      Alert.alert('Success', 'Product alert created! You\'ll be notified when matching items are posted.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'productAlerts', alertId), {
        isActive: !currentStatus
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'productAlerts', alertId));
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const renderAlert = ({ item }: { item: ProductAlert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>Product Alert</Text>
        <TouchableOpacity
          style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}
          onPress={() => toggleAlertStatus(item.id, item.isActive)}
        >
          <Text style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>

      {item.categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categories:</Text>
          <View style={styles.tagsContainer}>
            {item.categories.map((cat, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.keywords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Keywords:</Text>
          <Text style={styles.sectionValue}>{item.keywords.join(', ')}</Text>
        </View>
      )}

      {item.location && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Within {item.location.maxDistance}km of your location
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {item.notificationCount} notification{item.notificationCount !== 1 ? 's' : ''} sent
        </Text>
        {item.lastTriggered && (
          <Text style={styles.statsText}>
            Last: {new Date(item.lastTriggered).toLocaleDateString()}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAlert(item.id)}>
        <Text style={styles.deleteButtonText}>Delete Alert</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showCreateForm ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Product Alerts</Text>
            <Text style={styles.headerSubtitle}>
              Get notified when products/services you're looking for become available
            </Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={styles.createButtonText}>+ Create New Alert</Text>
          </TouchableOpacity>

          {alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts yet</Text>
              <Text style={styles.emptySubtext}>
                Create an alert to get notified about products and services
              </Text>
            </View>
          ) : (
            <FlatList
              data={alerts}
              renderItem={renderAlert}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      ) : (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Create Product Alert</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Categories (select what you're looking for)</Text>
          <View style={styles.categoriesContainer}>
            {VENDOR_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category) && styles.categoryChipSelected
                ]}
                onPress={() => toggleCategory(category)}
                disabled={creating}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategories.includes(category) && styles.categoryChipTextSelected
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Keywords (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., iPhone, laptop repair, plumbing"
            value={keywords}
            onChangeText={setKeywords}
            multiline
            editable={!creating}
          />

          <Text style={styles.label}>Maximum Distance (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={maxDistance}
            onChangeText={setMaxDistance}
            keyboardType="numeric"
            editable={!creating}
          />

          <TouchableOpacity
            style={[styles.submitButton, creating && styles.submitButtonDisabled]}
            onPress={handleCreateAlert}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Alert</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  createButton: {
    backgroundColor: '#2563eb',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  listContainer: {
    padding: 15
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  statusActive: {
    backgroundColor: '#10b981'
  },
  statusInactive: {
    backgroundColor: '#9ca3af'
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  section: {
    marginBottom: 12
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 5
  },
  sectionValue: {
    fontSize: 14,
    color: '#1f2937'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8
  },
  tagText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  statsText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  formContainer: {
    flex: 1,
    padding: 20
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  cancelText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
    marginTop: 15
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  categoryChipSelected: {
    backgroundColor: '#2563eb'
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280'
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    minHeight: 50
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ProductAlertsScreen;
