import { NavigateFunction } from 'react-router-dom';
import { message } from 'antd';
import { IRouteMetadata, IGuardResult } from '../types/route';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

// 认证守卫
export const authGuard = (meta: IRouteMetadata | undefined): IGuardResult => {
  // 如果路由不需要认证，直接允许访问
  if (!meta?.requiresAuth) {
    return { allowed: true };
  }

  // 检查用户是否已认证
  if (!isAuthenticated()) {
    return {
      allowed: false,
      redirectTo: '/login',
      message: '请先登录'
    };
  }

  return { allowed: true };
};

// 角色守卫
export const roleGuard = (meta: IRouteMetadata | undefined): IGuardResult => {
  // 如果没有指定角色要求，直接允许访问
  if (!meta?.roles || meta.roles.length === 0) {
    return { allowed: true };
  }

  // 获取当前用户
  const currentUser = getCurrentUser();
  // 如果没有用户信息，说明未登录
  if (!currentUser) {
    return {
      allowed: false,
      redirectTo: '/login',
      message: '请先登录'
    };
  }

  // 检查用户角色是否满足要求
  if (!meta.roles.includes(currentUser.role)) {
    return {
      allowed: false,
      redirectTo: '/',
      message: '没有访问权限'
    };
  }

  return { allowed: true };
};

// 路由守卫中间件
export const routeGuard = (meta: IRouteMetadata | undefined, navigate: NavigateFunction): boolean => {
  // 先执行认证守卫
  const authResult = authGuard(meta);
  if (!authResult.allowed) {
    message.warning(authResult.message);
    navigate(authResult.redirectTo || '/login', { replace: true });
    return false;
  }

  // 如果认证通过，再执行角色守卫
  const roleResult = roleGuard(meta);
  if (!roleResult.allowed) {
    message.warning(roleResult.message);
    navigate(roleResult.redirectTo || '/', { replace: true });
    return false;
  }

  return true;
}; 