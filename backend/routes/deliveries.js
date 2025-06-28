const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get all deliveries
router.get('/', auth, async (req, res) => {
  try {
    const deliveriesRef = db.collection('deliveries');
    const snapshot = await deliveriesRef.orderBy('created_at', 'desc').get();
    
    const deliveries = [];
    snapshot.forEach(doc => {
      deliveries.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Get single delivery
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('deliveries').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({ error: 'Failed to fetch delivery' });
  }
});

// Create delivery
router.post('/', auth, async (req, res) => {
  try {
    const deliveryData = {
      ...req.body,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: req.userId,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('deliveries').add(deliveryData);
    const doc = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});

// Update delivery
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.userId
    };
    
    delete updates.id;
    
    await db.collection('deliveries').doc(id).update(updates);
    const doc = await db.collection('deliveries').doc(id).get();
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({ error: 'Failed to update delivery' });
  }
});

// Delete delivery
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.collection('deliveries').doc(req.params.id).delete();
    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({ error: 'Failed to delete delivery' });
  }
});

module.exports = router;
