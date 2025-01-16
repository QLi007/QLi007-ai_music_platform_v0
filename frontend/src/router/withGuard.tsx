import React, { useEffect, ComponentType } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IRouteMetadata } from '../types/route';
import { routeGuard } from './guards';

// 路由守卫高阶组件
export const withGuard = (
  WrappedComponent: ComponentType<any>,
  meta?: IRouteMetadata
): React.FC => {
  const GuardedComponent: React.FC = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      // 执行路由守卫
      routeGuard(meta, navigate);
    }, [meta, navigate]); // 只在meta或navigate变化时执行

    return <WrappedComponent {...props} />;
  };

  return GuardedComponent;
}; 