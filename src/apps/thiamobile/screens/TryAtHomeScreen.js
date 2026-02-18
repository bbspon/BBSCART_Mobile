import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const TryAtHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Try@Home</Text>
        <Text style={styles.subtitle}>Experience Luxury at Your Doorstep</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.description}>
          Book a personalized home visit with our jewellery experts. Try on exclusive pieces 
          in the comfort of your home before making a purchase decision.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🏠</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Home Visit</Text>
            <Text style={styles.featureText}>
              Our expert consultant visits your home at your convenience
            </Text>
          </View>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💎</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Exclusive Collection</Text>
            <Text style={styles.featureText}>
              Try on premium jewellery pieces from our exclusive collection
            </Text>
          </View>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>👨‍💼</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Expert Consultation</Text>
            <Text style={styles.featureText}>
              Get personalized styling advice from our jewellery experts
            </Text>
          </View>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>✨</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>VIP Experience</Text>
            <Text style={styles.featureText}>
              Enjoy a premium shopping experience in your own space
            </Text>
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Book your home visit appointment</Text>
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Our consultant arrives with curated pieces</Text>
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Try on jewellery and get expert advice</Text>
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>Make your purchase decision comfortably</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('StoreVisit')}
      >
        <Text style={styles.ctaText}>Book Your Home Visit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: 30,
    },
    description: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    featureCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 12,
      elevation: isDark ? 0 : 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
    },
    featureIcon: {
      fontSize: 32,
      marginRight: 15,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 5,
    },
    featureText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    stepCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 12,
      elevation: isDark ? 0 : 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
    },
    stepNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 30,
      marginRight: 15,
    },
    stepText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    ctaButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    ctaText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default TryAtHomeScreen;
