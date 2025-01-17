import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface ServerConfig {
  port: number;
  nodeEnv: string;
  baseUrl: string;
}

interface MongoDBConfig {
  uri: string;
  testUri: string;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface CacheConfig {
  ttl: number;
  checkPeriod: number;
}

interface LogConfig {
  level: string;
  filePath: string;
}

interface PerformanceConfig {
  checkInterval: number;
  memoryWarningThreshold: number;
}

export interface Config {
  server: ServerConfig;
  mongodb: MongoDBConfig;
  jwt: JWTConfig;
  email: EmailConfig;
  cache: CacheConfig;
  log: LogConfig;
  performance: PerformanceConfig;
}

// 配置验证函数
function validateConfig(config: Config): void {
  const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'MONGODB_TEST_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'CACHE_TTL',
    'CACHE_CHECK_PERIOD',
    'LOG_LEVEL',
    'LOG_FILE_PATH',
    'PERFORMANCE_CHECK_INTERVAL',
    'MEMORY_WARNING_THRESHOLD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// 创建配置对象
export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_music',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ai_music_test'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10)
  },
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log'
  },
  performance: {
    checkInterval: parseInt(process.env.PERFORMANCE_CHECK_INTERVAL || '60000', 10),
    memoryWarningThreshold: parseInt(process.env.MEMORY_WARNING_THRESHOLD || '80', 10)
  }
};

// 验证配置
validateConfig(config);

export default config; 