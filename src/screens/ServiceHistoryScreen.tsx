import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Response as VendorResponse, Request } from '../types';

interface ServiceHistoryScreenProps {
  navigation: any;
}

interface EnhancedResponse extends VendorResponse {
  requestTitle?: string;
  requestCategory?: string;
}

const ServiceHistoryScreen: React.FC<ServiceHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<EnhancedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'responses'),
      where('vendorId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const responsesData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const responseData = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
            createdAt: docSnapshot.data().createdAt?.toDate() || new Date()
          } as EnhancedResponse;

          // Fetch associated request
          try {
            const requestDoc = await getDoc(doc(db, 'requests', responseData.requestId));
            if (requestDoc.exists()) {
              const requestData = requestDoc.data() as Request;
              responseData.requestTitle = requestData.title;
              responseData.requestCategory = requestData.category;
            }
          } catch (error) {
            console.error('Error fetching request:', error);
          }

          return responseData;
        })
      );

      setResponses(responsesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getFilteredResponses = () => {
    if (filter === 'all') {
      return responses;
    }
    return responses.filter((response) => response.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return responses.length;
    return responses.filter((r) => r.status === status).length;
  };

  const renderResponse = ({ item }: { item: EnhancedResponse }) => (
    <TouchableOpacity style={styles.responseCard}>
      <View style={styles.responseHeader}>
        <View style={styles.responseInfo}>
          <Text style={styles.requestTitle}>{item.requestTitle || 'Request'}</Text>
          <Text style={styles.categoryText}>{item.requestCategory || 'Category'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.responseFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Your Price</Text>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {item.features && item.features.length > 0 && (
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresLabel}>Features:</Text>
          <Text style={styles.featuresText} numberOfLines={2}>
            {item.features.join(', ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterButton = ({ status, label }: { status: typeof filter; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === status && styles.filterButtonActive]}
      onPress={() => setFilter(status)}
    >
      <Text style={[styles.filterButtonText, filter === status && styles.filterButtonTextActive]}>
        {label}
      </Text>
      <View style={[styles.countBadge, filter === status && styles.countBadgeActive]}>
        <Text style={[styles.countText, filter === status && styles.countTextActive]}>
          {getStatusCount(status)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const filteredResponses = getFilteredResponses();

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FilterButton status="all" label="All" />
        <FilterButton status="pending" label="Pending" />
        <FilterButton status="accepted" label="Accepted" />
        <FilterButton status="rejected" label="Rejected" />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{responses.length}</Text>
          <Text style={styles.statLabel}>Total Responses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>
            {getStatusCount('accepted')}
          </Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>
            {getStatusCount('pending')}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {filteredResponses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No responses found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all'
              ? 'Start responding to requests to build your history'
              : `No ${filter} responses`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredResponses}
          renderItem={renderResponse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  filterButtonActive: {
    backgroundColor: '#2563eb'
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 5
  },
  filterButtonTextActive: {
    color: '#fff'
  },
  countBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center'
  },
  countBadgeActive: {
    backgroundColor: '#fff'
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280'
  },
  countTextActive: {
    color: '#2563eb'
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280'
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
    alignItems: 'flex-start',
    marginBottom: 10
  },
  responseInfo: {
    flex: 1,
    marginRight: 10
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5
  },
  categoryText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600'
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  responseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981'
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  featuresContainer: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8
  },
  featuresLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5
  },
  featuresText: {
    fontSize: 12,
    color: '#6b7280'
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
  }
});

export default ServiceHistoryScreen;
