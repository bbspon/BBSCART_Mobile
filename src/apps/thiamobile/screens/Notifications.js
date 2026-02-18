import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Button,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialNotifications = [
  { id: '1', type: 'push', title: 'Order Shipped', message: 'Your gold necklace #12345 has been shipped with insurance.', read: false },
  { id: '2', type: 'email', title: 'Festive Offer', message: 'Get 20% off on making charges this Diwali!', read: false },
  { id: '3', type: 'email', title: 'Security Update', message: 'Your account password was changed successfully.', read: false },
  { id: '4', type: 'push', title: 'App Update', message: 'Explore our new jewellery collection in the app.', read: false },
  { id: '5', type: 'sms', title: 'Reminder', message: 'Visit our showroom for free gold purity check tomorrow.', read: false },
];

const NOTIFICATIONS_STORAGE_KEY = 'THIAWORLD_NOTIFICATIONS';
const NOTIFICATION_SETTINGS_KEY = 'THIAWORLD_NOTIFICATION_SETTINGS';

const Notifications = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ Load notifications and settings from storage on mount
  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  // ✅ Reload notifications when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
      loadSettings();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // ✅ Merge saved read status with initial notifications
        const merged = initialNotifications.map((item) => {
          const saved = parsed.find((s) => s.id === item.id);
          return saved ? { ...item, read: saved.read } : item;
        });
        setNotifications(merged);
      } else {
        // ✅ First time: save initial notifications
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
        setNotifications(initialNotifications);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
      setNotifications(initialNotifications);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setEmailNotifications(parsed.email ?? true);
        setPushNotifications(parsed.push ?? true);
        setSmsNotifications(parsed.sms ?? true);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveNotifications = async (updatedNotifications) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  };

  const toggleSwitch = async (type) => {
    let updated = {};
    if (type === 'email') {
      const newValue = !emailNotifications;
      setEmailNotifications(newValue);
      updated = { email: newValue };
    }
    if (type === 'push') {
      const newValue = !pushNotifications;
      setPushNotifications(newValue);
      updated = { push: newValue };
    }
    if (type === 'sms') {
      const newValue = !smsNotifications;
      setSmsNotifications(newValue);
      updated = { sms: newValue };
    }

    // ✅ Save settings immediately
    try {
      const currentSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      const parsed = currentSettings ? JSON.parse(currentSettings) : {};
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify({ ...parsed, ...updated })
      );
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify({
          email: emailNotifications,
          push: pushNotifications,
          sms: smsNotifications,
        })
      );
      showMessage({
        message: 'Success!',
        description: 'Notification settings saved successfully.',
        type: 'success',
        icon: 'success',
      });
      navigation.navigate('Home');
    } catch (error) {
      console.log('Error saving settings:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to save settings. Please try again.',
        type: 'danger',
        icon: 'danger',
      });
    }
  };

  const handleMarkAsRead = async (id) => {
    const updatedNotifications = notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );
    
    // ✅ Update state immediately
    setNotifications(updatedNotifications);
    
    // ✅ Save to AsyncStorage
    await saveNotifications(updatedNotifications);
    
    showMessage({
      message: 'Notification Read',
      description: 'You have marked this notification as read.',
      type: 'info',
      icon: 'info',
    });
  };

  const filteredNotifications = notifications.filter((item) => {
    if (item.type === 'email' && emailNotifications) return true;
    if (item.type === 'push' && pushNotifications) return true;
    if (item.type === 'sms' && smsNotifications) return true;
    return false;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Notifications</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        style={styles.notificationList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.notificationItem,
              item.read && { backgroundColor: '#f2e8d5', opacity: 0.7 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.notificationTitle, item.read && { opacity: 0.6 }]}>
                {item.title}
              </Text>
              <Text style={[styles.notificationMessage, item.read && { opacity: 0.6 }]}>
                {item.message}
              </Text>
            </View>
            {!item.read && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={() => handleMarkAsRead(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.markReadText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
            {item.read && (
              <View style={styles.readBadge}>
                <Text style={styles.readBadgeText}>Read</Text>
              </View>
            )}
          </View>
        )}
      />

      <Text style={[styles.heading, { marginTop: 20 }]}>
        Notification Settings
      </Text>
      <ScrollView contentContainerStyle={[styles.settingsContainer, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={() => toggleSwitch('email')}
            trackColor={{ false: '#ccc', true: '#e0c068' }}
            thumbColor={emailNotifications ? '#B8860B' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={() => toggleSwitch('push')}
            trackColor={{ false: '#ccc', true: '#e0c068' }}
            thumbColor={pushNotifications ? '#B8860B' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>SMS Notifications</Text>
          <Switch
            value={smsNotifications}
            onValueChange={() => toggleSwitch('sms')}
            trackColor={{ false: '#ccc', true: '#e0c068' }}
            thumbColor={smsNotifications ? '#B8860B' : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#faf8f3',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A2C2A',
    marginBottom: 10,
  },
  notificationList: {
    maxHeight: 450,
    marginBottom: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#B8860B',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4A2C2A',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  markReadButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  markReadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  settingsContainer: {
    flexGrow: 1,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
    shadowColor: '#B8860B',
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  settingTitle: {
    fontSize: 16,
    color: '#4A2C2A',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  readBadge: {
    backgroundColor: '#4caf50',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  readBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Notifications;
