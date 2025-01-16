import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { config } from './config.js';
import i18next from './config/i18n.js';
import i18nextMiddleware from 'i18next-http-middleware';
import { languageMiddleware } from './middleware/languageMiddleware.js';

import { authRouter } from './routes/authRoutes.js';
import { profileRouter } from './routes/profileRoutes.js';

// 引入模型
import './models/Music.js';

const app = express();
let server;
let isShuttingDown = false;

// 安全中间件
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// 使用 i18next 中间件
app.use(i18nextMiddleware.handle(i18next));
app.use(languageMiddleware);

// MongoDB 连接配置
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10
};

// 健康检查路由
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    configStatus: config.isLoaded ? 'loaded' : 'not_loaded'
  };
  res.status(200).json(healthcheck);
});

// 路由
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

// 基础路由
app.get('/', (req, res) => {
  res.send('AI Music Platform Backend');
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: req.t('errors.not_found')
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
    status: 'error',
    message: config.get('env') === 'development' 
      ? err.message 
      : req.t('errors.server_error'),
    error: config.get('env') === 'development' ? {
      stack: err.stack,
      details: err.details || {}
    } : undefined
  };

  res.status(err.statusCode || 500).json(errorResponse);
});

// 启动服务器
async function startServer() {
  try {
    // 等待配置加载完成
    if (!config.isLoaded) {
      console.log('等待配置加载...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 连接数据库
    await mongoose.connect(config.get('mongoUri'), mongooseOptions);
    console.log('MongoDB 连接成功');

    // 启动服务器
    const port = config.get('port');
    server = app.listen(port, () => {
      console.log(`服务器运行在端口 ${port}`);
    });

    // 错误处理
    server.on('error', (error) => {
      console.error('服务器错误:', error);
      if (error.code === 'EADDRINUSE') {
        console.log(`端口 ${port} 已被占用，尝试使用其他端口...`);
        setTimeout(() => {
          server.close();
          server.listen(0); // 让系统分配可用端口
        }, 1000);
      }
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅退出函数
async function gracefulShutdown() {
  if (isShuttingDown) {
    console.log('已经在关闭过程中...');
    return;
  }
  
  isShuttingDown = true;
  console.log('正在准备关闭服务器...');
  
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            console.error('关闭 HTTP 服务器时出错:', err);
            reject(err);
          } else {
            console.log('HTTP服务器已关闭');
            resolve();
          }
        });
      });
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close(false);
      console.log('MongoDB连接已关闭');
    }
    
    console.log('服务器已完全关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭过程中出错:', error);
    process.exit(1);
  }
}

// 监听进程信号
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  gracefulShutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  gracefulShutdown();
});

// 启动服务器
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// 导出 app 实例用于测试
export default app;
