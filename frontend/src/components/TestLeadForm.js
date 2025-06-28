import React, { useState } from 'react';

const TestLeadForm = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Test Lead Form</h2>
      
      <button
        onClick={() => {
          console.log('Button clicked, current showForm:', showForm);
          setShowForm(!showForm);
        }}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        Toggle Form (Currently: {showForm ? 'ON' : 'OFF'})
      </button>

      {showForm && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem'
          }}>
            <h3>Form is showing!</h3>
            <button onClick={() => setShowForm(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestLeadForm;
