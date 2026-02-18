import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';

const initialNotifications = [
  { id: '1', type: 'push', title: 'Order Shipped', message: 'Your order #12345 has been shipped.', read: false },
  { id: '2', type: 'email', title: 'New Offer', message: 'Get 20% off on your next purchase!', read: false },
  { id: '3', type: 'email', title: 'Password Changed', message: 'Your account password was changed successfully.', read: false },
  { id: '4', type: 'push', title: 'App Update', message: 'A new version of the app is available.', read: false },
  { id: '5', type: 'sms', title: 'Reminder', message: 'Don’t forget your appointment tomorrow at 10 AM.', read: false },
];

const Notifications = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  const toggleSwitch = (type) => {
    if (type === 'email') setEmailNotifications(prev => !prev);
    if (type === 'push') setPushNotifications(prev => !prev);
    if (type === 'sms') setSmsNotifications(prev => !prev);
  };

  // Save Settings button
  const handleSaveSettings = () => {
    showMessage({
      message: "Success!",
      description: "Notification settings saved successfully.",
      type: "success",
      icon: "success",
    });
    navigation.navigate('Home');
  };

  // Mark individual notification as read
  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(item => item.id === id ? { ...item, read: true } : item)
    );
    showMessage({
      message: "Notification Read",
      description: "You have marked this notification as read.",
      type: "info",
      icon: "info",
    });
  };

  // Filter notifications based on switches
  const filteredNotifications = notifications.filter(item => {
    if (item.type === 'email' && emailNotifications) return true;
    if (item.type === 'push' && pushNotifications) return true;
    if (item.type === 'sms' && smsNotifications) return true;
    return false;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        style={styles.notificationList}
        renderItem={({ item }) => (
          <View style={[styles.notificationItem, item.read && { backgroundColor: '#e0e0e0' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
            </View>
            {!item.read && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={() => handleMarkAsRead(item.id)}
              >
                <Text style={styles.markReadText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Text style={[styles.heading, { marginTop: 20 }]}>Notification Settings</Text>
      <ScrollView contentContainerStyle={[styles.settingsContainer, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={() => toggleSwitch('email')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={emailNotifications ? '#009688' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={() => toggleSwitch('push')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={pushNotifications ? '#009688' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>SMS Notifications</Text>
          <Switch
            value={smsNotifications}
            onValueChange={() => toggleSwitch('sms')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={smsNotifications ? '#009688' : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      <Button title="Save Settings" onPress={handleSaveSettings} color="#007bff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationList: {
    maxHeight: 450,
    borderWidth: 1,
    borderRadius:12,
    padding:10,
    margin:10,
    borderColor: 'gray',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 10,
    elevation: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  markReadButton: {
    backgroundColor: '#009688',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  markReadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  settingsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  settingTitle: {
    fontSize: 18,
    color: '#333',
  },
});

export default Notifications;
