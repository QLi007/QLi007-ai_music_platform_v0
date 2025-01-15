const { exec } = require('child_process');
const net = require('net');
const fs = require('fs').promises;
const path = require('path');

// 工具函数：添加超时
const withTimeout = (promise, ms = 5000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`操作超时 (${ms}ms)`));
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutId));
};

class PortManager {
  constructor(startPort = 5000, endPort = 5010) {
    this.startPort = startPort;
    this.endPort = endPort;
    this.configFiles = [
      {
        path: path.join(__dirname, '../.env'),
        pattern: /^PORT=\d+$/m,
        template: 'PORT='
      },
      {
        path: path.join(__dirname, '../config.js'),
        pattern: /port:\s*process\.env\.PORT\s*\|\|\s*\d+/,
        template: 'port: process.env.PORT || '
      }
    ];
    this.backupDir = path.join(__dirname, '../backups');
  }

  // 创建配置文件备份
  async backupConfig(filePath) {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      const fileName = path.basename(filePath);
      const backupPath = path.join(this.backupDir, `${fileName}.${Date.now()}.bak`);
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(`创建配置文件备份失败: ${error.message}`);
      return null;
    }
  }

  // 检查系统依赖
  async checkDependencies() {
    if (process.platform !== 'win32') {
      return withTimeout(new Promise((resolve) => {
        exec('which lsof', (error) => {
          if (error) {
            console.error('错误: 系统中未安装 lsof。请使用以下命令安装：');
            console.error('macOS: brew install lsof');
            console.error('Linux: sudo apt-get install lsof');
            process.exit(1);
          }
          resolve();
        });
      }), 3000);
    }
  }

  // 检查端口是否可用
  async checkPort(port) {
    return withTimeout(new Promise((resolve) => {
      const server = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          server.close();
          resolve(true);
        })
        .listen(port);
    }), 3000);
  }

  // 查找下一个可用端口
  async findAvailablePort() {
    for (let port = this.startPort; port <= this.endPort; port++) {
      if (await this.checkPort(port)) {
        return port;
      }
    }
    throw new Error(`在端口范围 ${this.startPort}-${this.endPort} 内没有可用端口`);
  }

  // 获取指定端口的进程 ID
  async getProcessOnPort(port) {
    return withTimeout(new Promise((resolve) => {
      const cmd = process.platform === 'win32' 
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port} -t`;

      exec(cmd, (error, stdout) => {
        if (error || !stdout) {
          resolve(null);
          return;
        }

        try {
          if (process.platform === 'win32') {
            const lines = stdout.split('\n').filter(line => line.includes(`:${port}`));
            if (lines.length === 0) return resolve(null);
            const pid = lines[0].split(/\s+/)[5];
            if (!pid || isNaN(parseInt(pid))) return resolve(null);
            resolve(pid);
          } else {
            const pid = stdout.trim();
            if (!pid || isNaN(parseInt(pid))) return resolve(null);
            resolve(pid);
          }
        } catch (error) {
          console.error(`解析进程ID时出错: ${error.message}`);
          resolve(null);
        }
      });
    }), 5000);
  }

  // 终止进程
  async killProcess(pid) {
    return withTimeout(new Promise((resolve, reject) => {
      const cmd = process.platform === 'win32'
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;

      exec(cmd, (error) => {
        if (error) {
          reject(new Error(`终止进程失败: ${error.message}`));
          return;
        }
        resolve();
      });
    }), 5000);
  }

  // 清理指定端口
  async cleanPort(port) {
    try {
      const pid = await this.getProcessOnPort(port);
      if (pid) {
        await this.killProcess(pid);
        console.log(`成功终止端口 ${port} 上的进程 (PID: ${pid})`);
        // 等待系统释放端口
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      return true;
    } catch (error) {
      if (error.message.includes('超时')) {
        console.error(`清理端口 ${port} 超时`);
      } else {
        console.error(`清理端口 ${port} 失败: ${error.message}`);
      }
      return false;
    }
  }

  // 清理所有配置的端口
  async cleanAllPorts() {
    console.log('开始清理所有配置的端口...');
    const results = [];
    for (let port = this.startPort; port <= this.endPort; port++) {
      const success = await this.cleanPort(port);
      results.push({ port, success });
    }
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.warn(`以下端口清理失败: ${failed.map(f => f.port).join(', ')}`);
    }
    
    console.log('端口清理完成');
    return failed.length === 0;
  }

  // 更新配置文件中的端口
  async updateConfigFiles(port) {
    const backups = [];
    for (const config of this.configFiles) {
      try {
        // 创建备份
        if (await fs.access(config.path).then(() => true).catch(() => false)) {
          const backup = await this.backupConfig(config.path);
          if (backup) backups.push({ original: config.path, backup });
        }

        let content = await fs.readFile(config.path, 'utf8').catch(() => '');
        
        if (path.basename(config.path) === 'config.js') {
          content = content.replace(config.pattern, `${config.template}${port}`);
        } else {
          if (content.match(config.pattern)) {
            content = content.replace(config.pattern, `${config.template}${port}`);
          } else {
            content = `${content.trim()}\n${config.template}${port}\n`;
          }
        }
        
        await fs.writeFile(config.path, content, 'utf8');
        console.log(`已更新配置文件 ${config.path} 中的端口为: ${port}`);
      } catch (error) {
        console.error(`更新配置文件 ${config.path} 失败:`, error);
        // 如果更新失败，尝试恢复备份
        const backup = backups.find(b => b.original === config.path);
        if (backup) {
          try {
            await fs.copyFile(backup.backup, backup.original);
            console.log(`已恢复配置文件 ${config.path} 的备份`);
          } catch (restoreError) {
            console.error(`恢复配置文件备份失败:`, restoreError);
          }
        }
        throw error;
      }
    }
  }

  // 初始化端口
  async initialize() {
    try {
      // 检查系统依赖
      await this.checkDependencies();

      // 1. 尝试获取当前配置的端口
      let currentPort = this.startPort;
      try {
        const envContent = await fs.readFile(this.configFiles[0].path, 'utf8');
        const portMatch = envContent.match(/^PORT=(\d+)$/m);
        if (portMatch) {
          currentPort = parseInt(portMatch[1]);
        }
      } catch (error) {
        console.log('未找到现有端口配置，使用默认端口:', this.startPort);
      }

      // 2. 清理当前端口
      console.log(`检查并清理端口 ${currentPort}...`);
      const cleaned = await this.cleanPort(currentPort);
      if (!cleaned) {
        console.log('当前端口清理失败，将尝试使用其他端口');
        currentPort = this.startPort;
      }

      // 3. 检查端口可用性
      const isAvailable = await this.checkPort(currentPort);
      
      // 4. 如果当前端口不可用，寻找新端口
      if (!isAvailable) {
        console.log(`端口 ${currentPort} 不可用，寻找新端口...`);
        currentPort = await this.findAvailablePort();
      }

      // 5. 更新配置文件
      await this.updateConfigFiles(currentPort);
      
      return currentPort;
    } catch (error) {
      console.error('端口初始化失败:', error);
      throw error;
    }
  }
}

// 处理命令行参数
if (require.main === module) {
  const args = process.argv.slice(2);
  const portManager = new PortManager();

  if (args.includes('--clean')) {
    console.log('开始清理端口...');
    portManager.cleanAllPorts()
      .then((success) => {
        if (success) {
          console.log('所有端口清理成功');
          process.exit(0);
        } else {
          console.error('部分端口清理失败');
          process.exit(1);
        }
      })
      .catch((error) => {
        console.error('端口清理失败:', error);
        process.exit(1);
      });
  }
}

module.exports = PortManager; 