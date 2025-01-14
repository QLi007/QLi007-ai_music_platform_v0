import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { BaseProps } from '../types';

const Home = ({ children }: BaseProps) => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">欢迎来到 AI 音乐平台</h1>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card title="创作新音乐" className="h-full">
            <p className="mb-4">使用 AI 技术辅助创作，让音乐创作更简单、更有趣</p>
            <Button type="primary">开始创作</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="我的作品" className="h-full">
            <p className="mb-4">查看和管理您的音乐作品，分享给更多人</p>
            <Button type="primary">查看作品</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="区块链版权" className="h-full">
            <p className="mb-4">使用区块链技术保护您的音乐版权，实现安全交易</p>
            <Button type="primary">管理版权</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home; 