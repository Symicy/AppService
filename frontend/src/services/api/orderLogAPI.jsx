import axios from "axios";
import { TokenManager } from "./authAPI";

const API_BASE_URL = "http://localhost:8080/api/order-logs";

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to orderLog API request:', token?.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for orderLog API request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 403 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Token or role issue:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export async function fetchOrderLogs(orderId) {
  try {
    console.log(`📋 Fetching logs for order #${orderId}`);
    const response = await apiClient.get(`/by-order/${orderId}`);
    console.log('✅ Order logs fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching order logs:", error.response?.data || error.message);
    throw error;
  }
}

export default {
  fetchOrderLogs
};