import { IUser } from '../types/user';

// 获取 token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置 token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 移除 token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// 获取当前用户
export const getCurrentUser = (): IUser | null => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// 设置当前用户
export const setCurrentUser = (user: IUser): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// 移除当前用户
export const removeCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};

// 检查是否已认证
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getCurrentUser();
};

// 清除认证信息
export const clearAuth = (): void => {
  removeToken();
  removeCurrentUser();
}; 