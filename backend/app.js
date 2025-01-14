const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const net = require('net');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

// 引入模型
require('./models/Music');

const app = express();
let server;

// 安全中间件
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use('/api', limiter);

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// MongoDB 连接配置
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// 健康检查路由
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.status(200).json(healthcheck);
});

// 路由
app.use('/api/auth', authRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.send('AI Music Platform Backend');
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 统一错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err.details || {}
    } : undefined
  };

  res.status(err.status || 500).json(errorResponse);
});

// 优雅退出函数
const gracefulShutdown = async () => {
  console.log('正在关闭服务器...');
  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('HTTP服务器已关闭');
          resolve();
        });
      });
      
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB连接已关闭');
      }
      
      process.exit(0);
    }
  } catch (error) {
    console.error('关闭服务器时出错:', error);
    process.exit(1);
  }
};

// 注册进程事件监听器
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', async (error) => {
  console.error('未捕获的异常:', error);
  await gracefulShutdown();
});
process.on('unhandledRejection', async (error) => {
  console.error('未处理的Promise拒绝:', error);
  await gracefulShutdown();
});

// 启动服务器
const startServer = async () => {
  try {
    // 先连接数据库
    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log('MongoDB 连接成功');

    // 寻找可用端口并启动服务器
    const port = await findAvailablePort(5001);
    server = app.listen(port, () => {
      console.log(`服务器运行在端口 ${port}`);
      console.log(`健康检查: http://localhost:${port}/health`);
      console.log(`API文档: http://localhost:${port}/api-docs`);
    });

    // 设置服务器超时
    server.timeout = 60000; // 60秒
    server.keepAliveTimeout = 30000; // 30秒
  } catch (error) {
    console.error('启动服务器时出错:', error);
    process.exit(1);
  }
};

// 端口查找函数
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve, reject);
      } else {
        reject(err);
      }
    });
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
};

// 启动应用
startServer();
