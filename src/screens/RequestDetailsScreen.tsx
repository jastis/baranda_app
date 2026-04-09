import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Request, Response as VendorResponse } from '../types';

interface RequestDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      requestId: string;
    };
  };
}

const RequestDetailsScreen: React.FC<RequestDetailsScreenProps> = ({
  navigation,
  route
}) => {
  const { requestId } = route.params;
  const { user } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestRef = doc(db, 'requests', requestId);

    const unsubscribeRequest = onSnapshot(requestRef, (doc) => {
      if (doc.exists()) {
        setRequest({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        } as Request);
      }
    });

    const q = query(
      collection(db, 'responses'),
      where('requestId', '==', requestId)
    );

    const unsubscribeResponses = onSnapshot(q, (snapshot) => {
      const responsesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as VendorResponse[];

      responsesData.sort((a, b) => b.vendorRating - a.vendorRating);
      setResponses(responsesData);
      setLoading(false);
    });

    return () => {
      unsubscribeRequest();
      unsubscribeResponses();
    };
  }, [requestId]);

  const handleAcceptResponse = async (response: VendorResponse) => {
    Alert.alert(
      'Accept Response',
      `Accept response from ${response.vendorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'requests', requestId), {
                status: 'accepted',
                chosenVendorId: response.vendorId
              });

              await updateDoc(doc(db, 'responses', response.id), {
                status: 'accepted'
              });

              // Create conversation
              const vendorDoc = await getDoc(doc(db, 'users', response.vendorId));
              const vendorData = vendorDoc.data();

              await addDoc(collection(db, 'conversations'), {
                requestId,
                participants: [user?.id, response.vendorId],
                participantDetails: {
                  [user?.id || '']: {
                    name: user?.displayName,
                    profileImage: user?.profileImage,
                    userType: user?.userType
                  },
                  [response.vendorId]: {
                    name: response.vendorName,
                    profileImage: vendorData?.profileImage,
                    userType: 'vendor'
                  }
                },
                lastMessage: 'Conversation started',
                lastMessageTime: serverTimestamp(),
                unreadCount: {
                  [user?.id || '']: 0,
                  [response.vendorId]: 0
                }
              });

              Alert.alert('Success', 'Response accepted! You can now chat with the vendor.');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to accept response: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderResponse = ({ item }: { item: VendorResponse }) => (
    <View style={styles.responseCard}>
      <View style={styles.responseHeader}>
        <View>
          <Text style={styles.vendorName}>{item.vendorName}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.vendorRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.vendorReviewCount} reviews)</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </View>

      <Text style={styles.responseDescription}>{item.description}</Text>

      {item.features && item.features.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features:</Text>
          {item.features.map((feature, index) => (
            <Text key={index} style={styles.bulletPoint}>
              • {feature}
            </Text>
          ))}
        </View>
      )}

      {item.deliveryOptions && item.deliveryOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options:</Text>
          {item.deliveryOptions.map((option, index) => (
            <Text key={index} style={styles.bulletPoint}>
              • {option}
            </Text>
          ))}
        </View>
      )}

      {item.estimatedDeliveryTime && (
        <Text style={styles.deliveryTime}>
          Estimated delivery: {item.estimatedDeliveryTime}
        </Text>
      )}

      {request?.status === 'open' && item.status === 'pending' && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptResponse(item)}
        >
          <Text style={styles.acceptButtonText}>Accept Response</Text>
        </TouchableOpacity>
      )}

      {item.status === 'accepted' && (
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedText}>Accepted</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.centerContainer}>
        <Text>Request not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestTitle}>{request.title}</Text>
        <Text style={styles.requestDescription}>{request.description}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
            {request.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.responsesHeader}>
        <Text style={styles.responsesTitle}>
          Responses ({responses.length})
        </Text>
      </View>

      {responses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No responses yet</Text>
          <Text style={styles.emptySubtext}>
            Vendors will respond to your request soon
          </Text>
        </View>
      ) : (
        <FlatList
          data={responses}
          renderItem={renderResponse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return '#10b981';
    case 'accepted':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
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
  requestInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  requestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10
  },
  requestDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 5
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  responsesHeader: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  responsesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  listContainer: {
    padding: 15
  },
  responseCard: {
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
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  ratingText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600'
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5
  },
  priceContainer: {
    alignItems: 'flex-end'
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981'
  },
  responseDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  section: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5
  },
  bulletPoint: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 10,
    marginBottom: 3
  },
  deliveryTime: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 10,
    fontStyle: 'italic'
  },
  acceptButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  acceptedBadge: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15
  },
  acceptedText: {
    color: '#fff',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  }
});

export default RequestDetailsScreen;
