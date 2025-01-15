import React, { Suspense } from 'react';
import { Layout, Menu, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../types';

const { Header, Content } = Layout;

const MainLayout = ({ children }: BaseProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = false; // TODO: 从 Redux 获取登录状态

  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      disabled: !isLoggedIn,
    },
    {
      key: isLoggedIn ? 'logout' : '/login',
      icon: isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />,
      label: isLoggedIn ? '退出' : '登录',
    },
  ];

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      // TODO: 处理登出逻辑
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout>
      <Header className="flex items-center justify-between bg-white shadow-md">
        <div className="text-xl font-bold text-primary">AI Music Platform</div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          className="flex-1 justify-end border-0"
        />
      </Header>
      <Content className="p-6">
        <Suspense fallback={<div className="flex justify-center p-8"><Spin size="large" /></div>}>
          <Outlet />
        </Suspense>
      </Content>
    </Layout>
  );
};

export default MainLayout; 