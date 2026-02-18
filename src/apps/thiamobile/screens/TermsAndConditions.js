// TermsAndConditionsPage.js

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TermsAndConditionsPage = () => {
  const insets = useSafeAreaInsets();
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: [
        'By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use, as well as any additional terms and conditions, policies, or guidelines referenced herein.',
        'If you do not agree to these terms, please refrain from using our website and services.'
      ],
    },
    {
      title: 'Eligibility',
      content: [
        'Our website and services are intended for individuals who are at least 18 years old or the legal age of majority in their jurisdiction.',
        'By accessing or using our website, you represent and warrant that you meet the eligibility criteria and have the legal capacity to enter into these Terms of Use.'
      ],
    },
    {
      title: 'Use of the Website',
      content: [
        'You may use our website for personal and non-commercial purposes in compliance with these Terms of Use.',
        'You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.',
        'You agree to provide accurate, current, and complete information when creating an account and to update your information as necessary.'
      ],
    },
    {
      title: 'Intellectual Property',
      content: [
        'All content, materials, and designs on our website, including text, graphics, logos, images, icons, videos, and software, are the property of ThiaWorld Jewellery and are protected by intellectual property laws.',
        'You may not reproduce, modify, distribute, transmit, display, perform, or otherwise use any content from our website without our prior written consent.'
      ],
    },
    {
      title: 'Product Information',
      content: [
        'We strive to provide accurate and up-to-date product information on our website. However, we do not warrant or guarantee the accuracy, completeness, or reliability of any product descriptions, prices, or availability.',
        'The colors, sizes, and dimensions of the products may vary slightly from the images displayed on our website due to factors such as screen settings and manufacturing processes.'
      ],
    },
    {
      title: 'Ordering and Transactions',
      content: [
        'By placing an order through our website, you make an offer to purchase the selected products subject to these Terms of Use.',
        'We reserve the right to accept or reject your order at our discretion. If we are unable to fulfill your order, we will notify you and provide a refund if applicable.',
        'Prices, promotions, and discounts displayed on our website are subject to change without notice.',
        'You are responsible for providing accurate and complete billing and shipping information. We are not liable for any delays or non-delivery resulting from inaccurate or incomplete information provided by you.'
      ],
    },
    {
      title: 'Payment',
      content: [
        'Payment for orders must be made using the provided payment methods.',
        'We take reasonable measures to ensure the security of your payment information, but we do not store or have access to your complete payment details.'
      ],
    },
    {
      title: 'Shipping and Delivery',
      content: [
        'We will make reasonable efforts to deliver your products within the estimated timeframe. However, delivery times may vary depending on factors beyond our control, such as shipping carrier delays or customs procedures.',
        'Risk of loss and title for the products pass to you upon our delivery to the shipping carrier. We are not responsible for any loss, damage, or delay during shipping.'
      ],
    },
    {
      title: 'Returns and Refunds',
      content: [
        'Our returns and refunds policy is outlined separately on our website. By purchasing from us, you agree to comply with the applicable policy.'
      ],
    },
    {
      title: 'Third-Party Links',
      content: [
        'Our website may contain links to third-party websites or resources. These links are provided for your convenience, but we do not endorse, control, or have any responsibility for them.'
      ],
    }
  ];

  return (
    <View style={styles.container}>


      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/thiaworldlogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.pageTitle}>Terms & Conditions</Text>

        {/* Sections */}
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((paragraph, pIdx) => (
              <Text key={pIdx} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>
        ))}

      </ScrollView>

      
    </View>
  );
};

export default TermsAndConditionsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10, // Reduced top padding
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5, // Reduced top margin
    marginBottom: 10, // Reduced bottom margin
    paddingHorizontal: 10, // Reduced horizontal padding
  },
  logo: {
    width: width * 0.5, // Reduced width from 0.6 to 0.5
    height: width * 0.4, // Set specific height instead of aspectRatio
    alignSelf: 'center', // Ensure center alignment
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8860B', // gold
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DAA520', // gold tone
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 8,
  },
});
