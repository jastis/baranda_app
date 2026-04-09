import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Request } from '../types';
import { getCurrentLocation, calculateDistance } from '../utils/location';

interface SearchRequestsScreenProps {
  navigation: any;
}

const categories = [
  'All',
  'Electronics',
  'Home Services',
  'Food & Beverage',
  'Transportation',
  'Health & Wellness',
  'Education',
  'Professional Services',
  'Other'
];

const SearchRequestsScreen: React.FC<SearchRequestsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState('50');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadUserLocation();
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, selectedCategory, maxDistance, minBudget, maxBudget]);

  const loadUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'requests'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Request[];

      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.title.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((request) => request.category === selectedCategory);
    }

    // Filter by distance
    if (userLocation && maxDistance) {
      const maxDist = parseFloat(maxDistance);
      filtered = filtered.filter((request) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          request.location.latitude,
          request.location.longitude
        );
        return distance <= maxDist;
      });
    }

    // Filter by budget
    if (minBudget) {
      const min = parseFloat(minBudget);
      filtered = filtered.filter(
        (request) => !request.budget?.max || request.budget.max >= min
      );
    }

    if (maxBudget) {
      const max = parseFloat(maxBudget);
      filtered = filtered.filter(
        (request) => !request.budget?.min || request.budget.min <= max
      );
    }

    // Sort by distance if location available
    if (userLocation) {
      filtered.sort((a, b) => {
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

    setFilteredRequests(filtered);
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
            ${item.budget.min || 0} - ${item.budget.max}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Max Distance (km)</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="50"
              value={maxDistance}
              onChangeText={setMaxDistance}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Budget Range</Text>
            <View style={styles.budgetInputs}>
              <TextInput
                style={[styles.filterInput, styles.budgetInputSmall]}
                placeholder="Min"
                value={minBudget}
                onChangeText={setMinBudget}
                keyboardType="numeric"
              />
              <Text style={styles.budgetSeparator}>-</Text>
              <TextInput
                style={[styles.filterInput, styles.budgetInputSmall]}
                placeholder="Max"
                value={maxBudget}
                onChangeText={setMaxBudget}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity onPress={loadRequests}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search filters
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15
  },
  categoriesScroll: {
    marginBottom: 15
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10
  },
  categoryChipActive: {
    backgroundColor: '#2563eb'
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280'
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5
  },
  filterLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5
  },
  filterInput: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    fontSize: 14
  },
  budgetInputs: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  budgetInputSmall: {
    flex: 1
  },
  budgetSeparator: {
    marginHorizontal: 5,
    color: '#6b7280'
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500'
  },
  refreshText: {
    fontSize: 14,
    color: '#2563eb',
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
    alignItems: 'center'
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
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60
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

export default SearchRequestsScreen;
