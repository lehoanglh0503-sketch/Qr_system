const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const categories = [];
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create category
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, count } = req.body;
    const newCategory = { name, count: count || 0, createdAt: new Date().toISOString() };
    const docRef = await db.collection('categories').add(newCategory);
    res.json({ id: docRef.id, ...newCategory });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update category
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    await db.collection('categories').doc(req.params.id).update({ name });
    res.json({ id: req.params.id, name });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete category
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.collection('categories').doc(req.params.id).delete();
    res.json({ message: 'Category removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
