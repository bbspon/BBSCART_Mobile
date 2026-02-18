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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { showMessage } from "react-native-flash-message";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_URL = "https://bbscart.com";

// Real API functions - replaced mock functions
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

/** ------------------------------
 * BPC ID generator helpers
 * TH{STATE}{CITY}{DDMMYY}{NNNNN}
 * STATE = first 2 letters of register_state (uppercased, A–Z only)
 * CITY  = first 2 letters of register_city  (uppercased, A–Z only)
 * DATE  = today DDMMYY
 * NNNNN = from backend /next-seq if present; else fallback (stable per day)
 * ------------------------------ */
const to2 = (txt = "") => (txt.replace(/[^A-Za-z]/g, "").toUpperCase() + "XX").slice(0, 2);
const pad5 = (n) => String(Math.max(0, Number(n) || 0)).padStart(5, "0");
const todayDDMMYY = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};
/** fallback run-number that’s deterministic for a given (state, city, date) */
const fallbackRun = (state2, city2, ddmmyy) => {
  const seed = `${state2}${city2}${ddmmyy}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pad5((hash % 99999) + 1);
};

export default function TerritoryHeadForm({ navigation: propNavigation }) {
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
  const [dobValue, setDobValue] = useState(null);

  const [step, setStep] = useState(1);
  const [territoryHeadId, setTerritoryHeadId] = useState("");

  // NEW: store generated BPC ID and show in UI (Step 2)
  const [bpcId, setBpcId] = useState("");

  // Load territoryHeadId and bpcId from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const id = await AsyncStorage.getItem("territoryHeadId");
        if (id) setTerritoryHeadId(id);
        const storedBpc = await AsyncStorage.getItem("bpcId");
        if (storedBpc) setBpcId(storedBpc);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // Loading flags for uploads/saves
  const [loadingPan, setLoadingPan] = useState(false);
  const [loadingAFront, setLoadingAFront] = useState(false);
  const [loadingABack, setLoadingABack] = useState(false);
  const [loadingGST, setLoadingGST] = useState(false);

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
  });

  const fmtAadhaarUI = (digits) =>
    (digits || "")
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  // Real upload helper - uses API
  const uploadDoc = async (fileUri, fileName, fileType) => {
    try {
      const fd = new FormData();
      fd.append("document", {
        uri: fileUri,
        type: fileType || "image/jpeg",
        name: fileName || "document.jpg",
      });
      const { data } = await axios.post(`${API_URL}/api/territory-heads/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!data?.ok || !data?.fileUrl) throw new Error("Upload failed");
      return data.fileUrl;
    } catch (err) {
      console.error("uploadDoc error:", err.message || err);
      throw err;
    }
  };

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
        const fileUrl = await uploadDoc(asset.uri, asset.fileName, asset.type);
        const r = await axios.post(`${API_URL}/api/territory-heads/step-by-key`, {
          territoryHeadId,
          pan_pic: fileUrl,
        });
        console.log("Territory Head submit response:", r.data);

        const id = r?.data?.data?._id;
        if (id && !territoryHeadId) {
          setTerritoryHeadId(id);
          await AsyncStorage.setItem("territoryHeadId", id);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "PAN upload failed");
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

    if (!territoryHeadId) {
      showMessage({ type: "danger", message: "Upload PAN Card before continuing" });
      return false;
    }

    return true;
  };

  const saveStep1AndNext = async () => {
    if (!validateStep1()) return;
    try {
      const payload = {
        territoryHeadId,
        pan_number: (formData.panNumber || "").toUpperCase(),
        vendor_fname: formData.firstName || "",
        vendor_lname: formData.lastName || "",
        dob: dobValue ? dobValue.toISOString().split("T")[0] : "",
      };
      const resp = await axios.post(`${API_URL}/api/territory-heads/step-by-key`, payload);
      if (!resp?.data?.ok) throw new Error("Save failed");
      const id = resp?.data?.data?._id;
      if (id) {
        setTerritoryHeadId(id);
        await AsyncStorage.setItem("territoryHeadId", id);
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
        const r = await axios.post(`${API_URL}/api/territory-heads/step-by-key`, {
          territoryHeadId,
          aadhar_pic_front: fileUrl,
        });
        const id = r?.data?.data?._id;
        if (id && !territoryHeadId) {
          setTerritoryHeadId(id);
          await AsyncStorage.setItem("territoryHeadId", id);
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
        const r = await axios.post(`${API_URL}/api/territory-heads/step-by-key`, {
          territoryHeadId,
          aadhar_pic_back: fileUrl,
        });
        const id = r?.data?.data?._id;
        if (id && !territoryHeadId) {
          setTerritoryHeadId(id);
          await AsyncStorage.setItem("territoryHeadId", id);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Aadhaar back upload failed");
      } finally {
        setLoadingABack(false);
      }
    });
  };

  /** NEW: Generate bpcId as soon as we have City/State (Step 2) */
  const maybeGenerateBpcId = async () => {
    const state2 = to2(formData.register_state);
    const city2 = to2(formData.register_city);
    if (!state2.trim() || !city2.trim()) return;

    const ddmmyy = todayDDMMYY();

    // Try server counter first (recommended). Fallback if not present.
    let run = "";
    try {
      const url = `${API_URL}/api/territory-heads/next-seq?state=${encodeURIComponent(
        state2
      )}&city=${encodeURIComponent(city2)}&date=${encodeURIComponent(ddmmyy)}`;
      const r = await axios.get(url);
      // expect { ok:true, next: 12 } or { next:"00012" }
      const next = r?.data?.next;
      run = typeof next === "number" ? pad5(next) : pad5(next);
    } catch {
      run = fallbackRun(state2, city2, ddmmyy);
    }

    const code = `TH${state2}${city2}${ddmmyy}${run}`;
    setBpcId(code);
    await AsyncStorage.setItem("bpcId", code);
  };

  /** Auto-generate when state/city changes (Step 2 screen) */
  useEffect(() => {
    if (step === 2) {
      maybeGenerateBpcId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, formData.register_state, formData.register_city]);
  const validateStep2 = () => {
    if (!territoryHeadId) {
      showMessage({ type: "danger", message: "Complete Step 1 first (PAN)" });
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

      // ensure we have bpcId ready before save
      if (!bpcId) await maybeGenerateBpcId();

      const r = await axios.post(`${API_URL}/api/territory-heads/step-by-key`, {
        territoryHeadId,
        // NEW: persist codes
        bpcId,                 // new key kept for clarity in UI/CRM
        bpc: bpcId,            // stored under `bpc` as well (dashboards already use `bpc`)
        // keep existing fields
        aadhar_number: aNumRaw,
        register_business_address: {
          street: formData.register_street || "",
          city: formData.register_city || "",
          state: formData.register_state || "",
          country: formData.register_country || "India",
          postalCode: formData.register_postalCode || "",
        },
        // (Optional) also store short codes – helpful for CRM joins
        stateCode: to2(formData.register_state),
        cityCode: to2(formData.register_city),
        joinedDate: new Date().toISOString(), // useful default
      });
      const id = r?.data?.data?._id;
      if (id && !territoryHeadId) {
        setTerritoryHeadId(id);
        await AsyncStorage.setItem("territoryHeadId", id);
      }
      showMessage({
        type: "success",
        message: "✅ Aadhaar & BPC ID saved!",
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
      showMessage({ type: "danger", message: "Enter GST State" });
      return false;
    }

    return true;
  };

  const saveGstAndNext = async () => {
    if (!validateStep3()) return;
    try {
      if (!territoryHeadId) {
        Alert.alert("Error", "Missing territoryHeadId. Complete Step 1 first.");
        return;
      }
      setLoadingGST(true);
      const fd = new FormData();
      fd.append("territoryHeadId", territoryHeadId);
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
      fd.append("gst_address[state]", formData.gst_state || "");

      const r = await axios.put(`${API_URL}/api/territory-heads/gst`, fd, {
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
      showMessage({ type: "danger", message: "Upload Cancelled Cheque or Bank Letter" });
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
    const tid = territoryHeadId || (await AsyncStorage.getItem("territoryHeadId"));
    if (!tid) {
      Alert.alert("Error", "Territory Head ID is required. Complete earlier steps first.");
      return;
    }
    try {
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

      const response = await axios.put(`${API_URL}/api/territory-heads/${tid}/bank`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!response?.data?.ok)
        throw new Error(response?.data?.message || "Save failed");
      showMessage({
        type: "success",
        message: "✅ Bank uploaded successfully!",
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOutlet((prev) => ({ ...prev, lat: String(latitude), lng: String(longitude) }));
          Alert.alert(
            "Location Fetched",
            `Latitude: ${latitude}, Longitude: ${longitude}`
          );
        },
        (error) => {
          console.error("Error fetching location:", error);
          Alert.alert("Error", "Failed to fetch location. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert("Error", "Geolocation is not supported on this device.");
    }
  };

  const submitTerritoryApplication = async () => {
    const tid = territoryHeadId || (await AsyncStorage.getItem("territoryHeadId"));
    if (!tid) {
      Alert.alert("Error", "Missing territoryHeadId");
      return;
    }
    const r = await axios.post(`${API_URL}/api/territory-heads/register`, {
      territoryHeadId: tid,
    });
    if (!r?.data?.ok) throw new Error(r?.data?.message || "Submit failed");
  };
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
      showMessage({ type: "danger", message: "Enter Street" });
      return false;
    }

    if (!outlet.city.trim()) {
      showMessage({ type: "danger", message: "Enter City" });
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
      showMessage({ type: "danger", message: "Location Required — Click 'Use current location'" });
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
    const tid = territoryHeadId || (await AsyncStorage.getItem("territoryHeadId"));
    if (!tid) {
      Alert.alert("Error", "Missing territoryHeadId. Complete earlier steps first.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("territoryHeadId", tid);
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

      const r = await axios.put(`${API_URL}/api/territory-heads/outlet`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!r?.data?.ok) throw new Error(r?.data?.message || "Save failed");
      showMessage({
        type: "success",
        message: "✅ Outlet uploaded successfully!",
      });

      console.log("Territory Head submit id:", tid);

      try {
        await submitTerritoryApplication();
      } catch (e) {
        console.error(e);
        Alert.alert("Error", e?.response?.data?.message || e.message || "Submit failed");
        return;
      }
      await AsyncStorage.removeItem("territoryHeadId");
      await AsyncStorage.removeItem("bpcId");
      Alert.alert(
        "Success!",
        "Your territory head application has been submitted successfully. We will review it and get back to you soon.",
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
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e?.response?.data?.message || e.message || "Save failed");
    }
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
      <Text style={styles.title}>Territory Head Owner Registration</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BPC ID (Auto)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={bpcId}
              editable={false}
              placeholder="Auto-generated"
            />
            <Text style={styles.helperText}>
              Format: TH{`{STATE}`}{`{CITY}`}{`{DDMMYY}`}{`{NNNNN}`}
            </Text>
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
  readOnlyInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: -8,
    marginBottom: 8,
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
