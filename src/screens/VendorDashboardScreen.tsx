import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Request } from '../types';
import { getCurrentLocation, calculateDistance } from '../utils/location';
import FeaturedItemsCarousel from '../components/FeaturedItemsCarousel';
import AdBanner from '../components/AdBanner';

interface VendorDashboardScreenProps {
  navigation: any;
}

const VendorDashboardScreen: React.FC<VendorDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadUserLocation();
    loadRequests();
  }, []);

  const loadUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
  };

  const loadRequests = () => {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Request[];

      // Filter out requests where vendor already responded
      const filteredRequests = await filterAlreadyResponded(requestsData);

      // Sort by distance if location is available
      if (userLocation) {
        filteredRequests.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.location.latitude,
            a.location.longitude
          );
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.location.latitude,
            b.location.longitude
          );
          return distanceA - distanceB;
        });
      }

      setRequests(filteredRequests);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  };

  const filterAlreadyResponded = async (requests: Request[]) => {
    const filtered = [];

    for (const request of requests) {
      const responsesQuery = query(
        collection(db, 'responses'),
        where('requestId', '==', request.id),
        where('vendorId', '==', user?.id)
      );

      const responsesSnapshot = await getDocs(responsesQuery);

      if (responsesSnapshot.empty) {
        filtered.push(request);
      }
    }

    return filtered;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserLocation();
  };

  const getDistance = (request: Request) => {
    if (!userLocation) return null;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      request.location.latitude,
      request.location.longitude
    );

    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('RespondToRequest', { request: item })}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        {getDistance(item) && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{getDistance(item)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.requestFooter}>
        <Text style={styles.categoryText}>{item.category}</Text>
        {item.budget?.max && (
          <Text style={styles.budgetText}>
            Budget: ${item.budget.min || 0} - ${item.budget.max}
          </Text>
        )}
      </View>
      <Text style={styles.locationText}>
        {item.location.address || 'Location provided'}
      </Text>
      <Text style={styles.dateText}>
        Posted {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Available Requests</Text>
          <Text style={styles.headerSubtitle}>
            {requests.length} request{requests.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('SearchRequests')}
        >
          <Text style={styles.searchButtonText}>🔍 Search</Text>
        </TouchableOpacity>
      </View>

      {requests.length === 0 ? (
        <>
          <FeaturedItemsCarousel />
          <AdBanner placement="vendor" />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new opportunities
            </Text>
          </View>
        </>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <>
              <FeaturedItemsCarousel />
              <AdBanner placement="vendor" />
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerLeft: {
    flex: 1
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5
  },
  searchButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  listContainer: {
    padding: 15
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 10
  },
  distanceBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  distanceText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600'
  },
  requestDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500'
  },
  budgetText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600'
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af'
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

export default VendorDashboardScreen;
