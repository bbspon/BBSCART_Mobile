import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

// IMPORTANT: use real API base
// Android Emulator → http://10.0.2.2:5000
// Physical device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const PlanPaymentScreen = () => {
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('razorpay');
  const [txnId, setTxnId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // ---------------------------
  // INITIATE PAYMENT (same as web)
  // ---------------------------
  const handleInitiate = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = await getToken();

      if (!token) {
        setMessage('❌ Please login again.');
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/plan/pay/initiate`,
        { planId, amount, method },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTxnId(res.data.txnId);
      setMessage('✅ Payment initiated. Please confirm.');
    } catch (err) {
      setMessage(
        '❌ Failed to initiate payment: ' +
          (err?.response?.data?.message || 'Server error'),
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // CONFIRM PAYMENT (same as web)
  // ---------------------------
  const handleConfirm = async () => {
    if (!txnId) {
      setMessage('❌ No transaction to confirm.');
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        setMessage('❌ Please login again.');
        return;
      }

      // Mobile does not open Razorpay UI
      // So we simulate paymentRef
      const paymentRef = 'MOBILE_TXN_' + Date.now();

      await axios.post(
        `${API_BASE_URL}/plan/pay/confirm`,
        {
          txnId,
          paymentRef,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage('✅ Payment confirmed. Plan activated.');
    } catch (err) {
      setMessage('❌ Payment confirmation failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Plan Payment</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.label}>Plan ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Plan ID"
        value={planId}
        onChangeText={setPlanId}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={method} onValueChange={setMethod}>
          <Picker.Item label="Razorpay" value="razorpay" />
          <Picker.Item label="Wallet" value="wallet" />
          <Picker.Item label="UPI" value="upi" />
        </Picker>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleInitiate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Initiate Payment</Text>
          )}
        </TouchableOpacity>

        {txnId && (
          <TouchableOpacity style={styles.successBtn} onPress={handleConfirm}>
            <Text style={styles.btnText}>Confirm Payment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PlanPaymentScreen;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  message: {
    backgroundColor: '#e7f1ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: '#084298',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  primaryBtn: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  successBtn: {
    backgroundColor: '#198754',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
