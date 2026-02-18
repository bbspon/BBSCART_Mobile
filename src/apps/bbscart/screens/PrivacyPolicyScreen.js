// PrivacyPolicyScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 24 + insets.bottom }]}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.paragraph}>
        This Privacy Policy explains how Thiaworld Jewellery (a subsidiary of
        BBSOCEAN Online Shopping) collects, uses, and protects your personal
        information when you use our website (https://bbscart.com) or any
        related services. By using our services, you agree to the practices
        described in this policy.
      </Text>

      <Section
        heading="Information We Collect"
        text="We may collect personal details such as your name, email address, phone number, shipping/billing addresses, and payment information when you create an account, make a purchase, or contact us. We also automatically collect technical data like IP address, browser type, and usage statistics to improve our services."
      />

      <Section
        heading="How We Use Your Information"
        text="Your data helps us process orders, provide customer support, send important updates, and personalize your shopping experience. We may also use your information for analytics, marketing communications (with your consent), and to improve our website functionality."
      />

      <Section
        heading="Sharing of Information"
        text="We do not sell your personal data. However, we may share it with trusted service providers (payment processors, shipping partners) who help operate our business. These providers are obligated to protect your data and use it only for agreed services."
      />

      <Section
        heading="Cookies and Tracking"
        text="Our website uses cookies and similar technologies to enhance your browsing experience, remember preferences, and analyze traffic. You can modify your browser settings to refuse cookies, but some site features may not function properly."
      />

      <Section
        heading="Data Security"
        text="We implement industry-standard security measures to protect your personal data. While we strive to safeguard your information, no method of transmission over the internet or electronic storage is completely secure."
      />

      <Section
        heading="Your Rights"
        text="You have the right to access, correct, or delete your personal data. You may also request that we limit or stop certain data processing activities, subject to applicable laws."
      />

      <Section
        heading="Third-Party Links"
        text="Our site may contain links to external websites. We are not responsible for the privacy practices or content of those third-party sites. We encourage you to read their privacy policies."
      />

      <Section
        heading="Policy Updates"
        text="We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes indicates acceptance of the updated policy."
      />

      <Section
        heading="Contact Us"
        text="If you have questions or concerns about this Privacy Policy or our data practices, please contact us at info@bbscart.com."
      />
    </ScrollView>
  );
};

const Section = ({ heading, text }) => (
  <View style={styles.section}>
    <Text style={styles.heading}>{heading}</Text>
    <Text style={styles.paragraph}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;
