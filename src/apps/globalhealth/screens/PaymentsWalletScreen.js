import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const PaymentsWalletPage = () => {
  const insets = useSafeAreaInsets();
  const [walletBalance, setWalletBalance] = useState(0);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('basic');
  const [offersOpen, setOffersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // FETCH WALLET BALANCE
  // -----------------------------
  const fetchWalletBalance = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const token = JSON.parse(raw)?.token;

      const res = await axios.get(`${API_BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWalletBalance(res.data.balance || 0);
    } catch (err) {
      console.error('❌ Wallet load failed', err?.response?.data || err);
      Alert.alert('Error', 'Failed to load wallet balance');
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const getPlanPrice = () => {
    switch (paymentPlan) {
      case 'basic':
        return 499;
      case 'premium':
        return 999;
      case 'govt':
        return 0;
      default:
        return 0;
    }
  };

  // -----------------------------
  // WALLET TOP-UP
  // -----------------------------
  const handleTopUp = async () => {
    const amt = parseInt(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const token = JSON.parse(raw)?.token;

      await axios.post(
        `${API_BASE_URL}/wallet/topup`,
        {
          amount: amt,
          method: "wallet", // REQUIRED
          referenceId: `MOBILE_WALLET_${Date.now()}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('✅ Success', 'Wallet topped up successfully');
      setTopupAmount('');
      setShowTopUpModal(false);
      fetchWalletBalance();
    } catch (err) {
      console.error('❌ Topup failed', err?.response?.data || err);
      Alert.alert('Error', 'Wallet top-up failed');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // PLAN PAYMENT (WALLET / RAZORPAY)
  // -----------------------------
  const handlePlanPayment = async () => {
    const amount = getPlanPrice();
    if (amount > walletBalance) {
      Alert.alert('Insufficient Balance', 'Please top-up your wallet first');
      return;
    }

    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const token = JSON.parse(raw)?.token;

      const initiateRes = await axios.post(
        `${API_BASE_URL}/plan/pay/initiate`,
        {
          planId: paymentPlan,
          amount,
          method: 'wallet',
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { txnId } = initiateRes.data;

      await axios.post(
        `${API_BASE_URL}/plan/pay/confirm`,
        {
          txnId,
          paymentRef: 'MOBILE_WALLET_' + Date.now(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert('✅ Success', 'Plan activated successfully');
      fetchWalletBalance();
    } catch (err) {
      console.error('❌ Payment failed', err?.response?.data || err);
      Alert.alert('Error', 'Plan payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.heading}>💼 Payments & Wallet</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'green' }]}
          onPress={() => setShowTopUpModal(true)}
        >
          <Text style={styles.buttonText}>Top-up Wallet</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wallet Balance</Text>
        <Text style={styles.balance}>₹{walletBalance}</Text>
        <Text style={styles.smallText}>
          Use for bookings, plans, and offers
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 Buy Health Plan</Text>
        <Picker
          selectedValue={paymentPlan}
          onValueChange={value => setPaymentPlan(value)}
          style={styles.picker}
        >
          <Picker.Item label="Basic Plan – ₹499" value="basic" />
          <Picker.Item label="Premium Plan – ₹999" value="premium" />
          <Picker.Item label="Govt Sponsored – ₹0" value="govt" />
        </Picker>

        <View style={styles.row}>
          <TextInput
            placeholder="Enter Coupon Code"
            style={styles.input}
            value={couponCode}
            onChangeText={setCouponCode}
          />
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: '#0d6efd', marginLeft: 8 },
            ]}
            onPress={() =>
              Alert.alert('Coupon Applied', `Applied: ${couponCode}`)
            }
          >
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#0d6efd', marginTop: 12 }]}
          onPress={handlePlanPayment}
        >
          <Text style={styles.buttonText}>Pay & Activate Plan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Referral Program</Text>
        <Text>
          Your Code: <Text style={{ fontWeight: 'bold' }}>BBSCART123</Text>
        </Text>

        <View style={styles.row}>
          <TextInput
            placeholder="Enter Referral Code"
            style={styles.input}
            value={referralCode}
            onChangeText={setReferralCode}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'green', marginLeft: 8 }]}
            onPress={() =>
              Alert.alert('Referral Applied', `Code: ${referralCode}`)
            }
          >
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.smallText}>
          Invite friends & earn wallet bonus.
        </Text>
      </View>

<TouchableOpacity
  style={styles.accordionHeader}
  onPress={() => setOffersOpen(!offersOpen)}
>
  <Text style={styles.cardTitle}>🎁 Available Offers</Text>
  <Text style={styles.arrow}>{offersOpen ? '▲' : '▼'}</Text>
</TouchableOpacity>

{offersOpen && (
  <View style={styles.offerContainer}>
    <View style={styles.offerItem}>
      <Text style={styles.offerIcon}>💸</Text>
      <Text style={styles.offerText}>
        ₹50 Cashback on ₹500 Top-up
      </Text>
    </View>

    <View style={styles.offerItem}>
      <Text style={styles.offerIcon}>🎁</Text>
      <Text style={styles.offerText}>
        10% off Premium Plan
      </Text>
    </View>

    <View style={styles.offerItem}>
      <Text style={styles.offerIcon}>🆓</Text>
      <Text style={styles.offerText}>
        Free Plan for Approved Users
      </Text>
    </View>
  </View>
)}


      <Modal
        transparent
        visible={showTopUpModal}
        animationType="slide"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Top-up Wallet</Text>
            <TextInput
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.input}
              value={topupAmount}
              onChangeText={setTopupAmount}
              placeholderTextColor="#888"  
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end',
               marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: '#6c757d', marginRight: 8 },
                ]}
                onPress={() => setShowTopUpModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#0d6efd' }]}
                onPress={handleTopUp}
              >
                <Text style={styles.buttonText}>Top-up Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// STYLES UNCHANGED
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 19 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 45,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  balance: { fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  smallText: { fontSize: 12, color: '#666', marginTop: 6 },
  input: {
    flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  padding: 15,
  color: '#000',               // ✅ text visible
  backgroundColor: '#fff',     // ✅ prevents blending
  fontSize: 14, minHeight:45,

  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  picker: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  button: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#f1f1f1',
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  accordionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 12,
  backgroundColor: '#fff',
  borderRadius: 8,
  marginBottom: 4,
},

arrow: {
  fontSize: 16,
},

offerContainer: {
  backgroundColor: '#fff',
  padding: 12,
  borderRadius: 8,
  marginBottom: 25,
},

offerItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},

offerIcon: {
  fontSize: 18,
  marginRight: 8,
},

offerText: {
  fontSize: 14,
  color: '#000',
},

});

export default PaymentsWalletPage;
