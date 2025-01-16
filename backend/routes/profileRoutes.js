import express from 'express';
import multer from 'multer';
import { protect } from '../controllers/authController.js';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  getStats,
  getProfileCompleteness
} from '../controllers/profileController.js';

const router = express.Router();

// 配置 multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// 所有路由都需要认证
router.use(protect);

// 获取个人资料
router.get('/me', getProfile);

// 更新个人资料
router.put('/update', updateProfile);

// 上传头像
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// 上传封面图片
router.post('/cover', upload.single('cover'), uploadCover);

// 获取用户统计信息
router.get('/stats', getStats);

// 获取个人资料完整度
router.get('/completeness', getProfileCompleteness);

export { router as profileRouter }; 