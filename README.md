# AI 音乐平台

一个基于人工智能的音乐创作和版权管理平台。

## 技术栈

### 后端
- Node.js + Express.js
- MongoDB + Mongoose
- JWT 认证
- bcrypt 加密
- Swagger API 文档

### 前端
- React 18 + TypeScript
- Vite
- React Router v6
- Redux Toolkit + RTK Query
- Ant Design v5
- TailwindCSS
- SCSS

### 开发工具
- ESLint + Prettier
- Husky
- Jest + React Testing Library
- Nodemon

## 功能特性

### 已实现功能
1. 用户系统
   - 用户注册
   - 用户登录
   - 信息获取
   - 资料更新
   - 钱包绑定

### 开发中功能
1. 音乐创作
   - AI 辅助创作
   - 作品管理
   - 版权登记
2. 区块链集成
   - 版权保护
   - 交易管理

## 安装说明

1. 克隆项目
```bash
git clone https://github.com/QLi007/QLi007-ai_music_platform_v0.git
cd ai_music_platform_v0
```

2. 安装依赖
```bash
# 安装项目依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. 环境配置
- 后端配置 (backend/.env)
```
MONGODB_URI=你的MongoDB连接地址
JWT_SECRET=你的JWT密钥
```

## 使用说明

1. 启动后端服务
```bash
cd backend
npm run dev
```
服务将自动寻找可用端口启动,默认从 5000 开始

2. 启动前端开发服务器
```bash
cd frontend
npm run dev
```

3. 访问服务
- 前端页面: http://localhost:5173
- API 文档: http://localhost:端口号/api-docs
- 健康检查: http://localhost:端口号/health

## API 文档

详细的 API 文档可以在服务启动后通过访问 `/api-docs` 获取。

主要接口包括：
1. 用户认证
   - POST /api/auth/register - 用户注册
   - POST /api/auth/login - 用户登录
   - GET /api/users/profile - 获取用户信息
   - PUT /api/users/profile - 更新用户信息
   - PUT /api/users/wallet - 绑定钱包地址

## 开发规范

1. Git 提交规范
   - feat: 新功能
   - fix: 修复问题
   - docs: 文档变更
   - style: 代码格式
   - refactor: 代码重构
   - perf: 性能优化
   - test: 测试相关
   - chore: 构建过程或辅助工具的变更

2. 代码规范
   - 使用 ESLint 和 Prettier 进行代码格式化
   - 遵循 TypeScript 类型定义规范
   - 组件和函数使用 JSDoc 注释

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
