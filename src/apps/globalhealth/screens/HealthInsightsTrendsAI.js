// HealthInsightsTrendsAI.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import Voice from "@react-native-voice/voice";

// Screen width for charts
const screenWidth = Dimensions.get("window").width;

const mockTrends = [
  { month: "Jan", trendType: "Steps", value: 5000 },
  { month: "Jan", trendType: "Calories", value: 2000 },
  { month: "Feb", trendType: "Steps", value: 6000 },
  { month: "Feb", trendType: "Calories", value: 2100 },
  { month: "Mar", trendType: "Steps", value: 5500 },
  { month: "Mar", trendType: "Calories", value: 1900 },
];

const HealthInsightsTrendsAI = () => {
  const insets = useSafeAreaInsets();
  const [trends, setTrends] = useState([]);
  const [voiceInput, setVoiceInput] = useState("");
  const [showBooking, setShowBooking] = useState(false);

  // Fetch trends (mock for now)
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setTrends(mockTrends);
    }, 500);

    // Voice setup
    Voice.onSpeechResults = (event) => {
      setVoiceInput(event.value[0]);
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleVoiceInput = async () => {
    try {
      await Voice.start("en-IN");
    } catch (e) {
      console.error(e);
    }
  };

  // Build chart data safely
  const labels = trends.length
    ? [...new Set(trends.map((t) => t.month))]
    : ["Jan", "Feb", "Mar"];

  const trendTypes = trends.length
    ? [...new Set(trends.map((t) => t.trendType))]
    : ["Steps", "Calories"];

  const datasets =
    trendTypes.length > 0
      ? trendTypes.map((type, idx) => ({
          data: labels.map(
            (month) =>
              trends.find((t) => t.month === month && t.trendType === type)
                ?.value || 0
          ),
          color: () =>
            ["#dc3545", "#0d6efd", "#198754", "#ffc107", "#6f42c1"][idx],
          strokeWidth: 2,
        }))
      : [
          {
            data: [0, 0, 0],
            color: () => "#0d6efd",
            strokeWidth: 2,
          },
        ];

  const chartData = { labels, datasets };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>
        🌠 Health Insights Trends (Live from AI Engine)
      </Text>

      {/* Graph */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>📊 Monthly Health Trends</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          }}
          bezier
          style={{ borderRadius: 8 }}
        />
      </View>

      {/* AI Coach */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🧠 AI Lifestyle Coach</Text>
        <TextInput
          style={styles.input}
          placeholder="Ask something..."
          value={voiceInput}
          editable={false}
        />
        <View style={{ flexDirection: "row", marginTop: 8, justifyContent: "space-around" }}>
          <TouchableOpacity style={styles.button} onPress={handleVoiceInput}>
            <Text style={styles.buttonText}>🎤 Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert("Meal Upload", "Feature coming soon")}
          >
            <Text style={styles.buttonText}>📷 Upload Meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking */}
      {showBooking && (
        <View style={styles.modal}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Book Appointment at ABC Hospital
          </Text>
          <TouchableOpacity
            style={[styles.button, { marginTop: 8 }]}
            onPress={() => {
              Alert.alert("Booked ✅");
              setShowBooking(false);
            }}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Button */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => setShowBooking(true)}
      >
        <Text style={styles.buttonText}>Download Health Summary PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 16 ,textAlign: "center"},
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#e9ecef",
  },
  button: {
    backgroundColor: "#0d6efd",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff",
     fontWeight: "bold" },
  modal: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 5,
    marginVertical: 16,
  },
});

export default HealthInsightsTrendsAI;
