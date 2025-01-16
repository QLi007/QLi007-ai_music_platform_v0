import sharp from 'sharp';
import { AppError } from './appError.js';

// 检查图片基本信息
export const validateImage = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    
    // 检查图片格式
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
    if (!allowedFormats.includes(metadata.format)) {
      throw new AppError('不支持的图片格式，请上传 JPG, PNG 或 WebP 格式的图片', 400);
    }

    // 检查图片尺寸
    const maxDimension = 5000; // 5000px
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      throw new AppError('图片尺寸过大，请上传较小的图片', 400);
    }

    // 检查图片比例
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio > 3 || aspectRatio < 0.33) {
      throw new AppError('图片比例不合适，请上传比例更合理的图片', 400);
    }

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      aspectRatio
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('图片验证失败，请确保上传的是有效的图片文件', 400);
  }
}; 