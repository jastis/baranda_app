import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { db } from '../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Favorite, User } from '../types';

const FavoritesScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<(Favorite & { vendor?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user!.id)
      );

      const snapshot = await getDocs(favoritesQuery);
      const favoritesData = await Promise.all(
        snapshot.docs.map(async (favDoc) => {
          const favData = {
            id: favDoc.id,
            ...favDoc.data(),
            createdAt: favDoc.data().createdAt?.toDate(),
          } as Favorite;

          // Load vendor details
          const vendorDoc = await getDoc(doc(db, 'users', favData.vendorId));
          const vendor = vendorDoc.exists() ? { id: vendorDoc.id, ...vendorDoc.data() } as User : undefined;

          return { ...favData, vendor };
        })
      );

      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = (favoriteId: string, vendorName: string) => {
    Alert.alert('Remove Favorite', `Remove ${vendorName} from favorites?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'favorites', favoriteId));
            Alert.alert('Success', 'Removed from favorites');
            loadFavorites();
          } catch (error) {
            Alert.alert('Error', 'Failed to remove favorite');
          }
        },
      },
    ]);
  };

  const renderFavorite = ({ item }: { item: Favorite & { vendor?: User } }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.vendorAvatar}>
        <Text style={styles.avatarText}>
          {item.vendorName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.vendorName}</Text>
        {item.vendor && (
          <>
            <Text style={styles.vendorRating}>
              ⭐ {item.vendor.rating?.toFixed(1) || '0.0'} ({item.vendor.reviewCount || 0} reviews)
            </Text>
            {item.vendor.businessDescription && (
              <Text style={styles.vendorDescription} numberOfLines={2}>
                {item.vendor.businessDescription}
              </Text>
            )}
          </>
        )}
        <Text style={styles.addedDate}>
          Added {item.createdAt?.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            // Navigate to vendor profile
            // navigation.navigate('VendorProfile', { vendorId: item.vendorId });
          }}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id, item.vendorName)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
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
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Add vendors to favorites to quickly find them later
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
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  vendorRating: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  vendorDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  addedDate: {
    fontSize: 11,
    color: '#ccc',
  },
  actions: {
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
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
    textAlign: 'center',
  },
});

export default FavoritesScreen;

/**
 * Helper function to add vendor to favorites
 * Use this in vendor profile or response screens
 */
export const addToFavorites = async (
  userId: string,
  vendorId: string,
  vendorName: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'favorites'), {
      userId,
      vendorId,
      vendorName,
      createdAt: Timestamp.now(),
    });
    Alert.alert('Success', 'Added to favorites');
  } catch (error) {
    Alert.alert('Error', 'Failed to add to favorites');
  }
};
