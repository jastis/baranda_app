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
  Image,
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
import { Advertisement, UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { showImagePickerOptions, uploadImage } from '../utils/imageUpload';

const ManageAdvertisementsScreen: React.FC = () => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [adType, setAdType] = useState<'banner' | 'interstitial' | 'featured'>('banner');
  const [targetUserType, setTargetUserType] = useState<UserType | 'all'>('all');
  const [isActive, setIsActive] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState('30');

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const adsQuery = query(collection(db, 'advertisements'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(adsQuery);
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Advertisement[];
      setAds(adsData);
    } catch (error) {
      console.error('Error loading ads:', error);
      Alert.alert('Error', 'Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingAd(null);
    setModalVisible(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setTitle(ad.title);
    setDescription(ad.description);
    setImageUri(ad.imageUrl || '');
    setLinkUrl(ad.linkUrl || '');
    setAdType(ad.type);
    setTargetUserType(ad.targetUserType || 'all');
    setIsActive(ad.isActive);

    if (ad.expiresAt) {
      const daysUntilExpiry = Math.ceil(
        (ad.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      setExpiresInDays(daysUntilExpiry.toString());
    }

    setEditingAd(ad);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUri('');
    setLinkUrl('');
    setAdType('banner');
    setTargetUserType('all');
    setIsActive(true);
    setExpiresInDays('30');
  };

  const handlePickImage = async () => {
    const uri = await showImagePickerOptions();
    if (uri) {
      setImageUri(uri);
    }
  };

  const handleSaveAd = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);

      let imageUrl = imageUri;

      // Upload image if it's a local URI
      if (imageUri && imageUri.startsWith('file://')) {
        const uploadResult = await uploadImage(imageUri, 'advertisements', user!.id);
        imageUrl = uploadResult.url;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays || '30'));

      const adData = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl || null,
        linkUrl: linkUrl.trim() || null,
        type: adType,
        targetUserType: targetUserType !== 'all' ? targetUserType : null,
        isActive,
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      if (editingAd) {
        // Update existing ad
        await updateDoc(doc(db, 'advertisements', editingAd.id), adData);
        Alert.alert('Success', 'Advertisement updated successfully');
      } else {
        // Create new ad
        await addDoc(collection(db, 'advertisements'), {
          ...adData,
          impressions: 0,
          clicks: 0,
          createdAt: Timestamp.now(),
        });
        Alert.alert('Success', 'Advertisement created successfully');
      }

      setModalVisible(false);
      loadAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      Alert.alert('Error', 'Failed to save advertisement');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAd = (ad: Advertisement) => {
    Alert.alert('Delete Advertisement', 'Are you sure you want to delete this ad?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'advertisements', ad.id));
            Alert.alert('Success', 'Advertisement deleted');
            loadAds();
          } catch (error) {
            console.error('Error deleting ad:', error);
            Alert.alert('Error', 'Failed to delete advertisement');
          }
        },
      },
    ]);
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      await updateDoc(doc(db, 'advertisements', ad.id), {
        isActive: !ad.isActive,
      });
      loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      Alert.alert('Error', 'Failed to update advertisement status');
    }
  };

  const renderAd = ({ item }: { item: Advertisement }) => {
    const isExpired = item.expiresAt && item.expiresAt < new Date();

    return (
      <View style={styles.adCard}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.adImage} resizeMode="cover" />
        )}

        <View style={styles.adContent}>
          <View style={styles.adHeader}>
            <Text style={styles.adTitle}>{item.title}</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleAdStatus(item)}
              trackColor={{ false: '#ccc', true: '#667eea' }}
            />
          </View>

          <Text style={styles.adDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.adMeta}>
            <Text style={styles.adMetaText}>Type: {item.type}</Text>
            <Text style={styles.adMetaText}>Target: {item.targetUserType || 'All'}</Text>
          </View>

          <View style={styles.adStats}>
            <Text style={styles.adStatText}>👁 {item.impressions}</Text>
            <Text style={styles.adStatText}>👆 {item.clicks}</Text>
            {isExpired && <Text style={styles.expiredBadge}>Expired</Text>}
          </View>

          <View style={styles.adActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAd(item)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        renderItem={renderAd}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No advertisements yet</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title *"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description *"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
              <Text style={styles.imageButtonText}>
                {imageUri ? '✓ Image Selected' : 'Pick Image'}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            )}

            <TextInput
              style={styles.input}
              placeholder="Link URL (optional)"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
            />

            <View style={styles.pickerRow}>
              <Text>Ad Type:</Text>
              <View style={styles.typeButtons}>
                {(['banner', 'interstitial', 'featured'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, adType === type && styles.typeButtonActive]}
                    onPress={() => setAdType(type)}
                  >
                    <Text style={adType === type ? styles.typeButtonTextActive : styles.typeButtonText}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.pickerRow}>
              <Text>Target:</Text>
              <View style={styles.typeButtons}>
                {(['all', 'requester', 'vendor'] as const).map((target) => (
                  <TouchableOpacity
                    key={target}
                    style={[styles.typeButton, targetUserType === target && styles.typeButtonActive]}
                    onPress={() => setTargetUserType(target)}
                  >
                    <Text
                      style={targetUserType === target ? styles.typeButtonTextActive : styles.typeButtonText}
                    >
                      {target}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Expires in (days)"
              value={expiresInDays}
              onChangeText={setExpiresInDays}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text>Active</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveAd}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
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
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adImage: {
    width: '100%',
    height: 150,
  },
  adContent: {
    padding: 15,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  adDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  adMeta: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  adMetaText: {
    fontSize: 12,
    color: '#999',
  },
  adStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  adStatText: {
    fontSize: 14,
    color: '#667eea',
  },
  expiredBadge: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adActions: {
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
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerRow: {
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: '#667eea',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ManageAdvertisementsScreen;
