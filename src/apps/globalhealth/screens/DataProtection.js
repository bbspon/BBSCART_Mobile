import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Glossary and policy content ---
const glossary = {
  GDPR: "General Data Protection Regulation - EU privacy law protecting user data.",
  HIPAA: "Health Insurance Portability and Accountability Act - US healthcare privacy law.",
  DSAR: "Data Subject Access Request - Users' right to access their personal data.",
  PII: "Personally Identifiable Information - Data that can identify an individual.",
  Encryption: "Process of encoding data to prevent unauthorized access.",
};

const policySections = [
  {
    key: "introduction",
    title: "Introduction & Purpose",
    content:
      "This Data Protection Policy explains how we collect, use, and protect your personal and health-related data when you interact with our Health Insurance services.",
  },
  {
    key: "definitions",
    title: "Definitions & Glossary",
    content: Object.entries(glossary)
      .map(([term, desc]) => `${term}: ${desc}`)
      .join("\n"),
  },
  {
    key: "data-collected",
    title: "Data Collected",
    content:
      "We collect personal data such as your name, contact details, identification documents, health history, claims information, and payment details.",
  },
  {
    key: "purpose-use",
    title: "Purpose of Data Use",
    content:
      "Your data is used for underwriting, claims processing, customer service, fraud prevention, regulatory compliance, and marketing communications.",
  },
  {
    key: "legal-basis",
    title: "Legal Basis for Processing",
    content:
      "We process your data based on your consent, contractual necessity, legal obligations, and legitimate business interests.",
  },
];

export default function DataProtectionPolicy() {
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set());

  // --- Highlight helper ---
  const highlightText = (text, query) => {
    if (!query) return <Text>{text}</Text>;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return (
      <Text>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <Text key={index} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  // --- Filter logic ---
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return policySections;

    return policySections.filter(
      (section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // --- Auto expand on search ---
  useEffect(() => {
    if (!searchTerm.trim()) {
      setExpandedSections(new Set());
      return;
    }

    const autoExpanded = new Set(filteredSections.map(s => s.key));
    setExpandedSections(autoExpanded);
  }, [searchTerm, filteredSections]);

  const toggleSection = (key) => {
    const newSet = new Set(expandedSections);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setExpandedSections(newSet);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.header}>🔒 Data Protection Policy</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search policy..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {filteredSections.length === 0 && (
        <Text style={styles.noResult}>No results found.</Text>
      )}

      {filteredSections.map((section) => (
        <View key={section.key} style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection(section.key)}>
            <Text style={styles.sectionTitle}>
              {section.title} {expandedSections.has(section.key) ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSections.has(section.key) && (
            <View style={{ marginTop: 6 }}>
              {highlightText(section.content, searchTerm)}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 6,
  },
  section: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  highlight: {
    backgroundColor: "#ffe58f",
    fontWeight: "bold",
  },
  noResult: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
    fontSize: 14,
  },
});
