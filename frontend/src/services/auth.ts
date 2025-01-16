import { request } from './api';
import { 
  IAuthResponse, 
  ILoginRequest, 
  IRegisterRequest, 
  IUpdateProfileRequest,
  IUser 
} from '../types';

// 用户注册
export const register = async (data: IRegisterRequest): Promise<IAuthResponse> => {
  return request({
    url: '/auth/register',
    method: 'POST',
    data,
  });
};

// 用户登录
export const login = async (data: ILoginRequest): Promise<IAuthResponse> => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data,
  });
};

// 用户登出
export const logout = async (): Promise<IAuthResponse> => {
  return request({
    url: '/auth/logout',
    method: 'POST',
  });
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<IAuthResponse> => {
  return request({
    url: '/auth/me',
    method: 'GET',
  });
};

// 更新用户资料
export const updateProfile = async (data: IUpdateProfileRequest): Promise<IAuthResponse> => {
  return request({
    url: '/profile/update',
    method: 'PUT',
    data,
  });
};

// 上传头像
export const uploadAvatar = async (file: File): Promise<IAuthResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return request({
    url: '/profile/avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}; 