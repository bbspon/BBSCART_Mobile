import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "https://bbscart.com/api";

export default function DeliverToModal({ visible, onDone }) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const validate = (v) => /^\d{6}$/.test(v);

  const handleSubmit = async () => {
    if (!validate(pincode)) {
      setMsg("Enter a valid 6-digit pincode");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      // save pincode
      await AsyncStorage.setItem("deliveryPincode", pincode);

      // assign vendor (same as website)
      const res = await axios.post(`${API_BASE}/geo/assign`, {
        pincode,
        customerId: null,
      });

      await AsyncStorage.setItem(
        "assignedStore",
        JSON.stringify(res.data)
      );

      onDone?.(pincode);
    } catch (err) {
      setMsg(
        err?.response?.data?.message ||
          "Service not available for this pincode"
      );
      await AsyncStorage.removeItem("deliveryPincode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Deliver To</Text>

          <TextInput
            value={pincode}
            onChangeText={(v) => setPincode(v.replace(/\D/g, ""))}
            maxLength={6}
            keyboardType="numeric"
            placeholder="Enter 6-digit pincode"
            style={styles.input}
          />

          {msg ? <Text style={styles.msg}>{msg}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.btn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Set Pincode</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
    backgroundColor: "#FFAE5F",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  msg: {
    textAlign: "center",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#C2410C",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
