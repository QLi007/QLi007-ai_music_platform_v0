import { Logger } from './logger';

interface PerformanceMetrics {
  operationName: string;
  startTime: [number, number];
  endTime: [number, number];
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  context?: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private readonly logger: Logger;
  private readonly metrics: Map<string, PerformanceMetrics[]>;
  private readonly MEMORY_WARNING_THRESHOLD = 0.8; // 80% 内存使用警告

  private constructor() {
    this.logger = Logger.forContext('PerformanceMonitor');
    this.metrics = new Map();
    this.startMemoryCheck();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public static async monitor<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const monitor = PerformanceMonitor.getInstance();
    const startTime = process.hrtime();
    const startMemory = process.memoryUsage();

    try {
      const result = await operation();
      monitor.recordMetrics({
        operationName,
        startTime,
        endTime: process.hrtime(),
        duration: 0,
        memoryUsage: {
          heapUsed: process.memoryUsage().heapUsed - startMemory.heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          arrayBuffers: process.memoryUsage().arrayBuffers,
        },
        context,
      });
      return result;
    } catch (error) {
      monitor.recordMetrics({
        operationName,
        startTime,
        endTime: process.hrtime(),
        duration: 0,
        memoryUsage: {
          heapUsed: process.memoryUsage().heapUsed - startMemory.heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          arrayBuffers: process.memoryUsage().arrayBuffers,
        },
        context: { ...context, error },
      });
      throw error;
    }
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    const duration = this.calculateDuration(metrics.startTime, metrics.endTime);
    metrics.duration = duration;

    if (!this.metrics.has(metrics.operationName)) {
      this.metrics.set(metrics.operationName, []);
    }

    this.metrics.get(metrics.operationName)?.push(metrics);

    // 记录性能指标
    this.logger.debug('性能指标', {
      operationName: metrics.operationName,
      duration: `${duration}ms`,
      memoryUsage: this.formatMemoryUsage(metrics.memoryUsage),
      context: metrics.context,
    });

    // 检查内存使用情况
    this.checkMemoryUsage(metrics.memoryUsage);
  }

  private calculateDuration(startTime: [number, number], endTime: [number, number]): number {
    const [seconds, nanoseconds] = [
      endTime[0] - startTime[0],
      endTime[1] - startTime[1],
    ];
    return seconds * 1000 + nanoseconds / 1_000_000;
  }

  private formatMemoryUsage(memory: PerformanceMetrics['memoryUsage']): Record<string, string> {
    return {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memory.external / 1024 / 1024)} MB`,
      arrayBuffers: `${Math.round(memory.arrayBuffers / 1024 / 1024)} MB`,
    };
  }

  private checkMemoryUsage(memory: PerformanceMetrics['memoryUsage']): void {
    const heapUsedPercentage = memory.heapUsed / memory.heapTotal;
    if (heapUsedPercentage > this.MEMORY_WARNING_THRESHOLD) {
      this.logger.warn('内存使用过高', {
        heapUsedPercentage: `${Math.round(heapUsedPercentage * 100)}%`,
        ...this.formatMemoryUsage(memory),
      });
    }
  }

  private startMemoryCheck(): void {
    setInterval(() => {
      const memory = process.memoryUsage();
      this.checkMemoryUsage({
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
        arrayBuffers: memory.arrayBuffers,
      });
    }, 60000); // 每分钟检查一次
  }

  public getMetrics(operationName: string): PerformanceMetrics[] {
    return this.metrics.get(operationName) || [];
  }

  public clearMetrics(operationName?: string): void {
    if (operationName) {
      this.metrics.delete(operationName);
    } else {
      this.metrics.clear();
    }
  }
} 