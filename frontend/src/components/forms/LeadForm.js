import React, { useState, useEffect } from 'react';
import { SALES_TEAM } from '../../constants';

const LeadForm = ({ lead, onSubmit, onCancel, inventory }) => {
  const [formData, setFormData] = useState({
    // Basic Contact Information
    name: '',
    email: '',
    phone: '',
    company: '',
    
    // Lead Source & Initial Contact
    source: '',
    date_of_enquiry: new Date().toISOString().split('T')[0],
    first_touch_base_done_by: '',
    
    // Location Information
    city_of_residence: '',
    country_of_residence: 'India',
    
    // Event & Travel Details
    lead_for_event: '',
    number_of_people: 1,
    
    // Travel Documentation
    has_valid_passport: '',
    visa_available: '',
    
    // Experience & Background
    attended_sporting_event_before: '',
    
    // Financial Information
    annual_income_bracket: '',
    
    // Sales Management
    assigned_to: '',
    potential_value: '',
    follow_up_date: '',
    notes: ''
  });

  const leadSources = [
    'Facebook', 'Instagram', 'LinkedIn', 'Friends and Family', 'Through Champion',
    'Website', 'Existing Client', 'Contacted on Social Media', 'Middlemen',
    'Wealth Management Firm', 'Media Agency', 'Concierge Desk',
    'Travel Partner', 'Travel OTA'
  ];

  const countries = [
    'India', 'United States', 'United Kingdom', 'Australia', 'Canada', 'Singapore',
    'UAE', 'Saudi Arabia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
    'Switzerland', 'Japan', 'South Korea', 'Other'
  ];

  const incomeBrackets = [
    'Less than 10 Lakhs',
    '10-25 Lakhs',
    '25-50 Lakhs',
    '50 Lakhs - 1 Crore',
    '1-5 Crores',
    '5-10 Crores',
    'Above 10 Crores'
  ];

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || '',
        date_of_enquiry: lead.date_of_enquiry || new Date().toISOString().split('T')[0],
        first_touch_base_done_by: lead.first_touch_base_done_by || '',
        city_of_residence: lead.city_of_residence || '',
        country_of_residence: lead.country_of_residence || 'India',
        lead_for_event: lead.lead_for_event || '',
        number_of_people: lead.number_of_people || 1,
        has_valid_passport: lead.has_valid_passport || '',
        visa_available: lead.visa_available || '',
        attended_sporting_event_before: lead.attended_sporting_event_before || '',
        annual_income_bracket: lead.annual_income_bracket || '',
        assigned_to: lead.assigned_to || '',
        potential_value: lead.potential_value || '',
        follow_up_date: lead.follow_up_date || '',
        notes: lead.notes || ''
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const sectionStyle = {
    marginBottom: '2rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '1.5rem'
  };

  const sectionTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem'
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '0.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        {lead ? 'Edit Lead' : 'Add New Lead'}
      </h2>

      {/* Basic Contact Information */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Basic Contact Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Contact Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              Phone*
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="10 digit mobile number"
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
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
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

      {/* Lead Source & Initial Contact */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Lead Source & Initial Contact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Source of Lead*
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select Source</option>
              {leadSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Date of Enquiry*
            </label>
            <input
              type="date"
              name="date_of_enquiry"
              value={formData.date_of_enquiry}
              onChange={handleChange}
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
              First Touch Base Done By*
            </label>
            <input
              type="text"
              name="first_touch_base_done_by"
              value={formData.first_touch_base_done_by}
              onChange={handleChange}
              required
              placeholder="Name of the person who first contacted"
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

      {/* Location Information */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Location Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              City of Residence*
            </label>
            <input
              type="text"
              name="city_of_residence"
              value={formData.city_of_residence}
              onChange={handleChange}
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
              Country of Residence*
            </label>
            <select
              name="country_of_residence"
              value={formData.country_of_residence}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Event & Travel Details */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Event & Travel Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Lead for Event*
            </label>
            <select
              name="lead_for_event"
              value={formData.lead_for_event}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select Event</option>
              {inventory && inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.event_name} - {item.venue} ({new Date(item.event_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Number of People Going*
            </label>
            <input
              type="number"
              name="number_of_people"
              value={formData.number_of_people}
              onChange={handleChange}
              min="1"
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

      {/* Travel Documentation */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Travel Documentation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Has Valid Passport
            </label>
            <select
              name="has_valid_passport"
              value={formData.has_valid_passport}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not Sure">Not Sure</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Visa Available
            </label>
            <select
              name="visa_available"
              value={formData.visa_available}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not Required">Not Required</option>
              <option value="In Process">In Process</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experience & Background */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Experience & Background</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Attended Sporting Event Before*
            </label>
            <select
              name="attended_sporting_event_before"
              value={formData.attended_sporting_event_before}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Annual Income Bracket
            </label>
            <select
              name="annual_income_bracket"
              value={formData.annual_income_bracket}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select Income Bracket</option>
              {incomeBrackets.map(bracket => (
                <option key={bracket} value={bracket}>{bracket}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sales Management */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Sales Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Assign To
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: formData.assigned_to ? '#eff6ff' : 'white'
              }}
            >
              <option value="">-- Unassigned --</option>
              {SALES_TEAM.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Lead will be marked as 'Assigned' if a sales person is selected
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Potential Value
            </label>
            <input
              type="number"
              name="potential_value"
              value={formData.potential_value}
              onChange={handleChange}
              min="0"
              step="1000"
              placeholder="Expected deal value"
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
              Follow-up Date
            </label>
            <input
              type="date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
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
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
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

      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '1rem',
        backgroundColor: 'white',
        position: 'sticky',
        bottom: 0
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
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
          {lead ? 'Update Lead' : 'Add Lead'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
