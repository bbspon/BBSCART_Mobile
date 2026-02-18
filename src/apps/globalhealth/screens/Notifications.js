import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const NotificationsPage = () => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/notifications?role=hospital`,
      );

      const data = res.data?.data || res.data || [];
      setNotifications(data);
    } catch (err) {
      console.error('❌ Error loading notifications', err);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getBadgeStyle = category => {
    switch (category) {
      case 'Info':
        return styles.info;
      case 'Finance':
        return styles.success;
      case 'System':
        return styles.warning;
      case 'Health':
        return styles.primary;
      case 'Alert':
        return styles.danger;
      default:
        return styles.secondary;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.message}>{item.message}</Text>
      <View style={[styles.badge, getBadgeStyle(item.category)]}>
        <Text style={styles.badgeText}>{item.category}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Alerts & Notifications</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
        />
      )}
    </View>
  );
};

export default NotificationsPage;

/* ===== STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  info: { backgroundColor: '#0dcaf0' },
  success: { backgroundColor: '#198754' },
  warning: { backgroundColor: '#ffc107' },
  primary: { backgroundColor: '#0d6efd' },
  danger: { backgroundColor: '#dc3545' },
  secondary: { backgroundColor: '#6c757d' },
});
