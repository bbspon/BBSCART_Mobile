import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Linking } from "react-native";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isMounted, setIsMounted] = React.useState(false);

  // Ensure component is fully mounted before rendering content
  React.useEffect(() => {
    // Small delay to ensure screen is fully mounted and navigation is ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Safe navigation handler
  const handleNavigate = React.useCallback((screenName) => {
    try {
      if (navigation && navigation.navigate) {
        navigation.navigate(screenName);
      }
    } catch (error) {
      console.warn(`Navigation error to ${screenName}:`, error);
    }
  }, [navigation]);

  if (!isMounted) {
    return <View style={styles.container} />; // Return empty view while mounting
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 26 + insets.bottom }]}
    >
      {/* Header */}
      <Text style={styles.header}>Business Partner</Text>
      <Text style={styles.subHeader}>Manage everything in one place</Text>

      {/* Franchise */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Franchise</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("FranchiseHead")}
        >
          <Text style={styles.emoji}>🏢</Text>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Franchise</Text>
            <Text style={styles.cardSubtitle}>Track all franchisees under your region</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleNavigate("Franchisee")}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Territory */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Territory</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("TerritoryHead")}
        >
          <Text style={styles.emoji}>🌍</Text>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Territory</Text>
            <Text style={styles.cardSubtitle}>Check sales & operations</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleNavigate("TerritoryHead")}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Agents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agents</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("Agent")}
        >
          <Text style={styles.emoji}>🧑‍💼</Text>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Agent Management</Text>
            <Text style={styles.cardSubtitle}>Monitor field activities</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleNavigate("AgentForm")}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Vendors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendors</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("Vendor")}
        >
          <Text style={styles.emoji}>📦</Text>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Vendor Network</Text>
            <Text style={styles.cardSubtitle}>Manage vendor partnerships</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleNavigate("VendorForm")}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Become a Vendor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Become a Vendor</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("BecomeAVendor")}
        >
          <Text style={styles.emoji}>🚀</Text>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Become a Vendor</Text>
            <Text style={styles.cardSubtitle}>Join our network of vendors</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleNavigate("CustomerBVendor")}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 26,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
    paddingLeft: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row", // side by side
    alignItems: "center",
  },
  emoji: {
    fontSize: 32,
    marginRight: 12, // spacing between emoji & text
  },
  textContainer: {
    flexShrink: 1, // allows wrapping text
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  applyButton: {
    backgroundColor: "#008080",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
