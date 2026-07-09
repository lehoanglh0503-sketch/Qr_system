const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create new order or append to existing (Public/Customer)
router.post('/', async (req, res) => {
  try {
    const { tableName, items, totalAmount, note } = req.body;
    
    // Check if there is an active order for this table
    const snapshot = await db.collection('orders').where('tableName', '==', tableName || 'Bàn chưa rõ').get();
    let activeOrderDoc = null;
    snapshot.forEach(doc => {
      if (doc.data().status !== 'paid') activeOrderDoc = doc;
    });

    if (activeOrderDoc) {
      // Append items
      const data = activeOrderDoc.data();
      const newItems = [...(data.items || []), ...(items || []).map(item => ({ ...item, status: 'pending' }))];
      const newTotalAmount = (data.totalAmount || 0) + (totalAmount || 0);
      const newNote = data.note ? data.note + (note ? `\n${note}` : '') : (note || '');
      
      await db.collection('orders').doc(activeOrderDoc.id).update({
        items: newItems,
        totalAmount: newTotalAmount,
        note: newNote,
      });
      res.json({ id: activeOrderDoc.id, items: newItems, totalAmount: newTotalAmount });
    } else {
      const newOrder = {
        tableName: tableName || 'Bàn chưa rõ',
        items: (items || []).map(item => ({ ...item, status: 'pending' })),
        totalAmount: totalAmount || 0,
        note: note || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const docRef = await db.collection('orders').add(newOrder);
      res.json({ id: docRef.id, ...newOrder });
    }
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get active order for a table (Public/Customer)
router.get('/table/:tableName', async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('tableName', '==', req.params.tableName)
      .get();
    
    let activeOrder = null;
    snapshot.forEach(doc => {
      if (doc.data().status !== 'paid') activeOrder = { id: doc.id, ...doc.data() };
    });
    
    res.json(activeOrder);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'processing', 'completed'
    await db.collection('orders').doc(req.params.id).update({ status });
    res.json({ id: req.params.id, status });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update order item status
router.put('/:id/items/:itemIndex/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'cooking', 'ready', 'served'
    const orderRef = db.collection('orders').doc(req.params.id);
    const doc = await orderRef.get();
    
    if (!doc.exists) {
      return res.status(404).send('Order not found');
    }
    
    const data = doc.data();
    const itemIndex = parseInt(req.params.itemIndex, 10);
    
    if (data.items && data.items[itemIndex]) {
      data.items[itemIndex].status = status;
      await orderRef.update({ items: data.items });
      res.json({ id: req.params.id, itemIndex, status });
    } else {
      res.status(404).send('Item not found');
    }
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
