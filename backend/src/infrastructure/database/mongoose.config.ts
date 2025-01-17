import mongoose from 'mongoose';
import { config } from '../config';

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected = false;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly retryInterval = 5000; // 5秒

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('已经连接到数据库');
      return;
    }

    try {
      const { connection } = await mongoose.connect(config.database.url, {
        autoCreate: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
      });

      this.isConnected = connection.readyState === 1;
      this.retryCount = 0;
      console.log('成功连接到数据库');

      connection.on('error', (error) => {
        console.error('数据库连接错误:', error);
        this.isConnected = false;
        this.retryConnection();
      });

      connection.on('disconnected', () => {
        console.log('数据库连接断开');
        this.isConnected = false;
        this.retryConnection();
      });

      // 优雅关闭
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('连接数据库失败:', error);
      await this.retryConnection();
    }
  }

  private async retryConnection(): Promise<void> {
    if (this.retryCount >= this.maxRetries) {
      console.error(`数据库重连失败，已达到最大重试次数 ${this.maxRetries}`);
      throw new Error('数据库连接失败');
    }

    this.retryCount++;
    console.log(`尝试重新连接数据库，第 ${this.retryCount} 次重试...`);
    
    await new Promise(resolve => setTimeout(resolve, this.retryInterval));
    await this.connect();
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('数据库连接已关闭');
    } catch (error) {
      console.error('关闭数据库连接失败:', error);
      throw error;
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
} 