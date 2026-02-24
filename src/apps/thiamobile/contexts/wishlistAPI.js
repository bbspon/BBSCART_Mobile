import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://thiaworld.bbscart.com/api";

/* ✅ Read unified auth safely */
const getAuthData = async () => {
    const raw = await AsyncStorage.getItem("UNIFIED_AUTH");
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.log("UNIFIED_AUTH parse error:", e);
        return null;
    }
};

/* ✅ Build auth header using accessToken */
const authConfig = async () => {
    const authData = await getAuthData();

    console.log("📦 UNIFIED_AUTH RAW:", authData);

const token = authData?.token;
    if (!token) {
        console.log("❌ NO TOKEN FOUND IN UNIFIED_AUTH");
        return {};
    }

    console.log("✅ AUTH TOKEN FOUND:", token);

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/* ✅ Auto refresh interceptor */
axios.interceptors.response.use(
    response => response,
    async error => {

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const authData = await getAuthData();

        if (!authData?.refreshToken) {
            return Promise.reject(error);
        }

        try {
            const res = await axios.post(`${API_BASE}/auth/refresh`, {
                refreshToken: authData.refreshToken,
            });

            const newAccessToken = res.data.accessToken;

            const updatedAuth = {
                ...authData,
                accessToken: newAccessToken,
            };

            await AsyncStorage.setItem(
                "UNIFIED_AUTH",
                JSON.stringify(updatedAuth)
            );

            error.config.headers.Authorization = `Bearer ${newAccessToken}`;

            return axios.request(error.config);

        } catch (refreshError) {
            console.log("Refresh token failed:", refreshError?.response?.status);
            return Promise.reject(refreshError);
        }
    }
);

/* ✅ APIs */

export const getWishlist = async () => {
    try {
        const config = await authConfig();

        if (!config.headers?.Authorization) {
            return [];
        }

        const res = await axios.get(`${API_BASE}/wishlist`, config);

        if (Array.isArray(res.data)) {
            return res.data;
        } else if (res.data?.items) {
            return res.data.items;
        } else if (res.data?.data) {
            return res.data.data;
        }

        return [];

    } catch (error) {
        console.log("getWishlist error:", error?.response?.status);
        return [];
    }
};

export const toggleWishlist = async (productId) => {
    try {
        const config = await authConfig();

        if (!config.headers?.Authorization) {
            throw new Error("No authentication token");
        }

        const res = await axios.post(
            `${API_BASE}/wishlist/toggle`,
            { productId },
            config
        );

        return res.data;

    } catch (error) {
        console.log("toggleWishlist error:", error?.response?.status);
        throw error;
    }
};

export const removeWishlist = async (productId) => {
    try {
        const config = await authConfig();

        const res = await axios.delete(
            `${API_BASE}/wishlist/${productId}`,
            config
        );

        return res.data;

    } catch (error) {
        console.log("removeWishlist error:", error?.response?.status);
        throw error;
    }
};