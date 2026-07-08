const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Get company info (Public)
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('company').doc('info').get();
    if (!doc.exists) {
      // Default info if DB is empty
      const defaultInfo = {
        name: 'Quán Ăn Ngon',
        phone: '0853272393',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        description: 'Quán ăn truyền thống',
        openTime: '06:00',
        closeTime: '22:00',
        slug: 'quan-an-ngon',
        primaryColor: '#dc2626',
        wifi: 'QuanAnNgon123'
      };
      return res.json(defaultInfo);
    }
    res.json(doc.data());
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update company info
router.put('/', authMiddleware, async (req, res) => {
  try {
    const info = req.body;
    await db.collection('company').doc('info').set(info, { merge: true });
    res.json(info);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
