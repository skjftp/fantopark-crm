#!/bin/bash

echo "Creating form components..."

# Create LeadForm component
cat > src/components/forms/LeadForm.js << 'EOFILE'
import React, { useState } from 'react';
import { LEAD_STATUSES } from '../../constants';

const LeadForm = ({ lead, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(lead || {
    name: '',
    email: '',
    phone: '',
    company: '',
    lead_for_event: '',
    number_of_people: '',
    event_start_date: '',
    event_end_date: '',
    location_preference: '',
    annual_income_bracket: '',
    source: '',
    status: 'new',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save lead');
      setLoading(false);
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  };

  const formStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    width: '100%',
    maxWidth: '56rem',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem'
  };

  return (
    <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={formStyle}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            {lead ? `Edit Lead: ${lead.name}` : 'Add New Lead'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              color: '#6b7280',
              fontSize: '1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Event Interest</label>
              <input
                type="text"
                value={formData.lead_for_event}
                onChange={(e) => handleInputChange('lead_for_event', e.target.value)}
                style={inputStyle}
                placeholder="e.g., IPL Finals 2024"
              />
            </div>

            <div>
              <label style={labelStyle}>Number of People</label>
              <input
                type="number"
                value={formData.number_of_people}
                onChange={(e) => handleInputChange('number_of_people', e.target.value)}
                style={inputStyle}
                min="1"
              />
            </div>

            <div>
              <label style={labelStyle}>Event Start Date</label>
              <input
                type="date"
                value={formData.event_start_date}
                onChange={(e) => handleInputChange('event_start_date', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Event End Date</label>
              <input
                type="date"
                value={formData.event_end_date}
                onChange={(e) => handleInputChange('event_end_date', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Location Preference</label>
              <input
                type="text"
                value={formData.location_preference}
                onChange={(e) => handleInputChange('location_preference', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Annual Income Bracket</label>
              <select
                value={formData.annual_income_bracket}
                onChange={(e) => handleInputChange('annual_income_bracket', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Income Bracket</option>
                <option value="< 10 Lakhs">Less than 10 Lakhs</option>
                <option value="10-25 Lakhs">10-25 Lakhs</option>
                <option value="25-50 Lakhs">25-50 Lakhs</option>
                <option value="50 Lakhs - 1 Cr">50 Lakhs - 1 Cr</option>
                <option value="> 1 Cr">More than 1 Cr</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Source</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Phone">Phone</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {lead && (
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  style={inputStyle}
                >
                  {Object.entries(LEAD_STATUSES).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px' }}
                rows={3}
              />
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : (lead ? 'Update Lead' : 'Add Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
EOFILE

# Create LeadDetailModal component
cat > src/components/modals/LeadDetailModal.js << 'EOFILE'
import React from 'react';
import { LEAD_STATUSES, formatDate } from '../../constants';

const LeadDetailModal = ({ lead, onClose, onEdit, onStatusChange, hasPermission }) => {
  if (!lead) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    width: '100%',
    maxWidth: '56rem',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const sectionStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem'
  };

  return (
    <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={contentStyle}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            Lead Details
          </h2>
          <button
            onClick={onClose}
            style={{
              color: '#6b7280',
              fontSize: '1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {/* Basic Information */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                📋 Basic Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Name: </span>
                  <span style={{ color: '#111827' }}>{lead.name}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Email: </span>
                  <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Phone: </span>
                    <a href={`tel:${lead.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.company && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Company: </span>
                    <span style={{ color: '#111827' }}>{lead.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Interest */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                🎫 Event Interest
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Event: </span>
                  <span style={{ color: '#111827' }}>{lead.lead_for_event || 'Not specified'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Number of People: </span>
                  <span style={{ color: '#111827' }}>{lead.number_of_people || 'Not specified'}</span>
                </div>
                {lead.location_preference && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Location: </span>
                    <span style={{ color: '#111827' }}>{lead.location_preference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Assignment */}
            <div style={{ ...sectionStyle, backgroundColor: '#fef3c7' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                📌 Status & Assignment
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Current Status: </span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: lead.status === 'new' ? '#dbeafe' :
                                    lead.status === 'contacted' ? '#fef3c7' :
                                    lead.status === 'qualified' ? '#e9d5ff' :
                                    lead.status === 'converted' ? '#d1fae5' : '#f3f4f6',
                    color: lead.status === 'new' ? '#1e40af' :
                           lead.status === 'contacted' ? '#92400e' :
                           lead.status === 'qualified' ? '#6b21a8' :
                           lead.status === 'converted' ? '#065f46' : '#374151'
                  }}>
                    {LEAD_STATUSES[lead.status]?.label}
                  </span>
                </div>
                {lead.assigned_to && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Assigned To: </span>
                    <span style={{ color: '#111827' }}>{lead.assigned_to}</span>
                  </div>
                )}
                {hasPermission('leads', 'write') && LEAD_STATUSES[lead.status]?.next?.length > 0 && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Change Status:
                    </span>
                    <select
                      onChange={(e) => e.target.value && onStatusChange(lead.id, e.target.value)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Select new status</option>
                      {LEAD_STATUSES[lead.status].next.map(status => (
                        <option key={status} value={status}>
                          {LEAD_STATUSES[status].label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Source */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                📊 Lead Source
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Source: </span>
                  <span style={{ color: '#111827' }}>{lead.source || 'Not specified'}</span>
                </div>
                {lead.created_date && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Created Date: </span>
                    <span style={{ color: '#111827' }}>{formatDate(lead.created_date)}</span>
                  </div>
                )}
                {lead.annual_income_bracket && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Income Bracket: </span>
                    <span style={{ color: '#111827' }}>{lead.annual_income_bracket}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div style={{ ...sectionStyle, marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                📝 Notes
              </h3>
              <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{lead.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            {hasPermission('leads', 'write') && (
              <button
                onClick={onEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Edit Lead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
EOFILE

echo "✓ Form components created successfully!"

