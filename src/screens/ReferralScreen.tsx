import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Referral } from '../types';

const REFERRAL_REWARD = 500; // NGN 500 per successful referral

const ReferralScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalEarned: 0,
  });

  const referralCode = user?.referralCode || '';
  const referralLink = `https://aswani.app/join/${referralCode}`;

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('referrerId', '==', user!.id)
      );

      const snapshot = await getDocs(referralsQuery);
      const referralsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        rewardedAt: doc.data().rewardedAt?.toDate(),
      })) as Referral[];

      setReferrals(referralsData);

      // Calculate stats
      const completed = referralsData.filter(r => r.status === 'completed').length;
      const pending = referralsData.filter(r => r.status === 'pending').length;
      const totalEarned = referralsData
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + r.rewardAmount, 0);

      setStats({
        total: referralsData.length,
        completed,
        pending,
        totalEarned,
      });
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Aswani and get the best service providers! Use my referral code: ${referralCode}\n\n${referralLink}`,
        title: 'Join Aswani',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Earnings Card */}
      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        <Text style={styles.earningsAmount}>₦{stats.totalEarned.toLocaleString()}</Text>
        <Text style={styles.earningsHint}>
          Earn ₦{REFERRAL_REWARD} for each successful referral!
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Referral Code Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{referralCode}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.linkText} numberOfLines={1}>
            {referralLink}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>📤 Share with Friends</Text>
      </TouchableOpacity>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>
            Share your referral code or link with friends
          </Text>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>
            They sign up using your code
          </Text>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>
            They complete their first transaction
          </Text>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>
            You both receive ₦{REFERRAL_REWARD} in your wallet!
          </Text>
        </View>
      </View>

      {/* Referrals List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referrals</Text>

        {referrals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No referrals yet. Start sharing to earn!
            </Text>
          </View>
        ) : (
          referrals.map((referral) => (
            <View key={referral.id} style={styles.referralCard}>
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>
                  {referral.refereeName || 'Pending signup'}
                </Text>
                <Text style={styles.referralDate}>
                  {referral.createdAt?.toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.referralStatus}>
                <Text
                  style={[
                    styles.statusBadge,
                    referral.status === 'rewarded' && styles.statusRewarded,
                    referral.status === 'completed' && styles.statusCompleted,
                    referral.status === 'pending' && styles.statusPending,
                  ]}
                >
                  {referral.status === 'rewarded'
                    ? '✓ Rewarded'
                    : referral.status === 'completed'
                    ? '⏳ Completed'
                    : '🕐 Pending'}
                </Text>
                {referral.status === 'rewarded' && (
                  <Text style={styles.rewardAmount}>
                    +₦{referral.rewardAmount}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
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
  earningsCard: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  earningsHint: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  codeText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: 2,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  copyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#4caf50',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingTop: 4,
  },
  referralCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  referralDate: {
    fontSize: 12,
    color: '#999',
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusRewarded: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  statusCompleted: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ReferralScreen;
