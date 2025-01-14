const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, bindWallet } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/wallet', bindWallet);

module.exports = router; 