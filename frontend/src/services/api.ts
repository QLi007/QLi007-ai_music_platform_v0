import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IBaseResponse, IApiError } from '../types';

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const apiError: IApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || '服务器错误',
      errors: error.response?.data?.errors,
    };
    return Promise.reject(apiError);
  }
);

// 通用请求方法
export const request = async <T = any>(
  config: AxiosRequestConfig
): Promise<T & IBaseResponse> => {
  try {
    const response = await api(config);
    return response;
  } catch (error) {
    throw error;
  }
};

export default api; 