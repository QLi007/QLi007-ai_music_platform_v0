const net = require('net');
const fs = require('fs');
const path = require('path');

const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // 端口被占用，尝试下一个端口
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// 更新环境文件中的端口
const updateEnvPort = (port) => {
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // 更新或添加PORT
  if (envContent.includes('PORT=')) {
    envContent = envContent.replace(/PORT=\d+/, `PORT=${port}`);
  } else {
    envContent += `\nPORT=${port}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`已更新端口为: ${port}`);
};

// 主函数
const main = async () => {
  try {
    const basePort = 5000;
    const port = await findAvailablePort(basePort);
    updateEnvPort(port);
    return port;
  } catch (error) {
    console.error('查找可用端口失败:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
} else {
  module.exports = { findAvailablePort, updateEnvPort };
} 