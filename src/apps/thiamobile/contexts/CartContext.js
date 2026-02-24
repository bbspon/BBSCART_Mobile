import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const STORAGE_KEYS = {
  gold: 'thiaworld_gold_cart',
  silver: 'thiaworld_silver_cart',
  diamond: 'thiaworld_diamond_cart',
  platinum: 'thiaworld_platinum_cart',
};

export const CartProvider = ({ children }) => {
  const [goldCart, setGoldCart] = useState([]);
  const [silverCart, setSilverCart] = useState([]);
  const [diamondCart, setDiamondCart] = useState([]);
  const [platinumCart, setPlatinumCart] = useState([]);

  const [mergedCart, setMergedCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartReady, setCartReady] = useState(false);

  // -----------------------------
  // LOAD CART FROM STORAGE
  // -----------------------------
  useEffect(() => {
    const loadCart = async () => {
      try {
        const load = async (key) => {
          try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : [];
          } catch (e) {
            console.log(`Error loading cart for ${key}:`, e);
            return [];
          }
        };

        setGoldCart(await load(STORAGE_KEYS.gold));
        setSilverCart(await load(STORAGE_KEYS.silver));
        setDiamondCart(await load(STORAGE_KEYS.diamond));
        setPlatinumCart(await load(STORAGE_KEYS.platinum));
      } catch (e) {
        console.log('❌ Cart load error:', e);
        // Initialize with empty arrays on error
        setGoldCart([]);
        setSilverCart([]);
        setDiamondCart([]);
        setPlatinumCart([]);
      } finally {
        setCartReady(true);
      }
    };

    loadCart();
  }, []);

  // -----------------------------
  // MERGE CARTS + COUNT
  // -----------------------------
  useEffect(() => {
    const merged = [
      ...goldCart,
      ...silverCart,
      ...diamondCart,
      ...platinumCart,
    ];

    setMergedCart(merged);
    setCartCount(
      merged.reduce((sum, item) => sum + (item.quantity || 1), 0)
    );
  }, [goldCart, silverCart, diamondCart, platinumCart]);

  // -----------------------------
  // SAVE CART
  // -----------------------------
  const saveCart = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.log('❌ Cart save error:', e);
    }
  };

  // -----------------------------
  // ADD TO CART
  // -----------------------------
const addToCart = (product) => {
  const category = (product.category || '').toLowerCase();

  const updater = (setCart, key) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === product.id);

      let updated;

      if (existing) {
        // ✅ Increase by incoming quantity OR +1
        updated = prevCart.map((i) =>
          i.id === product.id
            ? { 
                ...i, 
                quantity: (i.quantity || 1) + (product.quantity || 1) 
              }
            : i
        );

        console.log('✅ Qty merged for:', product.name);
      } else {
        // ✅ USE PRODUCT QUANTITY (THIS WAS THE BUG)
        updated = [
          ...prevCart,
          { ...product, quantity: product.quantity || 1 }
        ];

        console.log('✅ New product added with qty:', product.quantity);
      }

      saveCart(key, updated);
      return updated;
    });
  };

  if (category === 'gold') updater(setGoldCart, STORAGE_KEYS.gold);
  else if (category === 'silver') updater(setSilverCart, STORAGE_KEYS.silver);
  else if (category === 'diamond') updater(setDiamondCart, STORAGE_KEYS.diamond);
  else if (category === 'platinum') updater(setPlatinumCart, STORAGE_KEYS.platinum);
  else console.log('❌ Unknown category:', product.category);
};

  // -----------------------------
  // UPDATE QUANTITY
  // -----------------------------
const updateQuantity = (id, category, quantity) => {
  if (quantity < 1) return;

  const updater = (setCart, key) => {
    setCart((prevCart) => {

      const updated = prevCart.map((i) =>
        String(i.id) === String(id)
          ? { ...i, quantity }
          : i
      );

      saveCart(key, updated);
      return updated;
    });
  };

  category = category.toLowerCase();

  if (category === 'gold') updater(setGoldCart, STORAGE_KEYS.gold);
  if (category === 'silver') updater(setSilverCart, STORAGE_KEYS.silver);
  if (category === 'diamond') updater(setDiamondCart, STORAGE_KEYS.diamond);
  if (category === 'platinum') updater(setPlatinumCart, STORAGE_KEYS.platinum);
};

  // -----------------------------
  // REMOVE FROM CART
  // -----------------------------
const removeFromCart = (id, category) => {
  const remover = (setCart, key) => {
    setCart((prevCart) => {

      const updated = prevCart.filter(
        (i) => String(i.id) !== String(id)
      );

      saveCart(key, updated);
      return updated;
    });
  };

  category = category.toLowerCase();

  if (category === 'gold') remover(setGoldCart, STORAGE_KEYS.gold);
  if (category === 'silver') remover(setSilverCart, STORAGE_KEYS.silver);
  if (category === 'diamond') remover(setDiamondCart, STORAGE_KEYS.diamond);
  if (category === 'platinum') remover(setPlatinumCart, STORAGE_KEYS.platinum);
};
  // -----------------------------
  // CLEAR ALL CARTS
  // -----------------------------
  const clearAll = async () => {
    setGoldCart([]);
    setSilverCart([]);
    setDiamondCart([]);
    setPlatinumCart([]);

    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  };

  return (
    <CartContext.Provider
      value={{
        goldCart,
        silverCart,
        diamondCart,
        platinumCart,
        mergedCart,
        cartCount,
        cartReady,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearAll,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
