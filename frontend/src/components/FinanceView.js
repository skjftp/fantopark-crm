import React, { useState, useEffect } from 'react';
import OrdersService from '../services/ordersService';
import { formatDate, formatCurrency } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const FinanceView = ({ user, hasPermission }) => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const companyDetails = {
    name: 'FANTOPARK INNOVATIONS PRIVATE LIMITED',
    address: 'H.NO.-300 ROSHAN PURA NAJAFGARH, South West Delhi, Delhi, 110043',
    gstin: '07AAICF6379H1ZU',
    pan: 'AAICF6379H',
    phone: '+91 9876543210',
    email: 'billing@fantopark.com',
    website: 'www.fantopark.com',
    bank_name: 'HDFC Bank',
    account_number: '50200012345678',
    ifsc_code: 'HDFC0001234',
    branch: 'Najafgarh, Delhi'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = await OrdersService.getOrders();
      
      // Filter orders with payment details
      const paidOrders = ordersData.filter(order => order.payment_details);
      
      // Create invoice records
      const invoiceRecords = paidOrders.map(order => ({
        id: order.payment_details.invoice_number || `INV-${order.id}`,
        order_id: order.id,
        invoice_date: order.payment_details.invoice_date || order.payment_details.payment_date,
        ...order.payment_details,
        order
      }));
      
      setOrders(paidOrders);
      setInvoices(invoiceRecords);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const prefix = 'FTP';
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}/${year}${month}/${random}`;
  };

  const handleGenerateInvoice = (order) => {
    if (!order.payment_details) {
      alert('Payment details not found for this order');
      return;
    }

    const invoice = {
      ...order.payment_details,
      invoice_number: order.payment_details.invoice_number || generateInvoiceNumber(),
      invoice_date: order.payment_details.invoice_date || new Date().toISOString().split('T')[0],
      order
    };

    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    // In a real app, this would generate a PDF
    alert('PDF download functionality would be implemented with a library like jsPDF');
  };

  // Filter invoices
  let filteredInvoices = [...invoices];
  
  if (searchQuery) {
    filteredInvoices = filteredInvoices.filter(invoice =>
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.order.event_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (dateFilter !== 'all') {
    const today = new Date();
    const filterDate = new Date();
    
    switch(dateFilter) {
      case 'today':
        filteredInvoices = filteredInvoices.filter(invoice => 
          new Date(invoice.invoice_date).toDateString() === today.toDateString()
        );
        break;
      case 'week':
        filterDate.setDate(today.getDate() - 7);
        filteredInvoices = filteredInvoices.filter(invoice => 
          new Date(invoice.invoice_date) >= filterDate
        );
        break;
      case 'month':
        filterDate.setMonth(today.getMonth() - 1);
        filteredInvoices = filteredInvoices.filter(invoice => 
          new Date(invoice.invoice_date) >= filterDate
        );
        break;
    }
  }

  // Sort by date (newest first)
  const sortedInvoices = filteredInvoices.sort((a, b) => 
    new Date(b.invoice_date) - new Date(a.invoice_date)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  // Calculate totals
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.final_amount || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.total_tax || 0), 0);
  const totalPending = orders.filter(o => !o.payment_details).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderInvoiceModal = () => {
    if (!showInvoiceModal || !currentInvoice) return null;

    const order = currentInvoice.order;
    const isIntraState = currentInvoice.state === 'Haryana';

    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}
        onClick={() => setShowInvoiceModal(false)}
      >
        <div 
          style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '0.5rem'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Invoice Actions */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }} className="no-print">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Invoice Preview</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={printInvoice}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🖨️ Print
              </button>
              <button
                onClick={downloadInvoice}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📥 Download PDF
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div style={{ padding: '2rem' }} className="invoice-content">
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '2rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #000'
            }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {companyDetails.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{companyDetails.address}</p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  GSTIN: {companyDetails.gstin} | PAN: {companyDetails.pan}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Phone: {companyDetails.phone} | Email: {companyDetails.email}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>TAX INVOICE</h2>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  <strong>Invoice No:</strong> {currentInvoice.invoice_number}
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  <strong>Date:</strong> {formatDate(currentInvoice.invoice_date)}
                </p>
              </div>
            </div>

            {/* Billing Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Bill To:</h3>
                <p style={{ fontWeight: '500' }}>{currentInvoice.legal_name || currentInvoice.client_name}</p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{currentInvoice.registered_address}</p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>State: {currentInvoice.state}</p>
                {currentInvoice.gstin && (
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>GSTIN: {currentInvoice.gstin}</p>
                )}
                {currentInvoice.pan && (
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>PAN: {currentInvoice.pan}</p>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Transaction Details:</h3>
                <p style={{ fontSize: '0.875rem' }}>
                  <strong>Category:</strong> {currentInvoice.category_of_sale}
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  <strong>Type:</strong> {isIntraState ? 'Intra State' : 'Inter State'}
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  <strong>Payment Method:</strong> {currentInvoice.payment_method}
                </p>
                {currentInvoice.transaction_id && (
                  <p style={{ fontSize: '0.875rem' }}>
                    <strong>Transaction ID:</strong> {currentInvoice.transaction_id}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '2rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#1f2937', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>S.No</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Rate</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoice.invoice_items?.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{index + 1}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.description}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>₹{item.rate.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '2rem'
            }}>
              <table style={{ width: '300px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>Sub Total:</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                      ₹{currentInvoice.base_amount.toLocaleString()}
                    </td>
                  </tr>
                  {isIntraState ? (
                    <>
                      <tr>
                        <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                          CGST @ {currentInvoice.gst_rate/2}%:
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                          ₹{currentInvoice.cgst_amount.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                          SGST @ {currentInvoice.gst_rate/2}%:
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                          ₹{currentInvoice.sgst_amount.toLocaleString()}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                        IGST @ {currentInvoice.gst_rate}%:
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                        ₹{currentInvoice.igst_amount.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold' }}>
                    <td style={{ padding: '0.5rem' }}>Total Amount:</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      ₹{currentInvoice.final_amount.toLocaleString()}
                    </td>
                  </tr>
                  {currentInvoice.advance_amount > 0 && (
                    <>
                      <tr>
                        <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>Advance Paid:</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                          ₹{currentInvoice.advance_amount.toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', color: '#dc2626' }}>
                        <td style={{ padding: '0.5rem' }}>Balance Due:</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          ₹{(currentInvoice.final_amount - currentInvoice.advance_amount).toLocaleString()}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Amount in Words */}
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.375rem',
              marginBottom: '2rem'
            }}>
              <p style={{ fontSize: '0.875rem' }}>
                <strong>Amount in Words:</strong> {numberToWords(Math.floor(currentInvoice.final_amount))} Rupees Only
              </p>
            </div>

            {/* Bank Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Bank Details:</h3>
                <p style={{ fontSize: '0.875rem' }}>Bank: {companyDetails.bank_name}</p>
                <p style={{ fontSize: '0.875rem' }}>A/C No: {companyDetails.account_number}</p>
                <p style={{ fontSize: '0.875rem' }}>IFSC: {companyDetails.ifsc_code}</p>
                <p style={{ fontSize: '0.875rem' }}>Branch: {companyDetails.branch}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Terms & Conditions:</h3>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  1. Tickets are non-refundable and non-transferable.<br/>
                  2. Please carry valid ID proof at the venue.<br/>
                  3. Subject to jurisdiction of Delhi courts.<br/>
                  4. E. & O.E.
                </p>
              </div>
            </div>

            {/* Signature Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Received by:</p>
                <div style={{ marginTop: '3rem', borderTop: '1px solid #000', width: '200px' }}>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Customer Signature</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>For {companyDetails.name}</p>
                <div style={{ marginTop: '3rem', display: 'inline-block' }}>
                  <div style={{ borderTop: '1px solid #000', width: '200px' }}>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Finance & Invoice Management</h2>
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Revenue</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total GST Collected</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {formatCurrency(totalTax)}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Invoices Generated</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{invoices.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Payments</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{totalPending}</p>
        </div>
      </div>

      {/* Orders without invoices */}
      {totalPending > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #fbbf24'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e' }}>
            💡 {totalPending} orders pending payment. Process payments to generate invoices.
          </p>
        </div>
      )}

      {/* Modal */}
      {renderInvoiceModal()}

      {/* Main Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem'
        }}>
          <input
            type="text"
            placeholder="Search by invoice number, client name, or event..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Invoice No</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>GST</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    {invoices.length === 0 
                      ? 'No invoices generated yet. Process order payments to generate invoices.'
                      : 'No invoices match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((invoice) => {
                  const order = invoice.order;
                  
                  return (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{invoice.invoice_number}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>
                            {invoice.legal_name || invoice.client_name}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {invoice.category_of_sale}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {order.event_name}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        ₹{invoice.base_amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        ₹{invoice.total_tax.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>
                        ₹{invoice.final_amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setCurrentInvoice(invoice);
                              setShowInvoiceModal(true);
                            }}
                            title="View Invoice"
                            style={{ color: '#3b82f6', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => {
                              setCurrentInvoice(invoice);
                              setShowInvoiceModal(true);
                              setTimeout(() => window.print(), 100);
                            }}
                            title="Print Invoice"
                            style={{ color: '#10b981', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => alert('Email functionality would be implemented')}
                            title="Email Invoice"
                            style={{ color: '#8b5cf6', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            📧
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedInvoices.length)} of {sortedInvoices.length} results
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundColor: currentPage === index + 1 ? '#3b82f6' : 'white',
                    color: currentPage === index + 1 ? 'white' : '#374151',
                    cursor: 'pointer'
                  }}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for amount in words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
};

export default FinanceView;
