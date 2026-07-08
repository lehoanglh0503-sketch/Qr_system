const { db } = require('./firebase');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);
    
    await db.collection('users').doc('admin_id_1').set({
      name: 'Nguyễn Văn An',
      phone: '0853272393',
      password: hashedPassword,
      role: 'Admin',
      createdAt: new Date().toISOString()
    });
    console.log('Tạo tài khoản Admin thành công! Đăng nhập với 0853272393 / 12345678');
    process.exit(0);
  } catch(err) {
    console.error('Lỗi tạo Admin:', err);
    process.exit(1);
  }
}

seed();
