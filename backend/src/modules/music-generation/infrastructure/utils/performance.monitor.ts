import { Logger } from './logger';

export interface PerformanceMetrics {
  operationName: string;
  duration: number;
  success: boolean;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  context?: Record<string, any>;
}

export interface OperationTimer {
  end(success?: boolean): void;
}

/**
 * 性能监控管理器
 */
export class PerformanceMonitor {
  private static readonly SLOW_THRESHOLD = 1000; // 1秒
  private static readonly MEMORY_WARNING_THRESHOLD = 0.8; // 80%内存使用率警告
  private static readonly logger = Logger.forContext('PerformanceMonitor');
  private static instance: PerformanceMonitor;

  private constructor() {
    // 定期监控内存使用情况
    setInterval(() => this.checkMemoryUsage(), 60000); // 每分钟检查一次
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始监控操作
   * @param operationName 操作名称
   * @param context 上下文信息
   */
  public startOperation(operationName: string, context?: Record<string, any>): OperationTimer {
    const startTime = process.hrtime();
    const startMemory = process.memoryUsage();

    return {
      end: (success = true) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000; // 转换为毫秒
        const endMemory = process.memoryUsage();

        const metrics: PerformanceMetrics = {
          operationName,
          duration,
          success,
          memoryUsage: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal,
            external: endMemory.external,
            rss: endMemory.rss,
          },
          context,
        };

        this.recordMetrics(metrics);
      },
    };
  }

  /**
   * 记录性能指标
   * @param metrics 性能指标
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    const { operationName, duration, success, memoryUsage, context } = metrics;

    // 记录基本性能日志
    const logContext = {
      operation: operationName,
      duration: `${duration.toFixed(2)}ms`,
      success,
      memoryUsage: memoryUsage ? {
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
      } : undefined,
      ...context,
    };

    if (duration > PerformanceMonitor.SLOW_THRESHOLD) {
      PerformanceMonitor.logger.warn('检测到慢操作', logContext);
    }

    if (memoryUsage && this.isHighMemoryUsage(memoryUsage)) {
      PerformanceMonitor.logger.warn('检测到高内存使用', logContext);
    }

    PerformanceMonitor.logger.debug('操作性能指标', logContext);
  }

  /**
   * 检查是否是高内存使用
   * @param memoryUsage 内存使用情况
   */
  private isHighMemoryUsage(memoryUsage: PerformanceMetrics['memoryUsage']): boolean {
    if (!memoryUsage) return false;
    return memoryUsage.heapUsed / memoryUsage.heapTotal > PerformanceMonitor.MEMORY_WARNING_THRESHOLD;
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): void {
    const memory = process.memoryUsage();
    const heapUsedPercentage = memory.heapUsed / memory.heapTotal;

    const logContext = {
      heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memory.external / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memory.rss / 1024 / 1024).toFixed(2)}MB`,
      heapUsedPercentage: `${(heapUsedPercentage * 100).toFixed(2)}%`,
    };

    if (heapUsedPercentage > PerformanceMonitor.MEMORY_WARNING_THRESHOLD) {
      PerformanceMonitor.logger.warn('系统内存使用率过高', logContext);
    } else {
      PerformanceMonitor.logger.debug('系统内存使用情况', logContext);
    }
  }

  /**
   * 包装异步函数以进行性能监控
   * @param operationName 操作名称
   * @param fn 要监控的函数
   * @param context 上下文信息
   */
  public static async monitor<T>(
    operationName: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const monitor = PerformanceMonitor.getInstance();
    const timer = monitor.startOperation(operationName, context);

    try {
      const result = await fn();
      timer.end(true);
      return result;
    } catch (error) {
      timer.end(false);
      throw error;
    }
  }

  /**
   * 包装同步函数以进行性能监控
   * @param operationName 操作名称
   * @param fn 要监控的函数
   * @param context 上下文信息
   */
  public static monitorSync<T>(
    operationName: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    const monitor = PerformanceMonitor.getInstance();
    const timer = monitor.startOperation(operationName, context);

    try {
      const result = fn();
      timer.end(true);
      return result;
    } catch (error) {
      timer.end(false);
      throw error;
    }
  }
} 