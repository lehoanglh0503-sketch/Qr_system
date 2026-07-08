const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

// Middleware to check if user is Admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Admin role' });
  }
};

// Get all users
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      delete data.password; // Don't send passwords to frontend
      users.push({ id: doc.id, ...data });
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create user
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    
    // Check if phone already exists
    const existing = await db.collection('users').where('phone', '==', phone).get();
    if (!existing.empty) {
      return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      phone,
      password: hashedPassword,
      role: role || 'Nhân viên',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(newUser);
    delete newUser.password;
    res.json({ id: docRef.id, ...newUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete user
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting oneself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa chính tài khoản đang đăng nhập' });
    }
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Optional: Admin update user password
router.put('/:id/password', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await db.collection('users').doc(req.params.id).update({ password: hashedPassword });
    res.json({ message: 'Password updated' });
  } catch(err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
