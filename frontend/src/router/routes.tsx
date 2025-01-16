import React from 'react';
import { RouteObject } from 'react-router-dom';
import { IRouteConfig } from '../types/route';
import { withGuard } from './withGuard';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

const GuardedMainLayout = withGuard(MainLayout, {
  requiresAuth: true,
  title: '主页'
});

const GuardedProfile = withGuard(Profile, {
  requiresAuth: true,
  title: '个人资料'
});

const routes: (RouteObject & { meta?: IRouteConfig['meta'] })[] = [
  {
    path: '/',
    element: <GuardedMainLayout />,
    children: [
      {
        path: 'profile',
        element: <GuardedProfile />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/register',
    element: <Register />,
    meta: {
      requiresAuth: false,
      title: '注册'
    }
  },
  {
    path: '*',
    element: <NotFound />,
    meta: {
      requiresAuth: false,
      title: '404'
    }
  }
];

export default routes; 