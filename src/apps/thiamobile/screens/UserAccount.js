import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "https://thiaworld.bbscart.com/api";

const UserAccount = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  /* ================= LOAD USER ================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("THIAWORLD_TOKEN");
        const userStr = await AsyncStorage.getItem("THIAWORLD_USER");

        if (!token) {
          navigation.replace("SignIn");
          return;
        }

        // Load cached user first
        if (userStr) {
          const cachedUser = JSON.parse(userStr);
          setUser({
            name: cachedUser.name || "",
            email: cachedUser.email || "",
          });
        }

        // Refresh from backend
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedUser = {
          name: res.data?.name || "",
          email: res.data?.email || "",
        };

        setUser(updatedUser);
        await AsyncStorage.setItem(
          "THIAWORLD_USER",
          JSON.stringify({
            ...(userStr ? JSON.parse(userStr) : {}),
            ...updatedUser,
          })
        );
      } catch (err) {
        console.log("UserAccount load error", err);
      }
    };

    loadUser();
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    await AsyncStorage.removeItem("THIAWORLD_TOKEN");
    await AsyncStorage.removeItem("THIAWORLD_USER");
    navigation.replace("SignIn");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.name}>{user.name || "User"}</Text>
          <Text style={styles.email}>{user.email || ""}</Text>
        </View>
      </View>

      {/* Orders Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>My Jewellery Orders</Text>
        <MenuItem
          emoji="💍"
          text="My Orders"
          onPress={() => handleNavigation("Orders")}
        />
        <MenuItem
          emoji="🛒"
          text="Cart"
          onPress={() => handleNavigation("Cart")}
        />
        <MenuItem
          emoji="❤️"
          text="My Wishlist"
          onPress={() => handleNavigation("Wishlist")}
        />
      </View>

      {/* Jewellery Services */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Jewellery Services</Text>
        <MenuItem
          emoji="🔄"
          text="Gold Exchange / Buyback"
          onPress={() => handleNavigation("Exchange")}
        />
        <MenuItem
          emoji="🏬"
          text="Book a Store Visit"
          onPress={() => handleNavigation("StoreVisit")}
        />
      </View>

      {/* Payments Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Payments & Wallet</Text>
        <MenuItem
          emoji="👛"
          text="My Gold Wallet"
          onPress={() => handleNavigation("MyWallet")}
        />
        <MenuItem
          emoji="💳"
          text="Saved Cards & UPI"
          onPress={() => handleNavigation("Payments")}
        />
        <MenuItem
          emoji="🎁"
          text="Exclusive Rewards"
          onPress={() => handleNavigation("Rewards")}
        />
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <MenuItem
          emoji="👤"
          text="Profile Settings"
          onPress={() => handleNavigation("ProfileSettings")}
        />
        <MenuItem
          emoji="📍"
          text="Saved Addresses"
          onPress={() => handleNavigation("Addresses")}
        />
        <MenuItem
          emoji="⚙️"
          text="App Settings"
          onPress={() => handleNavigation("Settings")}
        />
      </View>

      {/* Support Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <MenuItem
          emoji="❓"
          text="Contact Us"
          onPress={() => handleNavigation("ContactUs")}
        />
        <MenuItem
          emoji="📜"
          text="Terms And Conditions"
          onPress={() => handleNavigation("TermsAndConditions")}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Reusable Menu Item Component
const MenuItem = ({ emoji, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.menuText}>{text}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  menuSection: {
    marginTop: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  chevron: {
    marginLeft: "auto",
    fontSize: 20,
    color: "#aaa",
  },
  logoutBtn: {
    margin: 20,
    paddingVertical: 15,
    backgroundColor: "#ff4444",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserAccount;
