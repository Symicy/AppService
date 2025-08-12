// QR API service for frontend
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Get QR image URL for client order
export const getClientOrderQRImage = (orderId) => {
  return `${API_BASE_URL}/api/qr/client-order/${orderId}`;
};

// Get QR image URL for service device
export const getServiceDeviceQRImage = (deviceId) => {
  return `${API_BASE_URL}/api/qr/service-device/${deviceId}`;
};

// Get QR link (URL) for client order
export const getClientOrderQRLink = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/qr/client-order/${orderId}/link`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client QR link:', error);
    throw error;
  }
};

// Get QR link (URL) for service device
export const getServiceDeviceQRLink = async (deviceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/qr/service-device/${deviceId}/link`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service QR link:', error);
    throw error;
  }
};

// Regenerate all QR codes for an order
export const regenerateOrderQRs = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/qr/regenerate/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error regenerating QR codes:', error);
    throw error;
  }
};

// Download QR image
export const downloadQRImage = async (qrImageUrl, fileName) => {
  try {
    const response = await axios.get(qrImageUrl, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading QR image:', error);
    throw error;
  }
};

// Print QR code (opens in new window for printing)
export const printQRCode = (qrImageUrl, title = 'QR Code') => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              text-align: center; 
              font-family: Arial, sans-serif;
            }
            img { 
              max-width: 100%; 
              height: auto; 
            }
            h1 {
              margin-bottom: 20px;
              color: #333;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <img src="${qrImageUrl}" alt="${title}" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for image to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

// Legacy function for backward compatibility
export async function fetchOrderByToken(token) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/scan";
  const endpoints = [
    `${API_BASE}/qr/scan/${encodeURIComponent(token)}`,
    `${API_BASE}/qr/scan?token=${encodeURIComponent(token)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (res.ok) return await res.json();
    } catch {
      // try next
    }
  }
  throw new Error("Unable to fetch order for this QR token.");
}