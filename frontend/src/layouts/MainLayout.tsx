import React from 'react'
import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, useNavigate } from 'react-router-dom'

const { Header, Content } = Layout

const MainLayout: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/profile')}>
        <UserOutlined /> 个人资料
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> 退出登录
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center bg-white px-6 shadow">
        <div className="text-xl font-bold">AI音乐平台</div>
        <div>
          <Dropdown overlay={menu} placement="bottomRight">
            <Avatar icon={<UserOutlined />} className="cursor-pointer" />
          </Dropdown>
        </div>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  )
}

export default MainLayout 