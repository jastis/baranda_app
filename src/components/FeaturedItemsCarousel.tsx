import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  Alert
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FeaturedItem } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface FeaturedItemsCarouselProps {
  category?: string;
}

const FeaturedItemsCarousel: React.FC<FeaturedItemsCarouselProps> = ({ category }) => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedItems();
  }, [category]);

  const loadFeaturedItems = async () => {
    try {
      let q = query(
        collection(db, 'featuredItems'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const now = new Date();

      let itemsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date()
        })) as FeaturedItem[];

      // Filter out expired items
      itemsData = itemsData.filter((item) => new Date(item.endDate) > now);

      // Filter by category if provided
      if (category && category !== 'All') {
        itemsData = itemsData.filter((item) => item.category === category);
      }

      // Shuffle and take first 5
      itemsData = itemsData.sort(() => Math.random() - 0.5).slice(0, 5);

      // Track impressions
      for (const item of itemsData) {
        await updateDoc(doc(db, 'featuredItems', item.id), {
          impressions: increment(1)
        });
      }

      setItems(itemsData);
    } catch (error) {
      console.error('Error loading featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: FeaturedItem) => {
    try {
      // Track click
      await updateDoc(doc(db, 'featuredItems', item.id), {
        clicks: increment(1)
      });

      // Show contact info or allow user to contact
      if (item.contactInfo) {
        Alert.alert(
          item.title,
          `${item.description}\n\nContact: ${item.contactInfo}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call/Text',
              onPress: () => {
                // Try to open dialer if it's a phone number
                const phoneRegex = /[\d\+\-\(\) ]+/;
                if (phoneRegex.test(item.contactInfo || '')) {
                  Linking.openURL(`tel:${item.contactInfo}`);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌟 Featured</Text>
        <Text style={styles.headerSubtitle}>Popular products & services</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 15}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => handleItemClick(item)}
            activeOpacity={0.9}
          >
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>

            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.itemDescription} numberOfLines={3}>
              {item.description}
            </Text>

            <View style={styles.footer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>

              {item.price && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>${item.price}</Text>
                </View>
              )}
            </View>

            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{item.vendorName}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {item.vendorRating.toFixed(1)}</Text>
              </View>
            </View>

            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap to view details</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280'
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 5
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#f59e0b'
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    paddingRight: 70
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  categoryText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981'
  },
  vendorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  vendorName: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    marginRight: 10
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600'
  },
  tapHint: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  tapHintText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic'
  }
});

export default FeaturedItemsCarousel;
