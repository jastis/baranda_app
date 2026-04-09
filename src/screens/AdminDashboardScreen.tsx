import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { AdminSettings, SubscriptionSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalRequesters: 0,
    activeRequests: 0,
    totalAds: 0,
    activePlans: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadAdminSettings(), loadSubscriptionSettings(), loadStats()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAdminSettings = async () => {
    const settingsDoc = await getDoc(doc(db, 'adminSettings', 'main'));
    if (settingsDoc.exists()) {
      setAdminSettings(settingsDoc.data() as AdminSettings);
    } else {
      // Create default settings
      const defaultSettings: AdminSettings = {
        id: 'main',
        adsEnabled: true,
        subscriptionEnabled: true,
        maintenanceMode: false,
        chatEnabled: true,
        reviewsEnabled: true,
        notificationsEnabled: true,
        updatedAt: Timestamp.now() as any,
        updatedBy: user!.id,
      };
      await setDoc(doc(db, 'adminSettings', 'main'), defaultSettings);
      setAdminSettings(defaultSettings);
    }
  };

  const loadSubscriptionSettings = async () => {
    const subDoc = await getDoc(doc(db, 'subscriptionSettings', 'main'));
    if (subDoc.exists()) {
      setSubscriptionSettings(subDoc.data() as SubscriptionSettings);
    } else {
      // Create default subscription settings
      const defaultSubSettings: SubscriptionSettings = {
        id: 'main',
        subscriptionEnabled: true,
        trialPeriodDays: 7,
        allowFreeAccess: false,
        gracePeriodDays: 3,
        paymentMethods: ['manual'],
        createdAt: Timestamp.now() as any,
        updatedAt: Timestamp.now() as any,
      };
      await setDoc(doc(db, 'subscriptionSettings', 'main'), defaultSubSettings);
      setSubscriptionSettings(defaultSubSettings);
    }
  };

  const loadStats = async () => {
    try {
      // Get users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());

      const vendors = users.filter(u => u.userType === 'vendor');
      const requesters = users.filter(u => u.userType === 'requester');

      // Get active requests
      const requestsSnapshot = await getDocs(
        query(collection(db, 'requests'))
      );
      const activeRequests = requestsSnapshot.docs.filter(
        doc => doc.data().status === 'open'
      ).length;

      // Get ads count
      const adsSnapshot = await getDocs(collection(db, 'advertisements'));

      // Get active subscription plans
      const plansSnapshot = await getDocs(collection(db, 'subscriptionPlans'));
      const activePlans = plansSnapshot.docs.filter(
        doc => doc.data().isActive
      ).length;

      setStats({
        totalUsers: users.length,
        totalVendors: vendors.length,
        totalRequesters: requesters.length,
        activeRequests,
        totalAds: adsSnapshot.size,
        activePlans,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateAdminSettings = async (updates: Partial<AdminSettings>) => {
    try {
      const updatedSettings = {
        ...adminSettings,
        ...updates,
        updatedAt: Timestamp.now(),
        updatedBy: user!.id,
      };
      await setDoc(doc(db, 'adminSettings', 'main'), updatedSettings);
      setAdminSettings(updatedSettings as AdminSettings);
      Alert.alert('Success', 'Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const updateSubscriptionSettings = async (updates: Partial<SubscriptionSettings>) => {
    try {
      const updatedSettings = {
        ...subscriptionSettings,
        ...updates,
        updatedAt: Timestamp.now(),
      };
      await setDoc(doc(db, 'subscriptionSettings', 'main'), updatedSettings);
      setSubscriptionSettings(updatedSettings as SubscriptionSettings);
      Alert.alert('Success', 'Subscription settings updated successfully');
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      Alert.alert('Error', 'Failed to update subscription settings');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Admin Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.displayName}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalVendors}</Text>
          <Text style={styles.statLabel}>Vendors</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalRequesters}</Text>
          <Text style={styles.statLabel}>Requesters</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeRequests}</Text>
          <Text style={styles.statLabel}>Active Requests</Text>
        </View>
      </View>

      {/* Advertisement Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📢 Advertisement Controls</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Advertisements</Text>
          <Switch
            value={adminSettings?.adsEnabled}
            onValueChange={(value) => updateAdminSettings({ adsEnabled: value })}
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ManageAdvertisements')}
        >
          <Text style={styles.actionButtonText}>Manage Advertisements ({stats.totalAds})</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Subscription Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Subscription Controls</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Subscriptions</Text>
          <Switch
            value={subscriptionSettings?.subscriptionEnabled}
            onValueChange={(value) =>
              updateSubscriptionSettings({ subscriptionEnabled: value })
            }
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Allow Free Access</Text>
          <Switch
            value={subscriptionSettings?.allowFreeAccess}
            onValueChange={(value) =>
              updateSubscriptionSettings({ allowFreeAccess: value })
            }
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ManageSubscriptionPlans')}
        >
          <Text style={styles.actionButtonText}>Manage Plans ({stats.activePlans})</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SubscriptionTransactions')}
        >
          <Text style={styles.actionButtonText}>View Transactions</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {/* App Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ App Features</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Chat</Text>
          <Switch
            value={adminSettings?.chatEnabled}
            onValueChange={(value) => updateAdminSettings({ chatEnabled: value })}
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Reviews</Text>
          <Switch
            value={adminSettings?.reviewsEnabled}
            onValueChange={(value) => updateAdminSettings({ reviewsEnabled: value })}
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={adminSettings?.notificationsEnabled}
            onValueChange={(value) => updateAdminSettings({ notificationsEnabled: value })}
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Maintenance Mode</Text>
          <Switch
            value={adminSettings?.maintenanceMode}
            onValueChange={(value) => {
              if (value) {
                Alert.alert(
                  'Maintenance Mode',
                  'This will prevent all users from using the app. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Enable', onPress: () => updateAdminSettings({ maintenanceMode: value }) },
                  ]
                );
              } else {
                updateAdminSettings({ maintenanceMode: value });
              }
            }}
            trackColor={{ false: '#ccc', true: '#ff4444' }}
          />
        </View>
      </View>

      {/* User Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 User Management</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <Text style={styles.actionButtonText}>Manage All Users</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PendingVerifications')}
        >
          <Text style={styles.actionButtonText}>Vendor Verifications</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Reports & Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Reports & Analytics</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Text style={styles.actionButtonText}>View Analytics</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SystemLogs')}
        >
          <Text style={styles.actionButtonText}>System Logs</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
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
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionButtonIcon: {
    fontSize: 20,
    color: '#667eea',
  },
});

export default AdminDashboardScreen;
