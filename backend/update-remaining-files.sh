#!/bin/bash

# Update routes/orders.js
cat > routes/orders.js << 'ENDFILE'
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.orderBy('created_at', 'desc').get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    // Generate order number
    const orderCount = await db.collection('counters').doc('orders').get();
    let nextNumber = 1;
    
    if (orderCount.exists) {
      nextNumber = (orderCount.data().count || 0) + 1;
      await db.collection('counters').doc('orders').update({ count: nextNumber });
    } else {
      await db.collection('counters').doc('orders').set({ count: 1 });
    }
    
    const orderData = {
      ...req.body,
      order_number: `ORD-${String(nextNumber).padStart(6, '0')}`,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: req.userId,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('orders').add(orderData);
    const doc = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.userId
    };
    
    delete updates.id;
    
    await db.collection('orders').doc(id).update(updates);
    const doc = await db.collection('orders').doc(id).get();
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).delete();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
ENDFILE

echo "Orders route updated!"
