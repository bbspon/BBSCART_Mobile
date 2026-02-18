import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";

const API_BASE = "https://thiaworld.bbscart.com/api";

const ContactUs = () => {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert("Required", "Please fill name, email and message");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        `${API_BASE}/contact`,
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Your message has been sent!");

      setForm({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.log("Contact API Error", error?.response?.data || error.message);
      Alert.alert("Error", "Unable to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* Heading */}
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.subtitle}>
        Have a question, concern, or feedback? We’d love to hear from you.
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.name}
          onChangeText={(text) => handleChange("name", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(text) => handleChange("phone", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Select Subject"
          value={form.subject}
          onChangeText={(text) => handleChange("subject", text)}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Your Message"
          multiline
          numberOfLines={4}
          value={form.message}
          onChangeText={(text) => handleChange("message", text)}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Sending..." : "Send Message"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📞 +91 413 291 5916</Text>
        <Text style={styles.infoText}>📞 +91 96007 29596</Text>
        <Text style={styles.infoText}>📧 info@bbscart.com</Text>
        <Text style={styles.infoText}>
          📍 Address: No.7, II Floor, Bharathy Street, Ist Cross, Anna Nagar
          Extension, Puducherry – 605005.
        </Text>
        <Text style={styles.infoText}>
          ⏰ Working Hours: Mon–Sat, 10:00 AM – 7:00 PM
        </Text>
      </View>

      {/* Links */}
      <View style={styles.links}>
        <TouchableOpacity>
          <Text style={styles.linkText}>Go to FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.linkText}>Book an Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* Trust Badges */}
      <View style={styles.badges}>
        <Text style={styles.badge}>✅ BIS Certified Jewelry</Text>
        <Text style={styles.badge}>🔒 Verified by Golddex Secure Plan</Text>
      </View>

      {/* Privacy Note */}
      <Text style={styles.privacy}>
        🔐 Your information is safe and encrypted. We respect your privacy.
      </Text>
    </ScrollView>
  );
};

export default ContactUs;

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf5",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#8B0000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },
  form: {
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#b22222",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  infoBox: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  links: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  linkText: {
    fontSize: 15,
    color: "#8B0000",
    fontWeight: "600",
  },
  badges: {
    marginBottom: 15,
    alignItems: "center",
  },
  badge: {
    fontSize: 14,
    color: "#228B22",
    marginVertical: 3,
  },
  privacy: {
    fontSize: 13,
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 30,
  },
});
