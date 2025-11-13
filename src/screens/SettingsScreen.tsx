import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

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

  const SettingRow = ({
    title,
    subtitle,
    onPress,
    showArrow = true,
    showSwitch = false,
    switchValue,
    onSwitchChange
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !showSwitch}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {showSwitch && onSwitchChange && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.colors.border, true: '#93c5fd' }}
          thumbColor={switchValue ? theme.colors.primary : theme.colors.disabled}
        />
      )}
      {showArrow && !showSwitch && (
        <Text style={[styles.arrow, { color: theme.colors.border }]}>›</Text>
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{title}</Text>
  );

  const getThemeModeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto (System)';
    }
  };

  const handleThemePress = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme',
      [
        {
          text: 'Light',
          onPress: () => setThemeMode('light'),
        },
        {
          text: 'Dark',
          onPress: () => setThemeMode('dark'),
        },
        {
          text: 'Auto (System)',
          onPress: () => setThemeMode('auto'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SettingRow
            title="Theme"
            subtitle={getThemeModeLabel(themeMode)}
            onPress={handleThemePress}
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SettingRow
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => navigation.navigate('ProfileTab')}
          />
          {user?.userType === 'vendor' && (
            <SettingRow
              title="Vendor Categories"
              subtitle="Manage your service categories"
              onPress={() => navigation.navigate('VendorCategories')}
            />
          )}
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SettingRow
            title="Push Notifications"
            subtitle="Receive push notifications"
            showSwitch
            switchValue={pushNotifications}
            onSwitchChange={setPushNotifications}
            showArrow={false}
          />
          <SettingRow
            title="Email Notifications"
            subtitle="Receive email updates"
            showSwitch
            switchValue={emailNotifications}
            onSwitchChange={setEmailNotifications}
            showArrow={false}
          />
        </View>

        {/* Privacy Section */}
        <SectionHeader title="Privacy & Security" />
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SettingRow
            title="Location Services"
            subtitle="Allow app to access your location"
            showSwitch
            switchValue={locationServices}
            onSwitchChange={setLocationServices}
            showArrow={false}
          />
          <SettingRow
            title="Change Password"
            subtitle="Update your password"
            onPress={() => Alert.alert('Coming Soon', 'Password change feature coming soon')}
          />
        </View>

        {/* History Section */}
        <SectionHeader title="History" />
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          {user?.userType === 'requester' ? (
            <SettingRow
              title="Request History"
              subtitle="View all your past requests"
              onPress={() => navigation.navigate('RequestHistory')}
            />
          ) : (
            <SettingRow
              title="Service History"
              subtitle="View all your responses"
              onPress={() => navigation.navigate('ServiceHistory')}
            />
          )}
        </View>

        {/* Help & Support Section */}
        <SectionHeader title="Help & Support" />
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SettingRow
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => Alert.alert('Help Center', 'Visit our help center at help.aswani.com')}
          />
          <SettingRow
            title="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'View our terms at aswani.com/terms')}
          />
          <SettingRow
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'View our privacy policy at aswani.com/privacy')}
          />
          <SettingRow
            title="About Aswani"
            subtitle={`Version 1.0.0`}
            showArrow={false}
          />
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Aswani © 2024</Text>
          <Text style={[styles.footerSubtext, { color: theme.colors.placeholder }]}>Made with care for connecting people</Text>
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
  content: {
    padding: 20,
    paddingBottom: 40
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 5
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6'
  },
  settingContent: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 3
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6b7280'
  },
  arrow: {
    fontSize: 24,
    color: '#d1d5db',
    marginLeft: 10
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 15
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 5
  },
  footerSubtext: {
    fontSize: 12,
    color: '#d1d5db'
  }
});

export default SettingsScreen;
