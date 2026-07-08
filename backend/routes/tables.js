const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Get all tables
router.get('/', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('tables').get();
    const tables = [];
    snapshot.forEach(doc => tables.push({ id: doc.id, ...doc.data() }));
    res.json(tables);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create table
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const newTable = { name, createdAt: new Date().toISOString() };
    const docRef = await db.collection('tables').add(newTable);
    res.json({ id: docRef.id, ...newTable });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete table
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.collection('tables').doc(req.params.id).delete();
    res.json({ message: 'Table removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
