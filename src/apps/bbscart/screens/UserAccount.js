import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

const UserAccount = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: "",
  });
  const navigation = useNavigation();
  const { logout } = useAuth();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("auth_user");
        if (!stored) return;

        const parsed = JSON.parse(stored);

        setUser({
          name: parsed?.user?.name || "",
          email: parsed?.user?.email || "",
          profilePic: parsed?.user?.profilePic || "",
        });
      } catch (err) {
        console.log("UserAccount load error:", err.message);
      }
    };

    loadUser();
  }, []);

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };
const handleLogout = async () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all AsyncStorage items
            await AsyncStorage.multiRemove([
              "auth_user",
              "deliveryPincode",
              "assignedStore",
            ]);

            // Clear local state
            setUser({
              name: "",
              email: "",
              profilePic: "",
            });

            // Use AuthContext to logout (this will trigger RootNavigator to switch to AuthStack)
            logout();

            Alert.alert("Success", "You have been logged out successfully");
          } catch (err) {
            console.log("Logout error:", err);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]
  );
};


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              user.profilePic ||
              "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.name}>
            {user.name || "User"}
          </Text>
          <Text style={styles.email}>
            {user.email || ""}
          </Text>
        </View>
      </View>

      {/* Orders Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        <MenuItem
          emoji="📦"
          text="Order History"
          onPress={() => handleNavigation("Orders")}
        />
        <MenuItem
          emoji="❤️"
          text="Wishlist"
          onPress={() => handleNavigation("Wishlist")}
        />
        <MenuItem
          emoji="🏷️"
          text="Coupons"
          onPress={() => handleNavigation("Coupons")}
        />
      </View>

      {/* Payments Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Payments & Wallet</Text>
        <MenuItem
          emoji="👛"
          text="My Wallet"
          onPress={() => handleNavigation("Wallet")}
        />
        <MenuItem
          emoji="💳"
          text="Saved Cards & UPI"
          onPress={() => handleNavigation("Payments")}
        />
        <MenuItem
          emoji="🎁"
          text="Rewards"
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
          emoji="⚙️"
          text="App Settings"
          onPress={() => handleNavigation("Settings")}
        />
        <MenuItem
          emoji="📞"
          text="Contact Us"
          onPress={() => handleNavigation("ContactUs")}
        />
        <MenuItem
          emoji="🔒"
          text="Change Password"
          onPress={() => handleNavigation("ChangePassword")}
        />
      </View>

      {/* Support Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <MenuItem
          emoji="❓"
          text="Help Center"
          onPress={() => handleNavigation("Help")}
        />
        <MenuItem
          emoji="📜"
          text="Terms Of Use"
          onPress={() => handleNavigation("TermsOfUse")}
        />
        <MenuItem
          emoji="📜"
          text="Privacy Policy"
          onPress={() => handleNavigation("PrivacyPolicy")}
        />
        <MenuItem
          emoji="📜"
          text="Cancellation Policy"
          onPress={() => handleNavigation("CancellationPolicy")}
        />
        <MenuItem
          emoji="📜"
          text="Shipping Policy"
          onPress={() => handleNavigation("ShippingPolicy")}
        />
        <MenuItem
          emoji="📜"
          text="Refund Policy"
          onPress={() => handleNavigation("RefundPolicy")}
        />
        <MenuItem
          emoji="📜"
          text="Buyback Policy"
          onPress={() => handleNavigation("BuybackPolicy")}
        />
        <MenuItem
          emoji="📜"
          text="Exchange Policy"
          onPress={() => handleNavigation("ExchangePolicy")}
        />
        <MenuItem
          emoji="📜"
          text="Bank Cashback Policy"
          onPress={() => handleNavigation("BankCashbackPolicy")}
        />
      </View>

      {/* Logout */}
   <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logs Out</Text>
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
