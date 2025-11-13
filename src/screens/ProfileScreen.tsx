import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        displayName,
        phoneNumber: phoneNumber || undefined
      });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {user.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.reviewCount}>
              {user.reviewCount || 0} review{user.reviewCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>User Type</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeText}>
                {user.userType === 'vendor' ? 'Vendor' : 'Requester'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          {editing ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setEditing(false);
                    setDisplayName(user.displayName);
                    setPhoneNumber(user.phoneNumber || '');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user.displayName}</Text>
              </View>

              {user.phoneNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone</Text>
                  <Text style={styles.value}>{user.phoneNumber}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Account Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.userType === 'requester' ? 'Requests' : 'Responses'}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          {user.userType === 'vendor' && (
            <>
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('VendorCategories')}
              >
                <Text style={styles.quickAccessText}>📋 Manage Categories</Text>
                <Text style={styles.quickAccessArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('FeaturedItems')}
              >
                <Text style={styles.quickAccessText}>🌟 Featured Items</Text>
                <Text style={styles.quickAccessArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('ProductAlerts')}
          >
            <Text style={styles.quickAccessText}>
              🔔 {user.userType === 'requester' ? 'Product Alerts' : 'Service Alerts'}
            </Text>
            <Text style={styles.quickAccessArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() =>
              navigation.navigate(
                user.userType === 'requester' ? 'RequestHistory' : 'ServiceHistory'
              )
            }
          >
            <Text style={styles.quickAccessText}>
              📊 {user.userType === 'requester' ? 'Request History' : 'Service History'}
            </Text>
            <Text style={styles.quickAccessArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.quickAccessText}>⚙️ Settings</Text>
            <Text style={styles.quickAccessArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 20
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 18,
    color: '#f59e0b',
    fontWeight: '600',
    marginRight: 10
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280'
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  infoRow: {
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500'
  },
  userTypeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  userTypeText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 15
  },
  inputGroup: {
    marginBottom: 15
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editButton: {
    backgroundColor: '#2563eb',
    marginTop: 10
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 10
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#2563eb'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  statValue: {
    fontSize: 12,
    color: '#1f2937',
    marginBottom: 5,
    textAlign: 'center'
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  quickAccessSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20
  },
  quickAccessButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  quickAccessText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500'
  },
  quickAccessArrow: {
    fontSize: 24,
    color: '#d1d5db'
  },
  dangerZone: {
    marginTop: 20
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default ProfileScreen;
