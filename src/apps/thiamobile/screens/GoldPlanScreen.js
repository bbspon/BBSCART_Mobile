import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const GoldPlanScreen = ({ navigation }) => {
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
        <Text style={styles.title}>Gold Plan</Text>
        <Text style={styles.subtitle}>Secure Your Gold Investment</Text>
      </View>

      {/* Plan Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan Benefits</Text>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>✨ Gold Rate Lock</Text>
          <Text style={styles.benefitText}>
            Lock in today's gold rate and pay in installments
          </Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>💰 Flexible Payments</Text>
          <Text style={styles.benefitText}>
            Pay 40% now, balance anytime you're ready
          </Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>🔒 Secure Storage</Text>
          <Text style={styles.benefitText}>
            Your gold is safely stored until final purchase
          </Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>🎁 No Hidden Charges</Text>
          <Text style={styles.benefitText}>
            All-inclusive pricing with complete transparency
          </Text>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Choose your gold jewellery design</Text>
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Pay 40% to lock the price and design</Text>
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Pay remaining 60% whenever ready</Text>
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>Collect your jewellery from store</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('ThiaSecurePlan')}
      >
        <Text style={styles.ctaText}>Learn More About Thia Secure Plan</Text>
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    benefitCard: {
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
    benefitTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 5,
    },
    benefitText: {
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

export default GoldPlanScreen;
