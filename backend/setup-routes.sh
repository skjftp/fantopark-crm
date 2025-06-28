#!/bin/bash

# Create routes/auth.js
cat > routes/auth.js << 'ENDFILE'
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const db = admin.firestore();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from Firestore
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Register (for initial setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    
    // Check if user exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userRef = await db.collection('users').add({
      email,
      password: hashedPassword,
      name,
      role: role || 'viewer',
      department: department || 'General',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const userDoc = await userRef.get();
    
    res.status(201).json({
      id: userRef.id,
      email: userDoc.data().email,
      name: userDoc.data().name,
      role: userDoc.data().role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
ENDFILE

# Create routes/leads.js
cat > routes/leads.js << 'ENDFILE'
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const leadsRef = db.collection('leads');
    const snapshot = await leadsRef.orderBy('created_at', 'desc').get();
    
    const leads = [];
    snapshot.forEach(doc => {
      leads.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('leads').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: req.userId,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('leads').add(leadData);
    const doc = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.userId
    };
    
    // Remove id if it exists in updates
    delete updates.id;
    
    await db.collection('leads').doc(id).update(updates);
    const doc = await db.collection('leads').doc(id).get();
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.collection('leads').doc(req.params.id).delete();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;
ENDFILE

echo "Auth and Leads routes created!"
