import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const planData = [
  { feature: 'OPD Consultations / Mo', tiers: ['2', '4', '6', 'Unlimited'] },
  {
    feature: 'Follow-Up Visits (14 Days)',
    tiers: ['1', '2', '3', 'Unlimited'],
  },
  {
    feature: 'Diagnostics & Tests',
    tiers: [
      '1 Lab / Mo',
      '2 Labs + 1 Scan',
      '4 Labs + 2 Scans',
      'Unlimited (Fair Usage)',
    ],
  },
  { feature: 'Pharmacy Discount', tiers: ['5%', '7.5%', '10%', '15%'] },
  {
    feature: 'Dental Services / Year',
    tiers: [
      '1',
      '1 + Cleaning',
      '2 + Cleaning + X-Ray',
      '3 + Cleaning + Procedure',
    ],
  },
  {
    feature: 'Accidental Care Cap',
    tiers: ['₹5K / Visit', '₹10K', '₹15K', '₹25K'],
  },
  {
    feature: 'IPD Room Charges (Non-ICU)',
    tiers: ['❌', '20% Co-Pay', '50% (₹30K Max)', '75% (₹50K Max)'],
  },
  {
    feature: 'Ambulance Access',
    tiers: ['❌', '₹300 Discount', 'Free (in-city)', 'Free + Pan-city'],
  },
  {
    feature: 'Second Opinion (Online)',
    tiers: ['❌', '1 / Year', '2 / Year', 'Unlimited'],
  },
  {
    feature: 'Video Consultations',
    tiers: ['2 / Mo', '4 / Mo', 'Unlimited', 'Unlimited + Priority'],
  },
  { feature: 'Family Member Add-on', tiers: ['❌', 'Max 2', 'Max 4', 'Max 6'] },
  {
    feature: 'AI Health Report Interpreter',
    tiers: ['❌', '✅', '✅', '✅ + Archive'],
  },
  {
    feature: 'Nutritionist Consultation',
    tiers: ['❌', 'Add-on', '1 / Yr', '2 / Yr'],
  },
  {
    feature: 'Mental Health Teletherapy',
    tiers: ['❌', 'Add-on', '1 / Mo', '2 / Mo'],
  },
  { feature: 'Upgrade Option', tiers: ['✅', '✅', '✅', '❌'] },
];

const tiers = ['Basic', 'Plus', 'Premium', 'Super Premium'];
const badgeColors = ['#6c757d', '#0dcaf0', '#0d6efd', '#198754'];

const PlanComparison = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Plan Comparison</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('PlanComparisonEditor')}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Plans */}
      {tiers.map((tier, tierIndex) => (
        <View
          key={tier}
          style={[styles.card, { borderColor: badgeColors[tierIndex] }]}
        >
          <View
            style={[
              styles.cardHeader,
              { backgroundColor: badgeColors[tierIndex] },
            ]}
          >
            <Text style={styles.cardTitle}>{tier}</Text>
          </View>

          {planData.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.feature}>{item.feature}</Text>
              <Text style={styles.value}>{item.tiers[tierIndex]}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  feature: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
});

export default PlanComparison;
