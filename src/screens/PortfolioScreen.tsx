import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { db } from '../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PortfolioItem, VENDOR_CATEGORIES } from '../types';
import { showImagePickerOptions, uploadMultipleImages } from '../utils/imageUpload';

const PortfolioScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(VENDOR_CATEGORIES[0]);
  const [clientName, setClientName] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [completionDate, setCompletionDate] = useState(new Date());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const portfolioQuery = query(
        collection(db, 'portfolioItems'),
        where('vendorId', '==', user!.id),
        orderBy('completionDate', 'desc')
      );

      const snapshot = await getDocs(portfolioQuery);
      const portfolioData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completionDate: doc.data().completionDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as PortfolioItem[];

      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingItem(null);
    setModalVisible(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setClientName(item.clientName || '');
    setPrice(item.price?.toString() || '');
    setTags(item.tags.join(', '));
    setImageUris(item.images);
    setCompletionDate(item.completionDate);
    setEditingItem(item);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(VENDOR_CATEGORIES[0]);
    setClientName('');
    setPrice('');
    setTags('');
    setImageUris([]);
    setCompletionDate(new Date());
  };

  const handleAddImage = async () => {
    if (imageUris.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 images');
      return;
    }

    const uri = await showImagePickerOptions();
    if (uri) {
      setImageUris([...imageUris, uri]);
    }
  };

  const handleSaveItem = async () => {
    if (!title.trim() || !description.trim() || imageUris.length === 0) {
      Alert.alert('Error', 'Please fill in required fields and add at least one image');
      return;
    }

    setUploading(true);

    try {
      // Upload new images (local URIs only)
      const localUris = imageUris.filter(uri => uri.startsWith('file://'));
      let imageUrls = imageUris.filter(uri => !uri.startsWith('file://'));

      if (localUris.length > 0) {
        const uploadResults = await uploadMultipleImages(
          localUris,
          'portfolio',
          user!.id
        );
        imageUrls = [...imageUrls, ...uploadResults.map(r => r.url)];
      }

      const itemData = {
        vendorId: user!.id,
        title: title.trim(),
        description: description.trim(),
        category,
        images: imageUrls,
        completionDate: Timestamp.fromDate(completionDate),
        clientName: clientName.trim() || null,
        price: price ? parseFloat(price) : null,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        featured: false,
      };

      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, 'portfolioItems', editingItem.id), {
          ...itemData,
        });
        Alert.alert('Success', 'Portfolio item updated');
      } else {
        // Create new item
        await addDoc(collection(db, 'portfolioItems'), {
          ...itemData,
          createdAt: Timestamp.now(),
        });
        Alert.alert('Success', 'Portfolio item added');
      }

      setModalVisible(false);
      loadPortfolio();
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      Alert.alert('Error', 'Failed to save portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = (item: PortfolioItem) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this portfolio item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'portfolioItems', item.id));
            Alert.alert('Success', 'Portfolio item deleted');
            loadPortfolio();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    try {
      await updateDoc(doc(db, 'portfolioItems', item.id), {
        featured: !item.featured,
      });
      loadPortfolio();
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const renderPortfolioItem = ({ item }: { item: PortfolioItem }) => (
    <View style={styles.portfolioCard}>
      <Image source={{ uri: item.images[0] }} style={styles.portfolioImage} />

      <View style={styles.portfolioContent}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioTitle}>{item.title}</Text>
          {item.featured && <Text style={styles.featuredBadge}>⭐ Featured</Text>}
        </View>

        <Text style={styles.portfolioDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.portfolioMeta}>
          <Text style={styles.metaText}>{item.category}</Text>
          <Text style={styles.metaText}>
            {item.completionDate?.toLocaleDateString()}
          </Text>
        </View>

        {item.images.length > 1 && (
          <Text style={styles.imageCount}>+{item.images.length - 1} more</Text>
        )}

        <View style={styles.portfolioActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleFeatured(item)}
          >
            <Text style={styles.actionButtonText}>
              {item.featured ? 'Unfeature' : 'Feature'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteItem(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
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
        data={portfolio}
        renderItem={renderPortfolioItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Portfolio</Text>
            <Text style={styles.headerSubtitle}>
              Showcase your best work to attract more clients
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No portfolio items yet</Text>
            <Text style={styles.emptySubtext}>Add your first project to showcase your work</Text>
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
                {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Project Title *"
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description *"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryButtons}>
                  {VENDOR_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        category === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TextInput
                style={styles.input}
                placeholder="Client Name (optional)"
                value={clientName}
                onChangeText={setClientName}
              />

              <TextInput
                style={styles.input}
                placeholder="Project Value (optional)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Tags (comma separated)"
                value={tags}
                onChangeText={setTags}
              />

              <Text style={styles.label}>Images * (up to 10)</Text>
              <View style={styles.imagesGrid}>
                {imageUris.map((uri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri }} style={styles.imagePreviewImg} />
                    <TouchableOpacity
                      style={styles.removeImage}
                      onPress={() => setImageUris(imageUris.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {imageUris.length < 10 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                    <Text style={styles.addImageText}>+</Text>
                  </TouchableOpacity>
                )}
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
                  onPress={handleSaveItem}
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  portfolioCard: {
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
  portfolioImage: {
    width: '100%',
    height: 200,
  },
  portfolioContent: {
    padding: 15,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  featuredBadge: {
    fontSize: 12,
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  portfolioDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  portfolioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  imageCount: {
    fontSize: 12,
    color: '#667eea',
    marginBottom: 12,
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: '#ff4444',
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#ff4444',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
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
    height: 100,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 13,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  imagePreview: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  imagePreviewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 32,
    color: '#999',
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

export default PortfolioScreen;
