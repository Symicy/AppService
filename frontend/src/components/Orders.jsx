import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TokenManager } from '../services/api/authAPI';
import KivaLogo from '../poze/3dlogo.png';
import * as ordersAPI from '../services/api/ordersAPI';
import * as clientsAPI from '../services/api/clientsAPI';
import * as orderLogAPI from '../services/api/orderLogAPI';
import * as devicesAPI from '../services/api/devicesAPI';
import '../styles/global.css';
import '../styles/components/navbar.css';
import '../styles/components/buttons.css';
import '../styles/components/cards.css';
import '../styles/components/tables.css';
import '../styles/components/forms.css';
import '../styles/components/timeline.css';

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
    status: 'PRELUAT'
  });

  const navigate = useNavigate();
  const location = useLocation();
  
  // Extrage deviceId direct din URL - elimină necesitatea unui useEffect
  const params = new URLSearchParams(location.search);
  const filteredByDevice = params.get('deviceId');
  
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
      status: 'PRELUAT'
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
                        <tr key={order.id}>
                          <td>
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
                          <td>
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
                            <label className="form-label text-cyan">Credentials</label>
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
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-kiva-outline"
                            onClick={handleAddDeviceToOrder}
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
      </div>
    </>
  );
}

export default Orders;