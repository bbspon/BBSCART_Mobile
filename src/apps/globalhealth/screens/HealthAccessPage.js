import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

// Android Emulator → http://10.0.2.2:5000
// Device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const HealthAccessPage = () => {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
 

  const getUserId = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    const session = raw ? JSON.parse(raw) : null;
    return session?.user?.id || null;
  };

  // Fetch plans (same as web)
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/health-plans/list`);
      setPlans(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load health plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Join plan (same as web)
  const handleJoin = async planTier => {
    try {
      const userId = await getUserId();

      if (!userId) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      await axios.post(`${API_BASE_URL}/health-plans/enroll`, {
        userId,
        selectedPlan: planTier,
      });

      Alert.alert('Success', `Successfully joined ${planTier} Plan`);
    } catch (err) {
      Alert.alert('Error', 'Failed to join plan');
    }
  };

  const renderPlan = ({ item }) => (
    <View style={[styles.card, { borderColor: item.color }]}>
      <View style={[styles.cardHeader, { backgroundColor: item.color }]}>
        <Text style={styles.cardHeaderText}>{item.tier} Plan</Text>
      </View>

      <View style={styles.cardBody}>
        {item.features.map((f, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkMark}>✔️</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: item.color }]}
          onPress={() => handleJoin(item.tier)}
        >
          <Text style={styles.joinButtonText}>Join Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 16 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>Choose Your Health-Care Access</Text>

      <Text style={styles.subHeading}>
        Your gateway to AI-powered care, partner hospitals, and smart health
        management.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={item => item.tier}
          renderItem={renderPlan}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      {/* Partner & AI Cards – UI unchanged */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { borderColor: '#007bff' }]}>
          <Text style={styles.infoTitle}>🏥 Partner Hospital Access</Text>
          <Text style={styles.infoText}>
            Find clinics, OPD slots & priority care through our verified
            partners.
          </Text>
          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: '#007bff' }]}
            onPress={() => navigation.navigate("HospitalPartner")}
          >
            <Text style={[styles.outlineButtonText, { color: '#007bff' }]}>
              Explore Hospitals
            </Text>
          </TouchableOpacity>

        </View>

        <View style={[styles.infoCard, { borderColor: '#28a745' }]}>
          <Text style={styles.infoTitle}>🤖 AI Symptom Checker</Text>
          <Text style={styles.infoText}>
            Describe your symptoms and let our AI guide you instantly.
          </Text>
          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: '#28a745' }]}
            onPress={() => navigation.navigate("AIDiseasePredictionRiskEngine")}
          >
            <Text style={[styles.outlineButtonText, { color: '#28a745' }]}>
              Try AI Check
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
};

export default HealthAccessPage;

// STYLES – UNCHANGED
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f4f8',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
  },
  cardHeaderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  cardBody: {
    padding: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkMark: { marginRight: 8 },
  featureText: { fontSize: 14 },
  joinButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  infoRow: {
    marginTop: 20,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
    color: '#495057',
  },
  outlineButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontWeight: '700',
  },
});
