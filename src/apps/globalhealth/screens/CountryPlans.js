import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import BuyPlanModal from '../components/HealthAccess/BuyPlanModal';

const CountryPlansScreen = ({ plan }) => {
  const insets = useSafeAreaInsets();
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("Chennai");
  const [plans, setPlans] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const countryOptions = ["India", "UAE"];
  const cityOptions = {
    India: ["Chennai", "Delhi", "Bengaluru"],
    UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
  };

  useEffect(() => {
    fetchPlansAndHospitals(country, city);
  }, [country, city]);

  const fetchPlansAndHospitals = async (selectedCountry, selectedCity) => {
    setLoading(true);
    try {
      const planRes = await axios.get(
        `https://healthcare.bbscart.com/api/region/plans?country=${selectedCountry}&city=${selectedCity}`,
      );
      const hospRes = await axios.get(
        `https://healthcare.bbscart.com/api/region/hospitals?country=${selectedCountry}&city=${selectedCity}`,
      );

      setPlans(planRes.data?.plans || planRes.data || []);
      setHospitals(hospRes.data?.hospitals || hospRes.data || []);
    } catch (err) {
      console.log("❌ Error loading region data", err.message);
      setPlans([]);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const OptionSelector = ({ options, value, onChange }) => (
    <View style={styles.optionRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.optionButton, value === opt && styles.optionSelected]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.heading}>🌍 BBSCART Health Plans</Text>

      <Text style={styles.label}>Select Country</Text>
      <OptionSelector options={countryOptions} value={country} onChange={setCountry} />

      <Text style={styles.label}>Select City</Text>
      <OptionSelector options={cityOptions[country]} value={city} onChange={setCity} />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <>
          <Text style={styles.subHeading}>📦 Plans in {city}</Text>

          <FlatList
            data={plans}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.price}>
                  💰 {country === "India" ? item.priceINR : item.priceAED}
                </Text>
                {item.features?.map((f, i) => (
                  <Text key={i} style={styles.feature}>
                    • {f}
                  </Text>
                ))}
                <BuyPlanModal
                  visible={showBuyModal}
                  plan={plan}
                  onDismiss={() => setShowBuyModal(false)}
                  onConfirm={() => {
                    setShowBuyModal(false);
                    navigation.navigate('MyPlans');
                  }}
                />

              </View>
            )}
          />

          <Text style={styles.subHeading}>🏥 Partner Hospitals</Text>

          <FlatList
            data={hospitals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text>📍 {item.city}</Text>
                <Text>🩺 {item.services?.join(", ")}</Text>
                <Text style={styles.tier}>{item.tier} Tier</Text>
              </View>
            )}
          />
        </>
      )}
    </ScrollView>
  );
};

export default CountryPlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginTop: 12,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  optionButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#e9ecef",
    marginRight: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#007bff",
  },
  optionText: {
    color: "#000",
  },
  optionTextSelected: {
    color: "#fff",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  price: {
    marginVertical: 6,
    fontWeight: "600",
  },
  feature: {
    fontSize: 13,
  },
  tier: {
    marginTop: 6,
    fontWeight: "600",
    color: "green",
  },
  buyBtn: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buyText: {
    color: "#fff",
    fontWeight: "600",
  },
});
