const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const config = require('./config');
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

// 连接MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
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

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 优雅退出函数
const gracefulShutdown = () => {
  console.log('正在关闭服务器...');
  if (server) {
    server.close(() => {
      console.log('HTTP服务器已关闭');
      mongoose.connection.close(false, () => {
        console.log('MongoDB连接已关闭');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

// 监听退出信号
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  gracefulShutdown();
});

// 启动服务器
const startServer = async () => {
  try {
    server = app.listen(config.port, () => {
      console.log(`服务器运行在端口 ${config.port}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();
