import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TokenManager } from '../services/api/authAPI';
import { printDocument } from '../utils/printUtils';
import KivaLogo from '../poze/3dlogo.png';
import * as ordersAPI from '../services/api/ordersAPI';
import * as clientsAPI from '../services/api/clientsAPI';
import * as orderLogAPI from '../services/api/orderLogAPI';
import * as devicesAPI from '../services/api/devicesAPI';
import * as qrAPI from '../services/api/qrAPI';
import '../styles/global.css';
import '../styles/components/navbar.css';
import '../styles/components/buttons.css';
import '../styles/components/cards.css';
import '../styles/components/tables.css';
import '../styles/components/forms.css';
import '../styles/components/timeline.css';
import '../styles/components/print-order.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [orderLogs, setOrderLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedOrderHistory, setSelectedOrderHistory] = useState(null);
  
  // QR Modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQROrder, setSelectedQROrder] = useState(null);
  
  // State pentru modal adăugare comandă
  const [newOrderForm, setNewOrderForm] = useState({
    clientId: '',
    status: 'PRELUAT',
    devices: []
  });

  // Pentru a adăuga un nou dispozitiv la comandă
  const [newDevice, setNewDevice] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    note: '',
    credential: '',
    licenseKey: '',
    hostname: '',
    status: 'PRELUAT',
    predefinedAccessories: [],
    customAccessories: '',
    toDo: ''
  });

  const [predefinedAccessories, setPredefinedAccessories] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Extrage parametrii din URL
  const params = new URLSearchParams(location.search);
  const filteredByDevice = params.get('deviceId');
  const filteredByOrder = params.get('orderId'); // Nou parametru pentru filtrarea după ID comandă
  
  // Adaugă aceste state-uri pentru paginare
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt'); 
  const [sortDir, setSortDir] = useState('desc');

  // Adaugă un ref pentru a preveni apelurile multiple în development mode
  const dataFetchedRef = useRef(false);
  // Adaugă acest ref pentru a urmări dacă clienții au fost încărcați
  const clientsLoadedRef = useRef(false);


  // Păstrăm useEffect pentru state-ul din location (mesaje și modale)
  useEffect(() => {
    if (location.state?.openNewOrderModal) {
      setShowNewOrderModal(true);
      window.history.replaceState({}, document.title);
    }
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  useEffect(() => {
    // Verifică flag-ul pentru a preveni apelurile duble
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    
    fetchFilteredData();
    
    // Resetați flag-ul când se schimbă criteriile de filtrare
    return () => {
      dataFetchedRef.current = false;
      // NU resetăm clientsLoadedRef.current aici
    };
  }, [searchTerm, filterStatus, filteredByDevice, page, size, sortBy, sortDir]);

  const handleAddDeviceToOrder = () => {
    // Validare pentru device
    if (!newDevice.brand || !newDevice.model) {
      setError('Brand and model are required for devices');
      return;
    }

    // Validare pentru credential
    if (!newDevice.credential || newDevice.credential.trim() === '') {
      setError('Credential is required for all devices');
      return;
    }

    // Adaugă dispozitiv nou la lista de dispozitive a comenzii
    setNewOrderForm({
      ...newOrderForm,
      devices: [...newOrderForm.devices, 
        { ...newDevice,
          status: newOrderForm.status, // Setează statusul dispozitivului la același ca al comenzii
         }]
    });

    // Reset form pentru device nou
    setNewDevice({
      brand: '',
      model: '',
      serialNumber: '',
      note: '',
      credential: '',
      licenseKey: '',
      hostname: '',
      status: 'PRELUAT',
      predefinedAccessories: [],
      customAccessories: '',
      toDo: ''
    });
    
    console.log('✅ Device added to order form');
  };

    const fetchFilteredData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Încarcă comenzile filtrate și paginate
        const response = await ordersAPI.fetchFilteredOrders(
          searchTerm, 
          filterStatus, 
          filteredByDevice, 
          page, 
          size,
          sortBy,
          sortDir
        );
        
        setOrders(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        
        // IMPORTANT: Setează isLoading la false ÎNAINTE de a încărca clienții
        setIsLoading(false);
        
        console.log(`✅ Loaded page ${page+1} of ${response.totalPages} (total: ${response.totalElements} orders)`);
        
        // Folosește setTimeout pentru a permite interfeței să se actualizeze înainte de încărcarea clienților
        if (!clientsLoadedRef.current && clients.length === 0) {
          // Folosește setTimeout cu un delay de 0ms pentru a plasa codul în următoarea iterație a event loop-ului
          setTimeout(async () => {
            try {
              console.log('🔄 Loading clients in background...');
              const clientsData = await clientsAPI.fetchAllClients();
              setClients(clientsData);
              clientsLoadedRef.current = true;
              console.log(`✅ ${clientsData.length} clients loaded silently in background`);
              
              // Load predefined accessories as well
              console.log('🔄 Loading predefined accessories...');
              const accessories = await devicesAPI.getAllPredefinedAccessories();
              setPredefinedAccessories(accessories);
              console.log(`✅ ${accessories.length} predefined accessories loaded`);
              
            } catch (error) {
              console.error('❌ Error loading clients in background:', error);
              // Nu setăm nicio eroare vizibilă deoarece se încarcă în background
            }
          }, 0);
        }
      } catch (error) {
        console.error('❌ Error loading orders data:', error);
        setError('Failed to load orders. Please try again.');
        setIsLoading(false);
      }
    };
  const handleRemoveDeviceFromOrder = (index) => {
    const updatedDevices = [...newOrderForm.devices];
    updatedDevices.splice(index, 1);
    setNewOrderForm({
      ...newOrderForm,
      devices: updatedDevices
    });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Verifică dacă este selectat un client
      if (!newOrderForm.clientId) {
        setError('Please select a client');
        setIsLoading(false);
        return;
      }

      // Verifică dacă există cel puțin un dispozitiv
      if (newOrderForm.devices.length === 0) {
        setError('Please add at least one device');
        setIsLoading(false);
        return;
      }

      // Obține user_id din token
      const token = TokenManager.getToken();
      let userId = null;
      
      if (token) {
        const decodedToken = TokenManager.decodeToken(token);
        userId = decodedToken?.userId || decodedToken?.id || decodedToken?.sub;
        console.log('🔒 Current user ID:', userId);
      }
      
      if (!userId) {
        setError('Could not determine user ID. Please login again.');
        setIsLoading(false);
        return;
      }

      // Pregătește datele pentru API
      const orderData = {
        client: { id: newOrderForm.clientId },
        status: newOrderForm.status,
        devices: newOrderForm.devices,
        user: { id: userId }  // În loc de user_id: userId
      };

      console.log('📝 Creating new order:', orderData);
      const result = await ordersAPI.addOrder(orderData);
      
      // Închide modalul și resetează formularul
      setShowNewOrderModal(false);
      setNewOrderForm({
        clientId: '',
        status: 'PRELUAT',
        devices: []
      });
      
      // Adaugă un mesaj de succes cu ID-ul comenzii
      setSuccessMessage(`Order #${result.id} created successfully. Page will refresh in a moment.`);
      console.log('✅ Order created successfully:', result);
      
      // Așteaptă 2 secunde și apoi reîncarcă pagina curentă
      setTimeout(() => {
        dataFetchedRef.current = false; // Resetează flag-ul pentru a permite reîncărcarea
        fetchFilteredData(); // Reîncarcă datele direct folosind funcția existentă
      }, 2000);
    
    } catch (error) {
      console.error('❌ Create order error:', error);
      
      if (error.response?.status === 403) {
        setError('Permission denied: You need administrator privileges to create orders');
      } else {
        setError('Failed to create order. Please check your data and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await ordersAPI.updateOrder(selectedOrder.id, selectedOrder);
      
      // Actualizare state local
      setOrders(orders.map(order => 
        order.id === selectedOrder.id ? result : order
      ));
      
      // Închide modalul
      setShowEditOrderModal(false);
      console.log('✅ Order updated successfully:', result);
      
    } catch (error) {
      console.error('❌ Update order error:', error);
      setError('Failed to update order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderIdentifier) => {
    if (window.confirm(`Are you sure you want to delete order #${orderIdentifier}? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        await ordersAPI.deleteOrder(orderId);
        
        // Elimină din state local
        setOrders(orders.filter(order => order.id !== orderId));
        console.log('✅ Order deleted successfully!');
        
      } catch (error) {
        console.error('❌ Error deleting order:', error);
        setError('Failed to delete order. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Adaugă această funcție în componenta Orders
  const openHistoryModal = async (order) => {
    setIsLoadingLogs(true);
    setSelectedOrderHistory(order);
    setShowHistoryModal(true);
    
    try {
      // Încarcă logurile pentru comanda selectată
      const logs = await orderLogAPI.fetchOrderLogs(order.id);
      setOrderLogs(logs);
      console.log(`✅ Loaded ${logs.length} history records for order #${order.id}`);
      console.log('Details:', logs);
    } catch (error) {
      console.error(`❌ Error loading history for order #${order.id}:`, error);
      setError('Failed to load order history. Please try again.');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Helper pentru a determina iconul potrivit pentru fiecare tip de log
  const getLogIcon = (message) => {
    if (message.includes("created")) return "fas fa-plus-circle";
    if (message.includes("status") || message.includes("Status")) return "fas fa-sync-alt";
    if (message.includes("delivered")) return "fas fa-handshake";
    if (message.includes("added") || message.includes("device")) return "fas fa-laptop";
    if (message.includes("updated") || message.includes("modified")) return "fas fa-edit";
    return "fas fa-info-circle";
  };

  // Modificați funcția openDetailsModal pentru a încărca detaliile complete
  const openDetailsModal = async (order) => {
    setIsLoading(true);
    
    try {
      // Folosim noul endpoint care returnează toate detaliile într-un singur apel
      const orderDetails = await ordersAPI.getOrderDetails(order.id);
      setSelectedOrder(orderDetails);
      setShowDetailsModal(true);
      console.log(`✅ Loaded complete details for order #${order.id}`);
    } catch (error) {
      console.error(`❌ Error loading details for order #${order.id}:`, error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open QR modal
  const openQRModal = async (order) => {
    try {
      const orderDetails = await ordersAPI.getOrderDetails(order.id);
      setSelectedQROrder(orderDetails);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error loading order for QR modal:', error);
      setError('Failed to load order details for QR codes.');
    }
  };

  const navigateToNewClient = () => {
    navigate('/clients', { 
      state: { 
        openNewClientModal: true,
        returnToOrders: true 
      } 
    });
  };

  // Helper pentru afișarea stării comenzii
  const getStatusBadge = (status) => {
    switch(status) {
      case 'PRELUAT':
        return <span className="badge bg-info">Preluată</span>;
      case 'IN_LUCRU':
        return <span className="badge bg-warning">În lucru</span>;
      case 'FINALIZAT':
        return <span className="badge bg-success">Finalizată</span>;
      case 'PREDAT':
        return <span className="badge bg-danger">Predată</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Adaugă aceste funcții pentru gestionarea paginării
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSizeChange = (event) => {
    setSize(parseInt(event.target.value));
    setPage(0); // Reset to first page when changing size
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      // Dacă e același sortBy, inversează direcția
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // Dacă e alt sortBy, setează-l și resetează direcția la desc
      setSortBy(column);
      setSortDir('desc');
    }
    setPage(0); // Reset to first page when changing sort
  };

  // Adăugați funcția pentru renderizarea numerelor de pagină
const renderPageNumbers = () => {
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  if (totalPages <= maxPagesToShow) {
    // Afișează toate paginile dacă sunt puține
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i + 1}
          </button>
        </li>
      );
    }
  } else {
    // Pentru multe pagini, afișează prima, ultima și câteva din jurul celei curente
    // Adaugă prima pagină
    pageNumbers.push(
      <li key={0} className={`page-item ${page === 0 ? 'active' : ''}`}>
        <button className="page-link" onClick={() => handlePageChange(0)}>1</button>
      </li>
    );
    
    // Adaugă elipsa dacă pagina curentă nu este aproape de început
    if (page > 2) {
      pageNumbers.push(
        <li key="ellipsis1" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    
    // Adaugă paginile din jurul celei curente
    const startPage = Math.max(1, page - 1);
    const endPage = Math.min(totalPages - 2, page + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i + 1}
          </button>
        </li>
      );
    }
    
    // Adaugă elipsa dacă pagina curentă nu este aproape de sfârșit
    if (page < totalPages - 3) {
      pageNumbers.push(
        <li key="ellipsis2" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    
    // Adaugă ultima pagină
    pageNumbers.push(
      <li key={totalPages-1} className={`page-item ${page === totalPages - 1 ? 'active' : ''}`}>
        <button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>
          {totalPages}
        </button>
      </li>
    );
  }
  
  return pageNumbers;
};

  // Adăugați această funcție pentru a încărca clienții când se deschide modal-ul
const loadClientsForNewOrder = async (showLoading = true) => {
  if (clients.length === 0) {
    try {
      if (showLoading) setIsLoading(true);
      
      const clientsData = await clientsAPI.fetchAllClients();
      setClients(clientsData);
      clientsLoadedRef.current = true;
      console.log(`✅ Loaded ${clientsData.length} clients for order form`);
      setShowNewOrderModal(true); // Deschide modalul după încărcare
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      if (showLoading) {
        setError('Failed to load clients. Please try again.');
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }
};

// Modifică funcția openNewOrderModal pentru a nu mai încărca clienții din nou
const openNewOrderModal = () => {
  // Verifică dacă clienții nu sunt încărcați deloc, caz foarte rar
  if (clients.length === 0 && !clientsLoadedRef.current) {
    loadClientsForNewOrder(true); // Forțează încărcarea clienților cu indicator
  } else {
    setShowNewOrderModal(true);
  }
};

  // Adaugă această funcție după celelalte handlere
const handleMarkAsDelivered = async () => {
  if (!selectedOrder) return;
  
  if (window.confirm(`Are you sure you want to mark order #${selectedOrder.id} as delivered to the client? This will update the status of all devices to 'PREDATA'.`)) {
    setIsLoading(true);
    try {
      await ordersAPI.markOrderAsDelivered(selectedOrder.id);
      
      // Actualizează lista de comenzi
      fetchFilteredData();
      
      // Actualizează comanda selectată
      const updatedOrder = await ordersAPI.getOrderDetails(selectedOrder.id);
      setSelectedOrder(updatedOrder);
      
      setSuccessMessage(`Order #${selectedOrder.id} has been marked as delivered to the client.`);
    } catch (error) {
      console.error(`❌ Error marking order as delivered:`, error);
      setError('Failed to mark order as delivered. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
};

// Add this new function to handle printing individual orders
const handlePrintOrder = async (order) => {
  try {
    // Get full order details for printing
    const orderDetails = await ordersAPI.getOrderDetails(order.id);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate the print HTML content
    const printHTML = generateOrderPrintHTML(orderDetails);
    
    // Write the HTML to the new window
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for images to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
    
  } catch (error) {
    console.error('Error printing order:', error);
    setError('Failed to prepare order for printing. Please try again.');
  }
};

// Helper function to generate print HTML
const generateOrderPrintHTML = (order) => {
  const formatPrintDate = (date) => {
    // Formatează data și ora de creație a comenzii
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatPrintStatus = (status) => {
    const statusMap = {
      'PRELUAT': 'Preluată',
      'IN_LUCRU': 'În lucru',
      'FINALIZAT': 'Finalizată',
      'PREDAT': 'Predată'
    };
    return statusMap[status] || status;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fișă de Recepție - Comandă #${order.id}</title>
      <style>
        /* Print styles */
        @page {
          size: A4;
          margin: 2cm 1.5cm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          background: #fff;
        }
        
        .print-header {
          border-bottom: 2px solid #000000;
          padding-bottom: 15px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .print-logo {
          max-height: 60px;
          width: auto;
        }
        
        .print-company-info {
          text-align: right;
          font-size: 10pt;
          line-height: 1.3;
        }
        
        .print-title {
          font-size: 18pt;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .print-order-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 25px;
        }
        
        .print-info-section {
          border: 1px solid #ccc;
          padding: 15px;
          background: #f9f9f9;
        }
        
        .print-info-title {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000000;
          border-bottom: 1px solid #000000;
          padding-bottom: 5px;
        }
        
        .print-info-item {
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        
        .print-info-label {
          font-weight: bold;
          color: #000000;
          min-width: 100px;
        }
        
        .print-info-value {
          color: #000;
          flex: 1;
          text-align: right;
        }
        
        .print-section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 2px solid #000000;
          text-transform: uppercase;
        }
        
        .print-devices-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          margin-bottom: 15px;
        }
        
        .print-devices-table th,
        .print-devices-table td {
          border: 1px solid #ccc;
          padding: 8px 6px;
          text-align: left;
          vertical-align: top;
        }
        
        .print-devices-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          color: #000000;
          font-size: 9pt;
          text-transform: uppercase;
          border: 1px solid #cccccc;
        }
        
        .print-devices-table td {
          color: #333;
        }
        
        .device-issue {
          font-style: italic;
          font-size: 9pt;
          color: #666;
        }
        
        .print-terms {
          margin-top: 20px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        
        .print-terms-title {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 8px;
          color: #000000;
        }
        
        .print-terms-list {
          font-size: 8pt;
          line-height: 1.3;
          color: #333;
          margin: 0;
          padding-left: 18px;
        }
        
        .print-terms-list li {
          margin-bottom: 3px;
        }
        
        .print-signatures {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .print-signature-box {
          border: 1px solid #ccc;
          padding: 10px;
          min-height: 80px;
          position: relative;
        }
        
        .print-signature-title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 30px;
          color: #000000;
        }
        
        .print-signature-line {
          border-bottom: 1px solid #333333;
          width: 100%;
          height: 1px;
          position: absolute;
          bottom: 25px;
        }
        
        .print-signature-label {
          position: absolute;
          bottom: 10px;
          font-size: 8pt;
          color: #666;
        }
        
        .print-footer {
          margin-top: 15px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          text-align: center;
          font-size: 8pt;
          color: #666;
        }
        
        .print-status-badge {
          display: inline-block;
          padding: 2px 6px;
          border: 1px solid #333333;
          background-color: #f5f5f5;
          border-radius: 3px;
          font-size: 8pt;
          font-weight: bold;
          text-transform: uppercase;
          color: #333333;
        }
        
        .print-text-center {
          text-align: center;
        }
        
        .print-bold {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <!-- Print Header -->
      <div class="print-header">
        <div>
          <img src="${KivaLogo}" alt="Kiva Net Service" class="print-logo" />
        </div>
        <div class="print-company-info">
          <div class="print-bold">KIVA NET SERVICE SRL</div>
          <div>Service și Reparații IT</div>
          <div>Bulevardul Decebal 7/6, Baia Mare</div>
          <div>Tel: +40749934941</div>
          <div>CUI: 37892391 | J24/1213/2017</div>
        </div>
      </div>

      <!-- Document Title -->
      <div class="print-title">
        Fișă de Recepție - Comandă #${order.id}
      </div>

      <!-- Order Information -->
      <div class="print-order-info">
        <div class="print-info-section">
          <div class="print-info-title">Informații Comandă</div>
          <div class="print-info-item">
            <span class="print-info-label">Număr comandă:</span>
            <span class="print-info-value">#${order.id}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">Data creație:</span>
            <span class="print-info-value">${formatPrintDate(order.createdAt)}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">Status:</span>
            <span class="print-info-value print-status-badge">${formatPrintStatus(order.status)}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">Device-uri:</span>
            <span class="print-info-value">${order.devices?.length || 0} buc.</span>
          </div>
        </div>

        <div class="print-info-section">
          <div class="print-info-title">Informații Client</div>
          <div class="print-info-item">
            <span class="print-info-label">Nume:</span>
            <span class="print-info-value">${order.client?.name ? `${order.client.name} ${order.client.surname}` : order.clientName || 'N/A'}</span>
          </div>
          ${order.client?.cui ? `
          <div class="print-info-item">
            <span class="print-info-label">CUI:</span>
            <span class="print-info-value">${order.client.cui}</span>
          </div>
          ` : ''}
          ${order.client?.phone ? `
          <div class="print-info-item">
            <span class="print-info-label">Telefon:</span>
            <span class="print-info-value">${order.client.phone}</span>
          </div>
          ` : ''}
          ${order.client?.email ? `
          <div class="print-info-item">
            <span class="print-info-label">Email:</span>
            <span class="print-info-value">${order.client.email}</span>
          </div>
          ` : ''}
          <div class="print-info-item">
            <span class="print-info-label">Cod QR Client:</span>
            <div class="print-qr-code">
              <img src="${qrAPI.getClientOrderQRImage(order.id)}" alt="QR Code Client" style="width: 80px; height: 80px; border: 1px solid #ccc;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Devices Table -->
      <div class="print-devices-section">
        <div class="print-section-title">Device-uri Recepționate</div>
        ${order.devices && order.devices.length > 0 ? `
          <table class="print-devices-table">
            <thead>
              <tr>
                <th style="width: 5%;">Nr.</th>
                <th style="width: 12%;">Brand</th>
                <th style="width: 12%;">Model</th>
                <th style="width: 12%;">Serie</th>
                <th style="width: 25%;">Problemă raportată</th>
                <th style="width: 18%;">Accesorii</th>
                <th style="width: 8%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${order.devices.map((device, index) => `
                <tr>
                  <td class="print-text-center print-bold">${index + 1}</td>
                  <td>${device.brand || 'N/A'}</td>
                  <td>${device.model || 'N/A'}</td>
                  <td>${device.serialNumber || 'N/A'}</td>
                  <td>
                    <div>${device.issueDescription || device.note || 'Nu a fost specificată'}</div>
                  </td>
                  <td>
                    ${(device.predefinedAccessories && device.predefinedAccessories.length > 0) || device.customAccessories ? `
                      <div style="font-size: 8pt;">
                        ${device.predefinedAccessories && device.predefinedAccessories.length > 0 ? 
                          device.predefinedAccessories.join(', ') : ''}${device.predefinedAccessories && device.predefinedAccessories.length > 0 && device.customAccessories ? ', ' : ''}${device.customAccessories || ''}
                      </div>
                    ` : '<span style="font-size: 8pt; color: #999;">-</span>'}
                  </td>
                  <td>
                    <span class="print-status-badge">
                      ${formatPrintStatus(device.status || order.status)}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div class="print-text-center" style="padding: 20px; font-style: italic;">
            Nu sunt device-uri în această comandă.
          </div>
        `}
      </div>

      <!-- Terms and Conditions -->
      <div class="print-terms">
        <div class="print-terms-title">Termeni și Condiții</div>
        <ol class="print-terms-list">
          <li>Clientul confirmă că device-urile predate corespund descrierii de mai sus.</li>
          <li>KIVA Service nu este responsabil pentru pierderea datelor. Recomandăm realizarea unui backup înainte de predare.</li>
          <li>Durata estimată de reparație este de 3-7 zile lucrătoare, în funcție de complexitatea problemei.</li>
          <li>Clientul va fi contactat telefonic la finalizarea reparației.</li>
          <li>Device-urile nereclmate în termen de 30 de zile vor fi considerate abandonate.</li>
          <li>Garantia pentru reparația efectuată este de 30 de zile pentru defectul remediat.</li>
          <li>Plata se efectuează la ridicarea device-ului reparat.</li>
          <li>În cazul în care reparația nu poate fi efectuată, se percepe o taxă de diagnosticare de 50 RON.</li>
        </ol>
      </div>

      <!-- Signatures -->
      <div class="print-signatures">
        <div class="print-signature-box">
          <div class="print-signature-title">Semnătura Clientului</div>
          <div class="print-signature-line"></div>
          <div class="print-signature-label">Semnătura și numele clientului</div>
        </div>

        <div class="print-signature-box">
          <div class="print-signature-title">Semnătura Reprezentant KIVA NET SERVICE</div>
          <div class="print-signature-line"></div>
          <div class="print-signature-label">Semnătura și numele tehnicianului</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="print-footer">
        <div>
          Acest document constituie dovada recepției device-urilor și acordul pentru serviciile KIVA NET SERVICE.
        </div>
        <div style="margin-top: 10px;">
          KIVA NET SERVICE SRL - Bulevardul Decebal 7/6, Baia Mare | CUI: 37892391 | Tel: +40749934941
        </div>
        <div style="margin-top: 5px; font-size: 7pt; color: #666;">
          Nr. Înmatriculare: J24/1213/2017 | EUID: ROONRC.J24/1213/2017
        </div>
      </div>
    </body>
    </html>
  `;
};

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'}}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src={KivaLogo} alt="KIVA Logo" className="kiva-logo" />
            <span className="text-cyan">KIVA</span> 
            <span className="text-white ms-2">Service Manager</span>
          </Link>
          <div className="navbar-nav">
            <Link className="nav-link text-white" to="/">
              <i className="fas fa-home me-2"></i>Home
            </Link>
            <Link className="nav-link text-cyan" to="/orders">
              <i className="fas fa-clipboard-list me-2"></i>Orders
            </Link>
            <Link className="nav-link text-white" to="/clients">
              <i className="fas fa-users me-2"></i>Clients
            </Link>
            <Link className="nav-link text-white" to="/devices">
              <i className="fas fa-laptop me-2"></i>Devices
            </Link>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh'}}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-cyan">Home</Link></li>
            <li className="breadcrumb-item text-white">Orders</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-cyan">
              <i className="fas fa-clipboard-list me-3"></i>Order Management
            </h2>
            <p className="text-white mb-0">Track and manage customer orders</p>
          </div>
          <button 
            className="btn btn-kiva-action"
            onClick={openNewOrderModal}
          >
            <i className="fas fa-plus me-2"></i>New Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Orders</h6>
                    <h3 className="mb-0 text-white">{totalElements}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-clipboard-list fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">In Progress</h6>
                    <h3 className="mb-0 text-white">{orders.filter(o => o.status === 'IN_LUCRU').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-cogs fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Completed</h6>
                    <h3 className="mb-0 text-white">{orders.filter(o => o.status === 'PREDAT').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-check-circle fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Devices</h6>
                    <h3 className="mb-0 text-white"> {orders.reduce((sum, order) => sum + (order.deviceCount || 0), 0)}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-laptop fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <div className="d-flex align-items-center">
              <i className="fas fa-exclamation-circle fa-2x me-3"></i>
              <div>
                <h5 className="mb-1">Error</h5>
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Display */}
        {successMessage && (
          <div className="alert alert-success mb-4">
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle fa-2x me-3"></i>
              <div>
                <h5 className="mb-1">Success</h5>
                <p className="mb-0">{successMessage}</p>
              </div>
              <button 
                type="button" 
                className="btn-close ms-auto" 
                onClick={() => setSuccessMessage('')}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card card-kiva mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-cyan mb-2">Filter by Status</label>
                <select 
                  className="form-select form-select-kiva"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="PRELUAT">Preluată</option>
                  <option value="IN_LUCRU">In Lucru</option>
                  <option value="FINALIZAT">Finalizată</option>
                  <option value="PREDAT">Predată</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-cyan mb-2">Search</label>
                <input 
                  type="text"
                  className="form-control form-control-kiva"
                  placeholder="Search by order #, client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtered by Device Info */}
        {filteredByDevice && (
          <div className="alert mb-4" style={{background: 'rgba(0, 255, 255, 0.15)', border: '1px solid #00ffff'}}>
            <div className="d-flex align-items-center">
              <i className="fas fa-filter fa-lg me-3 text-dark"></i>
              <div>
                <h5 className="mb-1 text-dark">Filtered View</h5>
                <p className="mb-0 text-dark">Showing orders containing Device #{filteredByDevice}</p>
              </div>
              <button 
                className="btn ms-auto" 
                style={{
                  background: 'transparent', 
                  border: '1px solid #000', 
                  color: '#000'
                }}
                onClick={() => navigate('/orders')}
              >
                <i className="fas fa-times me-2"></i>Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Filtered by Order ID Info */}
        {filteredByOrder && (
          <div className="alert mb-4" style={{background: 'rgba(255, 165, 0, 0.15)', border: '1px solid #ffa500'}}>
            <div className="d-flex align-items-center">
              <i className="fas fa-qrcode fa-lg me-3 text-dark"></i>
              <div>
                <h5 className="mb-1 text-dark">QR Scan View</h5>
                <p className="mb-0 text-dark">Viewing Order #{filteredByOrder}</p>
              </div>
              <button 
                className="btn ms-auto" 
                style={{
                  background: 'transparent', 
                  border: '1px solid #000', 
                  color: '#000'
                }}
                onClick={() => navigate('/orders')}
              >
                <i className="fas fa-times me-2"></i>Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="card card-kiva">
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <i className="fas fa-spinner fa-spin fa-3x text-cyan"></i>
                <p className="mt-3 text-white">Loading orders...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-kiva">
                  <thead>
                    <tr>
                      {/* Am eliminat onClick și className="sortable-header" și iconița de sortare */}
                      <th>Order #</th>
                      <th onClick={() => handleSortChange('client.name')} className="sortable-header">
                        Client {sortBy === 'client.name' && (
                          <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSortChange('createdAt')} className="sortable-header">
                        Date {sortBy === 'createdAt' && (
                          <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th>Devices</th>
                      <th onClick={() => handleSortChange('status')} className="sortable-header">
                        Status {sortBy === 'status' && (
                          <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <tr 
                          key={order.id}
                          className="cursor-pointer"
                          onClick={() => openDetailsModal(order)}
                          title="Click to view order details"
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <strong className="text-cyan">{order.id}</strong>
                          </td>
                          <td>
                            <div className="text-white">{order.clientName}</div>
                          </td>
                          <td className="text-cyan">
                            {order.createdAt}
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {order.deviceCount} {order.deviceCount === 1 ? 'device' : 'devices'}
                            </span>
                          </td>
                          <td>
                            {getStatusBadge(order.status)}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="btn-group btn-group-sm" role="group">
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => openDetailsModal(order)}
                                title="View Order Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => navigate(`/devices?orderId=${order.id}`)}
                                title="Manage Order Devices"
                              >
                                <i className="fas fa-laptop"></i>
                              </button>
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => openHistoryModal(order)}
                                title="View Order History"
                              >
                                <i className="fas fa-history"></i>
                              </button>
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => openQRModal(order)}
                                title="View QR Codes"
                              >
                                <i className="fas fa-qrcode"></i>
                              </button>
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => handlePrintOrder(order)}
                                title="Print Order Document"
                              >
                                <i className="fas fa-print"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteOrder(order.id, order.id)}
                                title="Delete Order"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          <i className="fas fa-clipboard-list fa-2x mb-3"></i>
                          <br />
                          {totalElements === 0 ? 
                            "No orders found. Create your first order above!" :
                            "No orders match your search criteria."
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-white">
              Showing {Math.min(page * size + 1, totalElements)} - {Math.min((page + 1) * size, totalElements)} of {totalElements} orders
            </span>
          </div>
          <div className="d-flex align-items-center">
            <select 
              className="form-select form-select-sm form-select-kiva me-3" 
              style={{width: "80px"}}
              value={size} 
              onChange={handleSizeChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <nav>
              <ul className="pagination pagination-kiva mb-0 mt-1">
                <li className={`page-item ${page === 0 ? 'disabled' : ''} me-1`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(0)}
                    disabled={page === 0}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                </li>
                <li className={`page-item ${page === 0 ? 'disabled' : ''} me-1`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>
                {renderPageNumbers()}
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''} me-1 ms-1`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''} me-1`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={page === totalPages - 1}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* New Order Modal */}
        {showNewOrderModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-cyan">
                    <i className="fas fa-plus me-2"></i>Create New Order
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowNewOrderModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateOrder}>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-user me-2"></i>Select Client
                        </label>
                        <select 
                          className="form-select form-select-kiva"
                          value={newOrderForm.clientId}
                          onChange={(e) => setNewOrderForm({...newOrderForm, clientId: e.target.value})}
                          required
                        >
                          <option value="">Select a client...</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>
                              {client.name} {client.surname} {client.type === 'persoana_juridica' ? `(${client.cui})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-tasks me-2"></i>Status
                        </label>
                        <select 
                          className="form-select form-select-kiva"
                          value={newOrderForm.status}
                          onChange={(e) => setNewOrderForm({...newOrderForm, status: e.target.value})}
                          required
                        >
                          <option value="PRELUAT">Preluată</option>
                          <option value="IN_LUCRU">In Lucru</option>
                          <option value="FINALIZAT">Finalizată</option>
                          <option value="PREDAT">Predată</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="text-cyan mb-0">
                        <i className="fas fa-laptop me-2"></i>Devices
                      </h6>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-kiva-outline"
                        onClick={navigateToNewClient}
                      >
                        <i className="fas fa-user-plus me-2"></i>Create New Client
                      </button>
                    </div>
                    
                    {/* List of already added devices */}
                    {newOrderForm.devices.length > 0 && (
                      <div className="mb-4">
                        <div className="card card-kiva">
                          <div className="card-header">
                            <h6 className="mb-0 text-cyan">Devices Added to Order ({newOrderForm.devices.length})</h6>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-sm table-hover table-kiva">
                                <thead>
                                  <tr>
                                    <th>Brand</th>
                                    <th>Model</th>
                                    <th>Serial Number</th>
                                    <th>ToDo</th>
                                    <th>Accessories</th>
                                    <th>Note</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {newOrderForm.devices.map((device, index) => (
                                    <tr key={index}>
                                      <td className="text-white">{device.brand}</td>
                                      <td className="text-white">{device.model}</td>
                                      <td className="text-cyan">{device.serialNumber || '-'}</td>
                                      <td>
                                        {device.toDo ? (
                                          <div className="d-flex align-items-center">
                                            <i className="fas fa-tasks text-warning me-2"></i>
                                            <div className="text-white text-truncate" style={{maxWidth: "100px"}}>
                                              <small style={{whiteSpace: 'pre-line', lineHeight: '1.2'}}>
                                                {device.toDo}
                                              </small>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="badge bg-secondary">No tasks</span>
                                        )}
                                      </td>
                                      <td>
                                        <div className="d-flex flex-column">
                                          {device.predefinedAccessories?.length > 0 && (
                                            <div className="mb-1">
                                              <small className="text-cyan fw-bold">Predefined:</small>
                                              <div className="d-flex flex-wrap gap-1 mt-1">
                                                {device.predefinedAccessories.slice(0, 2).map((accessory, accIndex) => (
                                                  <span key={accIndex} className="badge bg-info badge-sm">
                                                    {accessory}
                                                  </span>
                                                ))}
                                                {device.predefinedAccessories.length > 2 && (
                                                  <span className="badge bg-secondary badge-sm">
                                                    +{device.predefinedAccessories.length - 2}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {device.customAccessories && (
                                            <div>
                                              <small className="text-cyan fw-bold">Custom:</small>
                                              <small className="text-white d-block text-truncate" style={{maxWidth: "100px"}}>
                                                {device.customAccessories}
                                              </small>
                                            </div>
                                          )}
                                          {(!device.predefinedAccessories?.length && !device.customAccessories) && (
                                            <span className="badge bg-secondary">None</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="text-white"><small>{device.note || '-'}</small></td>
                                      <td>
                                        <button 
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleRemoveDeviceFromOrder(index)}
                                        >
                                          <i className="fas fa-times"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Add New Device Section */}
                    <div className="card card-kiva mb-4">
                      <div className="card-header">
                        <h6 className="mb-0 text-cyan">Add New Device</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label text-cyan">Brand</label>
                            <input 
                              type="text" 
                              className="form-control form-control-kiva" 
                              value={newDevice.brand}
                              onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label text-cyan">Model</label>
                            <input 
                              type="text" 
                              className="form-control form-control-kiva" 
                              value={newDevice.model}
                              onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label text-cyan">Serial Number</label>
                            <input 
                              type="text" 
                              className="form-control form-control-kiva" 
                              value={newDevice.serialNumber}
                              onChange={(e) => setNewDevice({...newDevice, serialNumber: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label text-cyan">Credentials *</label>
                            <input 
                              type="text" 
                              className="form-control form-control-kiva" 
                              placeholder="Password or PIN"
                              value={newDevice.credential}
                              onChange={(e) => setNewDevice({...newDevice, credential: e.target.value})}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label text-cyan">License Key</label>
                            <input 
                              type="text" 
                              className="form-control form-control-kiva" 
                              value={newDevice.licenseKey}
                              onChange={(e) => setNewDevice({...newDevice, licenseKey: e.target.value})}
                            />
                          </div>
                          {clients.find(c => c.id == newOrderForm.clientId)?.cui && (
                            <div className="col-md-4 mb-3">
                              <label className="form-label text-cyan">Hostname</label>
                              <input 
                                type="text" 
                                className="form-control form-control-kiva" 
                                value={newDevice.hostname}
                                onChange={(e) => setNewDevice({...newDevice, hostname: e.target.value})}
                              />
                            </div>
                          )}
                          <div className="col-md-4 mb-3">
                            <label className="form-label text-cyan">Note</label>
                            <input 
                              type="text" 
                              className="form-control form-control-kiva" 
                              value={newDevice.note}
                              onChange={(e) => setNewDevice({...newDevice, note: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        {/* Accessories Section */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h6 className="text-cyan fw-bold mb-3">
                              <i className="fas fa-puzzle-piece me-2"></i>Device Accessories
                            </h6>
                          </div>
                        </div>
                        
                        {predefinedAccessories.length > 0 && (
                          <div className="row mb-3">
                            <div className="col-12">
                              <label className="form-label text-cyan fw-bold mb-2">Predefined Accessories</label>
                              <div className="row">
                                {predefinedAccessories.map((accessory, index) => (
                                  <div key={index} className="col-md-4 col-lg-3 mb-2">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`new-accessory-${index}`}
                                        checked={newDevice.predefinedAccessories?.includes(accessory) || false}
                                        onChange={(e) => {
                                          const updatedAccessories = e.target.checked
                                            ? [...(newDevice.predefinedAccessories || []), accessory]
                                            : (newDevice.predefinedAccessories || []).filter(a => a !== accessory)
                                          setNewDevice({
                                            ...newDevice,
                                            predefinedAccessories: updatedAccessories
                                          })
                                        }}
                                      />
                                      <label className="form-check-label text-white" htmlFor={`new-accessory-${index}`}>
                                        {accessory}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="row mb-3">
                          <div className="col-12">
                            <label className="form-label text-cyan fw-bold">Custom Accessories</label>
                            <textarea 
                              className="form-control form-control-kiva" 
                              value={newDevice.customAccessories || ''}
                              onChange={(e) => setNewDevice({
                                ...newDevice, 
                                customAccessories: e.target.value
                              })}
                              rows="2"
                              placeholder="Enter any additional accessories (one per line)"
                            ></textarea>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-12">
                            <label className="form-label text-cyan fw-bold">
                              <i className="fas fa-tasks me-2"></i>ToDo Tasks
                            </label>
                            <textarea 
                              className="form-control form-control-kiva" 
                              value={newDevice.toDo || ''}
                              onChange={(e) => setNewDevice({
                                ...newDevice, 
                                toDo: e.target.value
                              })}
                              rows="3"
                              placeholder="Enter tasks that need to be completed for this device..."
                            ></textarea>
                            <small className="text-muted">
                              Specify any tasks, repairs, or checks that need to be performed on this device.
                            </small>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-kiva-outline"
                            onClick={handleAddDeviceToOrder}
                            disabled={!newDevice.brand || !newDevice.model || !newDevice.credential || newDevice.credential.trim() === ''}
                            title={(!newDevice.brand || !newDevice.model || !newDevice.credential || newDevice.credential.trim() === '') ? 'Please fill in all required fields (Brand, Model, and Credentials)' : 'Add device to order'}
                          >
                            <i className="fas fa-plus me-2"></i>Add Device to Order
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> Please add at least one device to create an order.
                    </div>
                  </div>
                  <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                    <button type="button" className="btn btn-kiva-outline" onClick={() => setShowNewOrderModal(false)}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-kiva-action" 
                      disabled={isLoading || newOrderForm.devices.length === 0}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>Create Order
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-cyan">
                    <i className="fas fa-clipboard-list me-2"></i>Order #{selectedOrder.id} Details
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card card-kiva h-100">
                        <div className="card-header">
                          <h6 className="mb-0 text-cyan">Client Information</h6>
                        </div>
                        <div className="card-body">
                          <p className="mb-2">
                            <strong className="text-cyan">Name:</strong> 
                            <span className="text-white ms-2">
                              {selectedOrder.client?.name ? 
                                `${selectedOrder.client.name} ${selectedOrder.client.surname}` : 
                                selectedOrder.clientName || 'N/A'}
                            </span>
                          </p>
                          <p className="mb-2">
                            <strong className="text-cyan">Client ID:</strong> 
                            <span className="text-white ms-2">#{selectedOrder.client.id || 'N/A'}</span>
                          </p>
                          <p className="mb-2">
                            <strong className="text-cyan">Email:</strong> 
                            <span className="text-white ms-2">{selectedOrder.client?.email || 'N/A'}</span>
                          </p>
                          <p className="mb-2">
                            <strong className="text-cyan">Phone:</strong> 
                            <span className="text-white ms-2">{selectedOrder.client?.phone || 'N/A'}</span>
                          </p>
                          <p className="mb-0">
                            <strong className="text-cyan">Type:</strong> 
                            <span className="ms-2">
                              {selectedOrder.client?.type === 'persoana_fizica' ? (
                                <span className="badge badge-kiva-individual">Individual</span>
                              ) : (
                                <span className="badge badge-kiva-company">Business</span>
                              )}
                            </span>
                          </p>
                          {selectedOrder.client?.type === 'persoana_juridica' && (
                            <p className="mb-0 mt-2">
                              <strong className="text-cyan">CUI:</strong> 
                              <span className="text-white ms-2">{selectedOrder.client?.cui || 'N/A'}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card card-kiva h-100">
                        <div className="card-header">
                          <h6 className="mb-0 text-cyan">Order Information</h6>
                        </div>
                        <div className="card-body">
                          <p className="mb-2">
                            <strong className="text-cyan">Order ID:</strong> 
                            <span className="text-white ms-2">#{selectedOrder.id}</span>
                          </p>
                          <p className="mb-2">
                            <strong className="text-cyan">Created Date:</strong> 
                            <span className="text-white ms-2">{selectedOrder.createdAt}</span>
                          </p>
                          <p className="mb-2">
                            <strong className="text-cyan">Status:</strong> 
                            <span className="ms-2">{getStatusBadge(selectedOrder.status)}</span>
                          </p>
                          <p className="mb-2">
                            <strong className="text-cyan">Devices:</strong> 
                            <span className="text-white ms-2">{selectedOrder.devices?.length || 0}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Devices List */}
                  <div className="card card-kiva">
                    <div className="card-header">
                      <h6 className="mb-0 text-cyan">Devices in This Order</h6>
                    </div>
                    <div className="card-body">
                      {selectedOrder.devices?.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover table-kiva">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Brand</th>
                                <th>Model</th>
                                <th>Serial Number</th>
                                <th>ToDo</th>
                                <th>Accessories</th>
                                <th>Received Date</th>
                                <th>Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrder.devices.map(device => (
                                <tr key={device.id}>
                                  <td className="text-cyan">{device.id}</td>
                                  <td className="text-white">{device.brand}</td>
                                  <td className="text-white">{device.model}</td>
                                  <td className="text-cyan">{device.serialNumber || '-'}</td>
                                  <td>
                                    {device.toDo ? (
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-tasks text-warning me-2"></i>
                                        <div className="text-white text-truncate" style={{maxWidth: "120px"}}>
                                          <small style={{whiteSpace: 'pre-line', lineHeight: '1.2'}}>
                                            {device.toDo}
                                          </small>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="badge bg-secondary">No tasks</span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex flex-column">
                                      {device.predefinedAccessories?.length > 0 && (
                                        <div className="mb-1">
                                          <small className="text-cyan fw-bold">Predefined:</small>
                                          <div className="d-flex flex-wrap gap-1 mt-1">
                                            {device.predefinedAccessories.slice(0, 2).map((accessory, accIndex) => (
                                              <span key={accIndex} className="badge bg-info badge-sm">
                                                {accessory}
                                              </span>
                                            ))}
                                            {device.predefinedAccessories.length > 2 && (
                                              <span className="badge bg-secondary badge-sm">
                                                +{device.predefinedAccessories.length - 2}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {device.customAccessories && (
                                        <div>
                                          <small className="text-cyan fw-bold">Custom:</small>
                                          <small className="text-white d-block text-truncate" style={{maxWidth: "120px"}}>
                                            {device.customAccessories}
                                          </small>
                                        </div>
                                      )}
                                      {(!device.predefinedAccessories?.length && !device.customAccessories) && (
                                        <span className="badge bg-secondary">No accessories</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-white">{device.receivedDate || '-'}</td>
                                  <td className="text-white">
                                    <small className="text-truncate d-inline-block" style={{maxWidth: '150px'}}>
                                      {device.note || '-'}
                                    </small>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted text-center py-4 mb-0">No devices found for this order.</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Adaugă secțiunea pentru marcarea comenzii ca predată */}
                {selectedOrder.status === "FINALIZAT" && (
                  <div className="card card-kiva mt-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="text-cyan mb-2">
                            <i className="fas fa-check-circle me-2"></i>Order Completion
                          </h6>
                          <p className="text-white mb-0">This order is complete and ready to be delivered to the client.</p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-success"
                          onClick={handleMarkAsDelivered}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-handshake me-2"></i>Mark as Delivered to Client
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button 
                    type="button" 
                    className="btn btn-kiva-outline" 
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                  
                  {selectedOrder.status === "FINALIZAT" ? (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={handleMarkAsDelivered}
                      disabled={isLoading}
                    >
                      <i className="fas fa-handshake me-2"></i>Mark as Delivered
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-kiva-action"
                      onClick={() => navigate(`/devices?orderId=${selectedOrder.id}`)}
                    >
                      <i className="fas fa-laptop me-2"></i>Manage Devices
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {showEditOrderModal && selectedOrder && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-cyan">
                    <i className="fas fa-edit me-2"></i>Edit Order #{selectedOrder.id}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowEditOrderModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleUpdateOrder}>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label text-cyan fw-bold">Client</label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          // Folosește clientName din obiectul order dacă client nu este disponibil
                          value={selectedOrder.client?.name ? 
                            `${selectedOrder.client.name} ${selectedOrder.client.surname}` : 
                            selectedOrder.clientName || `Client #${selectedOrder.clientId}`
                          }
                          readOnly
                        />
                        <small className="text-muted">Client cannot be changed</small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-cyan fw-bold">Status</label>
                        <select 
                          className="form-select form-select-kiva"
                          value={selectedOrder.status || 'IN_PROGRESS'}
                          onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
                        >
                          <option value="PRELUAT">Preluată</option>
                          <option value="IN_LUCRU">În lucru</option>
                          <option value="FINALIZAT">Finalizată</option>
                          <option value="PREDAT">Predată</option>
                        </select>
                      </div>
                    </div>

                    {/* Devices Table */}
                    <div className="card card-kiva mb-4">
                      <div className="card-header">
                        <h6 className="mb-0 text-cyan">Order Devices</h6>
                      </div>
                      <div className="card-body">
                        {selectedOrder.devices?.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-hover table-kiva">
                              <thead>
                                <tr>
                                  <th>Brand</th>
                                  <th>Model</th>
                                  <th>Serial</th>
                                  <th>Note</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedOrder.devices.map(device => (
                                  <tr key={device.id}>
                                    <td className="text-white">{device.brand}</td>
                                    <td className="text-white">{device.model}</td>
                                    <td className="text-cyan">{device.serialNumber || '-'}</td>
                                    <td>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm form-control-kiva" 
                                        value={device.note || ''}
                                        onChange={(e) => {
                                          const updatedDevices = selectedOrder.devices.map(d => 
                                            d.id === device.id ? {...d, note: e.target.value} : d
                                          );
                                          setSelectedOrder({...selectedOrder, devices: updatedDevices});
                                        }}
                                        placeholder="Add note"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted text-center py-4 mb-0">No devices found for this order.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> To modify device details, please use the Device Management page.
                    </div>
                  </div>
                  <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                    <button type="button" className="btn btn-kiva-outline" onClick={() => setShowEditOrderModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-kiva-action" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Order History Modal */}
        {showHistoryModal && selectedOrderHistory && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-cyan">
                    <i className="fas fa-history me-2"></i>Order #{selectedOrderHistory.id} History
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowHistoryModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {isLoadingLogs ? (
                    <div className="text-center py-4">
                      <i className="fas fa-spinner fa-spin fa-2x text-cyan"></i>
                      <p className="mt-3 text-white">Loading history records...</p>
                    </div>
                  ) : orderLogs.length > 0 ? (
                    <div className="timeline">
                      {orderLogs.map((log) => (
                        <div key={log.id} className="timeline-item">
                          <div className="d-flex">
                            <div className="timeline-icon me-3">
                              <i className={getLogIcon(log.message)}></i>
                            </div>
                            <div className="timeline-content">
                              <p className="text-white mb-1">
                                <strong>{log.message}</strong>
                              </p>
                              <small className="text-cyan">
                                {new Date(log.timestamp).toLocaleString()} by {log.username || 'System'}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-info-circle fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No history records found for this order.</p>
                      <p className="text-cyan small">System will automatically record changes to this order.</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button 
                    type="button" 
                    className="btn btn-kiva-outline" 
                    onClick={() => setShowHistoryModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Modal */}
        {showQRModal && selectedQROrder && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-white">
                    <i className="fas fa-qrcode me-2 text-cyan"></i>
                    QR Codes - Order #{selectedQROrder.id}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowQRModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    {/* Client QR Code */}
                    <div className="col-md-6 mb-4">
                      <div className="card border-0" style={{background: 'rgba(0, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                        <div className="card-header" style={{background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)', color: '#000'}}>
                          <h6 className="mb-0" style={{color: '#000'}}>
                            <i className="fas fa-user me-2"></i>
                            Client QR Code
                          </h6>
                        </div>
                        <div className="card-body text-center">
                          <img 
                            src={qrAPI.getClientOrderQRImage(selectedQROrder.id)} 
                            alt="Client QR Code" 
                            className="img-fluid mb-3"
                            style={{maxWidth: '200px', border: '2px solid #00ffff', borderRadius: '8px'}}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMWExYTFhIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjMDBmZmZmIiBmb250LXNpemU9IjE0cHgiPkVycm9yPC90ZXh0Pgo8L3N2Zz4=';
                            }}
                          />
                          <p className="text-white small mb-3">
                            Clientul poate scana acest QR pentru a vedea detaliile comenzii
                          </p>
                          <div className="btn-group w-100" role="group">
                            <button 
                              className="btn btn-kiva-outline btn-sm"
                              onClick={() => qrAPI.downloadQRImage(
                                qrAPI.getClientOrderQRImage(selectedQROrder.id), 
                                `client-order-${selectedQROrder.id}.png`
                              )}
                            >
                              <i className="fas fa-download me-1"></i>
                              Download
                            </button>
                            <button 
                              className="btn btn-kiva-outline btn-sm"
                              onClick={() => qrAPI.printQRCode(
                                qrAPI.getClientOrderQRImage(selectedQROrder.id),
                                `Client QR - Order #${selectedQROrder.id}`
                              )}
                            >
                              <i className="fas fa-print me-1"></i>
                              Print
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service QR Codes */}
                    <div className="col-md-6">
                      <div className="card border-0" style={{background: 'rgba(40, 167, 69, 0.1)', backdropFilter: 'blur(10px)'}}>
                        <div className="card-header" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: '#000'}}>
                          <h6 className="mb-0" style={{color: '#000'}}>
                            <i className="fas fa-tools me-2"></i>
                            Service QR Codes
                          </h6>
                        </div>
                        <div className="card-body">
                          {selectedQROrder.devices && selectedQROrder.devices.length > 0 ? (
                            <div className="row">
                              {selectedQROrder.devices.map((device, index) => (
                                <div key={device.id} className="col-12 mb-3">
                                  <div className="card border-0" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                                    <div className="card-body p-2">
                                      <div className="row align-items-center">
                                        <div className="col-4 text-center">
                                          <img 
                                            src={qrAPI.getServiceDeviceQRImage(device.id)} 
                                            alt={`Service QR for Device ${device.id}`}
                                            className="img-fluid"
                                            style={{maxWidth: '60px', border: '1px solid #00ffff', borderRadius: '4px'}}
                                            onError={(e) => {
                                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMWExYTFhIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzAwZmZmZiIgZm9udC1zaXplPSI4cHgiPkVycm9yPC90ZXh0Pgo8L3N2Zz4=';
                                            }}
                                          />
                                        </div>
                                        <div className="col-8">
                                          <h6 className="text-white mb-1">Device #{device.id}</h6>
                                          <p className="text-cyan small mb-1">{device.brand} {device.model}</p>
                                          <div className="btn-group btn-group-sm w-100" role="group">
                                            <button 
                                              className="btn btn-kiva-outline btn-sm"
                                              onClick={() => qrAPI.downloadQRImage(
                                                qrAPI.getServiceDeviceQRImage(device.id), 
                                                `service-device-${device.id}.png`
                                              )}
                                              title="Download QR"
                                            >
                                              <i className="fas fa-download"></i>
                                            </button>
                                            <button 
                                              className="btn btn-kiva-outline btn-sm"
                                              onClick={() => qrAPI.printQRCode(
                                                qrAPI.getServiceDeviceQRImage(device.id),
                                                `Service QR - Device #${device.id}`
                                              )}
                                              title="Print QR"
                                            >
                                              <i className="fas fa-print"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <i className="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                              <p className="text-white mb-0">No devices found in this order</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button 
                    type="button" 
                    className="btn btn-kiva-outline me-2" 
                    onClick={async () => {
                      try {
                        await qrAPI.regenerateOrderQRs(selectedQROrder.id);
                        setSuccessMessage('QR codes regenerated successfully!');
                        // Refresh the modal
                        setShowQRModal(false);
                        setTimeout(() => openQRModal(selectedQROrder), 100);
                      } catch (error) {
                        setError('Failed to regenerate QR codes.');
                      }
                    }}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    Regenerate All
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-kiva-outline" 
                    onClick={() => setShowQRModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Orders;