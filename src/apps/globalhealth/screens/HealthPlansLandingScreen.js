import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import PlanCard from '../components/HealthAccess/PlanCard';
import BuyPlanModal from '../components/HealthAccess/BuyPlanModal';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

// 🔁 SAME backend base URL used across mobile app
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const HealthPlansLanding = () => {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleBuyClick = plan => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const handleConfirmPurchase = plan => {
    console.log('✅ Plan purchased:', plan);
    setModalVisible(false);
    // Purchase flow already handled in BuyPlanModal
  };

  // -----------------------------
  // FETCH PLANS (API INTEGRATION)
  // -----------------------------
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/plans`);
        setPlans(res.data || []);
      } catch (err) {
        console.error('❌ Failed to fetch plans', err?.response?.data || err);
        Alert.alert('Error', 'Failed to load health plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No health plans available.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Health Plans</Text>

        {/* Right-side buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.eligibilityButton}
            onPress={() => navigation.navigate('PlanEligibility')}
          >
            <Text style={styles.eligibilityText}>Plan Eligibility</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.countryButton}
            onPress={() => navigation.navigate('CountryPlans')}
          >
            <Text style={styles.countryText}>Country Plans</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={plans}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <PlanCard
            plan={{
              ...item,
              price:
                typeof item.price === 'object'
                  ? item.price.INR || item.price.USD || item.price.AED
                  : item.price,
            }}
            onBuyClick={() => handleBuyClick(item)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
      />

      {/* Buy Plan Modal (unchanged) */}
      <BuyPlanModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        plan={selectedPlan}
        onConfirm={handleConfirmPurchase}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8, // RN >= 0.71 (supported in your project)
  },
  eligibilityButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eligibilityText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  countryButton: {
    backgroundColor: '#198754', // green
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  countryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HealthPlansLanding;
