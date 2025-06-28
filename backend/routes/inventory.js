const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const inventoryRef = db.collection('inventory');
    const snapshot = await inventoryRef.orderBy('created_at', 'desc').get();
    
    const inventory = [];
    snapshot.forEach(doc => {
      inventory.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('inventory').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Create inventory item
router.post('/', auth, async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: req.userId,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('inventory').add(inventoryData);
    const doc = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.userId
    };
    
    delete updates.id;
    
    await db.collection('inventory').doc(id).update(updates);
    const doc = await db.collection('inventory').doc(id).get();
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.collection('inventory').doc(req.params.id).delete();
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;
