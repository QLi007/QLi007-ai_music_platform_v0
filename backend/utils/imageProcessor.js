import sharp from 'sharp';
import { AppError } from './appError.js';

// 处理头像图片
export const processAvatar = async (buffer, crop = null) => {
  try {
    let image = sharp(buffer);
    
    // 如果提供了裁剪参数
    if (crop && crop.width && crop.height && crop.left && crop.top) {
      image = image.extract({
        left: Math.round(crop.left),
        top: Math.round(crop.top),
        width: Math.round(crop.width),
        height: Math.round(crop.height)
      });
    }

    return await image
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch (error) {
    throw new AppError('处理头像图片失败', 500);
  }
};

// 处理封面图片
export const processCoverImage = async (buffer, crop = null) => {
  try {
    let image = sharp(buffer);
    
    // 如果提供了裁剪参数
    if (crop && crop.width && crop.height && crop.left && crop.top) {
      image = image.extract({
        left: Math.round(crop.left),
        top: Math.round(crop.top),
        width: Math.round(crop.width),
        height: Math.round(crop.height)
      });
    }

    return await image
      .resize(1200, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    throw new AppError('处理封面图片失败', 500);
  }
};

// 生成缩略图
export const generateThumbnail = async (buffer) => {
  try {
    return await sharp(buffer)
      .resize(100, 100, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw new AppError('生成缩略图失败', 500);
  }
}; 