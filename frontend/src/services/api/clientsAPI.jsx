import axios from 'axios';
import { TokenManager } from './authAPI';

const API_BASE_URL = 'http://localhost:8080/api/clients';

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
      console.log('🔑 Adding token to client API request:', token?.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for client API request');
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

export async function fetchAllClients() {
  try {
    console.log('📋 Fetching all clients');
    const response = await apiClient.get('/all');
    console.log('✅ Clients fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching clients:", error.response?.data || error.message);
    throw error;
  }
}

export async function addClient(clientData) {
  try {
    console.log('➕ Adding new client:', clientData);
    
    // Log token information for debugging
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.decodeToken(token);
    console.log('🔐 Using token with roles:', decodedToken?.roles || 'No roles found');
    
    const response = await apiClient.post('/add', clientData);
    console.log('✅ Client added successfully:', response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (error.response?.status === 403) {
      console.error("🚫 Permission denied: You need ADMIN role to add clients");
      console.error("📝 Client data that failed:", clientData);
      
      // Check if token has admin role
      const token = TokenManager.getToken();
      const decodedToken = TokenManager.decodeToken(token);
      const hasAdminRole = decodedToken?.roles?.includes('ADMIN');
      console.error(`🔐 Current user has ADMIN role: ${hasAdminRole ? 'Yes' : 'No'}`);
    }
    
    console.error("❌ Error adding client:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateClient(clientId, clientData) {
  try {
    console.log(`🔄 Updating client #${clientId}:`, clientData);
    const response = await apiClient.put(`/update/${clientId}`, clientData);
    console.log('✅ Client updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating client #${clientId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function deleteClient(clientId) {
  try {
    console.log(`🗑️ Deleting client #${clientId}`);
    const response = await apiClient.delete(`/delete/${clientId}`);
    console.log('✅ Client deleted successfully');
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting client #${clientId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getClientById(clientId) {
  try {
    console.log(`🔍 Fetching client #${clientId}`);
    const response = await apiClient.get(`/${clientId}`);
    console.log('✅ Client fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching client #${clientId}:`, error.response?.data || error.message);
    throw error;
  }
}

export async function getClientsByType(clientType) {
  try {
    console.log(`🔍 Fetching clients of type: ${clientType}`);
    const response = await apiClient.get(`/type/${clientType}`);
    console.log(`✅ Fetched ${response.data.length} clients of type ${clientType}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching clients of type ${clientType}:`, error.response?.data || error.message);
    throw error;
  }
}

// Modifică funcția fetchFilteredClients astfel:
export const fetchFilteredClients = async (searchTerm, type, page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
  try {
    console.log('📋 Fetching filtered clients', { searchTerm, type, page, size });
    
    // Construiește parametrii URL
    let params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (type && type !== 'all') params.append('type', type);
    
    // Folosește apiClient care are deja configurată adresa de bază și interceptorii pentru token
    const response = await apiClient.get(`/filter?${params.toString()}`);
    
    console.log(`✅ Page ${page} loaded with ${response.data.content.length} clients (total: ${response.data.totalElements})`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching filtered clients:', error.response?.data || error.message);
    throw error;
  }
};

export const getNumberOfClients = async () => {
  try {
    const response = await apiClient.get('/nrClients');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching number of clients:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  fetchAllClients,
  addClient,
  updateClient,
  deleteClient,
  getClientById,
  getClientsByType,
  fetchFilteredClients,
  getNumberOfClients
};