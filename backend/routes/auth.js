const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('../firebase');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// Note: For a real app, users would be in Firestore. 
// For this clone, we can hardcode the admin or store them in DB.
// Let's use Firestore 'users' collection.

// Login
router.post('/login', async (req, res) => {
  const { phone, password, role } = req.body;
  
  try {
    const snapshot = await db.collection('users').where('phone', '==', phone).get();
    
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không đúng' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không đúng' });
    }

    const payload = {
      user: {
        id: userDoc.id,
        phone: user.phone,
        role: user.role || 'Nhân viên',
        name: user.name
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload.user });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
