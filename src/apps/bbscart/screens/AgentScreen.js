// AgentScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// ---------- Sample Data ----------
const tasksData = [
  { id: "1", title: "Visit Client A", status: "Pending", due: "Today", priority: "High" },
  { id: "2", title: "Collect Payment", status: "Completed", due: "Yesterday", priority: "Medium" },
  { id: "3", title: "Inventory Check", status: "Pending", due: "Today", priority: "High" },
];

const kpiData = [
  { title: "Tasks Completed", value: 12 },
  { title: "Pending Tasks", value: 5 },
  { title: "Today's Visits", value: 3 },
  { title: "Sales Target", value: "$5,000" },
];

// ---------- Agent Screen ----------
const AgentScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState(tasksData);
  const [searchText, setSearchText] = useState("");

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const markTaskComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status: "Completed" } : task
      )
    );
    Alert.alert("Task Completed", "Task has been marked as completed!");
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskMeta}>
          Status: {item.status} | Due: {item.due} | Priority: {item.priority}
        </Text>
      </View>
      {item.status !== "Completed" && (
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => markTaskComplete(item.id)}
        >
          <Text style={styles.completeBtnText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Agent Dashboard</Text>
        <Text style={styles.subHeader}>
          Manage your tasks, leads & territory efficiently
        </Text>
      </View>

      {/* KPI Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiContainer}>
        {kpiData.map((kpi, index) => (
          <View key={index} style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiTitle}>{kpi.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks or customers..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Tasks List */}
      <Text style={styles.sectionHeader}>Tasks & Leads</Text>
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* Quick Actions */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Add Task", "Navigate to Add Task Screen")}
        >
          <Text style={styles.actionBtnText}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Map", "Open Territory Map")}
        >
          <Text style={styles.actionBtnText}>Territory Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Customers", "Open Customer List")}
        >
          <Text style={styles.actionBtnText}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Reports", "Open Performance Reports")}
        >
          <Text style={styles.actionBtnText}>Performance</Text>
        </TouchableOpacity>
      </View>

      {/* Advanced / Future Features Placeholder */}
      <Text style={styles.sectionHeader}>Advanced Features (Future)</Text>
      <View style={styles.advancedContainer}>
        <Text style={styles.advancedText}>• AI Assistance for task prioritization</Text>
        <Text style={styles.advancedText}>• Gamification: Badges, Leaderboards</Text>
        <Text style={styles.advancedText}>• Wallet & Commission Tracking</Text>
        <Text style={styles.advancedText}>• Document Upload & Management</Text>
        <Text style={styles.advancedText}>• Geo-Tracking & Attendance</Text>
        <Text style={styles.advancedText}>• Offline Sync & Smart Notifications</Text>
        <Text style={styles.advancedText}>• Multi-language & Accessibility Support</Text>
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
  kpiContainer: { marginVertical: 12 },
  kpiCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    width: 140,
  },
  kpiValue: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  kpiTitle: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginVertical: 12 },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  taskMeta: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  completeBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completeBtnText: { color: "#fff", fontWeight: "bold" },
  quickActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "bold" },
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
  advancedText: { fontSize: 14, color: "#1f2937", marginBottom: 8 },
});

export default AgentScreen;
