#!/bin/bash

# Create server.js
cat > server.js << 'ENDFILE'
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors({
  origin: ['https://crm-frontend-150582227311.us-central1.run.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const inventoryRoutes = require('./routes/inventory');
const ordersRoutes = require('./routes/orders');
const invoicesRoutes = require('./routes/invoices');
const deliveriesRoutes = require('./routes/deliveries');
const usersRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { db };
ENDFILE

# Create middleware/auth.js
cat > middleware/auth.js << 'ENDFILE'
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};
ENDFILE

echo "Files created successfully!"
