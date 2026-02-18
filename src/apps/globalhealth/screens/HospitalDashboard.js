import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const HospitalDashboardHome = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const modules = [
    {
      title: 'Hospital Onboarding',
      route: 'Onboarding',
      icon: 'hospital-building',
      color: '#0d6efd',
      onPress: () => navigation.navigate('Onboarding'),
    },
    {
      title: 'Create Plan Tier',
      route: 'PlanTierPlan',
      icon: 'clipboard-plus',
      color: '#6610f2',
      onPress: () => navigation.navigate('PlanTierPlan'),
    },
    {
      title: 'Service Availability',
      route: 'ServiceAvailability',
      icon: 'clock-check',
      color: '#198754',
      onPress: () => navigation.navigate('ServiceAvailability'),
    },
    {
      title: 'Care Pass QR Scanner',
      route: 'CarePassScanner',
      icon: 'qrcode-scan',
      color: '#fd7e14',
      onPress: () => navigation.navigate('CarePassScanner'),
    },
    {
      title: 'Enter Billing',
      route: 'BillAnalyticsStack',
      icon: 'file-document-edit',
      color: '#dc3545',
      onPress: () => navigation.navigate('BillAnalyticsStack'),
    },
    {
      title: 'Support & Escalations',
      route: 'Support',
      icon: 'chart-bar',
      color: '#20c997',
      onPress: () => navigation.navigate('Support'),
    },
    {
      title: 'Hospital Partnerships Kit',
      route: 'HospitalPartnershipKit',
      icon: 'chart-bar',
      color: '#20c997',
      onPress: () => navigation.navigate('HospitalPartnershipKit'),
    },
    {
      title: 'ConsultRoom',
      route: 'ConsultRoom',
      icon: 'chart-bar',
      color: '#204dc9ff',
      onPress: () => navigation.navigate('ConsultRoom'),
    },
    {
      title: 'GrievanceResolutionSystem',
      route: 'GrievanceResolutionSystem',
      icon: 'chart-bar',
      color: '#204dc9ff',
      onPress: () => navigation.navigate('GrievanceResolutionSystem'),
    },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 40 + Math.max(12, insets.bottom) + 8 }]}>
      <Text style={styles.header}>🏥 Hospital Partner Dashboard</Text>

      {/* ✅ Logo Section */}
      <Image
        source={require("../assets/images/bbslogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ✅ Grid of Items */}
      <View style={styles.grid}>
        {modules.map((mod, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: mod.color }]}
            onPress={() => navigation.navigate(mod.route)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={mod.icon} size={40} color="#fff" />
            <Text style={styles.cardText}>{mod.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default HospitalDashboardHome;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 180,
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#212529",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    height: 120,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
