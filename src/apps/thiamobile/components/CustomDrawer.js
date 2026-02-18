import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomDrawer = ({ navigation, state }) => {
  const { colors, isDark } = useTheme();
  const [user, setUser] = useState({ name: '', email: '' });
  const [activeRoute, setActiveRoute] = useState('Home');

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('THIAWORLD_USER');
      if (userStr) {
        const cachedUser = JSON.parse(userStr);
        setUser({
          name: cachedUser.name || 'User',
          email: cachedUser.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  useEffect(() => {
    loadUser();
    // Get active route from parent navigator
    const parent = navigation.getParent();
    if (parent) {
      const parentState = parent.getState();
      if (parentState && parentState.routes) {
        const currentRoute = parentState.routes[parentState.index];
        if (currentRoute) {
          setActiveRoute(currentRoute.name);
        }
      }
    } else {
      // Fallback: use drawer's own state
      const currentRoute = state?.routes?.[state?.index];
      if (currentRoute) {
        setActiveRoute(currentRoute.name === 'HomeMain' ? 'Home' : currentRoute.name);
      }
    }
  }, [navigation, state]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('THIAWORLD_TOKEN');
            await AsyncStorage.removeItem('THIAWORLD_USER');
            // Navigate to parent stack navigator
            const parent = navigation.getParent();
            if (parent) {
              parent.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          },
        },
      ]
    );
  };

  const drawerItems = [
    { key: 'Home', label: 'Home', icon: 'home-outline', screen: 'Home' },
    { key: 'divider1', type: 'divider' },
    { key: 'Orders', label: 'My Orders', icon: 'bag-outline', screen: 'Orders' },
    { key: 'Cart', label: 'Cart', icon: 'cart-outline', screen: 'Cart' },
    { key: 'Wishlist', label: 'My Wishlist', icon: 'heart-outline', screen: 'Wishlist' },
    { key: 'Notifications', label: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
    { key: 'divider2', type: 'divider' },
    { key: 'Exchange', label: 'Gold Exchange / Buyback', icon: 'swap-horizontal-outline', screen: 'Exchange' },
    { key: 'StoreVisit', label: 'Book Store Visit', icon: 'storefront-outline', screen: 'StoreVisit' },
    { key: 'Ratings', label: 'Gold & Silver Rates', icon: 'trending-up-outline', screen: 'Ratings' },
    { key: 'divider3', type: 'divider' },
    { key: 'MyWallet', label: 'My Gold Wallet', icon: 'wallet-outline', screen: 'MyWallet' },
    { key: 'Payments', label: 'Saved Cards & UPI', icon: 'card-outline', screen: 'Payments' },
    { key: 'Rewards', label: 'Exclusive Rewards', icon: 'gift-outline', screen: 'Rewards' },
    { key: 'GoldPlan', label: 'Gold Plan', icon: 'diamond-outline', screen: 'GoldPlan' },
    { key: 'TryAtHome', label: 'Try@Home', icon: 'home-outline', screen: 'TryAtHome' },
    { key: 'divider4', type: 'divider' },
    { key: 'Account', label: 'Account', icon: 'person-outline', screen: 'Account' },
    { key: 'ProfileSettings', label: 'Profile Settings', icon: 'settings-outline', screen: 'ProfileSettings' },
    { key: 'Addresses', label: 'Saved Addresses', icon: 'location-outline', screen: 'Addresses' },
    { key: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', screen: 'Dashboard' },
    { key: 'divider5', type: 'divider' },
    { key: 'AboutUs', label: 'About Us', icon: 'information-circle-outline', screen: 'AboutUs' },
    { key: 'ContactUs', label: 'Contact Us', icon: 'mail-outline', screen: 'ContactUs' },
    { key: 'TermsAndConditions', label: 'Terms & Conditions', icon: 'document-text-outline', screen: 'TermsAndConditions' },
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.card,
      marginRight: 15,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: '#fff',
      opacity: 0.9,
    },
    drawerContent: {
      flex: 1,
      paddingTop: 10,
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: 'transparent',
    },
    drawerItemActive: {
      backgroundColor: colors.primary + '20',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    drawerIcon: {
      marginRight: 15,
      width: 24,
      textAlign: 'center',
    },
    drawerLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    drawerLabelActive: {
      fontWeight: '600',
      color: colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
      marginHorizontal: 20,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: '#ff4444',
      borderRadius: 8,
    },
    logoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 10,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header with User Profile */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.profileSection}>
          <View style={dynamicStyles.avatar}>
            <Icon name="person" size={30} color={colors.primary} style={{ alignSelf: 'center', marginTop: 15 }} />
          </View>
          <View style={dynamicStyles.userInfo}>
            <Text style={dynamicStyles.userName}>{user.name}</Text>
            <Text style={dynamicStyles.userEmail} numberOfLines={1}>
              {user.email || 'user@thiaworld.com'}
            </Text>
          </View>
        </View>
      </View>

      {/* Drawer Items */}
      <ScrollView style={dynamicStyles.drawerContent} showsVerticalScrollIndicator={false}>
        {drawerItems.map((item) => {
          if (item.type === 'divider') {
            return <View key={item.key} style={dynamicStyles.divider} />;
          }

          // Check if this item's screen matches the active route
          const isActive = activeRoute === item.screen || (item.screen === 'Home' && activeRoute === 'HomeMain');

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                dynamicStyles.drawerItem,
                isActive && dynamicStyles.drawerItemActive,
              ]}
              onPress={() => {
                // Navigate to parent stack navigator
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate(item.screen);
                } else {
                  navigation.navigate(item.screen);
                }
                navigation.closeDrawer();
              }}
            >
              <Icon
                name={item.icon}
                size={24}
                color={isActive ? colors.primary : colors.text}
                style={dynamicStyles.drawerIcon}
              />
              <Text
                style={[
                  dynamicStyles.drawerLabel,
                  isActive && dynamicStyles.drawerLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer with Logout */}
      <View style={dynamicStyles.footer}>
        <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#fff" />
          <Text style={dynamicStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
