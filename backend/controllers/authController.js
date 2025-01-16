import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'dev_jwt_secret_key',
    { expiresIn: '7d' }
  );
};

export const register = catchAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'auth.user_exists'
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    // 生成 JWT
    const token = generateToken(user);

    // 移除密码字段
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    next(error);
  }
});

export const login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 检查用户是否存在
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'auth.invalid_credentials'
      });
    }

    // 生成 JWT
    const token = generateToken(user);

    // 移除密码字段
    user.password = undefined;

    res.json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

export const protect = catchAsync(async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'auth.no_token'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_key');

    // 检查用户是否仍然存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'auth.user_not_found'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'auth.invalid_token'
    });
  }
});

export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: req.t('auth.logout_success')
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'auth.user_not_found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
});

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, avatar } = req.body;
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        throw new AppError(req.t('auth.email_in_use'), 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError(req.t('errors.not_found'), 404);
    }

    res.status(200).json({
      success: true,
      message: req.t('auth.profile_update_success'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const bindWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      throw new AppError(req.t('auth.wallet_already_bound'), 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError(req.t('errors.not_found'), 404);
    }

    res.status(200).json({
      success: true,
      message: req.t('auth.wallet_bind_success'),
      data: user
    });
  } catch (error) {
    next(error);
  }
}; 