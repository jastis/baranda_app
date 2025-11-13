import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

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

// Shared Screens
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// History Screens
import RequestHistoryScreen from '../screens/RequestHistoryScreen';
import ServiceHistoryScreen from '../screens/ServiceHistoryScreen';

// Vendor Management
import VendorCategoriesScreen from '../screens/VendorCategoriesScreen';
import SearchRequestsScreen from '../screens/SearchRequestsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for Requesters
const RequesterTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
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
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
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
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.userType === 'vendor' ? (
        <VendorStack />
      ) : (
        <RequesterStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
