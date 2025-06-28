const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoicesRef = db.collection('invoices');
    const snapshot = await invoicesRef.orderBy('created_at', 'desc').get();
    
    const invoices = [];
    snapshot.forEach(doc => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('invoices').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    // Generate invoice number
    const invoiceCount = await db.collection('counters').doc('invoices').get();
    let nextNumber = 1;
    
    if (invoiceCount.exists) {
      nextNumber = (invoiceCount.data().count || 0) + 1;
      await db.collection('counters').doc('invoices').update({ count: nextNumber });
    } else {
      await db.collection('counters').doc('invoices').set({ count: 1 });
    }
    
    const invoiceData = {
      ...req.body,
      invoice_number: `INV-${String(nextNumber).padStart(6, '0')}`,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: req.userId,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('invoices').add(invoiceData);
    const doc = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.userId
    };
    
    delete updates.id;
    
    await db.collection('invoices').doc(id).update(updates);
    const doc = await db.collection('invoices').doc(id).get();
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.collection('invoices').doc(req.params.id).delete();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

module.exports = router;
