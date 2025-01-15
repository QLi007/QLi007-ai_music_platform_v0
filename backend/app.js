const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const config = require('./config');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

// 引入模型
require('./models/Music');

const app = express();
let server;
let isShuttingDown = false;
let retryCount = 0;
const MAX_RETRIES = 5;  // 最大重试次数

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

// MongoDB 连接监听
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err);
  if (!isShuttingDown && retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`MongoDB 连接重试 (${retryCount}/${MAX_RETRIES})...`);
    setTimeout(() => {
      if (!isShuttingDown) {
        mongoose.connect(process.env.MONGO_URI, mongooseOptions)
          .catch(err => console.error('重连失败:', err));
      }
    }, 3000);
  } else if (retryCount >= MAX_RETRIES) {
    console.error('达到最大重试次数，停止重连');
    process.exit(1);
  }
});

mongoose.connection.on('disconnected', () => {
  if (!isShuttingDown && retryCount < MAX_RETRIES) {
    console.log('MongoDB 连接断开');
    retryCount++;
    console.log(`尝试重新连接 (${retryCount}/${MAX_RETRIES})...`);
    mongoose.connect(process.env.MONGO_URI, mongooseOptions);
  }
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB 连接成功');
  retryCount = 0;  // 重置重试计数
});

// 检查端口是否被占用
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const testServer = require('net').createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          console.log(`端口 ${port} 被占用，尝试下一个端口`);
          resolve(false);
        } else {
          reject(err);
        }
      })
      .once('listening', () => {
        testServer.close();
        resolve(true);
      })
      .listen(port);
  });
};

// 启动服务器
const startServer = async () => {
  if (isShuttingDown) {
    console.log('服务器正在关闭，取消启动');
    return;
  }

  try {
    // 先连接数据库
    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log('MongoDB 连接成功');

    let currentPort = config.port;
    let portAvailable = false;
    const MAX_PORT = currentPort + 10; // 最多尝试10个端口

    while (!portAvailable && currentPort < MAX_PORT) {
      console.log(`正在检查端口 ${currentPort}`);
      portAvailable = await checkPort(currentPort);
      
      if (!portAvailable) {
        currentPort++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒再尝试下一个端口
      }
    }

    if (!portAvailable) {
      throw new Error(`无法找到可用端口，已尝试端口范围: ${config.port} - ${MAX_PORT-1}`);
    }

    server = app.listen(currentPort, () => {
      console.log(`服务器运行在端口 ${currentPort}`);
      console.log(`健康检查: http://localhost:${currentPort}/health`);
      console.log(`API文档: http://localhost:${currentPort}/api-docs`);
    });

    // 设置服务器超时
    server.timeout = 60000;
    server.keepAliveTimeout = 30000;

    // 添加服务器错误处理
    server.on('error', (error) => {
      console.error('服务器错误:', error);
      if (!isShuttingDown) {
        gracefulShutdown();
      }
    });

  } catch (error) {
    console.error('启动服务器时出错:', error);
    if (!isShuttingDown) {
      console.log('服务器启动失败，请检查配置并重试');
      process.exit(1);
    }
  }
};

// 优雅退出函数
const gracefulShutdown = async () => {
  if (isShuttingDown) {
    console.log('已经在关闭过程中...');
    return;
  }
  
  isShuttingDown = true;
  console.log('正在准备关闭服务器...');
  console.log('等待所有请求完成...');
  
  // 设置一个超时时间，防止无限等待
  const shutdownTimeout = setTimeout(() => {
    console.log('关闭超时，强制退出');
    process.exit(1);
  }, 30000); // 30秒超时
  
  try {
    // 先关闭 HTTP 服务器
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
    
    // 再关闭 MongoDB 连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close(false);
      console.log('MongoDB连接已关闭');
    }
    
    // 清除超时定时器
    clearTimeout(shutdownTimeout);
    
    // 等待一段时间确保端口释放
    console.log('等待端口释放...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('服务器已完全关闭');
    process.exit(0);
  } catch (error) {
    console.error('服务器关闭过程中出错:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// 处理进程终止信号
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 处理未捕获的异常和拒绝的 Promise
process.on('uncaughtException', async (error) => {
  console.error('未捕获的异常:', error);
  await gracefulShutdown();
});

process.on('unhandledRejection', async (error) => {
  console.error('未处理的 Promise 拒绝:', error);
  await gracefulShutdown();
});

// 启动应用
startServer();
