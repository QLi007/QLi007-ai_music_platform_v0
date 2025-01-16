import { useState, useCallback } from 'react';
import { message } from 'antd';
import { 
  IMusic, 
  ICreateMusicRequest, 
  IUpdateMusicRequest,
  IPaginationParams 
} from '../types';
import * as musicService from '../services/music';
import { handleApiError, isApiError } from '../utils/error';

export const useMusic = () => {
  const [loading, setLoading] = useState(false);
  const [music, setMusic] = useState<IMusic | null>(null);
  const [musicList, setMusicList] = useState<IMusic[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 获取音乐列表
  const fetchMusicList = async (params?: IPaginationParams) => {
    setLoading(true);
    try {
      const response = await musicService.getMusicList(params);
      if (response.data) {
        setMusicList(response.data.musics);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.limit);
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取音乐详情
  const fetchMusicDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await musicService.getMusicDetail(id);
      if (response.data) {
        setMusic(response.data.music);
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建音乐
  const createMusic = async (data: ICreateMusicRequest) => {
    setLoading(true);
    try {
      const response = await musicService.createMusic(data);
      if (response.data) {
        message.success('音乐创建成功');
        return response.data.music;
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 更新音乐
  const updateMusic = async (id: string, data: IUpdateMusicRequest) => {
    setLoading(true);
    try {
      const response = await musicService.updateMusic(id, data);
      if (response.data) {
        setMusic(response.data.music);
        message.success('音乐更新成功');
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 删除音乐
  const deleteMusic = async (id: string) => {
    setLoading(true);
    try {
      await musicService.deleteMusic(id);
      message.success('音乐删除成功');
      // 从列表中移除
      setMusicList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    music,
    musicList,
    total,
    currentPage,
    pageSize,
    fetchMusicList,
    fetchMusicDetail,
    createMusic,
    updateMusic,
    deleteMusic,
  };
}; 