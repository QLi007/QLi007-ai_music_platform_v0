const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 从请求头或cookie中获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '请先登录以访问此资源'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '此token所属用户不存在'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '未授权，请重新登录'
    });
  }
};

// 角色权限中间件
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }
    next();
  };
}; 