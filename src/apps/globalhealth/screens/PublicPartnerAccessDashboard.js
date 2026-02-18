import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const PublicPartnerAccessDashboard = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('govt');
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const aiExamples = {
    govt: 'Show OPD spike zones for govt-sponsored plans.',
    corp: 'Which teams have rising absenteeism risk?',
    ngo: 'Track usage across rural gig workers this month.',
    mass: 'What’s the adoption rate in Tier-3 schools?',
  };

  const tabs = [
    { key: 'govt', label: 'Government' },
    { key: 'corp', label: 'Corporate' },
    { key: 'ngo', label: 'NGO' },
    { key: 'mass', label: 'Mass' },
  ];

  const renderTable = rows => (
    <View style={styles.table}>
      {rows.map((row, index) => (
        <View key={index} style={styles.card}>
          {Object.entries(row).map(([key, value]) => (
            <Text key={key} style={styles.rowText}>
              <Text style={styles.bold}>{key}: </Text>
              {value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  /* ===== ASK AI (REAL API) ===== */
  const handleAskBot = async () => {
    if (!aiPrompt) return;

    setLoading(true);
    setAIResponse('');

    try {
      const res = await axios.post(`${API_BASE_URL}/ask-ai`, {
        prompt: aiPrompt,
        context: activeTab,
        user: 'admin@bbscart.com',
      });

      const result = res.data?.response || '✅ AI processed successfully.';
      setAIResponse(result);

      /* ===== LOG QUERY (REAL API) ===== */
      await axios.post(`${API_BASE_URL}/log-ai-query`, {
        module: 'PublicPartnerAccess',
        query: aiPrompt,
        response: result,
        tab: activeTab,
        timestamp: new Date().toISOString(),
      });

      updateDashboardFromAI(activeTab, result);
    } catch (error) {
      console.error(error);
      setAIResponse('❌ AI failed to respond. Please try again.');
    }

    setLoading(false);
  };

  /* ===== UI ALERT LOGIC (STATIC) ===== */
  const updateDashboardFromAI = (tab, response) => {
    if (tab === 'govt' && response.includes('Bhagalpur')) {
      Alert.alert('Govt Alert', 'OPD surge flagged in Bhagalpur');
    } else if (tab === 'corp' && response.includes('absenteeism')) {
      Alert.alert('Corporate Update', 'Absenteeism risk detected');
    } else if (tab === 'ngo' && response.includes('Chhattisgarh')) {
      Alert.alert('NGO Update', 'Chhattisgarh outreach updated');
    } else if (tab === 'mass' && response.includes('Tamil Nadu')) {
      Alert.alert('Mass Adoption', 'Tamil Nadu schools prioritized');
    }
  };

  const openAI = () => {
    setAIPrompt(aiExamples[activeTab]);
    setAIResponse('');
    setShowAI(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>🌐 BBSCART Partnerships</Text>
      <Text style={styles.subtitle}>
        Govt, Corporate, NGO & Mass Adoption Monitoring
      </Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.activeTab]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={styles.tabText}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'govt' &&
        renderTable([
          { Model: 'Sponsored Care Pass', Impact: 'Free care', Admin: 'Govt' },
          { Model: 'Co-Pay Hybrid', Impact: 'User upgrade', Admin: 'Shared' },
          {
            Model: 'Smart Infra AI',
            Impact: 'Hospital AI',
            Admin: 'Govt + BBSCART',
          },
        ])}

      {activeTab === 'corp' &&
        renderTable([
          { Feature: 'Bulk Plans', Description: 'Employee tiers' },
          { Feature: 'Family Add-on', Description: 'Spouse & kids' },
          { Feature: 'Wellness AI', Description: 'Dept insights' },
        ])}

      {activeTab === 'ngo' &&
        renderTable([
          { Step: 'Sponsor Plans', Flow: 'Bulk purchase' },
          { Step: 'Field Onboarding', Flow: 'QR + ID' },
          { Step: 'Impact AI', Flow: 'Usage alerts' },
        ])}

      {activeTab === 'mass' &&
        renderTable([
          { Segment: 'Urban MSMEs', Strategy: 'UPI cashback' },
          { Segment: 'Rural India', Strategy: 'PHC QR support' },
          { Segment: 'Tier-2 Schools', Strategy: 'Family bundles' },
        ])}

      <TouchableOpacity style={styles.aiButton} onPress={openAI}>
        <Text style={styles.aiButtonText}>Ask AI Assistant 🎤</Text>
      </TouchableOpacity>

      {/* AI MODAL */}
      <Modal visible={showAI} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🧠 AI Assistant</Text>

            <TextInput
              style={styles.input}
              placeholder="Ask your question..."
              value={aiPrompt}
              onChangeText={setAIPrompt}
            />

            <TouchableOpacity style={styles.askBtn} onPress={handleAskBot}>
              <Text style={styles.askText}>Ask</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            {aiResponse ? (
              <Text style={styles.response}>{aiResponse}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowAI(false)}
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PublicPartnerAccessDashboard;

/* ===== STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: { marginBottom: 12, color: '#555', textAlign: 'center' },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tab: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  activeTab: { backgroundColor: '#007bff' },
  tabText: { color: '#000' },

  table: { marginVertical: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  rowText: { marginBottom: 4 },
  bold: { fontWeight: 'bold' },

  aiButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    marginVertical: 20,
  },
  aiButtonText: { color: '#fff', textAlign: 'center' },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  askBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  askText: { color: '#fff', textAlign: 'center' },

  response: { marginTop: 10, color: 'green' },
  closeBtn: { marginTop: 12, alignSelf: 'center' },
});
