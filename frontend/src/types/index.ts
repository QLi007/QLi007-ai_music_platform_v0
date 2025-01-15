import { ReactNode } from 'react';

// 基础 Props 类型
export interface BaseProps {
  children?: ReactNode;
  className?: string;
}

// 用户相关类型
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  tokenBalance: number;
  walletAddress?: string;
  createdMusic: Music[];
  favoriteMusic: Music[];
  createdAt: string;
  updatedAt: string;
}

// 音乐相关类型
export interface Music {
  _id: string;
  title: string;
  creator: User | string;
  ipfsHash: string;
  genre: string;
  duration: number;
  plays: number;
  rewards: number;
  shares: number;
  description?: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 路由配置类型
export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
  requireAuth?: boolean;
  roles?: ('user' | 'admin')[];
}

// 主题配置类型
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
} 