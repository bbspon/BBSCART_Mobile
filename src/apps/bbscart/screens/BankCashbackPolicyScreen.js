import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BankCashbackPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
  <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 40 + insets.bottom }]}>
    <Text style={styles.title}>Bank Cashback Policy</Text>

    <Text style={styles.paragraph}>
      Bank-partnered cashback offers are governed by the respective bank’s terms
      and conditions. Eligibility typically requires payment through specific
      cards or UPI methods and may have a minimum purchase value.
    </Text>

    <Text style={styles.paragraph}>
      Cashback is usually credited by the bank within the timeline stated in the
      offer. Please retain your payment receipt and refer to the bank’s official
      offer page for dispute resolution.
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

export default BankCashbackPolicyScreen;
