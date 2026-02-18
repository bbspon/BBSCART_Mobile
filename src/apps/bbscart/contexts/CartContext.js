import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "bbscart_cart_v1";

const initialState = {
  items: [],
  loaded: false,
};

async function loadCartFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed, loaded: true };
  } catch {
    return initialState;
  }
}

async function saveCartToStorage(state) {
  try {
    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify({ items: state.items })
    );
  } catch {}
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.payload, loaded: true };

    case "ADD": {
      const items = [...state.items];
      const idx = items.findIndex(
        (i) =>
          i.productId === action.item.productId &&
          String(i.variantId || "") === String(action.item.variantId || "")
      );

      if (idx >= 0) {
        items[idx] = {
          ...items[idx],
          qty: items[idx].qty + action.item.qty,
        };
      } else {
        items.push(action.item);
      }

      const next = { ...state, items };
      saveCartToStorage(next);
      return next;
    }

    case "REMOVE": {
      const items = state.items.filter(
        (i) => i.productId !== action.productId
      );
      const next = { ...state, items };
      saveCartToStorage(next);
      return next;
    }

    case "SET_QTY": {
      const items = state.items.map((i) =>
        i.productId === action.productId
          ? { ...i, qty: Math.max(1, action.qty) }
          : i
      );
      const next = { ...state, items };
      saveCartToStorage(next);
      return next;
    }

    case "CLEAR": {
      const next = { ...state, items: [] };
      saveCartToStorage(next);
      return next;
    }

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const stored = await loadCartFromStorage();
      dispatch({ type: "LOAD", payload: stored });
    })();
  }, []);

  const totalCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.qty, 0),
    [state.items]
  );

  const totalPrice = useMemo(
    () => state.items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [state.items]
  );

  const addItem = (item) =>
    dispatch({ type: "ADD", item: { ...item, qty: item.qty || 1 } });

  const removeItem = (productId) =>
    dispatch({ type: "REMOVE", productId });

  const updateQty = (productId, qty) =>
    dispatch({ type: "SET_QTY", productId, qty });

  const clearCart = () => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalCount,
        totalPrice,
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
