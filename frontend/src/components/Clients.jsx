import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import KivaLogo from '../poze/3dlogo.png'
import * as clientsAPI from '../services/api/clientsAPI'
import LoadingSkeleton from './LoadingSkeleton'
import '../styles/global.css'
import '../styles/components/navbar.css'
import '../styles/components/buttons.css'
import '../styles/components/cards.css'
import '../styles/components/tables.css'
import '../styles/components/forms.css'
import '../styles/components/badges.css'

function Clients() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    type: 'persoana_fizica',
    cui: ''
  })
  const [filteredClients, setFilteredClients] = useState([])

  // Adaugă state-uri pentru paginare
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalClientCount, setTotalClientCount] = useState(0); // State pentru numărul total de clienți

  const navigate = useNavigate()
  const location = useLocation()

  // Check state to automatically open new client modal from Orders page
  useEffect(() => {
    if (location.state?.openNewClientModal) {
      setShowNewClientModal(true)
      // Reset state to prevent reopening on page refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Fetch clients when component loads
  useEffect(() => {
    fetchClients()
  }, [])

  // Fetch filtered clients when search term or filter type changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsAPI.fetchFilteredClients(searchTerm, filterType, page, size);
        setFilteredClients(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setTotalClientCount(response.totalElements); // Extrage și salvează numărul total de clienți
      } catch (error) {
        console.error('❌ Error fetching filtered clients:', error);
        setError('Failed to load filtered clients');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a delay to avoid too many calls while typing
    const timeoutId = setTimeout(() => {
      fetchFilteredData();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType, page, size]);

  const fetchClients = async (page = 0) => {
    try {
      setIsLoading(true);
      const data = await clientsAPI.fetchFilteredClients(searchTerm, filterType, page, size);
      
      // Extrage și salvează numărul total de clienți
      setTotalClientCount(data.totalElements);
      
      // Restul logicii pentru setarea datelor paginii
      setClients(data.content);
      setTotalPages(data.totalPages);
      setPage(page);
    } catch (error) {
      setError('Failed to load clients');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateClient = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const newClient = { ...newClientForm }
      
      // If client type is persoana_fizica, ensure CUI is null
      if (newClient.type === 'persoana_fizica') {
        newClient.cui = null
      } else {
        // For business clients, ensure CUI is not empty
        if (!newClient.cui || newClient.cui.trim() === '') {
          setError('CUI is required for business clients')
          setIsLoading(false)
          return
        }
      }
      
      console.log('📝 Creating new client:', newClient)
      const result = await clientsAPI.addClient(newClient)
      setClients([...clients, result])
      
      // Close modal and reset form
      setShowNewClientModal(false)
      setNewClientForm({
        name: '',
        surname: '',
        email: '',
        phone: '',
        type: 'persoana_fizica',
        cui: ''
      })
      
      console.log('✅ Client created successfully:', result)
      await fetchClients() // Refresh the list

      // Navigate back to orders if user came from orders page
      if (location.state?.returnToOrders) {
        navigate('/orders', { 
          state: { 
            message: `Client "${result.name} ${result.surname}" was created successfully!` 
          } 
        })
      }
    
    } catch (error) {
      console.error('❌ Create client error:', error)
      
      // Enhanced error message for 403 errors
      if (error.response?.status === 403) {
        setError('Permission denied: You need administrator privileges to add business clients')
      } else {
        setError('Failed to create client. Please check your data and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateClient = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // If client type is persoana_fizica, ensure CUI is null
      if (selectedClient.type === 'persoana_fizica') {
        selectedClient.cui = null
      }
      
      const result = await clientsAPI.updateClient(selectedClient.id, selectedClient)
      
      // Update local state
      setClients(clients.map(client => 
        client.id === selectedClient.id ? result : client
      ))
      
      // Close modal
      setShowEditClientModal(false)
      console.log('✅ Client updated successfully:', result)
      
    } catch (error) {
      console.error('❌ Update client error:', error)
      setError('Failed to update client. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete client "${clientName}"? This action cannot be undone.`)) {
      try {
        setIsLoading(true)
        await clientsAPI.deleteClient(clientId)
        
        // Remove from local state
        setClients(clients.filter(client => client.id !== clientId))
        console.log('✅ Client deleted successfully!')
        
      } catch (error) {
        console.error('❌ Error deleting client:', error)
        setError('Failed to delete client. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const openEditModal = (client) => {
    setSelectedClient({...client})
    setShowEditClientModal(true)
  }

  // Funcții pentru navigarea între pagini
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSizeChange = (event) => {
    setSize(parseInt(event.target.value));
    setPage(0); // Reset to first page when changing size
  };

  // Înlocuiește iterarea prin pagini cu această abordare
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
            <Link className="nav-link text-white" to="/orders">
              <i className="fas fa-clipboard-list me-2"></i>Orders
            </Link>
            <Link className="nav-link text-cyan" to="/clients">
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
            <li className="breadcrumb-item text-white">Clients</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-cyan">
              <i className="fas fa-users me-3"></i>Client Management
            </h2>
            <p className="text-white mb-0">Manage and track client information</p>
          </div>
          <button 
            className="btn btn-kiva-action"
            onClick={() => setShowNewClientModal(true)}
          >
            <i className="fas fa-user-plus me-2"></i>New Client
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Clients</h6>
                    <h3 className="mb-0 text-white">{totalClientCount}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-users fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Individual Clients</h6>
                    <h3 className="mb-0 text-white">{clients.filter(c => c.type === 'persoana_fizica').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Business Clients</h6>
                    <h3 className="mb-0 text-white">{clients.filter(c => c.type === 'persoana_juridica').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-building fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card card-kiva mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-cyan mb-2">Filter by Type</label>
                <select 
                  className="form-select form-select-kiva"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="persoana_fizica">Individual</option>
                  <option value="persoana_juridica">Business</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-cyan mb-2">Search</label>
                <input 
                  type="text"
                  className="form-control form-control-kiva"
                  placeholder="Search by name, email, phone or CUI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="card card-kiva">
          <div className="card-body">
            {isLoading ? (
              <LoadingSkeleton rows={size} columns={7} />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-kiva">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>CUI</th>
                      <th>Orders</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map(client => (
                        <tr key={client.id}>
                          <td>
                            <strong className="text-cyan">{client.id}</strong>
                          </td>
                          <td>
                            <div className="text-white">{client.name} {client.surname}</div>
                          </td>
                          <td>
                            <div className="text-cyan">{client.email}</div>
                            <small className="text-white opacity-75">{client.phone}</small>
                          </td>
                          <td>
                            <span className={`badge ${client.type === 'persoana_fizica' ? 'badge-kiva-individual' : 'badge-kiva-company'}`}>
                              {client.type === 'persoana_fizica' ? 'Individual' : 'Business'}
                            </span>
                          </td>
                          <td className="text-cyan">
                            {client.cui || '-'}
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {client.orders?.length || 0}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => openEditModal(client)}
                                title="Edit Client"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <Link 
                                to={`/orders?client=${client.id}`}
                                className="btn btn-kiva-action"
                                title="View Orders"
                              >
                                <i className="fas fa-clipboard-list"></i>
                              </Link>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteClient(client.id, `${client.name} ${client.surname}`)}
                                title="Delete Client"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          <i className="fas fa-users fa-2x mb-3"></i>
                          <br />
                          {clients.length === 0 ? 
                            "No clients found. Create your first client above!" :
                            "No clients match your search criteria."
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

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-white">
              Showing {Math.min(page * size + 1, totalElements)} - {Math.min((page + 1) * size, totalElements)} of {totalElements} clients
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

        {/* New Client Modal */}
        {showNewClientModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-cyan">
                    <i className="fas fa-user-plus me-2"></i>Create New Client
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowNewClientModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateClient}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-id-card me-2"></i>Client Type
                        </label>
                        <select 
                          className="form-select form-select-kiva"
                          value={newClientForm.type}
                          onChange={(e) => setNewClientForm({...newClientForm, type: e.target.value})}
                          required
                        >
                          <option value="persoana_fizica">Individual</option>
                          <option value="persoana_juridica">Business</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-user me-2"></i>First Name
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          value={newClientForm.name}
                          onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-user me-2"></i>Last Name
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          value={newClientForm.surname}
                          onChange={(e) => setNewClientForm({...newClientForm, surname: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-envelope me-2"></i>Email
                        </label>
                        <input 
                          type="email" 
                          className="form-control form-control-kiva" 
                          value={newClientForm.email}
                          onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-phone me-2"></i>Phone
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          value={newClientForm.phone}
                          onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    {newClientForm.type === 'persoana_juridica' && (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-cyan fw-bold">
                            <i className="fas fa-building me-2"></i>CUI
                          </label>
                          <input 
                            type="text" 
                            className="form-control form-control-kiva" 
                            value={newClientForm.cui}
                            onChange={(e) => setNewClientForm({...newClientForm, cui: e.target.value})}
                            required={newClientForm.type === 'persoana_juridica'}
                          />
                        </div>
                      </div>
                    )}

                    <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> Phone number is required for all clients.
                    </div>
                  </div>
                  <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                    <button type="button" className="btn btn-kiva-outline" onClick={() => setShowNewClientModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-kiva-action" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>Create Client
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditClientModal && selectedClient && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
                <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                  <h5 className="modal-title text-cyan">
                    <i className="fas fa-edit me-2"></i>Edit Client
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowEditClientModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleUpdateClient}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-id-card me-2"></i>Client Type
                        </label>
                        <select 
                          className="form-select form-select-kiva"
                          value={selectedClient.type}
                          onChange={(e) => setSelectedClient({...selectedClient, type: e.target.value})}
                          required
                        >
                          <option value="persoana_fizica">Individual</option>
                          <option value="persoana_juridica">Business</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-user me-2"></i>First Name
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          value={selectedClient.name}
                          onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-user me-2"></i>Last Name
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          value={selectedClient.surname}
                          onChange={(e) => setSelectedClient({...selectedClient, surname: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-envelope me-2"></i>Email
                        </label>
                        <input 
                          type="email" 
                          className="form-control form-control-kiva" 
                          value={selectedClient.email || ''}
                          onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-cyan fw-bold">
                          <i className="fas fa-phone me-2"></i>Phone
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-kiva" 
                          value={selectedClient.phone || ''}
                          onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    {selectedClient.type === 'persoana_juridica' && (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-cyan fw-bold">
                            <i className="fas fa-building me-2"></i>CUI
                          </label>
                          <input 
                            type="text" 
                            className="form-control form-control-kiva" 
                            value={selectedClient.cui || ''}
                            onChange={(e) => setSelectedClient({...selectedClient, cui: e.target.value})}
                            required={selectedClient.type === 'persoana_juridica'}
                          />
                        </div>
                      </div>
                    )}

                    <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> Client ID #{selectedClient.id}
                    </div>
                  </div>
                  <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                    <button type="button" className="btn btn-kiva-outline" onClick={() => setShowEditClientModal(false)}>
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
      </div>
    </>
  )
}

export default Clients