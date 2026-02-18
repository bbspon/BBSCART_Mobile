import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const AppSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [appVersion] = useState('1.0.0');

  const NOTIFICATIONS_KEY = 'THIAWORLD_APP_NOTIFICATIONS';
  const BIOMETRIC_KEY = 'THIAWORLD_BIOMETRIC';
  const AUTO_SYNC_KEY = 'THIAWORLD_AUTO_SYNC';

  // Load settings on focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const biometric = await AsyncStorage.getItem(BIOMETRIC_KEY);
      const sync = await AsyncStorage.getItem(AUTO_SYNC_KEY);

      if (notifications !== null) {
        setNotificationsEnabled(JSON.parse(notifications));
      }
      if (biometric !== null) {
        setBiometricEnabled(JSON.parse(biometric));
      }
      if (sync !== null) {
        setAutoSync(JSON.parse(sync));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    saveSetting(NOTIFICATIONS_KEY, value);
  };

  const handleBiometricToggle = (value) => {
    setBiometricEnabled(value);
    saveSetting(BIOMETRIC_KEY, value);
  };

  const handleAutoSyncToggle = (value) => {
    setAutoSync(value);
    saveSetting(AUTO_SYNC_KEY, value);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will not delete your account or orders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear cache (but keep important data like token, user, preferences)
              await AsyncStorage.multiRemove([
                // Add keys you want to clear here
                // Keep: THIAWORLD_TOKEN, THIAWORLD_USER, theme preferences
              ]);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all app settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setNotificationsEnabled(true);
              setBiometricEnabled(false);
              setAutoSync(true);
              await AsyncStorage.multiRemove([NOTIFICATIONS_KEY, BIOMETRIC_KEY, AUTO_SYNC_KEY]);
              Alert.alert('Success', 'Settings reset to default');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      backgroundColor: colors.card,
      marginTop: 15,
      marginHorizontal: 10,
      borderRadius: 8,
      paddingVertical: 10,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      opacity: 0.7,
      paddingHorizontal: 15,
      paddingBottom: 5,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingIcon: {
      marginRight: 15,
      width: 24,
    },
    settingContent: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    settingDescription: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.6,
      marginTop: 2,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionButtonLast: {
      borderBottomWidth: 0,
    },
    actionLabel: {
      fontSize: 16,
      color: '#ff4444',
      fontWeight: '500',
      marginLeft: 15,
    },
    aboutSection: {
      backgroundColor: colors.card,
      marginTop: 15,
      marginHorizontal: 10,
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
    },
    aboutText: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
      textAlign: 'center',
    },
    versionText: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.5,
      marginTop: 5,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
      >
        {/* Appearance Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>APPEARANCE</Text>
          <View style={[dynamicStyles.settingItem, dynamicStyles.settingItemLast]}>
            <Icon
              name={isDark ? 'moon' : 'sunny'}
              size={24}
              color={colors.primary}
              style={dynamicStyles.settingIcon}
            />
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Dark Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Switch between light and dark theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDark ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={dynamicStyles.settingItem}>
            <Icon
              name="notifications-outline"
              size={24}
              color={colors.primary}
              style={dynamicStyles.settingIcon}
            />
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Push Notifications</Text>
              <Text style={dynamicStyles.settingDescription}>
                Receive notifications about orders and offers
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>SECURITY</Text>
          <View style={[dynamicStyles.settingItem, dynamicStyles.settingItemLast]}>
            <Icon
              name="finger-print-outline"
              size={24}
              color={colors.primary}
              style={dynamicStyles.settingIcon}
            />
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Biometric Login</Text>
              <Text style={dynamicStyles.settingDescription}>
                Use fingerprint or face ID to login
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data & Sync Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>DATA & SYNC</Text>
          <View style={dynamicStyles.settingItem}>
            <Icon
              name="sync-outline"
              size={24}
              color={colors.primary}
              style={dynamicStyles.settingIcon}
            />
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Auto Sync</Text>
              <Text style={dynamicStyles.settingDescription}>
                Automatically sync data when online
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={autoSync ? '#fff' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity
            style={[dynamicStyles.actionButton, dynamicStyles.actionButtonLast]}
            onPress={handleClearCache}
          >
            <Icon
              name="trash-outline"
              size={24}
              color="#ff4444"
              style={dynamicStyles.settingIcon}
            />
            <Text style={dynamicStyles.actionLabel}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* General Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>GENERAL</Text>
          <TouchableOpacity
            style={[dynamicStyles.actionButton, dynamicStyles.actionButtonLast]}
            onPress={handleResetSettings}
          >
            <Icon
              name="refresh-outline"
              size={24}
              color="#ff4444"
              style={dynamicStyles.settingIcon}
            />
            <Text style={dynamicStyles.actionLabel}>Reset Settings</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={dynamicStyles.aboutSection}>
          <Text style={dynamicStyles.aboutText}>Thiaworld Jewellery</Text>
          <Text style={dynamicStyles.versionText}>Version {appVersion}</Text>
          <Text style={dynamicStyles.versionText}>© 2024 Thiaworld. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppSettingsScreen;
