import React, { useState } from 'react';
import { PAYMENT_METHODS, INDIAN_STATES, formatCurrency } from '../../constants';

const PaymentForm = ({ lead, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    payment_amount: lead.potential_value || '',
    payment_method: 'Bank Transfer',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    event_name: lead.lead_for_event || '',
    event_date: '',
    venue: '',
    quantity: lead.number_of_people || 1,
    price_per_ticket: lead.potential_value || '',
    customer_address: '',
    customer_state: 'Haryana',
    customer_gst: '',
    payment_type: 'advance' // advance or full
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate total amount
    const baseAmount = formData.quantity * formData.price_per_ticket;
    const isIntraState = formData.customer_state === 'Haryana';
    const gstRate = 18;
    const gstAmount = (baseAmount * gstRate) / 100;
    const totalAmount = baseAmount + gstAmount;
    
    onSubmit({
      ...formData,
      base_amount: baseAmount,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      is_intra_state: isIntraState
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Record Payment - {lead.name}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Event Details */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Event Name*
          </label>
          <input
            type="text"
            name="event_name"
            value={formData.event_name}
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
            Event Date*
          </label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
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
            Venue*
          </label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
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
            Quantity*
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Price per Ticket*
          </label>
          <input
            type="number"
            name="price_per_ticket"
            value={formData.price_per_ticket}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
        </div>

        {/* Payment Details */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Payment Type*
          </label>
          <select
            name="payment_type"
            value={formData.payment_type}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          >
            <option value="advance">Advance Payment</option>
            <option value="full">Full Payment</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Payment Amount*
          </label>
          <input
            type="number"
            name="payment_amount"
            value={formData.payment_amount}
            onChange={handleChange}
            min="0"
            step="0.01"
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
            Payment Method*
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          >
            {(PAYMENT_METHODS || ['Bank Transfer', 'Cash', 'Cheque', 'UPI', 'Credit Card', 'Debit Card']).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Transaction ID
          </label>
          <input
            type="text"
            name="transaction_id"
            value={formData.transaction_id}
            onChange={handleChange}
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
            Payment Date*
          </label>
          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
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

        {/* Customer Details */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Customer Address*
          </label>
          <textarea
            name="customer_address"
            value={formData.customer_address}
            onChange={handleChange}
            required
            rows="2"
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
            State*
          </label>
          <select
            name="customer_state"
            value={formData.customer_state}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          >
            {(INDIAN_STATES || ['Haryana', 'Delhi', 'Uttar Pradesh', 'Punjab', 'Rajasthan', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'West Bengal']).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Customer GST (if applicable)
          </label>
          <input
            type="text"
            name="customer_gst"
            value={formData.customer_gst}
            onChange={handleChange}
            placeholder="15 character GSTIN"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
        </div>
      </div>

      {/* Amount Summary */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '1rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem'
      }}>
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Amount Summary</h4>
        <div style={{ fontSize: '0.875rem', display: 'grid', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Base Amount:</span>
            <span>₹{formatCurrency ? formatCurrency(formData.quantity * formData.price_per_ticket || 0) : (formData.quantity * formData.price_per_ticket || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST (18%):</span>
            <span>₹{formatCurrency ? formatCurrency((formData.quantity * formData.price_per_ticket * 0.18) || 0) : ((formData.quantity * formData.price_per_ticket * 0.18) || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #d1d5db', paddingTop: '0.25rem' }}>
            <span>Total Amount:</span>
            <span>₹{formatCurrency ? formatCurrency((formData.quantity * formData.price_per_ticket * 1.18) || 0) : ((formData.quantity * formData.price_per_ticket * 1.18) || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
          Record Payment
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
