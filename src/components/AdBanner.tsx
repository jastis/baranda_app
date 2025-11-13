import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Advertisement } from '../types';

const { width } = Dimensions.get('window');

interface AdBannerProps {
  placement?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement = 'general' }) => {
  const { user } = useAuth();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, [user]);

  const loadAd = async () => {
    // Check if user has ads disabled or is premium
    if (user?.adsDisabled || user?.isPremium) {
      setLoading(false);
      return;
    }

    try {
      // Get ad settings
      const settingsDoc = await getDocs(collection(db, 'adSettings'));
      if (settingsDoc.empty) {
        setLoading(false);
        return;
      }

      const settings = settingsDoc.docs[0].data();
      if (!settings.adsEnabled || !settings.manualAdsEnabled) {
        setLoading(false);
        return;
      }

      // Get active banner ads
      const q = query(
        collection(db, 'advertisements'),
        where('type', '==', 'banner'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setLoading(false);
        return;
      }

      // Filter by user type and expiration
      const now = new Date();
      const validAds = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Advertisement))
        .filter(ad => {
          const targetMatch = !ad.targetUserType ||
                            ad.targetUserType === 'all' ||
                            ad.targetUserType === user?.userType;
          const notExpired = !ad.expiresAt || new Date(ad.expiresAt) > now;
          return targetMatch && notExpired;
        });

      if (validAds.length > 0) {
        // Pick a random ad
        const selectedAd = validAds[Math.floor(Math.random() * validAds.length)];
        setAd(selectedAd);

        // Track impression
        await updateDoc(doc(db, 'advertisements', selectedAd.id), {
          impressions: increment(1)
        });
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async () => {
    if (!ad) return;

    // Track click
    try {
      await updateDoc(doc(db, 'advertisements', ad.id), {
        clicks: increment(1)
      });

      // Open link if provided
      if (ad.linkUrl) {
        await Linking.openURL(ad.linkUrl);
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  if (loading || !ad) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleAdClick} activeOpacity={0.8}>
      <View style={styles.adContent}>
        {ad.imageUrl ? (
          <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.textAd}>
            <Text style={styles.title}>{ad.title}</Text>
            <Text style={styles.description}>{ad.description}</Text>
          </View>
        )}
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Ad</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  adContent: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#f3f4f6'
  },
  textAd: {
    padding: 15,
    minHeight: 100,
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5
  },
  description: {
    fontSize: 14,
    color: '#6b7280'
  },
  adLabel: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  adLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600'
  }
});

export default AdBanner;
