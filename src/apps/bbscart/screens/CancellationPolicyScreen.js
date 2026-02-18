import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CancellationPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
  <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 40 + insets.bottom }]}>
    <Text style={styles.title}>Cancellation Policy</Text>

    <Text style={styles.paragraph}>
      Orders can be cancelled before they are shipped. Once an item has been
      dispatched, cancellation is no longer possible. To cancel, please contact
      our support team at info@bbscart.com with your order details.
    </Text>

    <Text style={styles.paragraph}>
      If payment has already been captured, a full refund will be issued to the
      original payment method within 5–7 business days.
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

export default CancellationPolicyScreen;
