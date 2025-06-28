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
