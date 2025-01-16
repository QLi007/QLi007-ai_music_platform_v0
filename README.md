# AI Music Platform

基于 AI 技术的音乐创作和分享平台

## 项目简介

AI Music Platform 是一个创新的音乐平台，结合了人工智能技术与音乐创作。用户可以使用 AI 辅助创作音乐，并与其他创作者分享作品。

### 主要功能

- 🎵 AI 辅助音乐创作
- 🎼 音乐作品管理
- 👥 用户社区互动
- 🌐 作品分享与发现
- 🔒 安全的用户认证
- 🌍 多语言支持

## 快速开始

### 前置条件

- Node.js >= 16
- MongoDB >= 4.4
- IPFS 节点
- Consul

### 安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/ai-music-platform.git
cd ai-music-platform
```

2. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

3. 配置环境变量
```bash
# 在 backend 目录创建 .env 文件
cp .env.example .env
```

4. 启动服务
```bash
# 启动后端服务
cd backend
npm run dev

# 启动前端服务
cd frontend
npm run dev
```

## 项目文档

- [API 文档](backend/API.md)
- [开发文档](backend/DEVELOPMENT.md)
- [部署指南](backend/DEPLOYMENT.md)

## 技术栈

### 后端
- Node.js + Express.js
- MongoDB + Mongoose
- JWT 认证
- IPFS 存储
- i18next 国际化

### 前端
- React.js
- TailwindCSS
- Redux Toolkit
- React Router
- Axios

## 测试

```bash
# 运行后端测试
cd backend
npm test

# 运行前端测试
cd frontend
npm test
```

## 部署

使用 Docker Compose 快速部署：

```bash
docker-compose up -d
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者: Your Name
- Email: your.email@example.com
- 项目链接: [https://github.com/yourusername/ai-music-platform](https://github.com/yourusername/ai-music-platform)

## 致谢

感谢所有为这个项目做出贡献的开发者！
