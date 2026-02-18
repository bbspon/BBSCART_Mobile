import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
// TODO: Re-enable when compatible PDF library is available
// import RNHTMLtoPDF from 'react-native-html-to-pdf';

// Sample Insurance Help Center Data
const INSURANCE_HELP_DATA = [
  {
    id: "plan1",
    category: "Insurance Plans & Coverage",
    title: "What insurance plans are available through BBS Global Health Access?",
    content:
      "We offer a range of insurance plans including individual, family, and corporate group plans tailored to diverse healthcare needs.",
    lastUpdated: "2025-08-08",
  },
  {
    id: "enroll1",
    category: "Enrollment & Eligibility",
    title: "How do I enroll in an insurance plan?",
    content:
      "Enrollment can be completed online via your user dashboard or through your employer's HR department.",
    lastUpdated: "2025-07-25",
  },
  {
    id: "claim1",
    category: "Claims Process & Status",
    title: "How do I file an insurance claim?",
    content:
      "Claims can be submitted online with required documents. You can track your claim status in your account dashboard.",
    lastUpdated: "2025-07-30",
  },
  {
    id: "billing1",
    category: "Billing & Payments",
    title: "What are the payment options for insurance premiums?",
    content: "Premiums can be paid via credit card, bank transfer, or auto-debit.",
    lastUpdated: "2025-08-01",
  },
  {
    id: "dispute1",
    category: "Dispute Resolution & Appeals",
    title: "How do I appeal a denied claim?",
    content:
      "You may file an appeal within 30 days by submitting a formal request through our appeals portal with supporting documents.",
    lastUpdated: "2025-08-04",
  },
  {
    id: "partner1",
    category: "Insurance Partner/Vendor Support",
    title: "How can partners onboard as insurance vendors?",
    content:
      "Partners can contact our vendor relations team for onboarding guidelines and documentation requirements.",
    lastUpdated: "2025-07-20",
  },
];

const categories = [...new Set(INSURANCE_HELP_DATA.map((item) => item.category))];

