import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { BaseProps } from '../types';

interface LoginForm {
  username: string;
  password: string;
}

const Login = ({ children }: BaseProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: LoginForm) => {
    try {
      // TODO: 实现登录逻辑
      message.success('登录成功');
      navigate('/home');
    } catch (error) {
      message.error('登录失败，请重试');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">登录</h1>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              登录
            </Button>
          </Form.Item>

          <div className="text-center">
            还没有账号？
            <Link to="/register" className="text-primary hover:text-primary-dark">
              立即注册
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 