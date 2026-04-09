import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db } from '../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { EnhancedReview } from '../types';
import { showImagePickerOptions, uploadMultipleImages } from '../utils/imageUpload';

interface EnhancedReviewsScreenProps {
  route: any;
  navigation: any;
}

const EnhancedReviewsScreen: React.FC<EnhancedReviewsScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { vendorId, vendorName } = route.params;

  const [reviews, setReviews] = useState<EnhancedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [respondModalVisible, setRespondModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<EnhancedReview | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'enhancedReviews'),
        where('revieweeId', '==', vendorId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as EnhancedReview[];

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (photoUris.length >= 5) {
      Alert.alert('Limit Reached', 'You can add up to 5 photos');
      return;
    }

    const uri = await showImagePickerOptions();
    if (uri) {
      setPhotoUris([...photoUris, uri]);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setSubmitting(true);

    try {
      let photoUrls: string[] = [];

      // Upload photos if any
      if (photoUris.length > 0) {
        const uploadResults = await uploadMultipleImages(
          photoUris,
          'reviews',
          user!.id
        );
        photoUrls = uploadResults.map(r => r.url);
      }

      const reviewData: Omit<EnhancedReview, 'id'> = {
        reviewerId: user!.id,
        reviewerName: user!.displayName,
        reviewerImage: user!.profileImage,
        revieweeId: vendorId,
        requestId: route.params.requestId || '',
        rating,
        comment: comment.trim(),
        photos: photoUrls,
        verifiedPurchase: !!route.params.requestId,
        helpful: 0,
        notHelpful: 0,
        status: 'published',
        createdAt: Timestamp.now() as any,
      };

      await addDoc(collection(db, 'enhancedReviews'), reviewData);

      Alert.alert('Success', 'Review submitted successfully');
      setWriteModalVisible(false);
      setRating(5);
      setComment('');
      setPhotoUris([]);
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      await updateDoc(doc(db, 'enhancedReviews', reviewId), {
        helpful: isHelpful ? review.helpful + 1 : review.helpful,
        notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful,
      });

      // Record vote
      await addDoc(collection(db, 'reviewVotes'), {
        reviewId,
        userId: user!.id,
        voteType: isHelpful ? 'helpful' : 'not_helpful',
        createdAt: Timestamp.now(),
      });

      loadReviews();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleRespondToReview = async () => {
    if (!responseText.trim() || !selectedReview) return;

    try {
      await updateDoc(doc(db, 'enhancedReviews', selectedReview.id), {
        vendorResponse: {
          text: responseText.trim(),
          respondedAt: Timestamp.now(),
        },
        updatedAt: Timestamp.now(),
      });

      Alert.alert('Success', 'Response submitted');
      setRespondModalVisible(false);
      setResponseText('');
      setSelectedReview(null);
      loadReviews();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit response');
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={[styles.star, { fontSize: size }]}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: EnhancedReview }) => (
    <View style={styles.reviewCard}>
      {/* Reviewer Info */}
      <View style={styles.reviewerInfo}>
        <View style={styles.reviewerAvatar}>
          {item.reviewerImage ? (
            <Image source={{ uri: item.reviewerImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{item.reviewerName.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.reviewerDetails}>
          <View style={styles.reviewerHeader}>
            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
            {item.verifiedPurchase && (
              <Text style={styles.verifiedBadge}>✓ Verified</Text>
            )}
          </View>
          {renderStars(item.rating, 14)}
          <Text style={styles.reviewDate}>
            {item.createdAt?.toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Review Comment */}
      <Text style={styles.reviewComment}>{item.comment}</Text>

      {/* Review Photos */}
      {item.photos && item.photos.length > 0 && (
        <View style={styles.photosContainer}>
          {item.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.reviewPhoto} />
          ))}
        </View>
      )}

      {/* Vendor Response */}
      {item.vendorResponse && (
        <View style={styles.vendorResponse}>
          <Text style={styles.vendorResponseTitle}>Vendor Response:</Text>
          <Text style={styles.vendorResponseText}>{item.vendorResponse.text}</Text>
          <Text style={styles.vendorResponseDate}>
            {item.vendorResponse.respondedAt?.toDate().toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={styles.helpfulButton}
          onPress={() => handleVoteHelpful(item.id, true)}
        >
          <Text style={styles.helpfulText}>👍 Helpful ({item.helpful})</Text>
        </TouchableOpacity>

        {user?.id === vendorId && !item.vendorResponse && (
          <TouchableOpacity
            style={styles.respondButton}
            onPress={() => {
              setSelectedReview(item);
              setRespondModalVisible(true);
            }}
          >
            <Text style={styles.respondButtonText}>Respond</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.ratingContainer}>
          <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
          {renderStars(Math.round(averageRating), 20)}
          <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
        </View>

        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => setWriteModalVisible(true)}
        >
          <Text style={styles.writeReviewButtonText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
          </View>
        }
      />

      {/* Write Review Modal */}
      <Modal
        visible={writeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWriteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write Review</Text>

            {/* Rating */}
            <Text style={styles.label}>Rating</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={styles.ratingStar}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment */}
            <TextInput
              style={styles.textArea}
              placeholder="Share your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* Photos */}
            <Text style={styles.label}>Photos (optional)</Text>
            <View style={styles.photosGrid}>
              {photoUris.map((uri, index) => (
                <View key={index} style={styles.photoPreview}>
                  <Image source={{ uri }} style={styles.photoPreviewImage} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => setPhotoUris(photoUris.filter((_, i) => i !== index))}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {photoUris.length < 5 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                  <Text style={styles.addPhotoText}>+</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setWriteModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Respond Modal */}
      <Modal
        visible={respondModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRespondModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Respond to Review</Text>

            <TextInput
              style={styles.textArea}
              placeholder="Write your response..."
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRespondModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRespondToReview}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
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
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  star: {
    marginHorizontal: 1,
  },
  reviewCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 5,
  },
  writeReviewButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  reviewCard: {
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
  reviewerInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  vendorResponse: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
    marginBottom: 12,
  },
  vendorResponseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 6,
  },
  vendorResponseText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  vendorResponseDate: {
    fontSize: 11,
    color: '#999',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  helpfulButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  helpfulText: {
    fontSize: 13,
    color: '#666',
  },
  respondButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  respondButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
    marginBottom: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ratingStar: {
    fontSize: 40,
    marginHorizontal: 5,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  photoPreview: {
    width: 70,
    height: 70,
    position: 'relative',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhoto: {
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
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 30,
    color: '#999',
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
  submitButton: {
    backgroundColor: '#667eea',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EnhancedReviewsScreen;
