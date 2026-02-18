import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { showMessage } from "react-native-flash-message";

const API_URL = "https://bbscart.com";

// Real API functions - integrated from web form
const uploadDoc = async (fileUri, fileName, fileType) => {
  const fd = new FormData();
  fd.append("document", {
    uri: fileUri,
    type: fileType || "image/jpeg",
    name: fileName || "document.jpg",
  });

  try {
    const { data } = await axios.post(`${API_URL}/api/franchisees/upload`, fd, {
      timeout: 30000, // 30s timeout
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("upload response:", data);
    if (!data?.ok || !data?.fileUrl) {
      throw new Error(`Upload failed: ${JSON.stringify(data || "no-response")}`);
    }
    return data.fileUrl;
  } catch (err) {
    console.error("uploadDoc error:", err?.response || err.message || err);
    throw err;
  }
};

const stepByKey = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/api/franchisees/step-by-key`, payload);
    return response;
  } catch (err) {
    console.error("stepByKey error:", err?.response || err.message || err);
    throw err;
  }
};

// Using mock data - all backend calls replaced with mock functions
// Options
const constitutionOptions = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_ltd", label: "Private Limited" },
  { value: "public_ltd", label: "Public Limited" },
  { value: "llp", label: "LLP" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
];

export default function FranchiseHeadForm({ value, onChange, navigation: propNavigation }) {
  // Use navigation from hook or prop
  const hookNavigation = useNavigation();
  const safeNavigation = propNavigation || hookNavigation || {
    navigate: (screen) => {
      Alert.alert("Success", "Registration completed successfully!");
    },
    goBack: () => {
      Alert.alert("Info", "Go back functionality not available");
    },
  };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openTo, setOpenTo] = useState("year");
  const [step, setStep] = useState(1);
  const [franchiseeId, setFranchiseeId] = useState("");

  // Load franchiseeId from AsyncStorage on mount
  useEffect(() => {
    const loadFranchiseeId = async () => {
      try {
        const id = await AsyncStorage.getItem("franchiseeId");
        if (id) setFranchiseeId(id);
      } catch (error) {
        console.error("Error loading franchiseeId:", error);
      }
    };
    loadFranchiseeId();
  }, []);

  // Loading flags for uploads/saves
  const [loadingPan, setLoadingPan] = useState(false);
  const [loadingAFront, setLoadingAFront] = useState(false);
  const [loadingABack, setLoadingABack] = useState(false);
  const [loadingGST, setLoadingGST] = useState(false);
  const [dobValue, setDobValue] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    panNumber: "",
    aadharNumber: "",
    gender: "",
    register_street: "",
    register_city: "",
    register_state: "",
    register_country: "India",
    register_postalCode: "",
    // GST manual fields
    gstNumber: "",
    gstLegalName: "",
    constitution_of_business: "",
    gst_floorNo: "",
    gst_buildingNo: "",
    gst_street: "",
    gst_locality: "",
    gst_district: "",
    gst_state: "",
    pan_pic: "",
  });


  const fmtAadhaarUI = (digits) =>
    (digits || "")
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  // uploadDoc is now defined at the top level - uses real API

  // -------------------- PAN (Step 1) --------------------
  const onPanUpload = async () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) return;

  setLoadingPan(true);
  try {
        console.log("Starting PAN upload, file:", asset.fileName, asset.fileSize);
        const fileUrl = await uploadDoc(asset.uri, asset.fileName, asset.type);
    console.log("PAN uploaded, fileUrl:", fileUrl);

    setFormData((p) => ({ ...p, pan_pic: fileUrl }));

        const r = await stepByKey({
        franchiseeId,
        pan_pic: fileUrl,
        });
    console.log("step-by-key response:", r?.data);

    const newId = r?.data?.data?._id;
    if (newId && !franchiseeId) {
      setFranchiseeId(newId);
          await AsyncStorage.setItem("franchiseeId", newId);
    }

        showMessage({
          type: "success",
          message: "PAN uploaded successfully",
        });
  } catch (err) {
    console.error("onPanUpload failed:", err?.response || err?.message || err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
          "PAN upload failed";
        showMessage({
          type: "danger",
          message: msg,
        });
  } finally {
    setLoadingPan(false);
  }
    });
};


  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      showMessage({ type: "danger", message: "Enter First Name" });
      return false;
    }

    if (!formData.lastName.trim()) {
      showMessage({ type: "danger", message: "Enter Last Name" });
      return false;
    }

    if (!dobValue) {
      showMessage({ type: "danger", message: "Select Date of Birth" });
      return false;
    }

    if (!formData.panNumber.trim()) {
      showMessage({ type: "danger", message: "Enter PAN Number" });
      return false;
    }

    if (!formData.pan_pic) {
      showMessage({ type: "danger", message: "Upload PAN Card" });
      return false;
    }

    return true;
  };

  const saveStep1AndNext = async () => {
    if (!validateStep1()) return;

    try {
      const payload = {
        franchiseeId,
        pan_number: (formData.panNumber || "").toUpperCase(),
        vendor_fname: formData.firstName || "",
        vendor_lname: formData.lastName || "",
        dob: formData.dob || "",
      };
      const resp = await stepByKey(payload);
      if (!resp?.data?.ok) throw new Error("Save failed");
      const id = resp?.data?.data?._id;
      if (id) {
        setFranchiseeId(id);
        await AsyncStorage.setItem("franchiseeId", id);
      }
      setStep(2);
      showMessage({
        type: "success",
        message: "✅ PAN uploaded successfully!",
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e?.response?.data?.message || e.message || "Save failed");
    }
  };

  // -------------------- Aadhaar (Step 2) --------------------
  const onAadhaarFront = async () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) return;

    setLoadingAFront(true);
    try {
        const fileUrl = await uploadDoc(asset.uri, asset.fileName, asset.type);
        const r = await stepByKey({
          franchiseeId,
          aadhar_pic_front: fileUrl,
        });
        const id = r?.data?.data?._id;
      if (id && !franchiseeId) {
        setFranchiseeId(id);
          await AsyncStorage.setItem("franchiseeId", id);
      }
    } catch (err) {
      console.error(err);
        Alert.alert("Error", "Aadhaar front upload failed");
    } finally {
      setLoadingAFront(false);
    }
    });
  };

  const onAadhaarBack = async () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) return;

    setLoadingABack(true);
    try {
        const fileUrl = await uploadDoc(asset.uri, asset.fileName, asset.type);
        const r = await stepByKey({
          franchiseeId,
          aadhar_pic_back: fileUrl,
        });
      const id = r?.data?.data?._id;
      if (id && !franchiseeId) {
        setFranchiseeId(id);
          await AsyncStorage.setItem("franchiseeId", id);
      }
    } catch (err) {
      console.error(err);
        Alert.alert("Error", "Aadhaar back upload failed");
    } finally {
      setLoadingABack(false);
    }
    });
  };
  const validateStep2 = () => {
    if (!franchiseeId) {
      showMessage({ type: "danger", message: "Complete Step 1 first" });
      return false;
    }

    if (!formData.aadharNumber.trim()) {
      showMessage({ type: "danger", message: "Enter Aadhaar Number" });
      return false;
    }

    if (!formData.register_street.trim()) {
      showMessage({ type: "danger", message: "Enter Street" });
      return false;
    }

    if (!formData.register_city.trim()) {
      showMessage({ type: "danger", message: "Enter City" });
      return false;
    }

    if (!formData.register_state.trim()) {
      showMessage({ type: "danger", message: "Enter State" });
      return false;
    }

    if (!formData.register_postalCode.trim()) {
      showMessage({ type: "danger", message: "Enter PIN Code" });
      return false;
    }

    return true;
  };

  const saveStep2AndNext = async () => {
    if (!validateStep2()) return;
    try {
      const aNumRaw = (formData.aadharNumber || "").replace(/\D/g, "");
      if (!aNumRaw) {
        Alert.alert("Error", "Missing Aadhaar number");
        return;
      }
      const r = await stepByKey({
          franchiseeId,
          aadhar_number: aNumRaw,
          register_business_address: {
            street: formData.register_street || "",
            city: formData.register_city || "",
            state: formData.register_state || "",
            country: formData.register_country || "India",
            postalCode: formData.register_postalCode || "",
          },
      });
      const id = r?.data?.data?._id;
      if (id && !franchiseeId) {
        setFranchiseeId(id);
        await AsyncStorage.setItem("franchiseeId", id);
      }
      showMessage({
        type: "success",
        message: "✅ Aadhaar uploaded successfully!",
      });

      setStep(3);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Save failed");
    }
  };

  // -------------------- GST (Step 3 — manual; file optional) --------------------
  const [gstFile, setGstFile] = useState(null);
  const onGstFileSelect = () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        setGstFile({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || "gst.jpg",
        });
      }
    });
  };

  const validateStep3 = () => {
    if (!gstFile) {
      showMessage({ type: "danger", message: "Upload GST Certificate" });
      return false;
    }

    if (!formData.gstNumber.trim()) {
      showMessage({ type: "danger", message: "Enter GST Number" });
      return false;
    }

    if (!formData.gstLegalName.trim()) {
      showMessage({ type: "danger", message: "Enter GST Legal Name" });
      return false;
    }

    if (!formData.constitution_of_business.trim()) {
      showMessage({ type: "danger", message: "Select Constitution of Business" });
      return false;
    }

    if (!formData.gst_floorNo.trim()) {
      showMessage({ type: "danger", message: "Enter Floor No." });
      return false;
    }

    if (!formData.gst_buildingNo.trim()) {
      showMessage({ type: "danger", message: "Enter Building/Flat No." });
      return false;
    }

    if (!formData.gst_street.trim()) {
      showMessage({ type: "danger", message: "Enter Street" });
      return false;
    }

    if (!formData.gst_locality.trim()) {
      showMessage({ type: "danger", message: "Enter Locality" });
      return false;
    }

    if (!formData.gst_district.trim()) {
      showMessage({ type: "danger", message: "Enter District" });
      return false;
    }

    if (!formData.gst_state.trim()) {
      showMessage({ type: "danger", message: "Enter State" });
      return false;
    }

    return true;
  };

  const saveGstAndNext = async () => {
    if (!validateStep3()) return;

    try {
      if (!franchiseeId) {
        Alert.alert("Error", "Missing franchiseeId. Complete Step 1 first.");
        return;
      }
      const fd = new FormData();
      fd.append("franchiseeId", franchiseeId);
      if (gstFile) {
        fd.append("document", {
          uri: gstFile.uri,
          type: gstFile.type || "image/jpeg",
          name: gstFile.name,
        });
      }
      fd.append("gst_number", (formData.gstNumber || "").toUpperCase());
      fd.append("gst_legal_name", formData.gstLegalName || "");
      fd.append("gst_constitution", formData.constitution_of_business || "");
      fd.append("gst_address[floorNo]", formData.gst_floorNo || "");
      fd.append("gst_address[buildingNo]", formData.gst_buildingNo || "");
      fd.append("gst_address[street]", formData.gst_street || "");
      fd.append("gst_address[locality]", formData.gst_locality || "");
      fd.append("gst_address[district]", formData.gst_district || "");

      setLoadingGST(true);
      const r = await axios.put(`${API_URL}/api/franchisees/gst`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!r?.data?.ok) throw new Error(r?.data?.message || "Save failed");
      setStep(4);

      showMessage({
        type: "success",
        message: "✅ GST uploaded successfully!",
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Save failed");
    } finally {
      setLoadingGST(false);
    }
  };

  // -------------------- Bank Details (Step 4) --------------------
  const [bankFile, setBankFile] = useState(null);
  const [bankData, setBankData] = useState({
    account_holder_name: "",
    account_no: "",
    ifcs_code: "",
    bank_name: "",
    branch_name: "",
    bank_address: "",
  });

  const onBankFileChange = () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        setBankFile({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || "bank.jpg",
        });
      }
    });
  };
  const validateStep4 = () => {
    if (!bankFile) {
      showMessage({ type: "danger", message: "Upload Cancelled Cheque or Bank Proof" });
      return false;
    }

    if (!bankData.account_holder_name.trim()) {
      showMessage({ type: "danger", message: "Enter Account Holder Name" });
      return false;
    }

    if (!bankData.account_no.trim()) {
      showMessage({ type: "danger", message: "Enter Account Number" });
      return false;
    }

    if (!bankData.ifcs_code.trim()) {
      showMessage({ type: "danger", message: "Enter IFSC Code" });
      return false;
    }

    if (!bankData.bank_name.trim()) {
      showMessage({ type: "danger", message: "Enter Bank Name" });
      return false;
    }

    if (!bankData.branch_name.trim()) {
      showMessage({ type: "danger", message: "Enter Branch Name" });
      return false;
    }

    if (!bankData.bank_address.trim()) {
      showMessage({ type: "danger", message: "Enter Bank Address" });
      return false;
    }

    return true;
  };

  const saveBankDetails = async () => {
    if (!validateStep4()) return;
    const fid = franchiseeId || (await AsyncStorage.getItem("franchiseeId"));
    if (!fid) {
      Alert.alert("Error", "Franchisee ID is required. Complete earlier steps first.");
      return;
    }
    const fd = new FormData();
    if (bankFile) {
      fd.append("document", {
        uri: bankFile.uri,
        type: bankFile.type || "image/jpeg",
        name: bankFile.name,
      });
    }
    fd.append("account_holder_name", bankData.account_holder_name || "");
    fd.append("account_no", bankData.account_no || "");
    fd.append("ifcs_code", (bankData.ifcs_code || "").toUpperCase());
    fd.append("bank_name", bankData.bank_name || "");
    fd.append("branch_name", bankData.branch_name || "");
    fd.append("bank_address", bankData.bank_address || "");

    try {
      const response = await axios.put(`${API_URL}/api/franchisees/${fid}/bank`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!response?.data?.ok)
        throw new Error(response?.data?.message || "Save failed");
      showMessage({
        type: "success",
        message: "✅Bank details saved successfully.",
      });

      setStep(5);
    } catch (error) {
      console.error("Error saving bank details:", error);
      Alert.alert("Error", "Failed to save bank details.");
    }
  };

  // -------------------- Outlet Details (Step 5) --------------------
  const [outlet, setOutlet] = useState({
    outlet_name: "",
    manager_name: "",
    manager_mobile: "",
    outlet_phone: "",
    street: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    postalCode: "",
    lat: "",
    lng: "",
  });
  const [outletImage, setOutletImage] = useState(null);

  const handleOutletImageChange = () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        setOutletImage({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || "outlet.jpg",
        });
      }
    });
  };

  const fetchLocation = () => {
    // Note: For React Native, you need to install and use @react-native-community/geolocation
    // For now, showing an alert to manually enter coordinates
    Alert.alert(
      "Location",
      "Please enter latitude and longitude manually, or install @react-native-community/geolocation for automatic location detection.",
      [{ text: "OK" }]
    );
    // Uncomment below when geolocation is installed:
    // import Geolocation from '@react-native-community/geolocation';
    // Geolocation.getCurrentPosition(
    //   (position) => {
    //     const { latitude, longitude } = position.coords;
    //     setOutlet((prev) => ({ ...prev, lat: String(latitude), lng: String(longitude) }));
    //     Alert.alert("Location Fetched", `Latitude: ${latitude}, Longitude: ${longitude}`);
    //   },
    //   (error) => {
    //     console.error("Error fetching location:", error);
    //     Alert.alert("Error", "Failed to fetch location. Please enable location services.");
    //   },
    //   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    // );
  };

  // ============ NEW: final submit helper ============
  const submitFranchiseApplication = async () => {
    const fid = franchiseeId || (await AsyncStorage.getItem("franchiseeId"));
    if (!fid) {
      Alert.alert("Error", "Missing franchiseeId");
      return;
    }
    const r = await axios.post(`${API_URL}/api/franchisees/submit`, {
      franchiseeId: fid,
    });
    if (!r?.data?.ok) throw new Error(r?.data?.message || "Submit failed");
  };
  // ===================================================
  const validateStep5 = () => {
    if (!outlet.outlet_name.trim()) {
      showMessage({ type: "danger", message: "Enter Outlet Name" });
      return false;
    }

    if (!outlet.manager_name.trim()) {
      showMessage({ type: "danger", message: "Enter Manager Name" });
      return false;
    }

    if (!outlet.manager_mobile.trim()) {
      showMessage({ type: "danger", message: "Enter Manager Mobile" });
      return false;
    }

    if (!outlet.outlet_phone.trim()) {
      showMessage({ type: "danger", message: "Enter Outlet Phone" });
      return false;
    }

    if (!outlet.street.trim()) {
      showMessage({ type: "danger", message: "Enter Outlet Street" });
      return false;
    }

    if (!outlet.city.trim()) {
      showMessage({ type: "danger", message: "Enter Outlet City" });
      return false;
    }

    if (!outlet.district.trim()) {
      showMessage({ type: "danger", message: "Enter District" });
      return false;
    }

    if (!outlet.state.trim()) {
      showMessage({ type: "danger", message: "Enter State" });
      return false;
    }

    if (!outlet.postalCode.trim()) {
      showMessage({ type: "danger", message: "Enter PIN Code" });
      return false;
    }

    if (!outlet.lat || !outlet.lng) {
      showMessage({ type: "danger", message: "Location Required — Use GPS button" });
      return false;
    }

    if (!outletImage) {
      showMessage({ type: "danger", message: "Upload Outlet Nameboard Image" });
      return false;
    }

    return true;
  };

  const saveOutletAndFinish = async () => {
    if (!validateStep5()) return;
    const fid = franchiseeId || (await AsyncStorage.getItem("franchiseeId"));
    if (!fid) {
      Alert.alert("Error", "Missing franchiseeId. Complete earlier steps first.");
      return;
    }

    const fd = new FormData();
    fd.append("franchiseeId", fid);
    fd.append("outlet_name", outlet.outlet_name);
    fd.append("outlet_manager_name", outlet.manager_name);
    fd.append("outlet_contact_no", outlet.manager_mobile);
    fd.append("outlet_phone_no", outlet.outlet_phone);
    fd.append("outlet_location[street]", outlet.street);
    fd.append("outlet_location[city]", outlet.city);
    fd.append("outlet_location[district]", outlet.district);
    fd.append("outlet_location[state]", outlet.state);
    fd.append("outlet_location[country]", outlet.country || "India");
    fd.append("outlet_location[postalCode]", outlet.postalCode);
    if (outlet.lat) fd.append("outlet_coords[lat]", outlet.lat);
    if (outlet.lng) fd.append("outlet_coords[lng]", outlet.lng);
    if (outletImage) {
      fd.append("outlet_nameboard_image", {
        uri: outletImage.uri,
        type: outletImage.type || "image/jpeg",
        name: outletImage.name,
      });
    }

    const r = await axios.put(`${API_URL}/api/franchisees/outlet`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!r?.data?.ok) throw new Error(r?.data?.message || "Save failed");

    showMessage({
      type: "success",
      message: "✅Outlet details saved!",
    });

    // ============ NEW: call final submit before redirect ============
    await submitFranchiseApplication();
    // ===============================================================

    Alert.alert(
      "Success!",
      "Your franchisee application has been submitted successfully. We will review it and get back to you soon.",
      [
        {
          text: "OK",
          onPress: () => {
            if (safeNavigation && safeNavigation.goBack) {
              safeNavigation.goBack();
            }
          },
        },
      ]
    );
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDobValue(selectedDate);
      setFormData((p) => ({
        ...p,
        dob: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Franchisee Owner Registration</Text>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step {step} of 5</Text>
      </View>

      {step === 1 && (
        <View style={styles.stepContainer}>
          <TouchableOpacity onPress={() => safeNavigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 1: PAN Card Details</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, firstName: text }))
                }
                placeholder="Enter First Name"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Surname (Last Name)</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, lastName: text }))
                }
                placeholder="Enter Last Name"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text>
                  {dobValue
                    ? dobValue.toLocaleDateString("en-GB")
                    : "Select Date of Birth"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dobValue || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                />
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>PAN Number</Text>
              <TextInput
                style={styles.input}
                value={formData.panNumber}
                onChangeText={(text) =>
                  setFormData((p) => ({
                    ...p,
                    panNumber: text.toUpperCase(),
                  }))
                }
                placeholder="Enter PAN Number"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>Upload PAN (JPG, JPEG, PNG, PDF)</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onPanUpload}
              disabled={loadingPan}
            >
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>
            {loadingPan && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#008080" />
                <Text>Uploading PAN…</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveStep1AndNext}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Icon name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 2: Aadhaar Details</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, firstName: text }))
                }
                placeholder="Enter First Name"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Surname (Last Name)</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, lastName: text }))
                }
                placeholder="Enter Last Name"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>DOB (DD/MM/YYYY)</Text>
              <TextInput
                style={styles.input}
                value={formData.dob}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, dob: text }))
                }
                placeholder="DD/MM/YYYY"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Aadhaar Number</Text>
              <TextInput
                style={styles.input}
                value={formData.aadharNumber}
                onChangeText={(text) =>
                  setFormData((p) => ({
                    ...p,
                    aadharNumber: fmtAadhaarUI(text),
                  }))
                }
                placeholder="Enter Aadhaar Number"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street</Text>
            <TextInput
              style={styles.input}
              value={formData.register_street}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, register_street: text }))
              }
              placeholder="Enter Street"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.col, { flex: 1 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.register_city}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, register_city: text }))
                }
                placeholder="Enter City"
              />
            </View>
            <View style={[styles.col, { flex: 1 }]}>
              <Text style={styles.label}>State/UT</Text>
              <TextInput
                style={styles.input}
                value={formData.register_state}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, register_state: text }))
                }
                placeholder="Enter State"
              />
            </View>
            <View style={[styles.col, { flex: 1 }]}>
              <Text style={styles.label}>PIN</Text>
              <TextInput
                style={styles.input}
                value={formData.register_postalCode}
                onChangeText={(text) =>
                  setFormData((p) => ({
                    ...p,
                    register_postalCode: text,
                  }))
                }
                placeholder="Enter PIN"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>Upload Aadhaar Front</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onAadhaarFront}
              disabled={loadingAFront}
            >
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>
            {loadingAFront && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#008080" />
                <Text>Uploading…</Text>
              </View>
            )}
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>Upload Aadhaar Back</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onAadhaarBack}
              disabled={loadingABack}
            >
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>
            {loadingABack && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#008080" />
                <Text>Uploading…</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveStep2AndNext}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContainer}>
          <TouchableOpacity onPress={() => setStep(2)}>
            <Icon name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 3: GST Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GST Number</Text>
            <TextInput
              style={styles.input}
              value={formData.gstNumber}
              onChangeText={(text) =>
                setFormData((p) => ({
                  ...p,
                  gstNumber: text.toUpperCase(),
                }))
              }
              placeholder="Enter GST Number"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>Upload GST Certificate</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onGstFileSelect}
              disabled={loadingGST}
            >
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>
            {loadingGST && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#008080" />
                <Text>Saving GST…</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Legal Name</Text>
            <TextInput
              style={styles.input}
              value={formData.gstLegalName}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gstLegalName: text }))
              }
              placeholder="Enter Legal Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Constitution of Business</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.constitution_of_business}
                onValueChange={(itemValue) =>
                  setFormData((p) => ({
                    ...p,
                    constitution_of_business: itemValue,
                  }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Select Constitution" value="" />
                {constitutionOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.label}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Floor No.</Text>
            <TextInput
              style={styles.input}
              value={formData.gst_floorNo}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gst_floorNo: text }))
              }
              placeholder="Enter Floor No."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Building/Flat No.</Text>
            <TextInput
              style={styles.input}
              value={formData.gst_buildingNo}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gst_buildingNo: text }))
              }
              placeholder="Enter Building/Flat No."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Road/Street</Text>
            <TextInput
              style={styles.input}
              value={formData.gst_street}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gst_street: text }))
              }
              placeholder="Enter Road/Street"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Locality/Sub-locality</Text>
            <TextInput
              style={styles.input}
              value={formData.gst_locality}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gst_locality: text }))
              }
              placeholder="Enter Locality"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              value={formData.gst_district}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gst_district: text }))
              }
              placeholder="Enter District"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={formData.gst_state}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, gst_state: text }))
              }
              placeholder="Enter State"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveGstAndNext}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 4 && (
        <View style={styles.stepContainer}>
          <TouchableOpacity onPress={() => setStep(3)}>
            <Icon name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 4: Bank Details</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                value={bankData.account_holder_name}
                onChangeText={(text) =>
                  setBankData((p) => ({
                    ...p,
                    account_holder_name: text,
                  }))
                }
                placeholder="Enter Account Holder Name"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={bankData.account_no}
                onChangeText={(text) =>
                  setBankData((p) => ({ ...p, account_no: text }))
                }
                placeholder="Enter Account Number"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                value={bankData.ifcs_code}
                onChangeText={(text) =>
                  setBankData((p) => ({
                    ...p,
                    ifcs_code: text.toUpperCase(),
                  }))
                }
                placeholder="Enter IFSC Code"
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                value={bankData.bank_name}
                onChangeText={(text) =>
                  setBankData((p) => ({ ...p, bank_name: text }))
                }
                placeholder="Enter Bank Name"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Branch</Text>
              <TextInput
                style={styles.input}
                value={bankData.branch_name}
                onChangeText={(text) =>
                  setBankData((p) => ({ ...p, branch_name: text }))
                }
                placeholder="Enter Branch Name"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Bank Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bankData.bank_address}
                onChangeText={(text) =>
                  setBankData((p) => ({ ...p, bank_address: text }))
                }
                placeholder="Enter Bank Address"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>
              Upload Cancelled Cheque or Bank Letter
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onBankFileChange}
            >
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveBankDetails}
            >
              <Text style={styles.saveButtonText}>Save Bank Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 5 && (
        <View style={styles.stepContainer}>
          <TouchableOpacity onPress={() => setStep(4)}>
            <Icon name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 5: Outlet Details</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Outlet Name</Text>
              <TextInput
                style={styles.input}
                value={outlet.outlet_name}
                onChangeText={(text) =>
                  setOutlet((p) => ({ ...p, outlet_name: text }))
                }
                placeholder="Enter Outlet Name"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Manager Name</Text>
              <TextInput
                style={styles.input}
                value={outlet.manager_name}
                onChangeText={(text) =>
                  setOutlet((p) => ({ ...p, manager_name: text }))
                }
                placeholder="Enter Manager Name"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Manager Mobile</Text>
              <TextInput
                style={styles.input}
                value={outlet.manager_mobile}
                onChangeText={(text) =>
                  setOutlet((p) => ({ ...p, manager_mobile: text }))
                }
                placeholder="Enter Manager Mobile"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Outlet Phone</Text>
              <TextInput
                style={styles.input}
                value={outlet.outlet_phone}
                onChangeText={(text) =>
                  setOutlet((p) => ({ ...p, outlet_phone: text }))
                }
                placeholder="Enter Outlet Phone"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
                placeholder="Street"
                value={outlet.street}
              onChangeText={(text) =>
                setOutlet((p) => ({ ...p, street: text }))
              }
            />
            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                    placeholder="City"
                    value={outlet.city}
                  onChangeText={(text) =>
                    setOutlet((p) => ({ ...p, city: text }))
                  }
                />
              </View>
              <View style={[styles.col, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                    placeholder="District"
                    value={outlet.district}
                  onChangeText={(text) =>
                    setOutlet((p) => ({ ...p, district: text }))
                  }
                />
              </View>
              <View style={[styles.col, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                    placeholder="State"
                    value={outlet.state}
                  onChangeText={(text) =>
                    setOutlet((p) => ({ ...p, state: text }))
                  }
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                    placeholder="Country"
                    value={outlet.country}
                  onChangeText={(text) =>
                    setOutlet((p) => ({ ...p, country: text }))
                  }
                />
              </View>
              <View style={[styles.col, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                    placeholder="PIN"
                    value={outlet.postalCode}
                  onChangeText={(text) =>
                    setOutlet((p) => ({ ...p, postalCode: text }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={outlet.lat}
                onChangeText={(text) =>
                  setOutlet((p) => ({ ...p, lat: text }))
                }
                placeholder="Latitude"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={outlet.lng}
                onChangeText={(text) =>
                  setOutlet((p) => ({ ...p, lng: text }))
                }
                placeholder="Longitude"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={fetchLocation}
            >
              <Text style={styles.locationButtonText}>Use current location</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>Outlet Nameboard Image</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleOutletImageChange}
            >
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveOutletAndFinish}
            >
              <Text style={styles.saveButtonText}>Save Outlet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stepIndicator: {
    alignItems: "center",
    marginBottom: 16,
    padding: 8,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 2,
    borderColor: "#008080",
    maxWidth: 700,
    alignSelf: "center",
    width: "100%",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#008080",
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  col: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: "#008080",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#81C784",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  locationButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});
