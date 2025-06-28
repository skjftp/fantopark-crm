import React, { useState, useEffect } from 'react';
import InventoryService from '../services/inventoryService';
import { formatDate } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const InventoryView = ({ user, hasPermission }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    event_type: '',
    sports: '',
    venue: '',
    day_of_match: 'Not Applicable',
    category_of_ticket: '',
    stand: '',
    total_tickets: '',
    available_tickets: '',
    mrp_of_ticket: '',
    buying_price: '',
    selling_price: '',
    inclusions: '',
    booking_person: '',
    procurement_type: '',
    notes: ''
  });

  const inventoryFormFields = [
    { name: 'event_name', label: 'Event Name', type: 'text', required: true },
    { name: 'event_date', label: 'Event Date', type: 'date', required: true },
    { name: 'event_type', label: 'Event Type', type: 'select', options: ['football', 'cricket', 'tennis', 'formula1', 'olympics', 'basketball', 'badminton', 'hockey'], required: true },
    { name: 'sports', label: 'Sports Category', type: 'select', options: ['Cricket', 'Football', 'Tennis', 'Formula 1', 'Olympics', 'Basketball', 'Badminton', 'Hockey', 'Golf', 'Wrestling'], required: true },
    { name: 'venue', label: 'Venue', type: 'text', required: true },
    { name: 'day_of_match', label: 'Day of Match (for Test/Multi-day)', type: 'select', options: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Not Applicable'], required: false },
    { name: 'category_of_ticket', label: 'Category of Ticket', type: 'select', options: ['VIP', 'Premium', 'Gold', 'Silver', 'Bronze', 'General', 'Corporate Box', 'Hospitality'], required: true },
    { name: 'stand', label: 'Stand/Section', type: 'text', required: false, placeholder: 'e.g., North Stand, East Pavilion' },
    { name: 'total_tickets', label: 'Total Tickets', type: 'number', required: true },
    { name: 'available_tickets', label: 'Available Tickets', type: 'number', required: true },
    { name: 'mrp_of_ticket', label: 'MRP of Ticket (₹)', type: 'number', required: true },
    { name: 'buying_price', label: 'Buying Price (₹)', type: 'number', required: true },
    { name: 'selling_price', label: 'Selling Price (₹)', type: 'number', required: true },
    { name: 'inclusions', label: 'Inclusions', type: 'textarea', required: false, placeholder: 'e.g., Food, Beverages, Parking, Merchandise, Meet & Greet' },
    { name: 'booking_person', label: 'Booking Person (Who Purchased)', type: 'text', required: true, placeholder: 'Name of person/company who purchased inventory' },
    { name: 'procurement_type', label: 'Procurement Type', type: 'select', options: ['pre_inventory', 'on_demand', 'partnership', 'direct_booking'], required: true },
    { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Any special conditions, restrictions, or notes' }
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await InventoryService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      event_name: '',
      event_date: '',
      event_type: '',
      sports: '',
      venue: '',
      day_of_match: 'Not Applicable',
      category_of_ticket: '',
      stand: '',
      total_tickets: '',
      available_tickets: '',
      mrp_of_ticket: '',
      buying_price: '',
      selling_price: '',
      inclusions: '',
      booking_person: '',
      procurement_type: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditForm && currentItem) {
        const updated = await InventoryService.updateInventoryItem(currentItem.id, formData);
        setInventory(prev => prev.map(item => item.id === currentItem.id ? updated : item));
        alert('Inventory updated successfully!');
      } else {
        const newItem = await InventoryService.createInventoryItem({
          ...formData,
          created_date: new Date().toISOString().split('T')[0]
        });
        setInventory(prev => [...prev, newItem]);
        alert('Event added to inventory successfully!');
      }
      setShowAddForm(false);
      setShowEditForm(false);
      setCurrentItem(null);
      resetForm();
    } catch (error) {
      alert('Failed to save inventory item');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openEditForm = (item) => {
    setCurrentItem(item);
    setFormData(item);
    setShowEditForm(true);
  };

  const openDetailModal = (item) => {
    setCurrentItem(item);
    setShowDetailModal(true);
  };

  // Filter inventory
  let filteredInventory = [...inventory];
  
  if (searchQuery) {
    filteredInventory = filteredInventory.filter(item =>
      item.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (eventFilter !== 'all') {
    filteredInventory = filteredInventory.filter(item => item.event_name === eventFilter);
  }

  if (dueDateFilter !== 'all') {
    const today = new Date();
    const filterDate = new Date();
    
    switch(dueDateFilter) {
      case '3days':
        filterDate.setDate(today.getDate() + 3);
        break;
      case '7days':
        filterDate.setDate(today.getDate() + 7);
        break;
      case '15days':
        filterDate.setDate(today.getDate() + 15);
        break;
      case '30days':
        filterDate.setDate(today.getDate() + 30);
        break;
    }
    
    filteredInventory = filteredInventory.filter(item => {
      const eventDate = new Date(item.event_date);
      return eventDate >= today && eventDate <= filterDate;
    });
  }

  // Sort by event date
  const sortedInventory = filteredInventory.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderForm = () => {
    const isEdit = showEditForm && currentItem;
    
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
            setShowEditForm(false);
            setCurrentItem(null);
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {isEdit ? `Edit Event: ${currentItem.event_name}` : 'Add New Event'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {inventoryFormFields.map(field => (
                <div key={field.name} style={{ 
                  gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' 
                }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.25rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500' 
                  }}>
                    {field.label} {field.required && '*'}
                  </label>
                  
                  {field.type === 'text' || field.type === 'number' || field.type === 'date' ? (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(option => (
                        <option key={option} value={option}>
                          {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setCurrentItem(null);
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
                {isEdit ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !currentItem) return null;

    const margin = currentItem.selling_price - currentItem.buying_price;
    const marginPercent = ((margin / currentItem.buying_price) * 100).toFixed(1);
    const daysUntilEvent = Math.ceil((new Date(currentItem.event_date) - new Date()) / (1000 * 60 * 60 * 24));

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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Inventory Details</h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Event Information</h4>
              <div style={{ fontSize: '0.875rem', space: '0.5rem' }}>
                <p><strong>Event:</strong> {currentItem.event_name}</p>
                <p><strong>Date:</strong> {new Date(currentItem.event_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</p>
                <p><strong>Venue:</strong> {currentItem.venue}</p>
                <p><strong>Sports:</strong> {currentItem.sports || currentItem.event_type}</p>
                {currentItem.day_of_match && currentItem.day_of_match !== 'Not Applicable' && (
                  <p><strong>Day:</strong> {currentItem.day_of_match}</p>
                )}
                {daysUntilEvent >= 0 && daysUntilEvent <= 7 && (
                  <p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ {daysUntilEvent} days until event</p>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Ticket Information</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Category:</strong> {currentItem.category_of_ticket}</p>
                {currentItem.stand && <p><strong>Stand:</strong> {currentItem.stand}</p>}
                <p><strong>Total Tickets:</strong> {currentItem.total_tickets}</p>
                <p><strong>Available:</strong> {currentItem.available_tickets}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' }}>
                    <div style={{
                      width: `${(currentItem.available_tickets / currentItem.total_tickets) * 100}%`,
                      backgroundColor: '#3b82f6',
                      height: '100%',
                      borderRadius: '9999px'
                    }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {((currentItem.available_tickets / currentItem.total_tickets) * 100).toFixed(0)}% available
                  </p>
                </div>
              </div>
            </div>

            {hasPermission('finance', 'read') && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Pricing Information</h4>
                <div style={{ fontSize: '0.875rem' }}>
                  <p><strong>MRP:</strong> ₹{currentItem.mrp_of_ticket?.toLocaleString()}</p>
                  <p><strong>Buying Price:</strong> ₹{currentItem.buying_price?.toLocaleString()}</p>
                  <p><strong>Selling Price:</strong> ₹{currentItem.selling_price?.toLocaleString()}</p>
                  <p style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #d1d5db' }}>
                    <strong>Margin:</strong> <span style={{ color: '#10b981' }}>₹{margin.toLocaleString()} ({marginPercent}%)</span>
                  </p>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Procurement Details</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Booking Person:</strong> {currentItem.booking_person}</p>
                <p><strong>Procurement Type:</strong> {currentItem.procurement_type?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {currentItem.inclusions && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', gridColumn: 'span 2' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Inclusions</h4>
                <p style={{ fontSize: '0.875rem' }}>{currentItem.inclusions}</p>
              </div>
            )}

            {currentItem.notes && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', gridColumn: 'span 2' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Additional Notes</h4>
                <p style={{ fontSize: '0.875rem' }}>{currentItem.notes}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            {hasPermission('inventory', 'write') && (
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditForm(currentItem);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Edit Inventory
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Inventory Management</h2>
        {hasPermission('inventory', 'write') && (
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
            + Add New Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Filter by Due Date
            </label>
            <select
              value={dueDateFilter}
              onChange={(e) => {
                setDueDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="all">All Inventory</option>
              <option value="3days">Due in 3 Days</option>
              <option value="7days">Due in 7 Days</option>
              <option value="15days">Due in 15 Days</option>
              <option value="30days">Due in 1 Month</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Filter by Event
            </label>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="all">All Events</option>
              {Array.from(new Set(inventory.map(item => item.event_name))).map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Forms and Modals */}
      {(showAddForm || showEditForm) && renderForm()}
      {renderDetailModal()}

      {/* Main Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Sports</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Available</th>
                {hasPermission('finance', 'read') && (
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Margin</th>
                )}
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={hasPermission('finance', 'read') ? 7 : 6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    {inventory.length === 0 
                      ? 'No inventory items yet. Click "+ Add New Event" to get started.'
                      : 'No inventory items match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const margin = item.selling_price - item.buying_price;
                  const marginPercent = ((margin / item.buying_price) * 100).toFixed(1);
                  const daysUntilEvent = Math.ceil((new Date(item.event_date) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>{item.event_name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.venue}</div>
                          {item.day_of_match && item.day_of_match !== 'Not Applicable' && (
                            <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{item.day_of_match}</div>
                          )}
                          {daysUntilEvent <= 7 && daysUntilEvent >= 0 && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.125rem 0.5rem',
                              marginTop: '0.25rem',
                              borderRadius: '0.25rem',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {daysUntilEvent} days left
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.sports || item.event_type}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: '0.25rem',
                          backgroundColor: 
                            item.category_of_ticket === 'VIP' || item.category_of_ticket === 'Premium' ? '#e9d5ff' :
                            item.category_of_ticket === 'Gold' ? '#fef3c7' :
                            item.category_of_ticket === 'Silver' ? '#f3f4f6' :
                            '#dbeafe',
                          color:
                            item.category_of_ticket === 'VIP' || item.category_of_ticket === 'Premium' ? '#7c3aed' :
                            item.category_of_ticket === 'Gold' ? '#d97706' :
                            item.category_of_ticket === 'Silver' ? '#4b5563' :
                            '#2563eb'
                        }}>
                          {item.category_of_ticket}
                        </span>
                        {item.stand && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{item.stand}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {new Date(item.event_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                            {item.available_tickets} / {item.total_tickets}
                          </div>
                          <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.375rem', marginTop: '0.25rem' }}>
                            <div style={{
                              width: `${(item.available_tickets / item.total_tickets) * 100}%`,
                              backgroundColor: '#3b82f6',
                              height: '100%',
                              borderRadius: '9999px'
                            }} />
                          </div>
                        </div>
                      </td>
                      {hasPermission('finance', 'read') && (
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: '500', color: '#10b981' }}>₹{margin.toLocaleString()}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{marginPercent}%</div>
                          </div>
                        </td>
                      )}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openDetailModal(item)}
                            title="View Details"
                            style={{ color: '#6b7280', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            👁️
                          </button>
                          {hasPermission('inventory', 'write') && (
                            <button
                              onClick={() => openEditForm(item)}
                              title="Edit"
                              style={{ color: '#3b82f6', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                            >
                              ✏️
                            </button>
                          )}
                          {hasPermission('inventory', 'allocate') && item.available_tickets > 0 && (
                            <button
                              title="Allocate"
                              style={{ color: '#10b981', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                            >
                              📤
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
            justifyContent: 'between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedInventory.length)} of {sortedInventory.length} results
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

export default InventoryView;
