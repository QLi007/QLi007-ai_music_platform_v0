// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ARTIST = 'artist',
  ADMIN = 'admin'
}

// 用户接口
export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// 注册请求接口
export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 登录请求接口
export interface ILoginRequest {
  email: string;
  password: string;
}

// 更新个人资料请求接口
export interface IUpdateProfileRequest {
  username?: string;
  bio?: string;
  avatar?: File;
}

// 认证响应接口
export interface IAuthResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    user: IUser;
    token: string;
  };
} 