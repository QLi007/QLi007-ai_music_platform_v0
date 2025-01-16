import Consul from 'consul';
import 'dotenv/config';

const isDevelopment = process.env.NODE_ENV === 'development';
const isDocker = process.env.DOCKER_ENV === 'true';

// 根据环境配置不同的默认值
const getDefaultConfig = () => {
    if (isDocker) {
        return {
            port: process.env.PORT || 3000,
            mongoUri: 'mongodb://mongodb:27017/ai_music_platform',
            jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
            jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
            ipfsGateway: 'http://ipfs:8080',
            ipfsHost: 'ipfs',
            ipfsPort: '5001',
            env: process.env.NODE_ENV || 'production'
        };
    } else {
        return {
            port: process.env.PORT || 3000,
            mongoUri: 'mongodb://localhost:27017/ai_music_platform',
            jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
            jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
            ipfsGateway: 'http://localhost:8080',
            ipfsHost: 'localhost',
            ipfsPort: '5001',
            env: process.env.NODE_ENV || 'development'
        };
    }
};

const consul = !isDevelopment ? new Consul({
    host: isDocker ? 'consul' : 'localhost',
    port: process.env.CONSUL_PORT || '8500',
    promisify: true,
    timeout: 5000
}) : null;

class Config {
    constructor() {
        // 使用环境特定的默认配置
        this.config = getDefaultConfig();
        this.isLoaded = true;
        this.lastUpdate = Date.now();
        this.updateInterval = 60000; // 1分钟更新间隔
        this.retryDelay = 5000; // 5秒重试延迟
        this.maxRetries = 3; // 最大重试次数
    }

    async load() {
        // 在开发环境下直接使用默认配置
        if (isDevelopment) {
            console.log(`开发环境: 使用${isDocker ? 'Docker' : '本地'}默认配置`);
            return;
        }

        // 如果距离上次更新时间不足1分钟，直接返回
        if (Date.now() - this.lastUpdate < this.updateInterval) {
            return;
        }

        try {
            const configs = await this.loadConfigs();
            if (configs) {
                this.config = { ...this.config, ...configs };
                this.lastUpdate = Date.now();
            }
            this.setupWatcher();
        } catch (error) {
            console.warn('无法从 Consul 加载配置，继续使用默认配置:', error.message);
        }
    }

    async loadConfigs(retryCount = 0) {
        try {
            const [mongodb, jwt, ipfs, app] = await Promise.all([
                this.getConsulValue('ai-music/config/mongodb'),
                this.getConsulValue('ai-music/config/jwt'),
                this.getConsulValue('ai-music/config/ipfs'),
                this.getConsulValue('ai-music/config/app')
            ]);

            if (mongodb && jwt && ipfs && app) {
                return {
                    mongoUri: mongodb.uri,
                    jwtSecret: jwt.secret,
                    jwtExpiresIn: jwt.expiresIn,
                    ipfsGateway: ipfs.gateway,
                    ipfsHost: ipfs.host,
                    ipfsPort: ipfs.port,
                    port: app.port,
                    env: app.environment
                };
            }
            return null;
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.warn(`配置加载失败，${this.retryDelay/1000}秒后重试(${retryCount + 1}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.loadConfigs(retryCount + 1);
            }
            throw error;
        }
    }

    async getConsulValue(key) {
        try {
            const { Value } = await consul.kv.get(key);
            return Value ? JSON.parse(Value) : null;
        } catch (error) {
            console.warn(`无法从 Consul 获取配置 ${key}:`, error.message);
            return null;
        }
    }

    setupWatcher() {
        // 清除之前的监听器
        if (this.watcher) {
            this.watcher.end();
        }

        // 设置新的监听器
        this.watcher = consul.watch({
            method: consul.kv.get,
            options: { 
                key: 'ai-music/config',
                recurse: true,
                wait: '30s' // 长轮询等待时间
            }
        });

        this.watcher.on('change', async () => {
            console.log('检测到配置变更，准备更新...');
            // 使用节流，避免频繁更新
            if (Date.now() - this.lastUpdate >= this.updateInterval) {
                await this.load();
            }
        });

        this.watcher.on('error', (err) => {
            console.warn('配置监听错误:', err.message);
        });
    }

    get(key) {
        return this.config[key];
    }
}

export const config = new Config();
await config.load();
