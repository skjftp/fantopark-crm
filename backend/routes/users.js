const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const db = admin.firestore();

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user has permission
    if (!['super_admin', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      // Don't send password
      delete userData.password;
      users.push({ id: doc.id, ...userData });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    // Users can get their own info, admins can get any user
    if (req.params.id !== req.userId && !['super_admin', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const doc = await db.collection('users').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = doc.data();
    delete userData.password;
    
    res.json({ id: doc.id, ...userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { email, password, name, role, department } = req.body;
    
    // Check if user exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userData = {
      email,
      password: hashedPassword,
      name,
      role,
      department,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: req.userId
    };
    
    const docRef = await db.collection('users').add(userData);
    const doc = await docRef.get();
    
    const responseData = doc.data();
    delete responseData.password;
    
    res.status(201).json({ id: docRef.id, ...responseData });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    // Users can update their own info, admins can update any user
    if (req.params.id !== req.userId && !['super_admin', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { id } = req.params;
    const updates = { ...req.body };
    
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
    updates.updated_by = req.userId;
    
    delete updates.id;
    
    await db.collection('users').doc(id).update(updates);
    const doc = await db.collection('users').doc(id).get();
    
    const userData = doc.data();
    delete userData.password;
    
    res.json({ id: doc.id, ...userData });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!['super_admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
