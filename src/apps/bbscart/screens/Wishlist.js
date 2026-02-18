// frontend/screens/Wishlist.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Share,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";

const IMAGE_BASE = "https://bbscart.com/uploads/";

export default function Wishlist({ navigation }) {
  const insets = useSafeAreaInsets();
  // 🔹 API BACKED WISHLIST
  const {
    items: apiWishlist,
    removeFromWishlist,
    fetchWishlist,
  } = useWishlist();
  
  // 🔹 CART CONTEXT
  const { addItem } = useCart();

  // 🔹 LOCAL UI STATE (unchanged functionality)
  const [wishlist, setWishlist] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);

  // Helper function to get image URL (consistent with SubcategoryProductsScreen)
  const getImageUrl = (product) => {
    if (product.product_img_url) return product.product_img_url;
    if (product.product_img) return IMAGE_BASE + product.product_img;
    if (product.image) return product.image;
    return "https://via.placeholder.com/300";
  };

  // Refresh wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist])
  );

  // 🔹 SYNC API → UI MODEL
  useEffect(() => {
    if (Array.isArray(apiWishlist) && apiWishlist.length > 0) {
      const mapped = apiWishlist
        .map((item) => {
          // Handle both structures: { product: {...} } or direct product object
          const product = item.product || item;
          if (!product || !product._id) return null;

          return {
            id: product._id,
            _id: product._id, // Keep original _id for reference
            name: product.name || "Unknown Product",
            price: product.price || 0,
            oldPrice: product.oldPrice || product.mrp || null,
            image: getImageUrl(product),
            inStock: (product.stock ?? 0) > 0,
            note: "",
            alert: false,
            // Store full product reference for cart
            productData: product,
          };
        })
        .filter(Boolean); // Remove any null entries
      setWishlist(mapped);
    } else {
      // Clear wishlist if empty or invalid
      setWishlist([]);
    }
  }, [apiWishlist]);

  // --- ACTIONS (UNCHANGED BEHAVIOR) ---
  const toggleSelect = (id) => {
    const updated = new Set(selectedIds);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setSelectedIds(updated);
  };

  const bulkRemove = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => removeFromWishlist(id));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const moveToCart = (item) => {
    try {
      // Add item to cart using CartContext
      addItem({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: 1,
        variantId: null,
      });
      
      // Remove from wishlist
      removeFromWishlist(item.id);
      
      // Show success message
      Alert.alert("Moved to Cart", `${item.name} has been added to your cart.`);
    } catch (error) {
      console.log("Move to cart error:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };

  const goToProductDetail = (item) => {
    // Use _id if available, otherwise fall back to id
    const productId = item._id || item.id;
    console.log('🔍 Wishlist: Navigating to ProductDetails with ID:', productId, 'Item:', item);
    
    if (!productId) {
      Alert.alert("Error", "Product ID not found. Please try again.");
      return;
    }
    
    // Pass product data if available (from wishlist) to avoid API call issues
    const productData = item.productData || item.product || item;
    
    navigation.navigate("ProductDetails", { 
      productId,
      productData: productData && productData._id ? productData : undefined // Only pass if it has _id
    });
  };

  const toggleAlert = (id) => {
    setWishlist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, alert: !i.alert } : i))
    );
  };

  const updateNote = (id, text) => {
    setWishlist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, note: text } : i))
    );
  };

  const shareWishlist = async () => {
    try {
      const items = wishlist.map((i) => `${i.name} - ₹${i.price}`).join("\n");
      await Share.share({
        message: `My Wishlist:\n\n${items}`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share wishlist.");
    }
  };

  // --- RENDER ITEM (UI UNCHANGED) ---
  const renderItem = ({ item }) => {
    const selected = selectedIds.has(item.id);
    const discount =
      item.oldPrice && item.price < item.oldPrice
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : null;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          selected && { borderColor: "#2874F0", borderWidth: 2 },
        ]}
        onPress={() =>
          selectMode ? toggleSelect(item.id) : goToProductDetail(item)
        }
        onLongPress={() => {
          setSelectMode(true);
          toggleSelect(item.id);
        }}
      >
        <Image 
          source={{ uri: item.image || "https://via.placeholder.com/300" }} 
          style={styles.image}
          defaultSource={{ uri: "https://via.placeholder.com/300" }}
        />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.oldPrice && (
              <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>
            )}
            {discount && (
              <Text style={styles.discount}>{discount}% off</Text>
            )}
          </View>

          <Text style={{ color: item.inStock ? "green" : "red", fontSize: 12 }}>
            {item.inStock ? "In stock" : "Out of stock"}
          </Text>

          <TouchableOpacity onPress={() => toggleAlert(item.id)}>
            <Text style={{ fontSize: 12, color: item.alert ? "red" : "#2874F0" }}>
              {item.alert ? "Alert Set ✓" : "Set Price/Stock Alert"}
            </Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Add a note..."
            value={item.note}
            onChangeText={(txt) => updateNote(item.id, txt)}
            style={styles.note}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => moveToCart(item)}
            >
              <Text style={styles.cartBtnText}>Move to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeFromWishlist(item.id)}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const selectedItems = wishlist.filter((i) => selectedIds.has(i.id));

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
        </View>
      ) : (
        <>
          {selectMode && (
            <View style={styles.bulkBar}>
              <Text style={styles.bulkText}>{selectedIds.size} selected</Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[styles.bulkRemoveBtn, { marginRight: 10 }]}
                  onPress={() => setCompareVisible(true)}
                >
                  <Text style={{ color: "white" }}>Compare</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bulkRemoveBtn}
                  onPress={bulkRemove}
                >
                  <Text style={{ color: "white" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.shareBtn} onPress={shareWishlist}>
            <Text style={{ color: "#2874F0", fontWeight: "500" }}>
              📤 Share Wishlist
            </Text>
          </TouchableOpacity>

          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 8, paddingBottom: 8 + insets.bottom }}
          />

          <Modal visible={compareVisible} transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
                  Compare Items
                </Text>
                <ScrollView horizontal>
                  {selectedItems.map((i) => (
                    <View key={i.id} style={styles.compareCard}>
                      <Image
                        source={{ uri: i.image }}
                        style={{ width: 80, height: 80 }}
                      />
                      <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                        {i.name}
                      </Text>
                      <Text style={{ fontSize: 12 }}>₹{i.price}</Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.bulkRemoveBtn, { marginTop: 10 }]}
                  onPress={() => setCompareVisible(false)}
                >
                  <Text style={{ color: "white" }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

// --- STYLES (UNCHANGED) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f3f6" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    marginBottom: 8,
  },
  image: { width: 90, height: 90, resizeMode: "contain" },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, color: "#212121", marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  price: { fontSize: 15, fontWeight: "bold", color: "#212121" },
  oldPrice: {
    fontSize: 13,
    color: "#878787",
    marginLeft: 6,
    textDecorationLine: "line-through",
  },
  discount: {
    fontSize: 13,
    color: "#388e3c",
    marginLeft: 6,
    fontWeight: "500",
  },
  note: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    fontSize: 12,
    paddingVertical: 2,
    marginTop: 4,
  },
  actions: { flexDirection: "row", marginTop: 6 },
  cartBtn: { marginRight: 20 },
  cartBtnText: { color: "#2874F0", fontSize: 13, fontWeight: "500" },
  removeBtnText: { fontSize: 13, color: "#d32f2f", fontWeight: "500" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#777" },
  bulkBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  bulkText: { fontSize: 14 },
  bulkRemoveBtn: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
  },
  shareBtn: {
    backgroundColor: "#fff",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 4,
    width: "90%",
  },
  compareCard: {
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
    alignItems: "center",
  },
});
