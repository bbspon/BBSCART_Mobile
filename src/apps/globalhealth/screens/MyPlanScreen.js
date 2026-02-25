import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SAME base URL used across mobile
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

export default function MyPlanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // FETCH MY PLAN (API)
  // -----------------------------
  const fetchMyPlan = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/user/my-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlan(res.data);
    } catch (err) {
      console.error('❌ Failed to load my plan', err?.response?.data || err);
      Alert.alert('Error', 'No active plan found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPlan();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading your plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text>No active health plan.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>🩺 My Health Plan</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{plan.planId?.name}</Text>

        <Text style={styles.badge}>
          {(plan.planId?.tier || 'N/A').toUpperCase()}
        </Text>

        <Text style={styles.row}>
          <Text style={styles.label}>Status:</Text> {plan.status}
        </Text>

        <Text style={styles.row}>
          <Text style={styles.label}>Price:</Text> ₹{plan.planId?.price?.INR}
        </Text>

        <Text style={styles.row}>
          <Text style={styles.label}>Valid Till:</Text>{' '}
          {new Date(plan.endDate).toLocaleDateString()}
        </Text>

        <Text style={styles.row}>
          <Text style={styles.label}>Transaction ID:</Text> {plan.transactionId}
        </Text>

        <Text style={styles.row}>
          <Text style={styles.label}>Add-ons:</Text>{' '}
          {plan.selectedAddons?.length
            ? plan.selectedAddons.join(', ')
            : 'None'}
        </Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('DigitalHealth')}
        >
          <Text style={styles.btnText}>View QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('PrescriptionLoop', { planId: plan._id })
          }
        >
          <Text style={styles.btnText}>View Prescriptions</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('HealthCoachDashboard', {
              userId: plan.userId,
            })
          }
        >
          <Text style={styles.btnText}>Health Coach Dashboard</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

// -----------------------------
// STYLES (CLEAN, SIMPLE, MOBILE)
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#17a2b8',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 6,
  },
  row: {
    marginTop: 6,
  },
  label: {
    fontWeight: 'bold',
  },
  actions: {
    gap: 10,
  },
  btn: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
