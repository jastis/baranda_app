import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Onboarding
import OnboardingScreen from '../screens/OnboardingScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Requester Screens
import HomeScreen from '../screens/HomeScreen';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';

// Vendor Screens
import VendorDashboardScreen from '../screens/VendorDashboardScreen';
import RespondToRequestScreen from '../screens/RespondToRequestScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ManageAdvertisementsScreen from '../screens/ManageAdvertisementsScreen';
import ManageSubscriptionPlansScreen from '../screens/ManageSubscriptionPlansScreen';

// Shared Screens
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HowItWorksScreen from '../screens/HowItWorksScreen';

// History Screens
import RequestHistoryScreen from '../screens/RequestHistoryScreen';
import ServiceHistoryScreen from '../screens/ServiceHistoryScreen';

// Vendor Management
import VendorCategoriesScreen from '../screens/VendorCategoriesScreen';
import SearchRequestsScreen from '../screens/SearchRequestsScreen';
import VendorSubscriptionScreen from '../screens/VendorSubscriptionScreen';

// New Features
import ProductAlertsScreen from '../screens/ProductAlertsScreen';
import FeaturedItemsScreen from '../screens/FeaturedItemsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import WalletScreen from '../screens/WalletScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ReportUserScreen from '../screens/ReportUserScreen';
import ReferralScreen from '../screens/ReferralScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import EnhancedReviewsScreen from '../screens/EnhancedReviewsScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import VendorAnalyticsScreen from '../screens/VendorAnalyticsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for Requesters
const RequesterTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          headerShown: true,
          headerTitle: 'My Requests'
        }}
      />
      <Tab.Screen
        name="ConversationsTab"
        component={ConversationsScreen}
        options={{
          tabBarLabel: 'Messages',
          headerShown: true,
          headerTitle: 'Messages'
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          headerShown: true,
          headerTitle: 'Notifications'
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: true,
          headerTitle: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

// Tab Navigator for Vendors
const VendorTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={VendorDashboardScreen}
        options={{
          tabBarLabel: 'Browse',
          headerShown: true,
          headerTitle: 'Available Requests'
        }}
      />
      <Tab.Screen
        name="ConversationsTab"
        component={ConversationsScreen}
        options={{
          tabBarLabel: 'Messages',
          headerShown: true,
          headerTitle: 'Messages'
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          headerShown: true,
          headerTitle: 'Notifications'
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: true,
          headerTitle: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

// Tab Navigator for Admin
const AdminTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          headerShown: true,
          headerTitle: 'Admin Dashboard'
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          headerShown: true,
          headerTitle: 'Notifications'
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: true,
          headerTitle: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

// Main Stack for Requesters
const RequesterStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={RequesterTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateRequest"
        component={CreateRequestScreen}
        options={{ title: 'Create Request' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen
        name="RequestHistory"
        component={RequestHistoryScreen}
        options={{ title: 'Request History' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ProductAlerts"
        component={ProductAlertsScreen}
        options={{ title: 'Product Alerts' }}
      />
      <Stack.Screen
        name="HowItWorks"
        component={HowItWorksScreen}
        options={{ title: 'How It Works' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{ title: 'Verification' }}
      />
      <Stack.Screen
        name="ReportUser"
        component={ReportUserScreen}
        options={{ title: 'Report User' }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ title: 'Earn Rewards' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorite Vendors' }}
      />
      <Stack.Screen
        name="Reviews"
        component={EnhancedReviewsScreen}
        options={{ title: 'Reviews' }}
      />
    </Stack.Navigator>
  );
};

// Main Stack for Vendors
const VendorStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={VendorTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RespondToRequest"
        component={RespondToRequestScreen}
        options={{ title: 'Respond to Request' }}
      />
      <Stack.Screen
        name="VendorCategories"
        component={VendorCategoriesScreen}
        options={{ title: 'Vendor Categories' }}
      />
      <Stack.Screen
        name="SearchRequests"
        component={SearchRequestsScreen}
        options={{ title: 'Search Requests' }}
      />
      <Stack.Screen
        name="ServiceHistory"
        component={ServiceHistoryScreen}
        options={{ title: 'Service History' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="FeaturedItems"
        component={FeaturedItemsScreen}
        options={{ title: 'Featured Items' }}
      />
      <Stack.Screen
        name="ProductAlerts"
        component={ProductAlertsScreen}
        options={{ title: 'Product Alerts' }}
      />
      <Stack.Screen
        name="VendorSubscription"
        component={VendorSubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
      <Stack.Screen
        name="HowItWorks"
        component={HowItWorksScreen}
        options={{ title: 'How It Works' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{ title: 'Verification' }}
      />
      <Stack.Screen
        name="ReportUser"
        component={ReportUserScreen}
        options={{ title: 'Report User' }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ title: 'Earn Rewards' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ title: 'Portfolio' }}
      />
      <Stack.Screen
        name="Analytics"
        component={VendorAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen
        name="Reviews"
        component={EnhancedReviewsScreen}
        options={{ title: 'Reviews' }}
      />
    </Stack.Navigator>
  );
};

// Main Stack for Admin
const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={AdminTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageAdvertisements"
        component={ManageAdvertisementsScreen}
        options={{ title: 'Manage Advertisements' }}
      />
      <Stack.Screen
        name="ManageSubscriptionPlans"
        component={ManageSubscriptionPlansScreen}
        options={{ title: 'Subscription Plans' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="HowItWorks"
        component={HowItWorksScreen}
        options={{ title: 'How It Works' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seen === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(true); // Default to true on error
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (loading || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Create custom navigation theme based on app theme
  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };

  // Show onboarding if user hasn't seen it and is not logged in
  if (!hasSeenOnboarding && !user) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!user ? (
        <AuthStack />
      ) : user.userType === 'admin' ? (
        <AdminStack />
      ) : user.userType === 'vendor' ? (
        <VendorStack />
      ) : (
        <RequesterStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
