import { create } from 'ipfs-http-client';
import { AppError } from './appError.js';
import { config } from '../config.js';

const ipfs = create({
  host: config.get('ipfsHost'),
  port: config.get('ipfsPort'),
  protocol: 'http'
});

export const uploadToIPFS = async (buffer) => {
  try {
    const result = await ipfs.add(buffer);
    return result.path;
  } catch (error) {
    throw new AppError('IPFS上传失败', 500);
  }
};

export const getFromIPFS = async (hash) => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    throw new AppError('IPFS获取文件失败', 500);
  }
}; 