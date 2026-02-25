import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

// IMPORTANT: use correct backend base
// Android Emulator → http://10.0.2.2:5000
// Physical device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const AIDiseasePredictionRiskEngine = () => {
  const insets = useSafeAreaInsets();
  const [showExplain, setShowExplain] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const [form, setForm] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    smoking: false,
    alcohol: false,
    activityLevel: '',
    symptoms: '',
    existingConditions: '',
  });

  const [result, setResult] = useState(null);

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    console.log('Raw UNIFIED_AUTH:', raw);
    
    return raw ? JSON.parse(raw)?.token : null;
  };

  // -----------------------------
  // SUBMIT AI RISK PREDICTION
  // -----------------------------
  const handleSubmit = async () => {
    try {
      const token = await getToken();
    console.log("TOKEN BEING SENT →", token);

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const payload = {
        ...form,
        symptoms: form.symptoms
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        existingConditions: form.existingConditions
          .split(',')
          .map(c => c.trim())
          .filter(Boolean),
      };
    console.log("PAYLOAD →", payload);
      const res = await axios.post(`${API_BASE_URL}/ai-risk/predict`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });
    console.log("✅ API SUCCESS RESPONSE →", res.data);

      setResult(res.data.data);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Prediction failed');
    }
  };

  // Static risk summary (same as web mock)
  const mockRiskData = {
    Diabetes: 68,
    Cardiac: 44,
    Mental: 22,
    Ortho: 15,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.title}>🧠 AI Disease Risk & Early Warning</Text>

      {/* FORM */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          value={form.age}
          onChangeText={v => handleChange('age', v)}
        />

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.gender}
            onValueChange={v => handleChange('gender', v)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          value={form.height}
          onChangeText={v => handleChange('height', v)}
        />

        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={form.weight}
          onChangeText={v => handleChange('weight', v)}
        />

        <View style={styles.switchRow}>
          <Text>Smoking</Text>
          <Switch
            value={form.smoking}
            onValueChange={v => handleChange('smoking', v)}
          />
        </View>

        <View style={styles.switchRow}>
          <Text>Alcohol</Text>
          <Switch
            value={form.alcohol}
            onValueChange={v => handleChange('alcohol', v)}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Activity Level"
          value={form.activityLevel}
          onChangeText={v => handleChange('activityLevel', v)}
        />

        <TextInput
          style={styles.input}
          placeholder="Symptoms (comma separated)"
          value={form.symptoms}
          onChangeText={v => handleChange('symptoms', v)}
        />

        <TextInput
          style={styles.input}
          placeholder="Existing Conditions"
          value={form.existingConditions}
          onChangeText={v => handleChange('existingConditions', v)}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Predict Risk</Text>
        </TouchableOpacity>
      </View>

      {/* RESULT */}
      {result && (
        <View style={styles.card}>
          <Text style={styles.successTitle}>✅ Prediction Results</Text>
          <Text>Risk Score: {result.riskScore}</Text>
          <Text>Risk Level: {result.riskLevel}</Text>
          <Text>Diseases: {result.predictedDiseases.join(', ')}</Text>
        </View>
      )}

      {/* RISK SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Risk Summary</Text>
        {Object.entries(mockRiskData).map(([k, v]) => (
          <View key={k} style={styles.progressRow}>
            <Text>{k}</Text>
            <Text style={{ color: v > 60 ? 'red' : 'orange' }}>{v}%</Text>
          </View>
        ))}
      </View>

      {/* AI TIPS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🧬 Smart AI Suggestions</Text>
        <Text>🚶 Walk 6,000+ steps/day</Text>
        <Text>🥣 High-fiber morning meals</Text>
        <Text>🛌 Sleep 7.5+ hours</Text>
      </View>

      {/* WARNING */}
      <View style={styles.alert}>
        <Text style={styles.alertText}>
          ⚠️ You're entering the red zone for Diabetes. Act within 7 days.
        </Text>
      </View>

      {/* PLAN SUGGESTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📦 Smart Plan Suggestion</Text>
        <Text>
          Upgrade to Metabolic Care Plan for tests and dietician support.
        </Text>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => setShowPlans(true)}
        >
          <Text style={styles.outlineText}>Explore Plan Options</Text>
        </TouchableOpacity>
      </View>

      {/* EXPLAIN */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => setShowExplain(true)}
      >
        <Text style={styles.btnText}>Why This Prediction?</Text>
      </TouchableOpacity>

      {/* EXPLAIN MODAL */}
      <Modal visible={showExplain} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.sectionTitle}>AI Explanation</Text>
            <Text>
              Based on activity, glucose patterns, and lifestyle factors, risk
              increased recently.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowExplain(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PLANS MODAL */}
      <Modal visible={showPlans} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.sectionTitle}>Health Plans</Text>
            <Text>• Basic: Annual checkups</Text>
            <Text>• Metabolic Care: HbA1c + dietician</Text>
            <Text>• Complete Health: Cardiac + lifestyle</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowPlans(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AIDiseasePredictionRiskEngine;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fbfd' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  primaryBtn: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryBtn: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 30,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#0d6efd',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  outlineText: { color: '#0d6efd', textAlign: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  successTitle: { color: 'green', fontWeight: '700', marginBottom: 6 },
  sectionTitle: { fontWeight: '700', marginBottom: 6 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  alert: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  alertText: { color: '#842029' },
  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
});
