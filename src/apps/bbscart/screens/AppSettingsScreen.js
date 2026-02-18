// AppSettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [appVersion] = useState('1.0.0'); // You can get this from package.json or app config

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem('app_notifications');
        const savedTheme = await AsyncStorage.getItem('app_theme');
        const savedLanguage = await AsyncStorage.getItem('app_language');

        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        if (savedTheme) {
          setTheme(savedTheme);
        }
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
      } catch (err) {
        console.log('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  // Save settings
  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (err) {
      console.log('Error saving settings:', err);
    }
  };

  const toggleNotification = async (type) => {
    const newNotifications = { ...notifications, [type]: !notifications[type] };
    setNotifications(newNotifications);
    await saveSettings('app_notifications', newNotifications);
  };

  const handleThemeChange = async (value) => {
    setTheme(value);
    await saveSettings('app_theme', value);
    Alert.alert('Theme Changed', 'Theme preference saved. Restart the app to see changes.');
  };

  const handleLanguageChange = async (value) => {
    setLanguage(value);
    await saveSettings('app_language', value);
    Alert.alert('Language Changed', 'Language preference saved. Restart the app to see changes.');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear cache-related items (keep auth_user, deliveryPincode, etc.)
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(
                (key) =>
                  !key.includes('auth_user') &&
                  !key.includes('deliveryPincode') &&
                  !key.includes('assignedStore') &&
                  !key.includes('app_') &&
                  !key.includes('hasLaunched')
              );
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleCheckUpdate = () => {
    Alert.alert(
      'Check for Updates',
      'You are using the latest version of the app.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About BBSCART',
      `Version: ${appVersion}\n\nBBSCART - Your trusted online shopping partner.\n\n© 2024 BBSCART. All rights reserved.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 20 + insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Settings</Text>
          <View style={styles.backButton} />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications.push}
              onValueChange={() => toggleNotification('push')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={notifications.push ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="email-outline" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={() => toggleNotification('email')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={notifications.email ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="message-text-outline" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>SMS Notifications</Text>
            </View>
            <Switch
              value={notifications.sms}
              onValueChange={() => toggleNotification('sms')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={notifications.sms ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="theme-light-dark" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>Theme</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={theme}
                onValueChange={handleThemeChange}
                style={styles.picker}
              >
                <Picker.Item label="Light" value="light" />
                <Picker.Item label="Dark" value="dark" />
                <Picker.Item label="System Default" value="system" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="translate" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>App Language</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={language}
                onValueChange={handleLanguageChange}
                style={styles.picker}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="Hindi" value="hi" />
                <Picker.Item label="Tamil" value="ta" />
                <Picker.Item label="Telugu" value="te" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="broom" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>Clear Cache</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleCheckUpdate}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="update" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>Check for Updates</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#4B5563" />
              <Text style={styles.settingLabel}>About BBSCART</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  pickerContainer: {
    width: 150,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
