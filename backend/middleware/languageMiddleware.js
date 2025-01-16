import i18next from '../config/i18n.js';

export const languageMiddleware = async (req, res, next) => {
  try {
    // 从用户偏好设置中获取语言
    if (req.user?.preferences?.language) {
      req.language = req.user.preferences.language;
    }
    
    // 从请求头中获取语言
    const acceptLanguage = req.headers['accept-language'];
    if (!req.language && acceptLanguage) {
      const lang = acceptLanguage.split(',')[0].split('-')[0];
      if (['en', 'zh'].includes(lang)) {
        req.language = lang;
      }
    }
    
    // 设置默认语言
    if (!req.language) {
      req.language = 'zh';
    }
    
    // 更改 i18next 实例的语言
    await i18next.changeLanguage(req.language);
    
    // 将翻译函数添加到请求对象
    req.t = i18next.t.bind(i18next);
    
    next();
  } catch (error) {
    console.error('Language middleware error:', error);
    next(error);
  }
}; 