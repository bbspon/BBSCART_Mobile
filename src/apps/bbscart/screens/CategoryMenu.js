import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_BASE = "https://bbscart.com/api";

const CategoryMenu = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]); // Store all subcategories
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  /* ---------------- FETCH CATEGORIES ---------------- */

  useEffect(() => {
    if (!visible) return;

    fetchCategories();
    fetchAllSubcategories(); // Fetch all subcategories upfront
    resetAll(); // important
  }, [visible]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.log("❌ CATEGORY API ERROR", err);
    }
  };

  /* ---------------- FETCH ALL SUBCATEGORIES (ONCE) ---------------- */
  
  const fetchAllSubcategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/subcategories`);
      const data = res.data || [];
      
      let subcategoriesList = [];
      if (Array.isArray(data)) {
        subcategoriesList = data;
      } else if (data.subcategories && Array.isArray(data.subcategories)) {
        subcategoriesList = data.subcategories;
      } else if (data.items && Array.isArray(data.items)) {
        subcategoriesList = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        subcategoriesList = data.data;
      }
      
      console.log("📦 All subcategories loaded:", subcategoriesList.length);
      setAllSubcategories(subcategoriesList);
    } catch (err) {
      console.log("❌ FETCH ALL SUBCATEGORIES ERROR", err);
      setAllSubcategories([]);
    }
  };

  /* ---------------- FETCH SUBCATEGORIES ---------------- */

  const fetchSubcategories = async (categoryId) => {
    try {
      if (!categoryId) return;
  
      const res = await axios.get(
        `${API_BASE}/products/catalog/subcategories`,
        {
          params: { category_id: categoryId },
        }
      );
  
      setSubcategories(res.data.items || []);
    } catch (err) {
      console.log("❌ SUBCATEGORY API ERROR", err.response?.data || err.message);
      setSubcategories([]);
    }
  };
  
  /* ---------------- FETCH GROUPS ---------------- */

  const fetchGroups = async (subcategoryId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/productgroups?subcategoryId=${subcategoryId}`
      );
      setGroups(res.data || []);
    } catch (err) {
      console.log("❌ GROUP API ERROR", err);
    }
  };

  /* ---------------- STATE RESET HELPERS ---------------- */

  const resetAll = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
    setSubcategories([]);
    setGroups([]);
    // Don't reset allSubcategories - we keep them loaded
  };

  const resetSubAndGroups = () => {
    setActiveSubcategory(null);
    setSubcategories([]);
    setGroups([]);
  };

  /* ---------------- CLOSE ---------------- */

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  /* ---------------- UI ---------------- */

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.popup}>
        <View style={styles.closeWrapper}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.columns}>
          {/* CATEGORY */}
          <View style={styles.column}>
            <Text style={styles.title}>Category</Text>
            <ScrollView>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.item,
                    activeCategory === cat._id && styles.activeItem,
                  ]}
                  onPress={() => {
                    setActiveCategory(cat._id);
                    setActiveSubcategory(null);
                    setGroups([]);
                    fetchSubcategories(cat._id);
                  }}
                  
                >
                  <Text>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SUBCATEGORY */}
          <View style={styles.column}>
            <Text style={styles.title}>Subcategory</Text>
            <ScrollView>
              {!activeCategory ? (
                <Text style={styles.emptyText}>Select a category</Text>
              ) : subcategories.length === 0 ? (
                <Text style={styles.emptyText}>No subcategories found</Text>
              ) : (
                subcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub._id}
                    style={[
                      styles.item,
                      activeSubcategory === sub._id && styles.activeItem,
                    ]}
                    onPress={() => {
                      if (activeSubcategory === sub._id) return;

                      setActiveSubcategory(sub._id);

                      // ✅ CLOSE POPUP
                      handleClose();

                      // ✅ NAVIGATE TO SUBCATEGORY PRODUCTS PAGE
                      navigation.navigate("SubcategoryProducts", {
                        subcategoryId: sub._id,
                        title: sub.name,
                      });
                    }}
                  >
                    <Text>{sub.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>


          {/* GROUPS */}
          <View style={styles.column}>
            <Text style={styles.title}>Groups</Text>
            <ScrollView>
              {!activeSubcategory ? (
                <Text style={styles.emptyText}>Select a subcategory</Text>
              ) : groups.length === 0 ? (
                <Text style={styles.emptyText}>No groups found</Text>
              ) : (
                groups.map((grp) => (
                  <TouchableOpacity
                    key={grp._id}
                    style={styles.item}
                    onPress={() => {
                      handleClose();
                      navigation.navigate("ProductListing", {
                        groupId: grp._id,
                        title: grp.label,
                      });
                    }}
                  >
                    <Text>{grp.label}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryMenu;

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  popup: {
    position: "absolute",
    top: 120,
    left: 10,
    right: 10,
    height: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 12,
  },
  closeWrapper: {
    alignItems: "flex-end",
  },
  closeText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  columns: {
    flexDirection: "row",
    flex: 1,
  },
  column: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  item: {
    paddingVertical: 10,
  },
  activeItem: {
    backgroundColor: "#ffe7b3",
    borderRadius: 6,
  },
  emptyText: {
    paddingVertical: 10,
    color: "#999",
    fontStyle: "italic",
    fontSize: 12,
  },
});
