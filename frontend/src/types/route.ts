import { ReactNode } from 'react';

// 路由元数据接口
export interface IRouteMetadata {
  requiresAuth?: boolean;      // 是否需要认证
  roles?: string[];           // 允许访问的角色
  title?: string;            // 路由标题
  icon?: ReactNode;          // 路由图标
}

// 路由配置接口
export interface IRouteConfig {
  path: string;              // 路由路径
  element: ReactNode;        // 路由组件
  children?: IRouteConfig[]; // 子路由
  meta?: IRouteMetadata;    // 路由元数据
}

// 路由守卫结果接口
export interface IGuardResult {
  allowed: boolean;          // 是否允许访问
  redirectTo?: string;       // 重定向路径
  message?: string;         // 提示信息
} 