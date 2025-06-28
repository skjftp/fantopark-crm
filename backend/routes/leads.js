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
