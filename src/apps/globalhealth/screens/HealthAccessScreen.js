import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
   Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function HealthAccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  // 🔹 Tier → Color mapping (UI unchanged)
  const getTierColor = tier => {
    switch (tier) {
      case 'basic':
        return '#6c757d';
      case 'premium':
        return '#0d6efd';
      case 'elite':
        return '#343a40';
      default:
        return '#6c757d';
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        'https://healthcare.bbscart.com/api/plans',
      );

      const apiPlans = Array.isArray(response.data) ? response.data : [];

      const mappedPlans = apiPlans
        .filter(p => p.isActive)
        .map(p => ({
          tier: p.name,
          features: p.features || [],
          color: getTierColor(p.tier),
        }));

      setPlans(mappedPlans);
    } catch (error) {
      console.log('Plans API Error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading plans…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>BBS Global Health Access</Text>
      <Text style={styles.subText}>
        Smart, affordable and AI-powered care — anytime, anywhere.
      </Text>

      {plans.map((plan, index) => (
        <View key={index} style={[styles.card, { borderColor: plan.color }]}>
          <Text style={[styles.cardTitle, { color: plan.color }]}>
            {plan.tier}
          </Text>

          {plan.features.map((f, i) => (
            <Text key={i} style={styles.feature}>
              ✅ {f}
            </Text>
          ))}

   <TouchableOpacity
  style={[styles.button, { backgroundColor: plan.color }]}
  onPress={() => navigation.navigate('Health Plans')}
>
  <Text style={styles.buttonText}>Join Now</Text>
</TouchableOpacity>

        </View>
      ))}

      <View style={styles.servicesContainer}>
        <TouchableOpacity style={styles.serviceBox}>
          <Text style={styles.serviceIcon}>🏥</Text>
          <Text style={styles.serviceText}>Hospital Finder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceBox}>
          <Text style={styles.serviceIcon}>🤖</Text>
          <Text style={styles.serviceText}>AI Symptom Check</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feature: { fontSize: 14, marginVertical: 2 },
  button: {
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: { color: '#fff', textAlign: 'center' },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  serviceBox: { alignItems: 'center' },
  serviceIcon: { fontSize: 24 },
  serviceText: { marginTop: 5, color: '#333' },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
});
