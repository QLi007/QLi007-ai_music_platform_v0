import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { 
  IUser, 
  ILoginRequest, 
  IRegisterRequest, 
  IUpdateProfileRequest 
} from '../types';
import * as authService from '../services/auth';
import * as authUtils from '../utils/auth';
import { handleApiError, isApiError } from '../utils/error';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(authUtils.getCurrentUser());
  const [loading, setLoading] = useState(false);

  // 注册
  const register = async (data: IRegisterRequest) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      if (response.data) {
        const { token, user } = response.data;
        authUtils.setToken(token);
        authUtils.setCurrentUser(user);
        setUser(user);
        message.success('注册成功');
        navigate('/');
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (data: ILoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      if (response.data) {
        const { token, user } = response.data;
        authUtils.setToken(token);
        authUtils.setCurrentUser(user);
        setUser(user);
        message.success('登录成功');
        navigate('/');
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      authUtils.clearAuth();
      setUser(null);
      message.success('已退出登录');
      navigate('/login');
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 更新用户资料
  const updateProfile = async (data: IUpdateProfileRequest) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(data);
      if (response.data?.user) {
        authUtils.setCurrentUser(response.data.user);
        setUser(response.data.user);
        message.success('资料更新成功');
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 上传头像
  const uploadAvatar = async (file: File) => {
    setLoading(true);
    try {
      const response = await authService.uploadAvatar(file);
      if (response.data?.user) {
        authUtils.setCurrentUser(response.data.user);
        setUser(response.data.user);
        message.success('头像上传成功');
      }
    } catch (error) {
      if (isApiError(error)) {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    uploadAvatar,
  };
}; 