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
  origin: ['https://fantopark-crm-frontend-150582227311.us-central1.run.app/', 'http://localhost:3000'],
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
