const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Get all pending notifications (Admin/Waiter)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
                             .where('status', '==', 'Pending')
                             .orderBy('createdAt', 'desc')
                             .get();
    const notifications = [];
    snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
    res.json(notifications);
  } catch (err) {
    // If index is missing, firebase will throw an error. For simplicity, just get all pending and sort client-side
    try {
        const fallbackSnapshot = await db.collection('notifications')
                             .where('status', '==', 'Pending')
                             .get();
        const notifications = [];
        fallbackSnapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
        // sort descending
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(notifications);
    } catch(fallbackErr) {
        res.status(500).send('Server Error');
    }
  }
});

// Create notification (Customer)
router.post('/', async (req, res) => {
  try {
    const { tableId, tableName, type } = req.body;
    const newNotif = {
      tableId: tableId || null,
      tableName: tableName || 'Bàn chưa rõ',
      type: type, // 'Call_Staff' or 'Request_Bill'
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('notifications').add(newNotif);
    res.json({ id: docRef.id, ...newNotif });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Resolve notification (Admin/Waiter)
router.put('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).update({ status: 'Resolved', resolvedAt: new Date().toISOString() });
    res.json({ id: req.params.id, status: 'Resolved' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
