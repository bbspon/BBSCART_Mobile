// AboutUsScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThiaLogo from '../assets/thiaworldlogo.png'; // replace with actual logo

const AboutUsScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* Header / Logo */}
      <View style={styles.header}>
        <Image source={ThiaLogo} style={styles.logo} />
        <Text style={styles.title}>About ThiaWorld</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        ThiaWorld Jewellery is your trusted destination for exquisite gold and silver jewelry. 
        With years of expertise, we craft timeless pieces that celebrate elegance and purity.
      </Text>

      {/* Our Vision */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.sectionText}>
          To provide customers with high-quality, certified gold and silver jewelry that they can cherish for generations.
        </Text>
      </View>

      {/* Our Mission */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          To combine tradition with modern design, ensuring each piece is perfect in purity, design, and craftsmanship.
        </Text>
      </View>

      {/* Our Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <Text style={styles.sectionText}>
          • Certified 22K & 24K gold jewelry
        </Text>
        <Text style={styles.sectionText}>
          • Pure silver collection
        </Text>
        <Text style={styles.sectionText}>
          • Custom bridal & festive designs
        </Text>
        <Text style={styles.sectionText}>
          • Gold saving schemes & loyalty rewards
        </Text>
        <Text style={styles.sectionText}>
          • Purity testing & store support
        </Text>
      </View>

      {/* Our Stores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Store Network</Text>
        <Text style={styles.sectionText}>
          With multiple showrooms across India, ThiaWorld ensures you experience jewelry shopping with comfort and trust.
        </Text>
      </View>

      {/* Why Choose Us */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose ThiaWorld</Text>
        <Text style={styles.sectionText}>
          • Guaranteed purity and authenticity
        </Text>
        <Text style={styles.sectionText}>
          • Elegant designs for every occasion
        </Text>
        <Text style={styles.sectionText}>
          • Customer-first approach with expert guidance
        </Text>
        <Text style={styles.sectionText}>
          • Exclusive offers, gold saving schemes, and loyalty rewards
        </Text>
      </View>

      {/* Contact / Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Support</Text>
        <Text style={styles.sectionText}>
          Reach out to our jewelry experts for queries, custom orders, or assistance with your favorite pieces.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#B8860B', marginBottom: 15, textAlign: 'center' },
  description: { fontSize: 16, textAlign: 'center', color: '#444', marginBottom: 20 },
  section: { marginBottom: 20, backgroundColor: '#FAFAFA', padding: 15, borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  sectionText: { fontSize: 15, color: '#555', marginBottom: 4, lineHeight: 22 },
});

export default AboutUsScreen;
