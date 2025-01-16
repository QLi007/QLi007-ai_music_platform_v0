import express from 'express';
import { register, login, logout, protect, getMe } from '../controllers/authController.js';

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);

export { router as authRouter }; 