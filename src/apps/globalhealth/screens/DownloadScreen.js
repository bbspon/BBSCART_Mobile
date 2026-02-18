// DownloadsPage.js
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Sample downloads data
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
    url: "https://example.com/terms_conditions_v2.1.pdf",
    previewSupported: true,
    languages: ["English", "Hindi"],
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
    url: "https://example.com/wellness_brochure.pdf",
    previewSupported: true,
    languages: ["English"],
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
    url: "https://example.com/agent_onboarding_form.docx",
    previewSupported: false,
    languages: ["English"],
    downloadCount: 78,
  },
];

const categories = [
  "All",
  "Legal",
  "Corporate Wellness",
  "Forms",
  "Reports",
  "User Guides",
  "Marketing Materials",
];

export default function DownloadsPage() {
  const insets = useSafeAreaInsets();
  const [downloads] = useState(sampleDownloads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Filtered downloads
  const filteredDownloads = downloads.filter((file) => {
    const categoryMatch =
      selectedCategory === "All" || file.category === selectedCategory;
    const searchMatch =
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Open preview
  const openPreview = (file) => {
    if (!file.previewSupported) {
      alert("Preview not supported for this file type.");
      return;
    }
    setLoadingPreview(true);
    setTimeout(() => {
      setPreviewFile(file);
      setLoadingPreview(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Downloads</Text>
      <Text style={styles.subText}>
        Access all important documents, forms, brochures, and reports related to
        BBS Global Health Access.
      </Text>

      {/* Search */}
      <TextInput
        style={styles.input}
        placeholder="Search downloads..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
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
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Downloads list */}
      <ScrollView style={{ marginTop: 10 }} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
        {filteredDownloads.length === 0 ? (
          <Text>No downloads found.</Text>
        ) : (
          filteredDownloads.map((file) => (
            <View key={file.id} style={styles.fileCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileTitle}>{file.title}</Text>
                <Text style={styles.fileDesc}>{file.description}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.badge}>{file.category}</Text>
                  <Text style={styles.badge}>v{file.version}</Text>
                  <Text style={styles.badge}>{file.size}</Text>
                </View>
                <Text style={styles.meta}>
                  Uploaded: {file.uploadDate} | Downloads: {file.downloadCount}
                </Text>
              </View>
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
                  onPress={() => alert("Downloading " + file.title)}
                >
                  <Text style={styles.primaryBtnText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Preview Modal */}
      <Modal visible={!!previewFile} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{previewFile?.title} Preview</Text>
            <TouchableOpacity onPress={() => setPreviewFile(null)}>
              <Text style={{ color: "red", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
          {loadingPreview ? (
            <ActivityIndicator size="large" style={{ marginTop: 50 }} />
          ) : previewFile?.fileType === "pdf" ? (
            <WebView source={{ uri: previewFile.url }} style={{ flex: 1 }} />
          ) : (
            <Text style={{ padding: 20 }}>
              Preview not available for this file type.
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subText: { color: "#555", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  categoryRow: { flexDirection: "row", marginBottom: 10 },
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
  badgeRow: { flexDirection: "row", marginVertical: 4 },
  badge: {
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    fontSize: 12,
  },
  meta: { fontSize: 12, color: "#888", marginTop: 4 },
  actionRow: { flexDirection: "row", marginTop: 8 },
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
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
});
