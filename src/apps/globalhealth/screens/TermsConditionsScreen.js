// File: TermsConditionsAdvanced.native.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BASE_CONTENT = {
  meta: {
    title: "Terms & Conditions — BBS Health Access",
    lastUpdated: "2025-08-10",
    currentVersion: "v2.1",
  },
  sections: [
    {
      id: "intro",
      title: "Introduction & Acceptance",
      body:
        "These Terms & Conditions (\"Terms\") are a legal agreement between you and BBS Health Access. By accessing or using our services you agree to be bound by these Terms.",
      roles: ["patient", "vendor", "agent", "corporate"],
    },
    {
      id: "privacy",
      title: "Data Protection & Privacy",
      body:
        "We process personal data per our Privacy Policy. Users can request data export and deletion as permitted by law.",
      roles: ["patient", "vendor", "agent", "corporate"],
    },
  ],
};

export default function TermsConditionsAdvanced() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState("patient");
  const [searchQ, setSearchQ] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [consentLog, setConsentLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  function performConfirmAcceptance() {
    if (!accepted) {
      Alert.alert("Error", "Please check the acceptance checkbox first.");
      return;
    }
    Alert.alert("Confirm", "Do you accept these Terms?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: () => {
          const entry = {
            ts: new Date().toISOString(),
            role,
            version: BASE_CONTENT.meta.currentVersion,
          };
          setConsentLog((prev) => [...prev, entry]);
        },
      },
    ]);
  }
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return BASE_CONTENT.sections;

    return BASE_CONTENT.sections.filter(
      (section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>{BASE_CONTENT.meta.title}</Text>
      <Text style={styles.meta}>
        Last updated: {BASE_CONTENT.meta.lastUpdated} · Version{" "}
        {BASE_CONTENT.meta.currentVersion}
      </Text>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search policy..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />


      {/* Sections */}
      {filteredSections.map((s) => (

        <View key={s.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
        </View>
      ))}

      {/* Consent */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consent & Acceptance</Text>
        <TouchableOpacity
          onPress={() => setAccepted(!accepted)}
          style={styles.checkboxRow}
        >
          <Text>{accepted ? "☑" : "☐"}</Text>
          <Text style={{ marginLeft: 8}}>
            I accept Terms (v{BASE_CONTENT.meta.currentVersion})
          </Text>
        </TouchableOpacity>

        <Button
          title="Confirm Acceptance"
          onPress={performConfirmAcceptance}
          disabled={!accepted}
          textStyle={{ color: "#fff", fontWeight: "bold",backgroundColor: "blue" }}
        />
      </View>

      {/* Consent log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consent Log</Text>
        {consentLog.length === 0 ? (
          <Text>No consents recorded yet.</Text>
        ) : (
          consentLog.map((c, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text>
                {new Date(c.ts).toLocaleString()} — {c.version} — {c.role}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold" },
  meta: { fontSize: 12, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 6, marginVertical: 10 },
  section: { marginVertical: 12, padding: 10, backgroundColor: "#f9f9f9" },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  sectionBody: { fontSize: 14, marginTop: 4 },
  checkboxRow: { flexDirection: "row", alignItems: "center", margin: 8 },
});
