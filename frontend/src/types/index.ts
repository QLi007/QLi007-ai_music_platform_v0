import { PropsWithChildren } from 'react';

// 组件基础类型
export type BaseProps = PropsWithChildren<{
  className?: string;
}>;

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// 音乐相关类型
export interface Music {
  id: string;
  title: string;
  creator: User;
  ipfsHash: string;
  genre: string;
  duration: number;
  plays: number;
  rewards: number;
  shares: number;
  description: string;
  coverImage: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
} 