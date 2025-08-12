// Print utilities for the Kiva Service application

/**
 * Triggers the browser's print dialog
 */
export const printDocument = () => {
  window.print()
}

/**
 * Format a date for print documents
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date in Romanian format
 */
export const formatPrintDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Format status text for printing
 * @param {string} status - Status to format
 * @returns {string} Formatted status text
 */
export const formatPrintStatus = (status) => {
  const statusMap = {
    'pending': 'În așteptare',
    'in_progress': 'În lucru',
    'completed': 'Finalizat',
    'cancelled': 'Anulat',
    'received': 'Primit',
    'diagnosing': 'În diagnosticare',
    'repairing': 'În reparație',
    'testing': 'În testare',
    'ready': 'Gata',
    'delivered': 'Livrat'
  }
  
  return statusMap[status?.toLowerCase()] || status || 'Necunoscut'
}

/**
 * Generate print-friendly device summary
 * @param {Array} devices - Array of devices
 * @returns {string} Summary text
 */
export const generateDeviceSummary = (devices) => {
  if (!devices || devices.length === 0) {
    return 'Nu sunt device-uri în această comandă'
  }
  
  const deviceCount = devices.length
  const brands = [...new Set(devices.map(d => d.brand).filter(Boolean))]
  
  return `${deviceCount} device${deviceCount > 1 ? '-uri' : ''} (${brands.join(', ')})`
}

/**
 * Add print styles to the document head if they don't exist
 * @param {string} cssContent - CSS content to add
 */
export const ensurePrintStyles = (cssContent) => {
  const existingStyle = document.getElementById('kiva-print-styles')
  
  if (!existingStyle) {
    const style = document.createElement('style')
    style.id = 'kiva-print-styles'
    style.textContent = cssContent
    document.head.appendChild(style)
  }
}

/**
 * Show print preview mode
 * @param {Function} setPrintPreview - State setter function
 */
export const showPrintPreview = (setPrintPreview) => {
  setPrintPreview(true)
  document.body.classList.add('print-preview-mode')
}

/**
 * Hide print preview mode
 * @param {Function} setPrintPreview - State setter function
 */
export const hidePrintPreview = (setPrintPreview) => {
  setPrintPreview(false)
  document.body.classList.remove('print-preview-mode')
}

/**
 * Print-specific company information
 */
export const COMPANY_INFO = {
  name: 'KIVA NET SERVICE',
  fullName: 'KIVA NET SERVICE SRL',
  address: 'Bulevardul Decebal 7/6, Baia Mare',
  phone: '+40749934941',
  email: 'contact@kivaservice.ro',
  cui: '37892391',
  nrInmatriculare: 'J24/1213/2017',
  euid: 'ROONRC.J24/1213/2017',
  description: 'Service și Reparații IT'
}

/**
 * Generate print header HTML
 * @param {string} logoSrc - Logo image source
 * @returns {string} HTML string for print header
 */
export const generatePrintHeader = (logoSrc) => {
  return `
    <div class="print-header">
      <div>
        <img src="${logoSrc}" alt="${COMPANY_INFO.name}" class="print-logo" />
      </div>
      <div class="print-company-info">
        <div class="print-bold">${COMPANY_INFO.name}</div>
        <div>${COMPANY_INFO.description}</div>
        <div>Tel: ${COMPANY_INFO.phone}</div>
        <div>Email: ${COMPANY_INFO.email}</div>
      </div>
    </div>
  `
}

/**
 * Generate print footer HTML
 * @returns {string} HTML string for print footer
 */
export const generatePrintFooter = () => {
  return `
    <div class="print-footer">
      <div>
        Acest document constituie dovada recepției device-urilor și acordul pentru serviciile ${COMPANY_INFO.name}.
      </div>
      <div style="margin-top: 10px;">
        ${COMPANY_INFO.fullName} - ${COMPANY_INFO.address} | CUI: ${COMPANY_INFO.cui} | Tel: ${COMPANY_INFO.phone}
      </div>
      <div style="margin-top: 5px; font-size: 7pt; color: #666;">
        Nr. Înmatriculare: ${COMPANY_INFO.nrInmatriculare} | EUID: ${COMPANY_INFO.euid}
      </div>
    </div>
  `
}
