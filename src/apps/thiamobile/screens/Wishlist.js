import React, { useEffect, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
const API_BASE = "https://thiaworld.bbscart.com/api";

export default function JewelryWishlist({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
const { reloadWishlist } = useWishlist();
  // ✅ Add focus listener to refresh wishlist when screen is focused
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadWishlist();
    });

    loadWishlist();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const getAuthConfig = async () => {
    // ✅ Try THIAWORLD_TOKEN first (current app standard)
    let token = await AsyncStorage.getItem("THIAWORLD_TOKEN");
    
    // ✅ Fallback to bbsUser token (legacy support)
    if (!token) {
      const raw = await AsyncStorage.getItem("bbsUser");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          token = parsed?.token;
        } catch (e) {
          console.log('Error parsing bbsUser:', e);
        }
      }
    }

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadWishlist = async () => {
    try {
      const config = await getAuthConfig();
      const res = await axios.get(`${API_BASE}/wishlist`, config);

      const mapped = (res.data?.items || []).map((w) => {
        const p = w.product || {};
        return {
          id: p._id,
          name: p.name,
          price: Number(p.price || p.finalPrice || 0),
          oldPrice: Number(p.mrp || 0),
          image: p.images?.[0]
            ? `https://thiaworld.bbscart.com/uploads/${p.images[0].split("|")[0]}`
            : "https://via.placeholder.com/150",
          category: p.category || 'gold', // ✅ Add category for cart
          images: p.images || [], // ✅ Keep images array for cart
          inStock: true,
          note: "",
          alert: false,
        };
      });

      setWishlist(mapped);
    } catch (e) {
      Alert.alert("Login Required", "Please login to view wishlist");
    }
  };

  // --- ACTIONS ---
  const toggleSelect = (id) => {
    const updated = new Set(selectedIds);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setSelectedIds(updated);
  };

  const bulkRemove = async () => {
    if (selectedIds.size === 0) return;
    try {
      const config = await getAuthConfig();
      for (const id of selectedIds) {
        await axios.delete(`${API_BASE}/wishlist/${id}`, config);
      }
      setWishlist((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      reloadWishlist(); 
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch {
      Alert.alert("Error", "Unable to remove selected items");
    }
  };

  const moveToCart = async (item) => {
    try {
      // ✅ If category is missing, try to fetch product details
      let category = item.category;
      
      if (!category || category === 'gold') {
        try {
          const config = await getAuthConfig();
          const productRes = await axios.get(`${API_BASE}/products/${item.id}`, config);
          const product = productRes.data?.product || productRes.data || {};
          category = product.category || 'gold';
        } catch (fetchError) {
          console.log('Could not fetch product details, using default category:', fetchError.message);
          category = 'gold'; // Default to gold if fetch fails
        }
      }

      // ✅ Prepare product for cart with all required fields
      const cartProduct = {
        id: item.id,
        name: item.name,
        price: item.price,
        category: String(category || 'gold').toLowerCase(), // ✅ Ensure category is lowercase string
        image: item.image,
        images: item.images || [],
        // Include other fields that might be useful
        mrp: item.oldPrice,
        quantity: 1, // Start with quantity 1
      };

      // ✅ Add to cart using CartContext
      addToCart(cartProduct);

      // ✅ Show success message
      Alert.alert(
        "Added to Cart",
        `${item.name} has been added to your cart.`,
        [
          {
            text: "Continue Shopping",
            style: "cancel",
          },
          {
            text: "View Cart",
            onPress: () => navigation.navigate("Cart"),
          },
        ]
      );

      // ✅ Remove from wishlist after successful add
      setWishlist((prev) => prev.filter((i) => i.id !== item.id));
      reloadWishlist();
    } catch (error) {
      console.error("Error moving to cart:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };

  const goToProductDetail = (item) => {
    // ✅ Use correct route name
    navigation.navigate("ProductDetails", { id: item.id });
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
        message: `💍 My Jewelry Wishlist:\n\n${items}`,
      });
    } catch {
      Alert.alert("Error", "Unable to share wishlist.");
    }
  };

  // --- RENDER ---
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
          selected && { borderColor: "#d4af37", borderWidth: 2 },
        ]}
        onPress={() =>
          selectMode ? toggleSelect(item.id) : goToProductDetail(item)
        }
        onLongPress={() => {
          setSelectMode(true);
          toggleSelect(item.id);
        }}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.oldPrice ? (
              <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>
            ) : null}
            {discount ? (
              <Text style={styles.discount}>{discount}% off</Text>
            ) : null}
          </View>

          <Text style={{ color: item.inStock ? "green" : "red", fontSize: 12 }}>
            {item.inStock ? "In stock" : "Out of stock"}
          </Text>

          <TouchableOpacity onPress={() => toggleAlert(item.id)}>
            <Text style={{ fontSize: 12, color: item.alert ? "red" : "#d4af37" }}>
              {item.alert ? "Alert Set ✓" : "Set Gold/Silver Price Alert"}
            </Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Add a note (occasion, size, etc.)"
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
              onPress={async () => {
                try {
                  const config = await getAuthConfig();
                  await axios.delete(
                    `${API_BASE}/wishlist/${item.id}`,
                    config
                  );
                  setWishlist((prev) =>
                    prev.filter((i) => i.id !== item.id)
                  );
                      reloadWishlist();   
                } catch {
                  Alert.alert("Error", "Unable to remove item");
                }
              }}
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
          <Text style={styles.emptyText}>Your jewelry wishlist is empty</Text>
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
            <Text style={{ color: "#d4af37", fontWeight: "500" }}>
              💎 Share Jewelry Wishlist
            </Text>
          </TouchableOpacity>

          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 8, paddingBottom: 8 + Math.max(12, insets.bottom) + 8 }}
          />

          <View style={styles.recommend}>
            <Text style={styles.recommendTitle}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((n) => (
                <View key={n} style={styles.recommendCard}>
                  <Image
                    source={{
                      uri: "https://i.etsystatic.com/5909612/r/il/093529/372391416/il_1080xN.372391416_88q2.jpg",
                    }}
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                  />
                  <Text style={{ fontSize: 12 }}>Recommended {n}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <Modal visible={compareVisible} transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
                  Compare Jewelry
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

// STYLES — UNCHANGED
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
  info: { flex: 1, marginLeft: 12, justifyContent: "flex-start" },
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
  cartBtnText: { color: "#d4af37", fontSize: 13, fontWeight: "500" },
  removeBtn: {},
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
  bulkText: { color: "#212121", fontSize: 14 },
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
  recommend: { backgroundColor: "#fff", padding: 10, marginTop: 8 },
  recommendTitle: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  recommendCard: {
    backgroundColor: "#fafafa",
    padding: 6,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
    alignItems: "center",
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
