import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ExchangePolicyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
  <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 40 + insets.bottom }]}>
    <Text style={styles.title}>Exchange Policy</Text>

    <Text style={styles.paragraph}>
      Products may be exchanged within 15 days of purchase provided they are in
      unused condition with original packaging, invoice, and certification.
    </Text>

    <Text style={styles.paragraph}>
      Exchange value is based on current market rates and subject to a quality
      check. Customized or engraved items may not be eligible.
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

export default ExchangePolicyScreen;
