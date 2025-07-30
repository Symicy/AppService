import axios from 'axios';
import { TokenManager } from './authAPI';

const API_BASE_URL = 'http://localhost:8080/api/orders';

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
      console.log('🔑 Adding token to order API request:', token?.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for order API request');
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

export async function fetchAllOrders() {
  try {
    console.log('📋 Fetching all orders');
    const response = await apiClient.get('/all');
    console.log('✅ Orders fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching orders:", error.response?.data || error.message);
    throw error;
  }
}

export async function getOrderById(orderId) {
  try {
    console.log(`🔍 Fetching order #${orderId}`);
    const response = await apiClient.get(`/${orderId}`);
    console.log('✅ Order fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching order #${orderId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getOrdersByClient(clientId) {
  try {
    console.log(`🔍 Fetching orders for client #${clientId}`);
    const response = await apiClient.get(`/client/${clientId}`);
    console.log(`✅ Fetched ${response.data.length} orders for client #${clientId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching orders for client #${clientId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getOrdersByStatus(status) {
  try {
    console.log(`🔍 Fetching orders with status: ${status}`);
    const response = await apiClient.get(`/status/${status}`);
    console.log(`✅ Fetched ${response.data.length} orders with status ${status}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching orders with status ${status}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function addOrder(orderData) {
  try {
    console.log('➕ Adding new order:', orderData);
    
    // Log token information for debugging
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.decodeToken(token);
    console.log('🔐 Using token with roles:', decodedToken?.roles || 'No roles found');
    
    const response = await apiClient.post('/add', orderData);
    console.log('✅ Order added successfully:', response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (error.response?.status === 403) {
      console.error("🚫 Permission denied: You need ADMIN role to add orders");
      console.error("📝 Order data that failed:", orderData);
      
      // Check if token has admin role
      const token = TokenManager.getToken();
      const decodedToken = TokenManager.decodeToken(token);
      const hasAdminRole = decodedToken?.roles?.includes('ADMIN');
      console.error(`🔐 Current user has ADMIN role: ${hasAdminRole ? 'Yes' : 'No'}`);
    }
    
    console.error("❌ Error adding order:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateOrder(orderId, orderData) {
  try {
    console.log(`🔄 Updating order #${orderId}:`, orderData);
    const response = await apiClient.put(`/update/${orderId}`, orderData);
    console.log('✅ Order updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating order #${orderId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function deleteOrder(orderId) {
  try {
    console.log(`🗑️ Deleting order #${orderId}`);
    const response = await apiClient.delete(`/delete/${orderId}`);
    console.log('✅ Order deleted successfully');
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting order #${orderId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    console.log(`🔄 Updating status of order #${orderId} to: ${status}`);
    const response = await apiClient.put(`/update/${orderId}/status`, { status });
    console.log('✅ Order status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating status of order #${orderId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getOrderQrCode(orderId) {
  try {
    console.log(`🔍 Fetching QR code for order #${orderId}`);
    const response = await apiClient.get(`/${orderId}/qrcode`);
    console.log('✅ QR code fetched successfully');
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching QR code for order #${orderId}:`, error.response?.data || error.message);
    throw error;
  }
}

// Adaugă această funcție în ordersAPI.jsx

export const fetchFilteredOrders = async (searchTerm, status, deviceId, page = 0, size = 10, sortBy = 'id', sortDir = 'desc') => {
  try {
    console.log('📋 Fetching filtered orders', { searchTerm, status, deviceId, page, size });
    
    // Construiește parametrii URL
    let params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (status && status !== 'all') params.append('status', status);
    if (deviceId) params.append('deviceId', deviceId);
    
    // Folosește apiClient care are deja configurată adresa de bază și interceptorii pentru token
    const response = await apiClient.get(`/filter?${params.toString()}`);
    
    console.log(`✅ Page ${page} loaded with ${response.data.content.length} orders (total: ${response.data.totalElements})`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching filtered orders:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrderDetails = async (id) => {
  console.log(`🔍 Fetching complete order details for ID: ${id}`);
  const response = await apiClient.get(`/details/${id}`);
  console.log(`✅ Order details fetched successfully for ID: ${id}`);
  return response.data;
};

/**
 * Marchează o comandă ca fiind predată clientului
 * @param {number} orderId ID-ul comenzii
 * @returns {Promise<Object>} Comanda actualizată
 */
export const markOrderAsDelivered = async (orderId) => {
  try {
    const response = await apiClient.put(`/${orderId}/deliver`);
    return response.data;
  } catch (error) {
    console.error('❌ Error marking order as delivered:', error);
    throw error;
  }
};

/**
 * Verifică dacă o comandă poate fi marcată ca predată
 * @param {number} orderId ID-ul comenzii
 * @returns {Promise<boolean>} true dacă poate fi marcată ca predată
 */
export const canOrderBeDelivered = async (orderId) => {
  try {
    const response = await apiClient.get(`/${orderId}/can-deliver`);
    return response.data;
  } catch (error) {
    console.error('❌ Error checking if order can be delivered:', error);
    return false;
  }
};

export default {
  fetchAllOrders,
  getOrderById,
  getOrdersByClient,
  getOrdersByStatus,
  addOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderQrCode,
  fetchFilteredOrders,
  getOrderDetails,
  markOrderAsDelivered,
  canOrderBeDelivered
};