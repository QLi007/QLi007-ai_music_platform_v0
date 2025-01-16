import { Music } from '../models/Music.js';
import AppError from '../utils/appError.js';
import { uploadToIPFS } from '../utils/ipfs.js';

export const uploadMusic = async (req, res, next) => {
  try {
    const { title, description, genre, isPublic } = req.body;

    if (!title) {
      throw new AppError(req.t('music.title_required'), 400);
    }

    if (!req.file) {
      throw new AppError(req.t('music.audio_required'), 400);
    }

    // 上传音频文件到 IPFS
    const audioHash = await uploadToIPFS(req.file.buffer);

    const music = await Music.create({
      title,
      description,
      genre,
      isPublic: isPublic || false,
      audioFile: audioHash,
      creator: req.user.id
    });

    res.status(201).json({
      success: true,
      message: req.t('music.upload_success'),
      data: music
    });
  } catch (error) {
    next(error);
  }
};

export const getMusic = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id)
      .populate('creator', 'username avatar');

    if (!music) {
      throw new AppError(req.t('music.not_found'), 404);
    }

    // 检查访问权限
    if (!music.isPublic && music.creator.id !== req.user.id) {
      throw new AppError(req.t('errors.forbidden'), 403);
    }

    res.status(200).json({
      success: true,
      data: music
    });
  } catch (error) {
    next(error);
  }
};

export const updateMusic = async (req, res, next) => {
  try {
    const { title, description, genre, isPublic } = req.body;
    const music = await Music.findById(req.params.id);

    if (!music) {
      throw new AppError(req.t('music.not_found'), 404);
    }

    // 检查更新权限
    if (music.creator.toString() !== req.user.id) {
      throw new AppError(req.t('errors.forbidden'), 403);
    }

    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      { title, description, genre, isPublic },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: req.t('music.update_success'),
      data: updatedMusic
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMusic = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      throw new AppError(req.t('music.not_found'), 404);
    }

    // 检查删除权限
    if (music.creator.toString() !== req.user.id) {
      throw new AppError(req.t('errors.forbidden'), 403);
    }

    await music.deleteOne();

    res.status(200).json({
      success: true,
      message: req.t('music.delete_success')
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      throw new AppError(req.t('music.not_found'), 404);
    }

    // 检查是否已经收藏
    const isFavorited = music.stats.likes.includes(req.user.id);
    const operation = isFavorited ? '$pull' : '$addToSet';

    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      { [operation]: { 'stats.likes': req.user.id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: req.t(isFavorited ? 'music.unfavorite_success' : 'music.favorite_success'),
      data: updatedMusic
    });
  } catch (error) {
    next(error);
  }
};

export const recordPlay = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      throw new AppError(req.t('music.not_found'), 404);
    }

    // 更新播放次数
    await Music.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.plays': 1 }
    });

    res.status(200).json({
      success: true,
      message: req.t('music.play_recorded')
    });
  } catch (error) {
    next(error);
  }
};

export const searchMusic = async (req, res, next) => {
  try {
    const { query, genre, sort = '-createdAt' } = req.query;
    const searchQuery = {};

    // 构建搜索条件
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (genre) {
      searchQuery.genre = genre;
    }

    // 只返回公开的音乐
    searchQuery.isPublic = true;

    const music = await Music.find(searchQuery)
      .sort(sort)
      .populate('creator', 'username avatar');

    res.status(200).json({
      success: true,
      data: music
    });
  } catch (error) {
    next(error);
  }
}; 