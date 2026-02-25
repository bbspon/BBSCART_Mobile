import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- helper functions (UNCHANGED) ---
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const toNum = v => (Number.isFinite(+v) ? +v : 0);

// SAME backend base URL
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const ProgressBar = ({ used = 0, total = 0, height = 20 }) => {
  const safeUsed = toNum(used);
  const safeTotal = toNum(total);
  const percent = safeTotal > 0 ? clamp((safeUsed / safeTotal) * 100) : 0;

  return (
    <View style={[styles.progressOuter, { height }]}>
      <View style={[styles.progressInner, { width: `${percent}%`, height }]} />
      <Text style={styles.progressLabel}>
        {safeUsed}/{safeTotal} ({Math.round(percent)}%)
      </Text>
    </View>
  );
};

const PlanUsageScreen = () => {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------
  // FETCH PLAN USAGE (API INTEGRATION)
  // ----------------------------------
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
        const session = raw ? JSON.parse(raw) : null;
        const token = session?.token;

        if (!token) {
          Alert.alert('Auth Error', 'Please login again');
          return;
        }

        const [usageRes, plansRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/user/plan-usage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/plans`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usageData = usageRes.data || [];
        const plansData = plansRes.data || [];

        // Merge usage with plan limits (same as web)
        const merged = usageData.map(u => {
          const planDetails = plansData.find(p => p._id === u.planId);

          return {
            _id: u._id,
            title: planDetails?.name || 'Unknown Plan',
            createdAt: u.createdAt,
            usage: {
              opdVisitsUsed: u.opdUsed || 0,
              labTestsUsed: u.labUsed || 0,
              videoConsultsUsed: u.videoConsultUsed || 0,
            },
            opdLimit: planDetails?.limits?.opd ?? planDetails?.opdLimit ?? 0,
            labLimit: planDetails?.limits?.lab ?? planDetails?.labLimit ?? 0,
            videoLimit:
              planDetails?.limits?.video ?? planDetails?.videoLimit ?? 0,
          };
        });

        setPlans(merged);
      } catch (err) {
        console.error(
          '❌ Failed to load plan usage',
          err?.response?.data || err,
        );
        Alert.alert('Error', 'Failed to load plan usage');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading plan usage…</Text>
      </SafeAreaView>
    );
  }

  if (!plans.length) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No plan usage data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 16 + Math.max(12, insets.bottom) + 8 }]}>
        {plans.map(plan => {
          const id = plan?._id ?? String(Math.random());
          const title = plan?.title ?? 'Unnamed Plan';
          const createdAt = plan?.createdAt ? new Date(plan.createdAt) : null;

          const usage = plan?.usage ?? {};
          const opdUsed = toNum(usage.opdVisitsUsed);
          const labUsed = toNum(usage.labTestsUsed);
          const vcUsed = toNum(usage.videoConsultsUsed);

          return (
            <View key={id} style={styles.card}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.label}>OPD Visits</Text>
              <ProgressBar used={opdUsed} total={plan.opdLimit} />

              <Text style={styles.label}>Lab Tests</Text>
              <ProgressBar used={labUsed} total={plan.labLimit} />

              <Text style={styles.label}>Video Consultations</Text>
              <ProgressBar used={vcUsed} total={plan.videoLimit} />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// -----------------------------
// STYLES (UNCHANGED)
// -----------------------------
const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#f7f7f8',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5ea',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  date: { marginTop: 4, marginBottom: 12, color: '#555' },
  label: { marginTop: 10, marginBottom: 6, color: '#222', fontWeight: '600' },
  progressOuter: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressInner: {
    backgroundColor: '#4caf50',
    borderRadius: 10,
  },
  progressLabel: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 12,
    color: '#111',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  muted: { color: '#666', textAlign: 'center', marginTop: 8 },
});

export default PlanUsageScreen;
