import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { uploadToIPFS } from '../utils/ipfs.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id || req.user.id)
      .select('-password')
      .populate('createdMusic')
      .populate('favorites');

    if (!user) {
      throw new AppError(req.t('profile.not_found'), 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { bio, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, preferences },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError(req.t('profile.not_found'), 404);
    }

    res.status(200).json({
      success: true,
      message: req.t('profile.update_success'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(req.t('profile.avatar_required'), 400);
    }

    const avatarHash = await uploadToIPFS(req.file.buffer);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarHash },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError(req.t('profile.not_found'), 404);
    }

    res.status(200).json({
      success: true,
      message: req.t('profile.avatar_upload_success'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(req.t('profile.cover_required'), 400);
    }

    const coverHash = await uploadToIPFS(req.file.buffer);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { coverImage: coverHash },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError(req.t('profile.not_found'), 404);
    }

    res.status(200).json({
      success: true,
      message: req.t('profile.cover_upload_success'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id || req.user.id)
      .select('createdMusic favorites');

    if (!user) {
      throw new AppError(req.t('profile.not_found'), 404);
    }

    const stats = {
      totalMusic: user.createdMusic.length,
      totalFavorites: user.favorites.length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileCompleteness = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new AppError(req.t('profile.not_found'), 404);
    }

    const fields = ['username', 'email', 'bio', 'avatar', 'coverImage', 'preferences'];
    const completedFields = fields.filter(field => user[field]);
    const completeness = Math.round((completedFields.length / fields.length) * 100);

    res.status(200).json({
      success: true,
      data: {
        completeness,
        missingFields: fields.filter(field => !user[field])
      }
    });
  } catch (error) {
    next(error);
  }
}; 