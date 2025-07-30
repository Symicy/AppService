import axios from 'axios';
import { TokenManager } from './authAPI';

const API_BASE_URL = 'http://localhost:8080/api/devices';

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
      console.log('🔑 Adding token to device API request:', token?.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for device API request');
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

export async function fetchAllDevices() {
  try {
    console.log('📋 Fetching all devices');
    const response = await apiClient.get('/all');
    console.log('✅ Devices fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching devices:", error.response?.data || error.message);
    throw error;
  }
}

export async function getDeviceById(deviceId) {
  try {
    console.log(`🔍 Fetching device #${deviceId}`);
    const response = await apiClient.get(`/${deviceId}`);
    console.log('✅ Device fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching device #${deviceId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getDevicesByOrder(orderId) {
  try {
    console.log(`🔍 Fetching devices for order #${orderId}`);
    const response = await apiClient.get(`/order/${orderId}`);
    console.log(`✅ Fetched ${response.data.length} devices for order #${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching devices for order #${orderId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getDeviceBySerialNumber(serialNumber) {
  try {
    console.log(`🔍 Fetching device with serial number: ${serialNumber}`);
    const response = await apiClient.get(`/serial/${serialNumber}`);
    console.log('✅ Device fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching device with serial number ${serialNumber}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function addDevice(deviceData) {
  try {
    console.log('➕ Adding new device:', deviceData);
    
    // Log token information for debugging
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.decodeToken(token);
    console.log('🔐 Using token with roles:', decodedToken?.roles || 'No roles found');
    
    const response = await apiClient.post('/add', deviceData);
    console.log('✅ Device added successfully:', response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (error.response?.status === 403) {
      console.error("🚫 Permission denied: You need ADMIN role to add devices");
      console.error("📝 Device data that failed:", deviceData);
      
      // Check if token has admin role
      const token = TokenManager.getToken();
      const decodedToken = TokenManager.decodeToken(token);
      const hasAdminRole = decodedToken?.roles?.includes('ADMIN');
      console.error(`🔐 Current user has ADMIN role: ${hasAdminRole ? 'Yes' : 'No'}`);
    }
    
    console.error("❌ Error adding device:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateDevice(deviceId, deviceData) {
  try {
    console.log(`🔄 Updating device #${deviceId}:`, deviceData);
    const response = await apiClient.put(`/update/${deviceId}`, deviceData);
    console.log('✅ Device updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating device #${deviceId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function deleteDevice(deviceId) {
  try {
    console.log(`🗑️ Deleting device #${deviceId}`);
    const response = await apiClient.delete(`/delete/${deviceId}`);
    console.log('✅ Device deleted successfully');
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting device #${deviceId}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Actualizează doar statusul unui dispozitiv
 * @param {number} deviceId ID-ul dispozitivului
 * @param {string} status Noul status
 * @returns {Promise<Object>} Dispozitivul actualizat
 */
export async function updateDeviceStatus(deviceId, status) {
  try {
    console.log(`🔄 Updating status for device #${deviceId} to "${status}"`);
    const response = await apiClient.put(`/${deviceId}/status`, { status });
    console.log('✅ Device status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating status for device #${deviceId}:`, error.response?.data || error.message);
    throw error;
  }
}

export default {
  fetchAllDevices,
  getDeviceById,
  getDevicesByOrder,
  getDeviceBySerialNumber,
  addDevice,
  updateDevice,
  deleteDevice,
  updateDeviceStatus
};