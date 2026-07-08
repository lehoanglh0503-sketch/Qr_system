const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = [];
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, desc, icon, available } = req.body;
    const newProduct = { name, category, price: Number(price), desc, icon, available, createdAt: new Date().toISOString() };
    const docRef = await db.collection('products').add(newProduct);
    res.json({ id: docRef.id, ...newProduct });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, desc, icon, available } = req.body;
    const updateData = { name, category, price: Number(price), desc, icon, available };
    await db.collection('products').doc(req.params.id).update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
