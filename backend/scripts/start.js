const PortManager = require('./portManager');
const { spawn } = require('child_process');
const path = require('path');

async function startServer() {
  try {
    // 初始化端口管理器
    const portManager = new PortManager();
    const port = await portManager.initialize();
    
    console.log(`正在启动服务器，端口: ${port}`);

    // 使用 nodemon 启动服务器
    const serverProcess = spawn('nodemon', ['app.js'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: port.toString() }
    });

    // 处理服务器进程事件
    serverProcess.on('error', (error) => {
      console.error('服务器启动失败:', error);
      process.exit(1);
    });

    // 处理进程终止信号
    const handleShutdown = async () => {
      console.log('\n正在关闭服务器...');
      
      // 清理端口
      await portManager.cleanPort(port);
      
      // 结束进程
      process.exit(0);
    };

    // 注册信号处理程序
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    
  } catch (error) {
    console.error('启动脚本执行失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer(); 