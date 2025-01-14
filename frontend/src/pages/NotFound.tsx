import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BaseProps } from '../types';

const NotFound = ({ children }: BaseProps) => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate('/home')}>
          返回首页
        </Button>
      }
    />
  );
};

export default NotFound; 