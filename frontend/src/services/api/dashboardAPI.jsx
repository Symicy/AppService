import { TokenManager } from './authAPI';

const BASE_URL = 'http://localhost:8080/api';

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent orders for dashboard
  getRecentOrders: async (limit = 5) => {
    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/recent-orders?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  // Get monthly orders data for charts
  getMonthlyOrdersData: async () => {
    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/monthly-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly orders data:', error);
      throw error;
    }
  },

  // Get order status distribution for doughnut chart
  getStatusDistribution: async () => {
    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/status-distribution`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching status distribution:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
