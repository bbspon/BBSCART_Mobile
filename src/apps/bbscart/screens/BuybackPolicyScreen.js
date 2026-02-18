import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BuybackPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
  <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 40 + insets.bottom }]}>
    <Text style={styles.title}>Buyback Policy</Text>

    <Text style={styles.paragraph}>
      Customers can sell back eligible jewellery to us at the prevailing market
      rate of gold on the date of buyback. Original invoice and product
      certification must be presented.
    </Text>

    <Text style={styles.paragraph}>
      Deductions for making charges or wear-and-tear may apply. Final valuation
      will be confirmed after product inspection.
    </Text>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  paragraph: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 16 },
});

export default BuybackPolicyScreen;
