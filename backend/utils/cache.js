import NodeCache from 'node-cache';

// 创建缓存实例，默认过期时间10分钟
const cache = new NodeCache({ stdTTL: 600 });

// 缓存中间件
export const cacheMiddleware = async (req, res, next) => {
  // 只缓存GET请求
  if (req.method !== 'GET') {
    return next();
  }

  // 只缓存已认证的请求
  if (!req.user) {
    return next();
  }

  const key = `${req.user.id}:${req.originalUrl}`;
  const cachedData = cache.get(key);

  if (cachedData) {
    return res.json(cachedData);
  }

  // 保存原始的json方法
  const originalJson = res.json;

  // 重写json方法以缓存响应
  res.json = function(data) {
    cache.set(key, data);
    return originalJson.call(this, data);
  };

  next();
};

// 清除用户相关的缓存
export const clearUserCache = (userId) => {
  const keys = cache.keys();
  const userKeys = keys.filter(key => key.startsWith(`${userId}:`));
  userKeys.forEach(key => {
    cache.del(key);
  });
  // 强制清理所有已删除的键
  cache.flushAll();
};

// 获取缓存数据
export const get = (key) => {
  return cache.get(key);
};

// 设置缓存数据
export const set = (key, value) => {
  return cache.set(key, value);
}; 