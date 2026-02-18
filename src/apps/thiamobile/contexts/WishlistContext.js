import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getWishlist,
    toggleWishlist as toggleWishlistAPI,
} from '../services/wishlistAPI';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    /* ================= LOAD WISHLIST ================= */

    const loadWishlist = useCallback(async () => {
        try {
            // ✅ Check for token (try both THIAWORLD_TOKEN and bbsUser)
            const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
            const bbsUserRaw = await AsyncStorage.getItem('bbsUser');
            const hasToken = token || (bbsUserRaw && JSON.parse(bbsUserRaw)?.token);

            if (!hasToken) {
                setWishlistIds(new Set());
                setLoading(false);
                return;
            }

            const res = await getWishlist();

            // ✅ Handle different response structures
            let items = [];
            if (Array.isArray(res)) {
                items = res;
            } else if (res?.items && Array.isArray(res.items)) {
                items = res.items;
            } else if (res?.data && Array.isArray(res.data)) {
                items = res.data;
            }

            const ids = new Set(
                items.map((item) => {
                    // Handle different item structures
                    const productId = item.productId?._id || 
                                    item.productId || 
                                    item.product?._id ||
                                    item.product ||
                                    item._id ||
                                    item.id;
                    return String(productId); // Ensure string for consistency
                }).filter(Boolean) // Remove any null/undefined values
            );

            setWishlistIds(ids);
        } catch (err) {
            console.log('Wishlist load error', err);
            // ✅ Don't clear wishlist on error - keep current state
            // setWishlistIds(new Set());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    /* ================= HELPERS ================= */

    const isWishlisted = useCallback(
        (productId) => {
            // ✅ Ensure consistent string comparison
            return wishlistIds.has(String(productId));
        },
        [wishlistIds]
    );

    /* ================= TOGGLE ================= */

    const toggleWishlist = async (productId) => {
        // ✅ Ensure productId is string for consistency
        const productIdStr = String(productId);
        
        // ✅ Save current state before making changes (for error rollback)
        const wasWishlisted = wishlistIds.has(productIdStr);
        
        try {
            // ✅ Check for token (try both THIAWORLD_TOKEN and bbsUser)
            const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
            const bbsUserRaw = await AsyncStorage.getItem('bbsUser');
            const hasToken = token || (bbsUserRaw && JSON.parse(bbsUserRaw)?.token);

            if (!hasToken) {
                // User not logged in - could show alert here if needed
                console.log('User not logged in - cannot add to wishlist');
                return;
            }

            // ✅ Optimistic UI update
            setWishlistIds((prev) => {
                const updated = new Set(prev);
                if (updated.has(productIdStr)) {
                    updated.delete(productIdStr);
                } else {
                    updated.add(productIdStr);
                }
                return updated;
            });

            // Call API to toggle wishlist
            await toggleWishlistAPI(productIdStr);
            
            // ✅ Wait a bit before reloading to give backend time to update
            // Then reload wishlist to ensure sync with backend
            setTimeout(async () => {
                try {
                    await loadWishlist();
                } catch (reloadErr) {
                    console.log('Wishlist reload after toggle error:', reloadErr);
                    // If reload fails, keep the optimistic update
                }
            }, 500); // 500ms delay
            
        } catch (err) {
            console.log('Wishlist toggle error', err);
            // ✅ Revert optimistic update on error
            setWishlistIds((prev) => {
                const updated = new Set(prev);
                if (wasWishlisted) {
                    // Was wishlisted, so add it back
                    updated.add(productIdStr);
                } else {
                    // Was not wishlisted, so remove it
                    updated.delete(productIdStr);
                }
                return updated;
            });
            
            // Don't reload on error - keep current state
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistIds,
                isWishlisted,
                toggleWishlist,
                loading,
                reloadWishlist: loadWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

/* ================= HOOK ================= */

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error(
            'useWishlist must be used inside WishlistProvider'
        );
    }
    return context;
};
