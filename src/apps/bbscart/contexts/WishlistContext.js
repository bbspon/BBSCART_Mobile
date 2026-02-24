import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const WishlistContext = createContext(null);
const API_BASE = "https://bbscart.com/api";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const authUserStr = await AsyncStorage.getItem("auth_user");

      if (!authUserStr) {
        setItems([]);
        setLoading(false);
        return;
      }

      let authUser;
      try {
        authUser = JSON.parse(authUserStr);
      } catch (parseError) {
        console.log("Failed to parse auth_user:", parseError);
        setItems([]);
        setLoading(false);
        return;
      }

      const token = authUser?.token;

      if (!token) {
        setItems([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token.token || token}` },
      });

      setItems(res.data?.items || res.data || []);
    } catch (e) {
      console.log("Wishlist fetch error", e.response?.data || e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    try {
      if (!productId) {
        console.log("Product ID is missing");
        return { success: false, error: "Product ID is missing" };
      }

      const authUserStr = await AsyncStorage.getItem("auth_user");

      if (!authUserStr) {
        console.log("No auth_user found for wishlist add");
        Alert.alert(
          "Login Required",
          "Please login to add items to your wishlist.",
          [{ text: "OK" }]
        );
        return { success: false, error: "Please login to add items to wishlist" };
      }

      let authUser;
      try {
        authUser = JSON.parse(authUserStr);
      } catch (parseError) {
        console.log("Failed to parse auth_user:", parseError);
        Alert.alert(
          "Login Required",
          "Please login to add items to your wishlist.",
          [{ text: "OK" }]
        );
        return { success: false, error: "Please login to add items to wishlist" };
      }

      const token = authUser?.token;

      if (!token) {
        console.log("No token found in auth_user for wishlist add");
        Alert.alert(
          "Login Required",
          "Please login to add items to your wishlist.",
          [{ text: "OK" }]
        );
        return { success: false, error: "Please login to add items to wishlist" };
      }

      const response = await axios.post(
        `${API_BASE}/wishlist/add`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh wishlist after adding
      await fetchWishlist();
      
      return { success: true, message: "Item added to wishlist" };
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || "Failed to add item to wishlist";
      console.log("Wishlist add error", e.response?.data || e.message);
      
      // Show alert for authentication errors
      if (e.response?.status === 401 || e.response?.status === 403) {
        Alert.alert(
          "Authentication Error",
          "Please login to add items to your wishlist.",
          [{ text: "OK" }]
        );
      } else if (e.response?.status >= 500) {
        Alert.alert(
          "Server Error",
          "Unable to add item to wishlist. Please try again later.",
          [{ text: "OK" }]
        );
      }
      
      return { success: false, error: errorMessage };
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const authUserStr = await AsyncStorage.getItem("auth_user");

      if (!authUserStr) {
        console.log("No auth_user found for wishlist remove");
        return { success: false, error: "Please login to manage wishlist" };
      }

      let authUser;
      try {
        authUser = JSON.parse(authUserStr);
      } catch (parseError) {
        console.log("Failed to parse auth_user:", parseError);
        return { success: false, error: "Please login to manage wishlist" };
      }

      const token = authUser?.token;

      if (!token) {
        console.log("No token found in auth_user for wishlist remove");
        return { success: false, error: "Please login to manage wishlist" };
      }

      await axios.delete(`${API_BASE}/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh wishlist after removing
      await fetchWishlist();
      return { success: true, message: "Item removed from wishlist" };
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || "Failed to remove item from wishlist";
      console.log("Wishlist remove error", e.response?.data || e.message);
      return { success: false, error: errorMessage };
    }
  }, [fetchWishlist]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
