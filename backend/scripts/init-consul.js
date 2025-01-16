import Consul from 'consul';

const consul = new Consul({
  host: 'localhost',
  port: '8500',
  promisify: true,
  timeout: 5000,
});

const initialConfig = {
  'ai-music/config/mongodb': {
    uri: 'mongodb://localhost:27017/ai_music_platform',
  },
  'ai-music/config/jwt': {
    secret: 'dev_jwt_secret_key',
    expiresIn: '7d',
  },
  'ai-music/config/ipfs': {
    gateway: 'https://ipfs.io/ipfs',
    host: 'localhost',
    port: 5001,
  },
  'ai-music/config/app': {
    port: 3000,
    environment: 'development',
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function setConfigWithRetry(key, value, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await consul.kv.set(key, JSON.stringify(value));
      console.log(`配置已设置: ${key}`);
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`设置配置 ${key} 失败，尝试重试 (${attempt}/${retries})...`);
      await delay(1000 * attempt); // 递增延迟
    }
  }
}

async function initializeConfig() {
  try {
    console.log('开始初始化 Consul 配置...');
    
    for (const [key, value] of Object.entries(initialConfig)) {
      await setConfigWithRetry(key, value);
      await delay(500); // 在每个请求之间添加延迟
    }
    
    console.log('Consul 配置初始化完成');
  } catch (error) {
    console.error('Consul 配置初始化失败:', error);
    process.exit(1);
  }
}

initializeConfig(); 