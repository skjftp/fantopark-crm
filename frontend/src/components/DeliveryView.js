import React, { useState, useEffect } from 'react';
import OrdersService from '../services/ordersService';
import { formatDate, formatCurrency, ORDER_STATUSES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const DeliveryView = ({ user, hasPermission }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [deliveryData, setDeliveryData] = useState({
    order_id: '',
    delivery_method: '',
    delivery_status: 'pending',
    tracking_number: '',
    courier_name: '',
    delivery_address: '',
    contact_person: '',
    contact_phone: '',
    scheduled_date: '',
    actual_delivery_date: '',
    delivery_proof: '',
    delivery_notes: '',
    delivery_charges: 0
  });

  const deliveryStatuses = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'scheduled', label: 'Scheduled', color: '#3b82f6' },
    { value: 'in_transit', label: 'In Transit', color: '#8b5cf6' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#06b6d4' },
    { value: 'delivered', label: 'Delivered', color: '#10b981' },
    { value: 'failed', label: 'Failed', color: '#ef4444' },
    { value: 'returned', label: 'Returned', color: '#6b7280' }
  ];

  const deliveryMethods = [
    'Courier',
    'Speed Post',
    'Registered Post',
    'Hand Delivery',
    'Email (E-Ticket)',
    'WhatsApp',
    'Pickup from Office',
    'Delivery at Venue'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = await OrdersService.getOrders();
      
      // Filter orders that are ready for delivery (payment received)
      const paidOrders = ordersData.filter(order => 
        order.status === 'payment_received' || order.status === 'service_assigned'
      );
      
      // Create delivery records from orders
      const deliveryRecords = ordersData
        .filter(order => order.delivery_details)
        .map(order => ({
          id: `DEL-${order.id}`,
          order_id: order.id,
          ...order.delivery_details,
          order
        }));
      
      setOrders(paidOrders);
      setDeliveries(deliveryRecords);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDeliveryData({
      order_id: '',
      delivery_method: '',
      delivery_status: 'pending',
      tracking_number: '',
      courier_name: '',
      delivery_address: '',
      contact_person: '',
      contact_phone: '',
      scheduled_date: '',
      actual_delivery_date: '',
      delivery_proof: '',
      delivery_notes: '',
      delivery_charges: 0
    });
  };

  const handleOrderSelect = (orderId) => {
    const selectedOrder = orders.find(order => order.id === orderId);
    if (selectedOrder) {
      setDeliveryData(prev => ({
        ...prev,
        order_id: orderId,
        delivery_address: selectedOrder.payment_details?.registered_address || '',
        contact_person: selectedOrder.client_name,
        contact_phone: selectedOrder.client_phone
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedOrder = orders.find(order => order.id === deliveryData.order_id);
      
      if (!selectedOrder) {
        alert('Please select an order');
        return;
      }

      // Update order with delivery details
      const updatedOrder = {
        ...selectedOrder,
        status: 'service_assigned',
        delivery_details: {
          ...deliveryData,
          created_date: new Date().toISOString().split('T')[0],
          created_by: user.name
        }
      };
      
      await OrdersService.updateOrder(selectedOrder.id, updatedOrder);
      
      alert('Delivery scheduled successfully!');
      setShowDeliveryForm(false);
      resetForm();
      loadData();
    } catch (error) {
      alert('Failed to schedule delivery');
    }
  };

  const updateDeliveryStatus = async (delivery, newStatus) => {
    try {
      const order = delivery.order;
      const updatedDelivery = {
        ...delivery,
        delivery_status: newStatus,
        actual_delivery_date: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : delivery.actual_delivery_date
      };
      
      const updatedOrder = {
        ...order,
        status: newStatus === 'delivered' ? 'completed' : order.status,
        delivery_details: updatedDelivery
      };
      
      await OrdersService.updateOrder(order.id, updatedOrder);
      
      alert(`Delivery status updated to ${deliveryStatuses.find(s => s.value === newStatus)?.label}`);
      loadData();
    } catch (error) {
      alert('Failed to update delivery status');
    }
  };

  const handleInputChange = (field, value) => {
    setDeliveryData(prev => ({ ...prev, [field]: value }));
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery => {
    const order = delivery.order;
    const matchesSearch = 
      order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.delivery_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by scheduled date
  const sortedDeliveries = filteredDeliveries.sort((a, b) => 
    new Date(a.scheduled_date) - new Date(b.scheduled_date)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDeliveries.length / itemsPerPage);

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderDeliveryForm = () => {
    if (!showDeliveryForm) return null;

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
            setShowDeliveryForm(false);
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
            Schedule Delivery
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Order Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Select Order *
              </label>
              <select
                value={deliveryData.order_id}
                onChange={(e) => handleOrderSelect(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              >
                <option value="">Select an order</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} - {order.client_name} - {order.event_name} 
                    ({order.tickets_quantity} tickets)
                  </option>
                ))}
              </select>
            </div>

            {deliveryData.order_id && (
              <>
                {/* Delivery Method */}
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
                  Delivery Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Delivery Method *
                    </label>
                    <select
                      value={deliveryData.delivery_method}
                      onChange={(e) => handleInputChange('delivery_method', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <option value="">Select method</option>
                      {deliveryMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryData.scheduled_date}
                      onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>

                  {(deliveryData.delivery_method === 'Courier' || 
                    deliveryData.delivery_method === 'Speed Post' || 
                    deliveryData.delivery_method === 'Registered Post') && (
                    <>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                          Courier Name
                        </label>
                        <input
                          type="text"
                          value={deliveryData.courier_name}
                          onChange={(e) => handleInputChange('courier_name', e.target.value)}
                          placeholder="e.g., Blue Dart, DTDC, FedEx"
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
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={deliveryData.tracking_number}
                          onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Delivery Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={deliveryData.delivery_charges}
                      onChange={(e) => handleInputChange('delivery_charges', parseFloat(e.target.value) || 0)}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={deliveryData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
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
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={deliveryData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Delivery Address *
                    </label>
                    <textarea
                      value={deliveryData.delivery_address}
                      onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Delivery Notes
                  </label>
                  <textarea
                    value={deliveryData.delivery_notes}
                    onChange={(e) => handleInputChange('delivery_notes', e.target.value)}
                    rows={3}
                    placeholder="Special instructions, landmarks, etc."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeliveryForm(false);
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
                disabled={!deliveryData.order_id}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: !deliveryData.order_id ? 0.5 : 1
                }}
              >
                Schedule Delivery
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !currentDelivery) return null;

    const order = currentDelivery.order;
    const status = deliveryStatuses.find(s => s.value === currentDelivery.delivery_status);

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
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Delivery Details</h3>
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
                <p><strong>Order ID:</strong> #{order.id}</p>
                <p><strong>Client:</strong> {order.client_name}</p>
                <p><strong>Event:</strong> {order.event_name}</p>
                <p><strong>Tickets:</strong> {order.tickets_quantity} x {order.ticket_category}</p>
                <p><strong>Event Date:</strong> {formatDate(order.event_date)}</p>
              </div>
            </div>

            {/* Delivery Status */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Delivery Status</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Current Status:</strong>{' '}
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    backgroundColor: `${status?.color}20`,
                    color: status?.color
                  }}>
                    {status?.label}
                  </span>
                </p>
                <p><strong>Delivery Method:</strong> {currentDelivery.delivery_method}</p>
                <p><strong>Scheduled Date:</strong> {formatDate(currentDelivery.scheduled_date)}</p>
                {currentDelivery.actual_delivery_date && (
                  <p><strong>Delivered On:</strong> {formatDate(currentDelivery.actual_delivery_date)}</p>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {(currentDelivery.courier_name || currentDelivery.tracking_number) && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Tracking Information</h4>
                <div style={{ fontSize: '0.875rem' }}>
                  {currentDelivery.courier_name && <p><strong>Courier:</strong> {currentDelivery.courier_name}</p>}
                  {currentDelivery.tracking_number && <p><strong>Tracking Number:</strong> {currentDelivery.tracking_number}</p>}
                  {currentDelivery.delivery_charges > 0 && (
                    <p><strong>Delivery Charges:</strong> ₹{currentDelivery.delivery_charges}</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Delivery Contact</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Contact Person:</strong> {currentDelivery.contact_person}</p>
                <p><strong>Phone:</strong> {currentDelivery.contact_phone}</p>
                <p><strong>Address:</strong> {currentDelivery.delivery_address}</p>
              </div>
            </div>

            {/* Notes */}
            {currentDelivery.delivery_notes && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Delivery Notes</h4>
                <p style={{ fontSize: '0.875rem' }}>{currentDelivery.delivery_notes}</p>
              </div>
            )}

            {/* Status Update */}
            {hasPermission('delivery', 'write') && currentDelivery.delivery_status !== 'delivered' && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Update Status</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {deliveryStatuses
                    .filter(s => s.value !== currentDelivery.delivery_status)
                    .map(status => (
                      <button
                        key={status.value}
                        onClick={() => {
                          if (window.confirm(`Update status to ${status.label}?`)) {
                            updateDeliveryStatus(currentDelivery, status.value);
                            setShowDetailModal(false);
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: `${status.color}20`,
                          color: status.color,
                          borderRadius: '0.375rem',
                          border: `1px solid ${status.color}`,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Mark as {status.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Delivery Management</h2>
        {hasPermission('delivery', 'write') && orders.length > 0 && (
          <button
            onClick={() => setShowDeliveryForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Schedule Delivery
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Deliveries</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{deliveries.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {deliveries.filter(d => d.delivery_status === 'pending' || d.delivery_status === 'scheduled').length}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Transit</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {deliveries.filter(d => d.delivery_status === 'in_transit' || d.delivery_status === 'out_for_delivery').length}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Delivered</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {deliveries.filter(d => d.delivery_status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Ready for Delivery Orders */}
      {orders.length > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #fbbf24'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e' }}>
            📦 {orders.length} orders ready for delivery scheduling
          </p>
        </div>
      )}

      {/* Modals */}
      {renderDeliveryForm()}
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
            placeholder="Search by client, event, or tracking number..."
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
            {deliveryStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Delivery ID</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Method</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Tracking</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Scheduled</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    {deliveries.length === 0 
                      ? 'No deliveries scheduled yet. Process payments and schedule deliveries.'
                      : 'No deliveries match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((delivery) => {
                  const order = delivery.order;
                  const status = deliveryStatuses.find(s => s.value === delivery.delivery_status);
                  
                  return (
                    <tr key={delivery.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{delivery.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>{order.client_name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.client_phone}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div>{order.event_name}</div>
                          <div style={{ color: '#6b7280' }}>{order.tickets_quantity} tickets</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {delivery.delivery_method}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {delivery.tracking_number || '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: '0.25rem',
                          backgroundColor: `${status?.color}20`,
                          color: status?.color
                        }}>
                          {status?.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {formatDate(delivery.scheduled_date)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setCurrentDelivery(delivery);
                              setShowDetailModal(true);
                            }}
                            title="View Details"
                            style={{ color: '#6b7280', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            👁️
                          </button>
                          {hasPermission('delivery', 'write') && delivery.delivery_status !== 'delivered' && (
                            <button
                              onClick={() => updateDeliveryStatus(delivery, 'delivered')}
                              title="Mark as Delivered"
                              style={{ color: '#10b981', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                            >
                              ✅
                            </button>
                          )}
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedDeliveries.length)} of {sortedDeliveries.length} results
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

export default DeliveryView;
