import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SAME backend base URL used across mobile
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const tiers = [
  {
    name: 'Basic',
    price: 'Free',
    features: ['AI Symptom Checker', 'Limited Consults', 'OPD Discounts'],
    consultLimit: 2,
    opdLimit: 1,
  },
  {
    name: 'Premium',
    price: '₹999/year',
    features: [
      'Unlimited AI Consults',
      '5 Doctor Consults',
      '3 OPD Visits',
      'Health Reports',
    ],
    consultLimit: 5,
    opdLimit: 3,
  },
  {
    name: 'Corporate',
    price: 'Custom',
    features: [
      'Everything in Premium',
      'Family Members Access',
      'Corporate Dashboard',
      'Dedicated Health Coach',
    ],
    consultLimit: 10,
    opdLimit: 5,
  },
];

export default function HealthMembershipPage() {
  const insets = useSafeAreaInsets();
  const [currentPlan, setCurrentPlan] = useState('Basic');
  const [usedConsults, setUsedConsults] = useState(0);
  const [usedOpd, setUsedOpd] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // ----------------------------------
  // FETCH MEMBERSHIP (API)
  // ----------------------------------
  const fetchMembership = async () => {
    try {
      const raw = await AsyncStorage.getItem('bbsUser');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/membership/my-membership`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data || {};

      setCurrentPlan(data.planType || 'Basic');
      setUsedConsults(data.consultsUsed || 0);
      setUsedOpd(data.opdUsed || 0);
    } catch (err) {
      console.error(
        '❌ Failed to fetch membership',
        err?.response?.data || err,
      );
      Alert.alert('Error', 'Failed to load membership details');
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

  // ----------------------------------
  // PLAN UPGRADE (API)
  // ----------------------------------
  const handleUpgrade = async planName => {
    try {
      const raw = await AsyncStorage.getItem('bbsUser');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      const res = await axios.put(
        `${API_BASE_URL}/membership/update`,
        { planType: planName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCurrentPlan(res.data.planType);
      setShowUpgrade(false);
    } catch (err) {
      console.error('❌ Upgrade failed', err?.response?.data || err);
      Alert.alert('Error', 'Plan upgrade failed');
    }
  };

  // ----------------------------------
  // AUTO RENEW TOGGLE (API)
  // ----------------------------------
  const handleAutoRenew = async () => {
    try {
      const raw = await AsyncStorage.getItem('bbsUser');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      const res = await axios.put(
        `${API_BASE_URL}/membership/toggle-renew`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert(
        'Auto Renew',
        `Auto-renew is now ${res.data.autoRenew ? 'enabled' : 'disabled'}`,
      );
    } catch (err) {
      console.error('❌ Auto renew toggle failed', err?.response?.data || err);
      Alert.alert('Error', 'Failed to update auto-renew');
    }
  };

  const currentTier = tiers.find(t => t.name === currentPlan);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>My Health Membership</Text>
      <Text style={styles.subHeader}>
        Track your benefits, upgrade plans, and access smart health care.
      </Text>

      {/* CURRENT PLAN */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>{currentPlan} Plan</Text>
          <Text style={styles.badge}>QR ID: BBSC-HEALTH-6721</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.sectionTitle}>Plan Usage</Text>

          <Text>
            Consultations Used: {usedConsults}/{currentTier.consultLimit}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(usedConsults / currentTier.consultLimit) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={{ marginTop: 8 }}>
            OPD Visits Used: {usedOpd}/{currentTier.opdLimit}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: '#ffeeba' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(usedOpd / currentTier.opdLimit) * 100}%`,
                  backgroundColor: '#ff9800',
                },
              ]}
            />
          </View>

          <Text style={styles.sectionTitle}>Features</Text>
          {currentTier.features.map((f, idx) => (
            <Text key={idx} style={styles.featureItem}>
              ✔ {f}
            </Text>
          ))}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => setShowUpgrade(true)}
            >
              <Text style={styles.buttonText}>⬆ Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonOutlineDark}
              onPress={handleAutoRenew}
            >
              <Text style={styles.buttonText}>🔄 Auto Renew</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* COMPARE PLANS */}
      <Text style={styles.subHeader}>Compare All Plans</Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Plan</Text>
          {tiers.map(t => (
            <Text key={t.name} style={styles.tableCell}>
              {t.name}
            </Text>
          ))}
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Consults</Text>
          {tiers.map(t => (
            <Text key={t.name} style={styles.tableCell}>
              {t.consultLimit}
            </Text>
          ))}
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>OPD</Text>
          {tiers.map(t => (
            <Text key={t.name} style={styles.tableCell}>
              {t.opdLimit}
            </Text>
          ))}
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Price</Text>
          {tiers.map(t => (
            <Text key={t.name} style={styles.tableCell}>
              {t.price}
            </Text>
          ))}
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}></Text>
          {tiers.map(t => (
            <TouchableOpacity
              key={t.name}
              disabled={currentPlan === t.name}
              onPress={() => handleUpgrade(t.name)}
              style={[
                styles.selectButton,
                currentPlan === t.name && { backgroundColor: '#aaa' },
              ]}
            >
              <Text style={{ color: 'white' }}>
                {currentPlan === t.name ? 'Current' : 'Select'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SMART SUGGESTION */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Smart Suggestion</Text>
        <Text>
          You’ve used most of your consults. Upgrade to Premium for unlimited AI
          support.
        </Text>
        <TouchableOpacity
          style={styles.buttonDanger}
          onPress={() => setShowUpgrade(true)}
        >
          <Text style={{ color: 'white' }}>View Upgrade Options</Text>
        </TouchableOpacity>
      </View>

      {/* FUTURE FEATURE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎖 Future Feature: Badges</Text>
        <Text>
          Coming Soon: Earn badges like Wellness Champ & Diagnostic Hero.
        </Text>
        <Text style={styles.badgeInfo}>Gamification Beta</Text>
      </View>

      {/* UPGRADE MODAL */}
      <Modal visible={showUpgrade} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upgrade Your Plan</Text>

            <FlatList
              data={tiers.filter(t => t.name !== currentPlan)}
              keyExtractor={item => item.name}
              renderItem={({ item }) => (
                <View style={styles.modalCard}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.features.map((f, i) => (
                    <Text key={i} style={styles.featureItem}>
                      - {f}
                    </Text>
                  ))}
                  <TouchableOpacity
                    style={styles.buttonSuccess}
                    onPress={() => handleUpgrade(item.name)}
                  >
                    <Text style={{ color: 'white' }}>
                      Upgrade to {item.name} ({item.price})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.buttonOutline, { margin: 12 }]}
              onPress={() => setShowUpgrade(false)}
            >
              <Text style={{ color: '#333' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeader: { textAlign: 'center', color: '#666', marginBottom: 16 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderText: { fontWeight: 'bold', fontSize: 16 },
  badge: {
    backgroundColor: '#333',
    color: 'white',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeInfo: {
    backgroundColor: '#17a2b8',
    color: 'white',
    padding: 6,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  cardBody: { marginTop: 8 },
  cardTitle: { fontWeight: 'bold', marginBottom: 6 },
  sectionTitle: { fontWeight: 'bold', marginTop: 12 },
  featureItem: { marginVertical: 2 },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: { height: 10, backgroundColor: '#007bff' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 12,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonOutlineDark: {
    marginTop: 18,
    
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#007bff', fontWeight: 'bold' },
  table: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: { flex: 1, textAlign: 'center' },
  selectButton: {
    backgroundColor: '#28a745',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
