import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const sampleDownloads = [
  {
    id: 1,
    title: "Terms & Conditions - v2.1",
    category: "Legal",
    fileType: "pdf",
    size: "1.2 MB",
    uploadDate: "2025-07-25",
    version: "2.1",
    description: "Latest terms and conditions document.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewSupported: true,
    downloadCount: 256,
  },
  {
    id: 2,
    title: "Corporate Wellness Brochure",
    category: "Corporate Wellness",
    fileType: "pdf",
    size: "3.4 MB",
    uploadDate: "2025-06-15",
    version: "1.0",
    description: "Comprehensive wellness program brochure.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewSupported: true,
    downloadCount: 112,
  },
  {
    id: 3,
    title: "Agent Onboarding Form",
    category: "Forms",
    fileType: "docx",
    size: "450 KB",
    uploadDate: "2025-05-10",
    version: "3.0",
    description: "Form for agent registration and onboarding.",
    url: "https://file-examples.com/storage/fe86c/documents/docx/file-sample_100kB.docx",
    previewSupported: false,
    downloadCount: 78,
  },
];

const categories = ["All", "Legal", "Corporate Wellness", "Forms"];

export default function DownloadsPage() {
  const insets = useSafeAreaInsets();
  const [downloads] = useState(sampleDownloads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const filteredDownloads = downloads.filter((file) => {
    const categoryMatch =
      selectedCategory === "All" || file.category === selectedCategory;

    const searchMatch =
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const openPreview = (file) => {
    if (!file.previewSupported) {
      Alert.alert("Preview Not Available", "This file cannot be previewed.");
      return;
    }

    setLoadingPreview(true);

    setTimeout(() => {
      setPreviewFile(file);
      setLoadingPreview(false);
    }, 400);
  };

  const handleDownload = async (file) => {
    try {
      const supported = await Linking.canOpenURL(file.url);

      if (!supported) {
        Alert.alert("Error", "Cannot open download link.");
        return;
      }

      Linking.openURL(file.url);

      Alert.alert("Download Started", file.title);
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Download Failed", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Downloads</Text>

      <TextInput
        style={styles.input}
        placeholder="Search downloads..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={
                selectedCategory === cat
                  ? styles.categoryTextActive
                  : styles.categoryText
              }
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ marginTop: 10 }}
        contentContainerStyle={{
          paddingBottom: 24 + Math.max(12, insets.bottom),
        }}
      >
        {filteredDownloads.map((file) => (
          <View key={file.id} style={styles.fileCard}>
            <Text style={styles.fileTitle}>{file.title}</Text>
            <Text style={styles.fileDesc}>{file.description}</Text>

            <View style={styles.actionRow}>
              {file.previewSupported && (
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => openPreview(file)}
                >
                  <Text style={styles.outlineBtnText}>Preview</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => handleDownload(file)}
              >
                <Text style={styles.primaryBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!previewFile} animationType="slide">
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {previewFile?.title} Preview
            </Text>

            <TouchableOpacity onPress={() => setPreviewFile(null)}>
              <Text style={{ color: "red" }}>Close</Text>
            </TouchableOpacity>
          </View>

          {loadingPreview ? (
            <ActivityIndicator size="large" style={{ marginTop: 50 }} />
          ) : (
            <WebView source={{ uri: previewFile?.url }} style={{ flex: 1 }} />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007bff",
    marginRight: 8,
  },

  categoryBtnActive: { backgroundColor: "#007bff" },

  categoryText: { color: "#007bff" },
  categoryTextActive: { color: "#fff" },

  fileCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },

  fileTitle: { fontSize: 16, fontWeight: "bold" },
  fileDesc: { color: "#555", marginVertical: 4 },

  actionRow: { flexDirection: "row", marginTop: 6 },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },

  outlineBtnText: { color: "#007bff", fontSize: 12 },

  primaryBtn: {
    backgroundColor: "#007bff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  primaryBtnText: { color: "#fff", fontSize: 12 },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  modalTitle: { fontSize: 16, fontWeight: "bold" },
});