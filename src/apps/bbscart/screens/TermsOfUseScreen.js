// TermsOfUseScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TermsOfUseScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 24 + insets.bottom }]}>
      <Text style={styles.title}>Terms of Use</Text>

      <Text style={styles.paragraph}>
        Please read the following Terms of Use carefully before using our website
        (https://bbscart.com) or engaging in any transactions with Thiaworld
        Jewellery (a subsidiary of BBSOCEAN Online Shopping). By accessing or
        using our services, you agree to comply with these terms and conditions.
      </Text>

      <Section
        heading="Acceptance of Terms"
        text="By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use, as well as any additional terms and conditions, policies, or guidelines referenced herein. If you do not agree to these terms, please refrain from using our website and services."
      />

      <Section
        heading="Eligibility"
        text="Our website and services are intended for individuals who are at least 18 years old or the legal age of majority in their jurisdiction. By accessing or using our website, you represent and warrant that you meet the eligibility criteria and have the legal capacity to enter into these Terms of Use."
      />

      <Section
        heading="Use of the Website"
        text="You may use our website for personal and non-commercial purposes in compliance with these Terms of Use. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate, current, and complete information when creating an account and to update your information as necessary."
      />

      <Section
        heading="Intellectual Property"
        text="All content, materials, and designs on our website, including but not limited to text, graphics, logos, images, icons, videos, and software, are the property of Thiaworld Jewellery and are protected by intellectual property laws. You may not reproduce, modify, distribute, transmit, display, perform, or otherwise use any content from our website without our prior written consent."
      />

      <Section
        heading="Product Information"
        text="We strive to provide accurate and up-to-date product information on our website. However, we do not warrant or guarantee the accuracy, completeness, or reliability of any product descriptions, prices, or availability. The colors, sizes, and dimensions of the products may vary slightly from the images displayed on our website due to factors such as screen settings and manufacturing processes."
      />

      <Section
        heading="Ordering and Transactions"
        text="By placing an order through our website, you make an offer to purchase the selected products subject to these Terms of Use. We reserve the right to accept or reject your order at our discretion. If we are unable to fulfill your order, we will notify you and provide a refund if applicable. Prices, promotions, and discounts displayed on our website are subject to change without notice."
      />

      <Section
        heading="Payment"
        text="Payment for orders must be made using the provided payment methods. We take reasonable measures to ensure the security of your payment information, but we do not store or have access to your complete payment details."
      />

      <Section
        heading="Shipping and Delivery"
        text="We will make reasonable efforts to deliver your products within the estimated timeframe. However, delivery times may vary depending on factors beyond our control, such as shipping carrier delays or customs procedures. Risk of loss and title for the products pass to you upon our delivery to the shipping carrier. We are not responsible for any loss, damage, or delay during shipping."
      />

      <Section
        heading="Returns and Refunds"
        text="Our returns and refunds policy is outlined separately on our website. By purchasing from us, you agree to comply with the applicable policy."
      />

      <Section
        heading="Third-Party Links"
        text="Our website may contain links to third-party websites or resources. These links are provided for your convenience, but we do not endorse, control, or have any responsibility for the content or practices of third-party sites."
      />
    </ScrollView>
  );
};

// Reusable sub-component for headings & text
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

export default TermsOfUseScreen;
