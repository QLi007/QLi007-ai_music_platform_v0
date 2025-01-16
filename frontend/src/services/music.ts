import { request } from './api';
import { 
  ICreateMusicRequest, 
  IUpdateMusicRequest, 
  IMusicListResponse, 
  IMusicDetailResponse,
  IPaginationParams 
} from '../types';

// 获取音乐列表
export const getMusicList = async (params?: IPaginationParams): Promise<IMusicListResponse> => {
  return request({
    url: '/music',
    method: 'GET',
    params,
  });
};

// 获取音乐详情
export const getMusicDetail = async (id: string): Promise<IMusicDetailResponse> => {
  return request({
    url: `/music/${id}`,
    method: 'GET',
  });
};

// 创建音乐
export const createMusic = async (data: ICreateMusicRequest): Promise<IMusicDetailResponse> => {
  const formData = new FormData();
  
  // 添加基本信息
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.genre) formData.append('genre', data.genre);
  if (data.tags) formData.append('tags', JSON.stringify(data.tags));
  if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
  
  // 添加文件
  if (data.coverImage) formData.append('coverImage', data.coverImage);
  formData.append('audioFile', data.audioFile);
  
  return request({
    url: '/music',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 更新音乐
export const updateMusic = async (id: string, data: IUpdateMusicRequest): Promise<IMusicDetailResponse> => {
  const formData = new FormData();
  
  // 添加可更新的字段
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.genre) formData.append('genre', data.genre);
  if (data.tags) formData.append('tags', JSON.stringify(data.tags));
  if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
  if (data.coverImage) formData.append('coverImage', data.coverImage);
  
  return request({
    url: `/music/${id}`,
    method: 'PUT',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 删除音乐
export const deleteMusic = async (id: string): Promise<IMusicDetailResponse> => {
  return request({
    url: `/music/${id}`,
    method: 'DELETE',
  });
}; 