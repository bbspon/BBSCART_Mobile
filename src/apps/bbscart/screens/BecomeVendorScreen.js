// BecomeVendorDashboard.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

// ---------- Sample Data for Multi-Step ----------
const steps = ["Business Info", "Bank Info", "Product Category", "Documents", "Review"];
const sampleDocs = ["GST Certificate", "ID Proof", "Bank Proof"];

const BecomeVendorDashboard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [businessInfo, setBusinessInfo] = useState({ name: "", email: "", phone: "" });
  const [bankInfo, setBankInfo] = useState({ account: "", ifsc: "" });
  const [productCategories, setProductCategories] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState("Pending"); // Pending, Approved, Rejected

  // ---------- Handlers ----------
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const uploadDocument = (doc) => {
    if (!uploadedDocs.includes(doc)) {
      setUploadedDocs([...uploadedDocs, doc]);
      Alert.alert("Uploaded", `${doc} uploaded successfully!`);
    }
  };

  const submitApplication = () => {
    if (
      !businessInfo.name ||
      !businessInfo.email ||
      !bankInfo.account ||
      productCategories.length === 0 ||
      uploadedDocs.length < sampleDocs.length
    ) {
      Alert.alert("Incomplete", "Please complete all steps before submission.");
      return;
    }
    setApprovalStatus("Pending");
    Alert.alert("Submitted", "Your vendor application has been submitted!");
  };

  // ---------- Step Content ----------
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={businessInfo.name}
              onChangeText={(text) => setBusinessInfo({ ...businessInfo, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={businessInfo.email}
              onChangeText={(text) => setBusinessInfo({ ...businessInfo, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={businessInfo.phone}
              onChangeText={(text) => setBusinessInfo({ ...businessInfo, phone: text })}
            />
          </View>
        );
      case 1:
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Bank Account Number"
              value={bankInfo.account}
              onChangeText={(text) => setBankInfo({ ...bankInfo, account: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="IFSC Code"
              value={bankInfo.ifsc}
              onChangeText={(text) => setBankInfo({ ...bankInfo, ifsc: text })}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.label}>Select Product Categories:</Text>
            {["Electronics", "Fashion", "Groceries", "Health"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  productCategories.includes(cat) && styles.categorySelected,
                ]}
                onPress={() =>
                  setProductCategories(
                    productCategories.includes(cat)
                      ? productCategories.filter((c) => c !== cat)
                      : [...productCategories, cat]
                  )
                }
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.label}>Upload Documents:</Text>
            {sampleDocs.map((doc) => (
              <TouchableOpacity
                key={doc}
                style={[
                  styles.docBtn,
                  uploadedDocs.includes(doc) && styles.docUploaded,
                ]}
                onPress={() => uploadDocument(doc)}
              >
                <Text style={styles.docText}>{doc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.label}>Review & Submit:</Text>
            <Text>Business Name: {businessInfo.name}</Text>
            <Text>Email: {businessInfo.email}</Text>
            <Text>Phone: {businessInfo.phone}</Text>
            <Text>Bank Account: {bankInfo.account}</Text>
            <Text>IFSC: {bankInfo.ifsc}</Text>
            <Text>Categories: {productCategories.join(", ")}</Text>
            <Text>Documents: {uploadedDocs.join(", ")}</Text>
            <Text>Status: {approvalStatus}</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={submitApplication}>
              <Text style={styles.submitBtnText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header & Progress */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Become a Vendor</Text>
        <Text style={styles.subHeader}>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
        </Text>
      </View>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.navBtn} onPress={prevStep}>
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentStep < steps.length - 1 && (
          <TouchableOpacity style={styles.navBtn} onPress={nextStep}>
            <Text style={styles.navBtnText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Advanced / Future Features Info */}
      <View style={styles.advancedContainer}>
        <Text style={styles.sectionHeader}>Advanced / Future Features</Text>
        {[
          "AI-guided onboarding & input validation",
          "Gamification: Badges & points",
          "Document auto-verification",
          "Interactive video tutorials",
          "Smart notifications for incomplete steps",
          "Integrated AI support bot",
          "Dynamic onboarding paths by vendor type/region",
          "Multi-device sync",
          "Secure & compliant data storage",
          "Predictive insights for missing documents",
          "Accessibility support (TTS, high-contrast)",
          "Automated email/SMS reminders",
        ].map((feat, i) => (
          <Text key={i} style={styles.advancedText}>
            • {feat}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  headerContainer: { marginBottom: 16 },
  header: { fontSize: 28, fontWeight: "bold", color: "#1f2937" },
  subHeader: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontWeight: "bold", marginVertical: 8, fontSize: 16 },
  categoryBtn: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
  },
  categorySelected: { backgroundColor: "#3b82f6" },
  categoryText: { color: "#1f2937" },
  docBtn: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
  },
  docUploaded: { backgroundColor: "#10b981" },
  docText: { color: "#1f2937" },
  navButtons: { flexDirection: "row", justifyContent: "space-between", marginVertical: 16 },
  navBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  navBtnText: { color: "#fff", fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "bold" },
  advancedContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  advancedText: { fontSize: 14, marginBottom: 8 },
});

export default BecomeVendorDashboard;
