import dotenv from 'dotenv';
import { z } from 'zod';

// 加载环境变量
dotenv.config();

// MongoDB URL 验证模式
const MongoDBUrlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'), {
    message: 'Invalid MongoDB URL format',
  });

// 端口验证模式
const PortSchema = z
  .number()
  .int()
  .min(1)
  .max(65535)
  .default(3000);

// JWT 配置验证模式
const JWTSchema = z.object({
  secret: z.string().min(32),
  expiresIn: z.string().regex(/^\d+[hdwmy]$/, {
    message: 'Invalid JWT expiration format. Use format: 1h, 1d, 1w, 1m, 1y',
  }),
});

// CORS 配置验证模式
const CORSSchema = z.object({
  origin: z.array(
    z.string().url({
      message: 'Invalid CORS origin URL',
    })
  ),
  credentials: z.boolean().default(true),
  methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
});

// 主配置验证模式
const ConfigSchema = z.object({
  env: z.enum(['development', 'production', 'test']).default('development'),
  port: PortSchema,
  database: z.object({
    url: MongoDBUrlSchema,
    poolSize: z.number().int().min(1).max(100).default(10),
    retryWrites: z.boolean().default(true),
  }),
  jwt: JWTSchema,
  cors: CORSSchema,
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    file: z.string().optional(),
  }).default({
    level: 'info',
  }),
});

// 配置类型
export type Config = z.infer<typeof ConfigSchema>;

// 配置缓存
let configCache: Config | null = null;

// 创建配置对象
const createConfig = (): Config => {
  if (configCache) {
    return configCache;
  }

  try {
    const config = {
      env: process.env.NODE_ENV as Config['env'],
      port: parseInt(process.env.PORT || '3000', 10),
      database: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/ai-music-platform',
        poolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10', 10),
        retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false',
      },
      jwt: {
        secret: process.env.JWT_SECRET || generateSecureSecret(),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
      cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
        credentials: process.env.CORS_CREDENTIALS !== 'false',
        methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
      },
      logging: {
        level: (process.env.LOG_LEVEL || 'info') as Config['logging']['level'],
        file: process.env.LOG_FILE,
      },
    };

    // 验证配置
    configCache = ConfigSchema.parse(config);
    return configCache;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('配置验证失败:', JSON.stringify(error.errors, null, 2));
      throw new Error('配置验证失败: ' + JSON.stringify(error.errors));
    }
    throw error;
  }
};

// 生成安全的密钥
function generateSecureSecret(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

// 导出配置
export const config = createConfig();

// 打印非敏感配置（用于调试）
export function logConfig(): void {
  const sanitizedConfig = {
    ...config,
    jwt: {
      ...config.jwt,
      secret: '******',
    },
    database: {
      ...config.database,
      url: config.database.url.replace(/\/\/[^@]*@/, '//******:******@'),
    },
  };

  console.log('应用配置:', JSON.stringify(sanitizedConfig, null, 2));
}

// 重置配置缓存（用于测试）
export function resetConfigCache(): void {
  configCache = null;
} 