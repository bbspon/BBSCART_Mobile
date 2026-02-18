import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RefundPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
  <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 40 + insets.bottom }]}>
    <Text style={styles.title}>Refund Policy</Text>

    <Text style={styles.paragraph}>
      Refunds are provided for eligible cancellations or returns in accordance
      with our return policy. Approved refunds are processed to the original
      payment method within 5–7 business days after inspection.
    </Text>

    <Text style={styles.paragraph}>
      Shipping charges are non-refundable unless the return is due to our error
      or a defective product.
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

export default RefundPolicyScreen;
