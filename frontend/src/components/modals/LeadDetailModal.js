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
