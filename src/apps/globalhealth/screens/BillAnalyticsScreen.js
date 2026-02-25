import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Must be SAME as web VITE_API_URI

const BillAnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const [analytics, setAnalytics] = useState([
    { id: 1, title: 'Total Consultations', value: '0' },
    { id: 2, title: 'Total Reimbursements', value: '₹ 0' },
    { id: 3, title: 'Feedback Score', value: '0 ★' },
  ]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

const fetchAnalytics = async () => {
  try {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    const session = raw ? JSON.parse(raw) : null;
    const token = session?.token;

    if (!token) {
      Alert.alert('Auth Error', 'Please login again');
      return;
    }

    // ✅ HARDCODED HOSPITAL ID (same as web)
    const hospitalId = '64ffabc0123abc456789de01';

    const res = await axios.get(
      `${API_BASE_URL}/analytics/hospital?hospitalId=${hospitalId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = res.data;

    setAnalytics([
      {
        id: 1,
        title: 'Total Consultations',
        value: String(data.totalConsultations || 0),
      },
      {
        id: 2,
        title: 'Total Reimbursements',
        value: `₹ ${(data.totalReimbursements || 0).toLocaleString()}`,
      },
      {
        id: 3,
        title: 'Feedback Score',
        value: `${data.feedbackScore || 0} ★`,
      },
    ]);
  } catch (err) {
    console.error('❌ Failed to load analytics', err?.response?.data || err);
    Alert.alert('Error', 'Failed to load analytics data');
  }
};


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.heading}>📊 Hospital Analytics & Reports</Text>

      <View style={styles.grid}>
        {analytics.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
});

export default BillAnalyticsScreen;
