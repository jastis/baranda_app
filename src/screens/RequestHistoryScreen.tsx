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
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Request } from '../types';

interface RequestHistoryScreenProps {
  navigation: any;
}

const RequestHistoryScreen: React.FC<RequestHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'accepted' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'requests'),
      where('requesterId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Request[];

      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getFilteredRequests = () => {
    if (filter === 'all') {
      return requests;
    }
    return requests.filter((request) => request.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return requests.length;
    return requests.filter((r) => r.status === status).length;
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.requestFooter}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {item.budget?.max && (
        <Text style={styles.budgetText}>
          Budget: ${item.budget.min || 0} - ${item.budget.max}
        </Text>
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

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FilterButton status="all" label="All" />
        <FilterButton status="open" label="Open" />
        <FilterButton status="accepted" label="Active" />
        <FilterButton status="completed" label="Done" />
      </View>

      {filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No requests found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all'
              ? 'Create your first request to get started'
              : `No ${filter} requests`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
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
    paddingHorizontal: 12,
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
  requestDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  categoryText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500'
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  budgetText: {
    fontSize: 12,
    color: '#10b981',
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
  }
});

export default RequestHistoryScreen;
