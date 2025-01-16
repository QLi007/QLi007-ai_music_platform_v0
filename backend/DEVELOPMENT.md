# AI Music Platform 开发文档

## 项目架构

### 技术栈
- Node.js + Express.js
- MongoDB + Mongoose
- JWT 认证
- IPFS 存储
- i18next 国际化
- Jest 测试框架

### 目录结构
```
backend/
├── __tests__/           # 测试文件
├── config/             # 配置文件
├── controllers/        # 控制器
├── models/            # 数据模型
├── routes/            # 路由
├── utils/             # 工具函数
├── locales/           # 语言文件
├── scripts/           # 脚本文件
├── app.js            # 应用入口
└── package.json      # 项目配置
```

## 开发环境设置

### 前置要求
- Node.js >= 16
- MongoDB >= 4.4
- IPFS 节点
- Consul (配置管理)

### 安装依赖
```bash
npm install
```

### 环境变量
创建 `.env` 文件：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai_music
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
IPFS_HOST=localhost
IPFS_PORT=5001
```

### 启动开发服务器
```bash
npm run dev
```

### 运行测试
```bash
npm test                 # 运行所有测试
npm run test:watch      # 监视模式
npm run test:coverage   # 生成覆盖率报告
```

## 核心功能实现

### 用户认证
- JWT based 认证系统
- 密码加密使用 bcrypt
- Token 有效期 7 天
- 支持登录、注册、登出

### 文件处理
- 使用 multer 处理文件上传
- sharp 处理图片优化
- IPFS 存储媒体文件

### 缓存系统
- node-cache 实现内存缓存
- 缓存用户资料和常用数据
- 自动清理过期缓存

### 国际化
- i18next 支持多语言
- 支持中英文切换
- 动态加载语言包

## 测试策略

### 单元测试
- 使用 Jest 测试框架
- 测试覆盖率要求 > 80%
- 模拟外部依赖

### 集成测试
- 使用 supertest 测试 API
- MongoDB Memory Server
- 端到端 API 测试

## 部署

### Docker 部署
```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - consul
  
  mongodb:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  consul:
    image: hashicorp/consul
    ports:
      - "8500:8500"
    command: agent -dev -client=0.0.0.0

volumes:
  mongodb_data:
```

## API 文档
详见 [API.md](./API.md)

## 开发规范

### 代码风格
- 使用 ES Modules
- 异步使用 async/await
- 使用 TypeScript 类型注释

### 错误处理
- 统一使用 AppError 类
- 错误消息国际化
- 开发环境显示详细错误

### Git 工作流
- feature 分支开发
- PR 提交前运行测试
- 语义化版本号

## 性能优化

### 缓存策略
- 合理使用内存缓存
- 缓存用户会话信息
- 定期清理过期缓存

### 数据库优化
- 索引优化
- 查询优化
- 连接池管理

### 安全措施
- helmet 安全头
- rate limiting
- XSS 防护
- MongoDB 注入防护 