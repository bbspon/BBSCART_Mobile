import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ------------ Responsive size helper ------------
const guidelineBaseWidth = 375; // base design width
const rs = (size) => {
  try {
    const { width } = Dimensions.get("window");
    if (!width || isNaN(width) || width <= 0) {
      // Fallback to original size if width is invalid
      return size;
    }
    const calculated = (width / guidelineBaseWidth) * size;
    // Ensure result is a valid number
    return isNaN(calculated) ? size : calculated;
  } catch (error) {
    // Fallback to original size on error
    return size;
  }
};

/* ---------------- Badge ---------------- */
const Badge = ({ label, tone = "neutral" }) => {
  const tones = {
    success: { bg: "#D1FADF", fg: "#05603A" },
    warning: { bg: "#FEF0C7", fg: "#B54708" },
    danger: { bg: "#FEE4E2", fg: "#912018" },
    neutral: { bg: "#E5E7EB", fg: "#111827" },
  };
  const t = tones[tone] || tones.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
};

/* ================= MAIN SCREEN ================= */
const RevenueEngineDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  /* ----------- Hooks (ALL AT TOP LEVEL) ----------- */
  const [activeTab, setActiveTab] = useState("admin");
  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [showAIAdvice, setShowAIAdvice] = useState(false);

  const [region, setRegion] = useState("");
  const [condition, setCondition] = useState("");
  const [cut, setCut] = useState("");
  const [forecastScenario, setForecastScenario] = useState("");

  /* ---------------- Data ---------------- */
  const agentRows = useMemo(
    () => [
      {
        agent: "A. Mehta",
        plans: 142,
        commission: "₹13,400",
        status: "Paid",
        tone: "success",
        region: "Chennai",
      },
      {
        agent: "S. Khan",
        plans: 108,
        commission: "₹10,200",
        status: "Pending",
        tone: "warning",
        region: "Dubai",
      },
    ],
    []
  );

  const invoiceRows = useMemo(
    () => [
      {
        partner: "Apollo Chennai",
        amount: "₹1,25,000",
        status: "Overdue",
        tone: "danger",
        due: "July 5",
      },
      {
        partner: "Medeor Dubai",
        amount: "₹3,60,000",
        status: "Paid",
        tone: "success",
        due: "June 30",
      },
    ],
    []
  );

  /* ---------------- Handlers ---------------- */
  const handleSaveRule = useCallback(() => {
    if (!region || !condition || !cut) {
      Alert.alert("Missing Info", "Please fill all fields");
      return;
    }
    Alert.alert("Saved", "Commission rule saved");
    setRegion("");
    setCondition("");
    setCut("");
  }, [region, condition, cut]);

  const handleGenerateForecast = useCallback(() => {
    if (!forecastScenario) return;
    Alert.alert("Forecast Generated", forecastScenario);
    setForecastScenario("");
  }, [forecastScenario]);

  // Handlers for input changes
  const handleRegionChange = useCallback((text) => {
    setRegion(text);
  }, []);

  const handleConditionChange = useCallback((text) => {
    setCondition(text);
  }, []);

  const handleCutChange = useCallback((text) => {
    setCut(text);
  }, []);

  const handleForecastScenarioChange = useCallback((text) => {
    setForecastScenario(text);
  }, []);

  /* ---------------- Cards ---------------- */
  const AgentCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{item.agent}</Text>
        <Badge label={item.status} tone={item.tone} />
      </View>
      <Text style={styles.meta}>Plans: {item.plans}</Text>
      <Text style={styles.meta}>Commission: {item.commission}</Text>
      <Text style={styles.meta}>Region: {item.region}</Text>
    </View>
  );

  const InvoiceCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{item.partner}</Text>
        <Badge label={item.status} tone={item.tone} />
      </View>
      <Text style={styles.meta}>Amount: {item.amount}</Text>
      <Text style={styles.meta}>Due: {item.due}</Text>
    </View>
  );

  // Memoize tab content to prevent recreating on every render
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'admin':
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Commission Rule Editor</Text>

            <Text style={styles.label}>Region *</Text>
            <TextInput 
              style={styles.input} 
              value={region} 
              onChangeText={handleRegionChange}
              placeholder="Enter region"
            />

            <Text style={styles.label}>Condition *</Text>
            <TextInput
              style={styles.input}
              value={condition}
              onChangeText={handleConditionChange}
              placeholder="Enter condition"
            />

            <Text style={styles.label}>BBSCART Cut % *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cut}
              onChangeText={handleCutChange}
              placeholder="Enter percentage"
            />

            <TouchableOpacity style={styles.button} onPress={handleSaveRule}>
              <Text style={styles.buttonText}>Save Rule</Text>
            </TouchableOpacity>
          </View>
        );
      case 'agent':
        return (
          <FlatList
            data={agentRows}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <AgentCard item={item} />}
            contentContainerStyle={{ paddingBottom: rs(12) }}
          />
        );
      case 'hospital':
        const cities = ["Chennai", "Dubai", "Delhi"];
        return (
          <View>
            <View style={styles.segment}>
              {cities.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.segmentItem,
                    selectedCity === c && styles.segmentActive,
                  ]}
                  onPress={() => setSelectedCity(c)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedCity === c && styles.segmentTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.meta}>
                <Text style={styles.bold}>{selectedCity}</Text> Revenue: ₹4.6L
              </Text>
              <Text style={styles.meta}>OPD: 74%</Text>
              <Text style={styles.meta}>Labs: 56%</Text>
              <Text style={[styles.meta, { color: "#B42318" }]}>
                Dental: 12%
              </Text>
            </View>
          </View>
        );
      case 'forecast':
        return (
          <View style={styles.card}>
            <Text style={styles.meta}>MRR: ₹1.42 Cr</Text>
            <Text style={styles.meta}>Churn: 7.8%</Text>

            <Text style={styles.label}>Scenario *</Text>
            <TextInput
              style={styles.input}
              value={forecastScenario}
              onChangeText={handleForecastScenarioChange}
              placeholder="Enter scenario"
            />

            <TouchableOpacity style={styles.button} onPress={handleGenerateForecast}>
              <Text style={styles.buttonText}>Generate Forecast</Text>
            </TouchableOpacity>
          </View>
        );
      case 'invoice':
        return (
          <FlatList
            data={invoiceRows}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <InvoiceCard item={item} />}
            contentContainerStyle={{ paddingBottom: rs(12) }}
          />
        );
      case 'compliance':
        return (
          <View style={styles.card}>
            <Text style={styles.meta}>✅ GDPR / DPDPA / PDPL Ready</Text>
            <Text style={styles.meta}>🔐 Encrypted Financial Data</Text>
            <Text style={styles.meta}>👨‍⚖️ Role-based Access</Text>
            <Text style={styles.meta}>📜 Auto Audit Logs</Text>
          </View>
        );
      case 'ai':
        return (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => setShowAIAdvice(true)}
            >
              <Text style={styles.buttonOutlineText}>Ask AI Revenue Bot</Text>
            </TouchableOpacity>

            <Modal transparent visible={showAIAdvice} animationType="fade">
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.sectionTitle}>AI Suggestions</Text>
                  <Text style={styles.meta}>✅ Boost Premium in Tier-2 cities</Text>
                  <Text style={styles.meta}>⚠️ Diagnostics drop in Sharjah</Text>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowAIAdvice(false)}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    region,
    condition,
    cut,
    forecastScenario,
    selectedCity,
    showAIAdvice,
    handleRegionChange,
    handleConditionChange,
    handleCutChange,
    handleForecastScenarioChange,
    handleSaveRule,
    handleGenerateForecast,
    agentRows,
    invoiceRows,
  ]);

  /* ---------------- Render ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>💰 Revenue Engine</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          ["admin", "⚙️ Admin"],
          ["agent", "👤 Agents"],
          ["hospital", "🏦 Hospitals"],
          ["forecast", "📈 Forecast"],
          ["invoice", "💵 Invoices"],
          ["compliance", "🔒 Compliance"],
          ["ai", "🤖 AI"],
        ].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={[styles.tab, activeTab === key && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, activeTab === key && styles.tabTextActive]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ marginTop: rs(12) }}
        contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
      >
        {tabContent}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RevenueEngineDashboardScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
  },

  title: {
    fontSize: rs(20),
    fontWeight: "800",
    marginBottom: rs(12),
    textAlign: "center",
  },

  /* ---------- Tabs ---------- */
  tab: {
    backgroundColor: "#E5E7EB",
    paddingVertical: rs(8),
    paddingHorizontal: rs(14),
    borderRadius: rs(20),
    marginRight: rs(10),
    minHeight: rs(36),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: rs(12),
    minWidth: rs(100),
    maxWidth: rs(200),
    maxHeight: rs(36),
  },

  tabActive: {
    backgroundColor: "#2563EB",
  },

  tabText: {
    fontSize: rs(13),
    color: "#111827",
  },

  tabTextActive: {
    color: "white",
    fontWeight: "700",
  },

  /* ---------- Cards ---------- */
  card: {
    backgroundColor: "white",
    borderRadius: rs(14),
    padding: rs(16),
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs(6),
  },

  cardTitle: {
    fontSize: rs(15),
    fontWeight: "700",
  },

  /* ---------- Text ---------- */
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: "700",
    marginBottom: rs(10),
  },

  meta: {
    fontSize: rs(13),
    color: "#475569",
    marginBottom: rs(4),
  },

  bold: {
    fontWeight: "700",
  },

  /* ---------- Inputs ---------- */
  label: {
    fontSize: rs(12),
    marginTop: rs(10),
    marginBottom: rs(4),
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: rs(8),
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    fontSize: rs(14),
  },

  /* ---------- Buttons ---------- */
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: rs(12),
    borderRadius: rs(8),
    marginTop: rs(12),
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: rs(14),
  },

  buttonOutline: {
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: rs(12),
    borderRadius: rs(8),
  },

  buttonOutlineText: {
    color: "#2563EB",
    fontWeight: "600",
    textAlign: "center",
    fontSize: rs(14),
  },

  /* ---------- Badge ---------- */
  badge: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
    borderRadius: rs(20),
  },

  badgeText: {
    fontSize: rs(11),
    fontWeight: "600",
  },

  /* ---------- Segmented Control ---------- */
  segment: {
    flexDirection: "row",
    borderRadius: rs(8),
    overflow: "hidden",
    marginBottom: rs(12),
  },

  segmentItem: {
    flex: 1,
    paddingVertical: rs(8),
    alignItems: "center",
  },

  segmentActive: {
    backgroundColor: "#2563EB",
  },

  segmentText: {
    fontSize: rs(13),
  },

  segmentTextActive: {
    color: "white",
    fontWeight: "700",
  },

  /* ---------- Modal ---------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: rs(20),
  },

  modalCard: {
    backgroundColor: "white",
    borderRadius: rs(14),
    padding: rs(16),
  },
});
