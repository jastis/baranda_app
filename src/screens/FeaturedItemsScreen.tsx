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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FeaturedItem } from '../types';
import { VENDOR_CATEGORIES } from '../types';

interface FeaturedItemsScreenProps {
  navigation: any;
}

const MAX_FEATURED_ITEMS = 3; // Limit per vendor

const FeaturedItemsScreen: React.FC<FeaturedItemsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [contactInfo, setContactInfo] = useState(user?.phoneNumber || '');
  const [durationDays, setDurationDays] = useState('30');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'featuredItems'),
      where('vendorId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date()
      })) as FeaturedItem[];

      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateItem = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check limit
    const activeItems = items.filter((item) => item.isActive && new Date(item.endDate) > new Date());
    if (activeItems.length >= MAX_FEATURED_ITEMS) {
      Alert.alert(
        'Limit Reached',
        `You can only have ${MAX_FEATURED_ITEMS} active featured items at a time. Please deactivate or wait for an existing item to expire.`
      );
      return;
    }

    setCreating(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (parseInt(durationDays) || 30));

      const newItem: Omit<FeaturedItem, 'id'> = {
        vendorId: user!.id,
        vendorName: user!.displayName,
        vendorRating: user!.rating || 0,
        title: title.trim(),
        description: description.trim(),
        category,
        price: price ? parseFloat(price) : undefined,
        contactInfo: contactInfo.trim() || undefined,
        isActive: true,
        impressions: 0,
        clicks: 0,
        startDate: Timestamp.fromDate(startDate) as any,
        endDate: Timestamp.fromDate(endDate) as any,
        createdAt: serverTimestamp() as any
      };

      await addDoc(collection(db, 'featuredItems'), newItem);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      setContactInfo(user?.phoneNumber || '');
      setDurationDays('30');
      setShowCreateForm(false);
      Alert.alert('Success', 'Featured item created! It will be visible to users soon.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleItemStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'featuredItems', itemId), {
        isActive: !currentStatus
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteItem = (itemId: string) => {
    Alert.alert('Delete Featured Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'featuredItems', itemId));
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const isItemExpired = (endDate: Date) => {
    return new Date(endDate) < new Date();
  };

  const renderItem = ({ item }: { item: FeaturedItem }) => {
    const expired = isItemExpired(item.endDate);
    const daysLeft = Math.ceil((new Date(item.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!expired && (
              <TouchableOpacity
                style={[
                  styles.statusBadge,
                  item.isActive ? styles.statusActive : styles.statusInactive
                ]}
                onPress={() => toggleItemStatus(item.id, item.isActive)}
              >
                <Text style={styles.statusText}>
                  {item.isActive ? 'Active' : 'Paused'}
                </Text>
              </TouchableOpacity>
            )}
            {expired && (
              <View style={[styles.statusBadge, styles.statusExpired]}>
                <Text style={styles.statusText}>Expired</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.itemDescription}>{item.description}</Text>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>
          {item.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>${item.price}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Views:</Text>
            <Text style={styles.detailValue}>{item.impressions}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Clicks:</Text>
            <Text style={styles.detailValue}>{item.clicks}</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          {!expired ? (
            <Text style={styles.dateText}>
              Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </Text>
          ) : (
            <Text style={[styles.dateText, { color: '#ef4444' }]}>
              Expired on {new Date(item.endDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const activeItems = items.filter((item) => item.isActive && !isItemExpired(item.endDate));

  return (
    <View style={styles.container}>
      {!showCreateForm ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Featured Items</Text>
            <Text style={styles.headerSubtitle}>
              Promote your products/services ({activeItems.length}/{MAX_FEATURED_ITEMS} active)
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              activeItems.length >= MAX_FEATURED_ITEMS && styles.createButtonDisabled
            ]}
            onPress={() => setShowCreateForm(true)}
            disabled={activeItems.length >= MAX_FEATURED_ITEMS}
          >
            <Text style={styles.createButtonText}>
              {activeItems.length >= MAX_FEATURED_ITEMS
                ? 'Limit Reached'
                : '+ Create Featured Item'}
            </Text>
          </TouchableOpacity>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No featured items yet</Text>
              <Text style={styles.emptySubtext}>
                Create featured items to promote your products/services to requesters
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      ) : (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Create Featured Item</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., iPhone 15 Pro Max"
            value={title}
            onChangeText={setTitle}
            editable={!creating}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your product or service"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!creating}
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoriesContainer}>
            {VENDOR_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected
                ]}
                onPress={() => setCategory(cat)}
                disabled={creating}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Price (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!creating}
          />

          <Text style={styles.label}>Contact Info</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone or email"
            value={contactInfo}
            onChangeText={setContactInfo}
            editable={!creating}
          />

          <Text style={styles.label}>Duration (days)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={durationDays}
            onChangeText={setDurationDays}
            keyboardType="numeric"
            editable={!creating}
          />
          <Text style={styles.hint}>How long should this item be featured?</Text>

          <TouchableOpacity
            style={[styles.submitButton, creating && styles.submitButtonDisabled]}
            onPress={handleCreateItem}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Featured Item</Text>
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
  createButtonDisabled: {
    backgroundColor: '#93c5fd'
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  listContainer: {
    padding: 15
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 10
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusActive: {
    backgroundColor: '#10b981'
  },
  statusInactive: {
    backgroundColor: '#9ca3af'
  },
  statusExpired: {
    backgroundColor: '#ef4444'
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500'
  },
  dateContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  dateText: {
    fontSize: 12,
    color: '#2563eb',
    fontStyle: 'italic'
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
    marginBottom: 8,
    marginTop: 15
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
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
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 5
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

export default FeaturedItemsScreen;
