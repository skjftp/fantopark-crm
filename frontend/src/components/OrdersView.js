import React, { useState, useEffect } from 'react';
import OrdersService from '../services/ordersService';
import LeadsService from '../services/leadsService';
import InventoryService from '../services/inventoryService';
import { formatDate, formatCurrency, ORDER_STATUSES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const OrdersView = ({ user, hasPermission }) => {
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    lead_id: '',
    inventory_id: '',
    event_name: '',
    event_date: '',
    tickets_quantity: 1,
    ticket_category: '',
    unit_price: 0,
    total_amount: 0,
    advance_amount: 0,
    payment_status: 'pending',
    notes: ''
  });

  const [paymentData, setPaymentData] = useState({
    // Client Details
    client_name: '',
    client_email: '',
    client_phone: '',
    legal_name: '',
    registered_address: '',
    state: '',
    gstin: '',
    pan: '',
    
    // Invoice Details
    category_of_sale: 'B2C',
    type_of_sale: 'Inter State',
    invoice_items: [],
    base_amount: 0,
    gst_rate: 18,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    total_tax: 0,
    final_amount: 0,
    
    // Payment Details
    advance_amount: 0,
    payment_method: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    cheque_details: '',
    pdc_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, leadsData, inventoryData] = await Promise.all([
        OrdersService.getOrders(),
        LeadsService.getLeads(),
        InventoryService.getInventory()
      ]);
      setOrders(ordersData);
      setLeads(leadsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      lead_id: '',
      inventory_id: '',
      event_name: '',
      event_date: '',
      tickets_quantity: 1,
      ticket_category: '',
      unit_price: 0,
      total_amount: 0,
      advance_amount: 0,
      payment_status: 'pending',
      notes: ''
    });
  };

  const handleInventorySelect = (inventoryId) => {
    const selectedInventory = inventory.find(item => item.id === inventoryId);
    if (selectedInventory) {
      setFormData(prev => ({
        ...prev,
        inventory_id: inventoryId,
        event_name: selectedInventory.event_name,
        event_date: selectedInventory.event_date,
        ticket_category: selectedInventory.category_of_ticket,
        unit_price: selectedInventory.selling_price,
        total_amount: selectedInventory.selling_price * prev.tickets_quantity
      }));
    }
  };

  const handleLeadSelect = (leadId) => {
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        lead_id: leadId,
        client_name: selectedLead.name,
        client_email: selectedLead.email,
        client_phone: selectedLead.phone
      }));
    }
  };

  const handleQuantityChange = (quantity) => {
    setFormData(prev => ({
      ...prev,
      tickets_quantity: quantity,
      total_amount: prev.unit_price * quantity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newOrder = await OrdersService.createOrder({
        ...formData,
        order_date: new Date().toISOString().split('T')[0],
        created_by: user.name,
        status: 'pending_approval'
      });
      
      // Update inventory available tickets
      const selectedInventory = inventory.find(item => item.id === formData.inventory_id);
      if (selectedInventory) {
        await InventoryService.updateInventoryItem(formData.inventory_id, {
          ...selectedInventory,
          available_tickets: selectedInventory.available_tickets - formData.tickets_quantity
        });
      }
      
      setOrders(prev => [...prev, newOrder]);
      alert('Order created successfully!');
      setShowAddForm(false);
      resetForm();
      loadData(); // Reload to get updated inventory
    } catch (error) {
      alert('Failed to create order');
    }
  };

  const openPaymentForm = (order) => {
    setCurrentOrder(order);
    setPaymentData({
      ...paymentData,
      client_name: order.client_name,
      client_email: order.client_email,
      client_phone: order.client_phone,
      base_amount: order.total_amount,
      invoice_items: [{
        description: `${order.event_name} - ${order.ticket_category} (${order.tickets_quantity} tickets)`,
        quantity: order.tickets_quantity,
        rate: order.unit_price,
        amount: order.total_amount
      }]
    });
    setShowPaymentForm(true);
  };

  const calculateGST = () => {
    const isIntraState = paymentData.state === 'Haryana';
    const gstAmount = (paymentData.base_amount * paymentData.gst_rate) / 100;
    
    if (isIntraState) {
      return {
        cgst_amount: gstAmount / 2,
        sgst_amount: gstAmount / 2,
        igst_amount: 0,
        total_tax: gstAmount
      };
    } else {
      return {
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: gstAmount,
        total_tax: gstAmount
      };
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const gstCalculation = calculateGST();
      const finalAmount = paymentData.base_amount + gstCalculation.total_tax;
      
      const paymentDetails = {
        ...paymentData,
        ...gstCalculation,
        final_amount: finalAmount,
        invoice_number: `INV-${Date.now()}`,
        invoice_date: new Date().toISOString().split('T')[0]
      };
      
      // Update order with payment details
      const updatedOrder = {
        ...currentOrder,
        payment_details: paymentDetails,
        payment_status: paymentData.advance_amount >= finalAmount ? 'paid' : 'partial',
        status: 'payment_received'
      };
      
      await OrdersService.updateOrder(currentOrder.id, updatedOrder);
      setOrders(prev => prev.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      ));
      
      alert('Payment processed successfully! Invoice can be generated.');
      setShowPaymentForm(false);
      setCurrentOrder(null);
    } catch (error) {
      alert('Failed to process payment');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by date (newest first)
  const sortedOrders = filteredOrders.sort((a, b) => 
    new Date(b.order_date) - new Date(a.order_date)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderOrderForm = () => {
    if (!showAddForm) return null;

    const availableInventory = inventory.filter(item => item.available_tickets > 0);

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
          zIndex: 9999
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false);
            resetForm();
          }
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Create New Order
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Client Selection */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Client Information
            </h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Select Lead or Enter Details
              </label>
              <select
                value={formData.lead_id}
                onChange={(e) => handleLeadSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem'
                }}
              >
                <option value="">Select existing lead or enter manually</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.email} ({lead.phone})
                  </option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Client Email *
                  </label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Client Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Event Selection */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Event Details
            </h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Select Event *
              </label>
              <select
                value={formData.inventory_id}
                onChange={(e) => handleInventorySelect(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem'
                }}
              >
                <option value="">Select an event</option>
                {availableInventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.event_name} - {item.category_of_ticket} - {formatDate(item.event_date)} 
                    ({item.available_tickets} available) - ₹{item.selling_price}
                  </option>
                ))}
              </select>

              {formData.inventory_id && (
                <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.375rem' }}>
                  <p><strong>Event:</strong> {formData.event_name}</p>
                  <p><strong>Date:</strong> {formatDate(formData.event_date)}</p>
                  <p><strong>Category:</strong> {formData.ticket_category}</p>
                  <p><strong>Unit Price:</strong> ₹{formData.unit_price.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Quantity and Amount */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Order Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Number of Tickets *
                </label>
                <input
                  type="number"
                  value={formData.tickets_quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max={inventory.find(item => item.id === formData.inventory_id)?.available_tickets || 1}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₹${formData.total_amount.toLocaleString()}`}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f3f4f6'
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!showPaymentForm || !currentOrder) return null;

    const gstCalculation = calculateGST();
    const finalAmount = paymentData.base_amount + gstCalculation.total_tax;

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
          zIndex: 9999
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPaymentForm(false);
            setCurrentOrder(null);
          }
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Process Payment for Order #{currentOrder.id}
          </h3>
          
          <form onSubmit={handlePaymentSubmit}>
            {/* Client GST Details */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Client GST Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Legal Name *
                </label>
                <input
                  type="text"
                  value={paymentData.legal_name}
                  onChange={(e) => handlePaymentInputChange('legal_name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  State *
                </label>
                <select
                  value={paymentData.state}
                  onChange={(e) => handlePaymentInputChange('state', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="">Select State</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Other">Other States</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Registered Address *
                </label>
                <input
                  type="text"
                  value={paymentData.registered_address}
                  onChange={(e) => handlePaymentInputChange('registered_address', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  GSTIN
                </label>
                <input
                  type="text"
                  value={paymentData.gstin}
                  onChange={(e) => handlePaymentInputChange('gstin', e.target.value)}
                  placeholder="15 character GSTIN"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  PAN
                </label>
                <input
                  type="text"
                  value={paymentData.pan}
                  onChange={(e) => handlePaymentInputChange('pan', e.target.value)}
                  placeholder="10 character PAN"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>

            {/* Invoice Details */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Invoice Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Category of Sale
                </label>
                <select
                  value={paymentData.category_of_sale}
                  onChange={(e) => handlePaymentInputChange('category_of_sale', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  GST Rate (%)
                </label>
                <select
                  value={paymentData.gst_rate}
                  onChange={(e) => handlePaymentInputChange('gst_rate', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="5">5% (Tour Packages)</option>
                  <option value="18">18% (Event Tickets)</option>
                </select>
              </div>
            </div>

            {/* GST Calculation */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
              <h5 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>GST Calculation</h5>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Base Amount:</strong> ₹{paymentData.base_amount.toLocaleString()}</p>
                {paymentData.state === 'Haryana' ? (
                  <>
                    <p><strong>CGST ({paymentData.gst_rate/2}%):</strong> ₹{(gstCalculation.cgst_amount).toLocaleString()}</p>
                    <p><strong>SGST ({paymentData.gst_rate/2}%):</strong> ₹{(gstCalculation.sgst_amount).toLocaleString()}</p>
                  </>
                ) : (
                  <p><strong>IGST ({paymentData.gst_rate}%):</strong> ₹{(gstCalculation.igst_amount).toLocaleString()}</p>
                )}
                <p style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #d1d5db' }}>
                  <strong>Total Amount:</strong> <span style={{ fontSize: '1.125rem' }}>₹{finalAmount.toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Payment Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Advance Amount *
                </label>
                <input
                  type="number"
                  value={paymentData.advance_amount}
                  onChange={(e) => handlePaymentInputChange('advance_amount', parseFloat(e.target.value) || 0)}
                  required
                  min="0"
                  max={finalAmount}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Payment Method *
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => handlePaymentInputChange('payment_method', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="PDC">PDC (Post Dated Cheque)</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentData.transaction_id}
                  onChange={(e) => handlePaymentInputChange('transaction_id', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => handlePaymentInputChange('payment_date', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              {paymentData.payment_method === 'Cheque' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Cheque Details
                  </label>
                  <input
                    type="text"
                    value={paymentData.cheque_details}
                    onChange={(e) => handlePaymentInputChange('cheque_details', e.target.value)}
                    placeholder="Cheque number, Bank name, etc."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              )}

              {paymentData.payment_method === 'PDC' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    PDC Date
                  </label>
                  <input
                    type="date"
                    value={paymentData.pdc_date}
                    onChange={(e) => handlePaymentInputChange('pdc_date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm(false);
                  setCurrentOrder(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !currentOrder) return null;

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
          zIndex: 9999
        }}
        onClick={() => setShowDetailModal(false)}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Order Details #{currentOrder.id}</h3>
            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                fontSize: '1.5rem',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Order Info */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Order Information</h4>
              <div style={{ fontSize: '0.875rem', space: '0.5rem' }}>
                <p><strong>Order Date:</strong> {formatDate(currentOrder.order_date)}</p>
                <p><strong>Status:</strong> <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  backgroundColor: ORDER_STATUSES[currentOrder.status]?.color.split(' ')[0] + '20',
                  color: ORDER_STATUSES[currentOrder.status]?.color.split(' ')[1]
                }}>{ORDER_STATUSES[currentOrder.status]?.label}</span></p>
                <p><strong>Created By:</strong> {currentOrder.created_by}</p>
              </div>
            </div>

            {/* Client Info */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Client Information</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Name:</strong> {currentOrder.client_name}</p>
                <p><strong>Email:</strong> {currentOrder.client_email}</p>
                <p><strong>Phone:</strong> {currentOrder.client_phone}</p>
              </div>
            </div>

            {/* Event Info */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Event Details</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Event:</strong> {currentOrder.event_name}</p>
                <p><strong>Date:</strong> {formatDate(currentOrder.event_date)}</p>
                <p><strong>Category:</strong> {currentOrder.ticket_category}</p>
                <p><strong>Quantity:</strong> {currentOrder.tickets_quantity} tickets</p>
                <p><strong>Unit Price:</strong> ₹{currentOrder.unit_price?.toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ₹{currentOrder.total_amount?.toLocaleString()}</p>
              </div>
            </div>

            {/* Payment Info */}
            {currentOrder.payment_details && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Payment Information</h4>
                <div style={{ fontSize: '0.875rem' }}>
                  <p><strong>Invoice Number:</strong> {currentOrder.payment_details.invoice_number}</p>
                  <p><strong>Payment Status:</strong> {currentOrder.payment_status}</p>
                  <p><strong>Payment Method:</strong> {currentOrder.payment_details.payment_method}</p>
                  <p><strong>Transaction ID:</strong> {currentOrder.payment_details.transaction_id || 'N/A'}</p>
                  <p><strong>Base Amount:</strong> ₹{currentOrder.payment_details.base_amount?.toLocaleString()}</p>
                  <p><strong>GST:</strong> ₹{currentOrder.payment_details.total_tax?.toLocaleString()}</p>
                  <p><strong>Final Amount:</strong> ₹{currentOrder.payment_details.final_amount?.toLocaleString()}</p>
                  <p><strong>Advance Paid:</strong> ₹{currentOrder.payment_details.advance_amount?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {currentOrder.notes && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Notes</h4>
                <p style={{ fontSize: '0.875rem' }}>{currentOrder.notes}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            {!currentOrder.payment_details && hasPermission('orders', 'write') && (
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openPaymentForm(currentOrder);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Process Payment
              </button>
            )}
            {currentOrder.payment_details && hasPermission('finance', 'write') && (
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Generate Invoice
              </button>
            )}
            <button
              onClick={() => setShowDetailModal(false)}
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
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Orders & Payments</h2>
        {hasPermission('orders', 'write') && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Create Order
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Orders</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{orders.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Approval</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {orders.filter(o => o.status === 'pending_approval').length}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Payment Pending</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            {orders.filter(o => o.payment_status === 'pending').length}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Revenue</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            ₹{orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Modals */}
      {renderOrderForm()}
      {renderPaymentForm()}
      {renderDetailModal()}

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
            placeholder="Search orders..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          >
            <option value="all">All Status</option>
            {Object.entries(ORDER_STATUSES).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Payment</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    {orders.length === 0 
                      ? 'No orders yet. Click "+ Create Order" to get started.'
                      : 'No orders match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>#{order.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{order.client_name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.client_email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>{order.event_name}</div>
                        <div style={{ color: '#6b7280' }}>{order.tickets_quantity} tickets</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      ₹{order.total_amount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        backgroundColor: ORDER_STATUSES[order.status]?.color.split(' ')[0] + '20',
                        color: ORDER_STATUSES[order.status]?.color.split(' ')[1]
                      }}>
                        {ORDER_STATUSES[order.status]?.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        backgroundColor: 
                          order.payment_status === 'paid' ? '#d1fae5' :
                          order.payment_status === 'partial' ? '#fef3c7' :
                          '#fee2e2',
                        color:
                          order.payment_status === 'paid' ? '#065f46' :
                          order.payment_status === 'partial' ? '#92400e' :
                          '#991b1b'
                      }}>
                        {order.payment_status === 'paid' ? 'Paid' :
                         order.payment_status === 'partial' ? 'Partial' :
                         'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatDate(order.order_date)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setCurrentOrder(order);
                            setShowDetailModal(true);
                          }}
                          title="View Details"
                          style={{ color: '#6b7280', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                        >
                          👁️
                        </button>
                        {!order.payment_details && hasPermission('orders', 'write') && (
                          <button
                            onClick={() => openPaymentForm(order)}
                            title="Process Payment"
                            style={{ color: '#10b981', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            💳
                          </button>
                        )}
                        {order.payment_details && hasPermission('finance', 'write') && (
                          <button
                            title="Generate Invoice"
                            style={{ color: '#8b5cf6', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            📄
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedOrders.length)} of {sortedOrders.length} results
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

export default OrdersView;
