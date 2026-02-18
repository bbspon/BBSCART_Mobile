import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TODO: Re-enable when compatible document picker is available
// import DocumentPicker from "react-native-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://healthcare.bbscart.com/api";

export default function HospitalOnboarding() {
  const insets = useSafeAreaInsets();
  const [hospitalName, setHospitalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* -------------------------
     PICK LICENSE FILE
  -------------------------- */
  const pickLicense = async () => {
    // TODO: Re-enable when compatible document picker is available
    Alert.alert(
      "Feature Temporarily Disabled",
      "Document picking is temporarily disabled. Will be re-enabled with a compatible library."
    );
    // try {
    //   const res = await DocumentPicker.pickSingle({
    //     type: [
    //       DocumentPicker.types.images,
    //       DocumentPicker.types.pdf,
    //     ],
    //     presentationStyle: "fullScreen",
    //     copyTo: "cachesDirectory",
    //   });
    //   setLicense(res);
    //   setErrorMsg("");
    // } catch (err) {
    //   if (!DocumentPicker.isCancel(err)) {
    //     Alert.alert("Error", "Unable to select file");
    //   }
    // }
  };

  /* -------------------------
     SUBMIT FORM
  -------------------------- */
  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!hospitalName.trim() || !registrationNumber.trim()) {
      setErrorMsg("Please enter hospital name and registration number.");
      return;
    }

    try {
      setLoading(true);

      // Get token from AsyncStorage (same as web localStorage)
      const raw = await AsyncStorage.getItem("bbsUser");
      const token = raw ? JSON.parse(raw).token : null;
      
      if (!token) {
        setErrorMsg("You are not logged in. Please log in and try again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("hospitalName", hospitalName.trim()); // matches backend
      formData.append("registrationNumber", registrationNumber.trim());
      
      if (license) {
        formData.append("license", {
          uri:
            Platform.OS === "android"
              ? license.fileCopyUri || license.uri
              : license.uri,
          name: license.name || "license.pdf",
          type: license.type || "application/pdf",
        });
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/hospitals/onboarding`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // backend returns { record: {...} }
      setSuccessMsg(`Onboarding submitted. Ref: ${data?.record?._id || ""}`);
      setHospitalName("");
      setRegistrationNumber("");
      setLicense(null);
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit.";
      setErrorMsg(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
     UI
  -------------------------- */
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
    >
      <Text style={styles.title}>Hospital Onboarding</Text>

      {successMsg ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      ) : null}
      
      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hospital Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hospital name"
          value={hospitalName}
          onChangeText={setHospitalName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Registration Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter registration number"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Upload License Document</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickLicense}>
          <Text style={styles.uploadText}>
            {license ? "Change License File" : "Upload License"}
          </Text>
        </TouchableOpacity>
        {license && (
          <Text style={styles.fileName}>
            Selected: {license.name}
          </Text>
        )}
        <Text style={styles.helperText}>
          Accepted: PDF or image (JPG/PNG/WebP)
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* -------------------------
   STYLES
-------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  uploadBtn: {
    backgroundColor: "#0dcaf0",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "600",
  },
  fileName: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  submitBtn: {
    backgroundColor: "#198754",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
  successBox: {
    backgroundColor: "#d1e7dd",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  successText: {
    color: "#0f5132",
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: "#842029",
    fontSize: 14,
  },
});
