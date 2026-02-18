import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AboutUs = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 20 + Math.max(12, insets.bottom) + 8 }]}>
      <View style={styles.section}>
        <Text style={styles.heading}>BBS Global Health Access</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.emphasis}>BBS Global Health Access</Text> is a next-gen healthcare platform
          designed to offer <Text style={styles.emphasis}>affordable, cashless health plans</Text> across{' '}
          <Text style={styles.bold}>India and the UAE</Text>. Unlike traditional insurance, our Basic, Prime,
          and Elite memberships are priced at just 50–60% of typical insurance premiums, making quality healthcare
          accessible without the burden of high upfront costs or reimbursement delays.
        </Text>
      </View>

      {/* Every Plan Includes */}
      <View style={styles.section}>
        <Text style={styles.subHeading}>Every plan includes:</Text>
        {[
          'Virtual consultation support with 24/7 AI-powered assistance',
          'Discounted OPD visits, including savings on doctor consultations, pharmacy bills, diagnostic labs, and scans',
          'Digital health cards, usable across partner hospitals',
          'Maternity and dental add-on modules',
          'Secure health record vaults',
          'Direct hospital payments — no reimbursement process required',
        ].map((item, index) => (
          <Text key={index} style={styles.listItem}>• {item}</Text>
        ))}
      </View>

      {/* What sets us apart */}
      <View style={styles.section}>
        <Text style={styles.subHeading}>What truly sets us apart:</Text>
        {[
          '🌍 We enable medical tourism from high-cost countries like the USA, UK, EU, Canada, and Australia by offering premium care in South India’s top hospitals',
          '💳 No reimbursement model',
          '🌎 Medical tourism enabled — patients from high-cost countries (USA, UK, Canada, etc.) can access premium hospitals in South India',
          '🧠 AI Assistants to guide users for bookings, health advice, and plan selection',
          '🏥 Geo-filtered pricing for different cities, hospitals, and countries',
          '💼 Partner tools with CRM and commission logic built-in',
        ].map((item, index) => (
          <Text key={index} style={styles.listItem}>• {item}</Text>
        ))}
      </View>

      {/* Closing */}
      <View style={styles.section}>
        <Text style={styles.paragraph}>
          Our mission is to make quality healthcare globally accessible and financially sustainable —
          whether you're in a metro city, a Tier-2 town, or abroad.
        </Text>
        <Text style={styles.closing}>It is a pioneering digital healthcare solution.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: '#333',
  },
  emphasis: {
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 'bold',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
    color: '#444',
  },
  closing: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#222',
  },
});

export default AboutUs;