export default function HelpCenter() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState(INSURANCE_HELP_DATA);
  const [expandedId, setExpandedId] = useState(null);
  const [feedback, setFeedback] = useState({}); // {id: 'yes'|'no'}
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) {
        setFilteredItems(INSURANCE_HELP_DATA);
      } else {
        const filtered = INSURANCE_HELP_DATA.filter((item) =>
          item.title.toLowerCase().includes(term) ||
          item.content.toLowerCase().includes(term)
        );
        setFilteredItems(filtered);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleFeedback(id, response) {
    setFeedback((prev) => ({ ...prev, [id]: response }));
    console.log(`Feedback for ${id}: ${response}`);
  }

  // Handle Print - Generate PDF that works on real devices
  const handlePrint = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
              h3 { color: #333; margin-top: 20px; }
              p { line-height: 1.6; color: #555; }
              small { color: #888; font-size: 12px; }
              hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Insurance Help Center</h1>
            ${INSURANCE_HELP_DATA.map(item => `
              <h3>${item.title}</h3>
              <p>${item.content}</p>
              <small>Last updated: ${item.lastUpdated}</small>
              <hr />
            `).join('')}
          </body>
        </html>
      `;

      const options = {
        html,
        fileName: `Insurance_Help_Center_${Date.now()}`,
        directory: Platform.OS === 'android' ? 'Download' : 'Documents',
      };

      // TODO: Re-enable when compatible PDF library is available
      Alert.alert(
        'Feature Temporarily Disabled',
        'PDF generation is temporarily disabled. Will be re-enabled with a compatible library.'
      );
      return;
      
      // const file = await RNHTMLtoPDF.convert(options);
      
      Alert.alert(
        'PDF Generated Successfully',
        `File saved to:\n${file.filePath}\n\nYou can now share or print this file.`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (err) {
      console.error('Print error:', err);
      Alert.alert(
        'Print Functionality Unavailable',
        'Unable to generate PDF. Please try again later or contact support.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  function highlight(text) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => (
      regex.test(part) ? <Text key={i} style={styles.highlight}>{part}</Text> : part
    ));
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>Insurance Help Center</Text>
      <Text style={styles.subHeader}>
        Find answers and support for insurance plans, claims, payments, and more.
      </Text>

      {/* Search Bar */}
      <TextInput
        ref={searchRef}
        style={styles.searchInput}
        placeholder="Search insurance topics..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 12 }} />}

      {/* Categories */}
      {categories.map((category) => {
        const itemsInCategory = filteredItems.filter((item) => item.category === category);
        if (itemsInCategory.length === 0) return null;

        return (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {itemsInCategory.map((item) => (
              <View key={item.id} style={styles.accordionItem}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.accordionHeader}>
                  <Text style={styles.accordionTitle}>{highlight(item.title)}</Text>
                  <Text style={styles.expandIcon}>{expandedId === item.id ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                {expandedId === item.id && (
                  <View style={styles.accordionBody}>
                    <Text style={styles.content}>{item.content}</Text>
                    <Text style={styles.lastUpdated}>Last updated: {item.lastUpdated}</Text>
                    <View style={styles.feedbackContainer}>
                      <Text style={styles.feedbackText}>Was this helpful?</Text>
                      <View style={styles.feedbackButtons}>
                        <TouchableOpacity
                          style={[
                            styles.feedbackBtn,
                            feedback[item.id] === "yes" ? styles.yesBtn : styles.outlineYes,
                          ]}
                          onPress={() => handleFeedback(item.id, "yes")}
                        >
                          <Text style={feedback[item.id] === "yes" ? styles.feedbackBtnTextActive : styles.feedbackBtnText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.feedbackBtn,
                            feedback[item.id] === "no" ? styles.noBtn : styles.outlineNo,
                          ]}
                          onPress={() => handleFeedback(item.id, "no")}
                        >
                          <Text style={feedback[item.id] === "no" ? styles.feedbackBtnTextActive : styles.feedbackBtnText}>No</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      })}

      {/* No results */}
      {!loading && filteredItems.length === 0 && (
        <Text style={styles.noResults}>No insurance help topics found matching your search.</Text>
      )}

      {/* Contact Support */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need more assistance?</Text>
        <Text style={styles.contactText}>
          If you can’t find what you’re looking for, please contact our insurance support team.
        </Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => navigation.navigate('Contact Us')}
        >
          <Text style={styles.contactButtonText}>Contact Insurance Support</Text>
        </TouchableOpacity>
      </View>

      {/* Print Button */}
      <View style={styles.printSection}>
        <TouchableOpacity
          style={styles.printButton}
          onPress={handlePrint}
        >
          <Text style={styles.printButtonText}>Print this page</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  subHeader: { fontSize: 16, textAlign: "center", marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  categoryContainer: { marginBottom: 24 },
  categoryTitle: { fontSize: 18, fontWeight: "600", borderBottomWidth: 1, borderColor: "#eee", paddingBottom: 4, marginBottom: 8 },
  accordionItem: { marginBottom: 8, borderWidth: 1, borderColor: "#eee", borderRadius: 6 },
  accordionHeader: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#f9f9f9", borderRadius: 6 },
  accordionTitle: { fontSize: 16, fontWeight: "500", flex: 1 },
  expandIcon: { fontSize: 16, marginLeft: 8 },
  accordionBody: { padding: 12, backgroundColor: "#fff" },
  content: { fontSize: 14, marginBottom: 8 },
  lastUpdated: { fontSize: 12, color: "#666", marginBottom: 8 },
  feedbackContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  feedbackText: { fontSize: 14 },
  feedbackButtons: { flexDirection: "row" },
  feedbackBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6, marginLeft: 4 },
  yesBtn: { backgroundColor: "green" },
  noBtn: { backgroundColor: "red" },
  outlineYes: { borderWidth: 1, borderColor: "green" },
  outlineNo: { borderWidth: 1, borderColor: "red" },
  feedbackBtnText: { color: "#000" },
  feedbackBtnTextActive: { color: "#fff", fontWeight: "bold" },
  highlight: { backgroundColor: "#ffff00" },
  noResults: { textAlign: "center", fontSize: 16, color: "#666", marginVertical: 20 },
  contactSection: { marginTop: 24, alignItems: "center" },
  contactTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  contactText: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  contactButton: { backgroundColor: "#0d6efd", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  contactButtonText: { color: "#fff", fontWeight: "bold" },
  printSection: { margin: 16, alignItems: "center" },
  printButton: { borderWidth: 1, borderColor: "#6c757d", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6,marginBottom: 13 },
  printButtonText: { color: "#6c757d"},
});
