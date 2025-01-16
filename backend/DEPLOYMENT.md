# AI Music Platform 部署指南

## 环境要求

### 硬件要求
- CPU: 2核心以上
- 内存: 4GB以上
- 硬盘: 20GB以上

### 软件要求
- Node.js >= 16
- MongoDB >= 4.4
- Docker >= 20.10
- Docker Compose >= 2.0
- IPFS 节点
- Consul

## 部署方式

### 1. Docker 部署（推荐）

#### 准备工作
1. 安装 Docker 和 Docker Compose
2. 克隆项目代码
3. 配置环境变量

#### 部署步骤
1. 构建镜像
```bash
docker-compose build
```

2. 启动服务
```bash
docker-compose up -d
```

3. 检查服务状态
```bash
docker-compose ps
```

4. 查看日志
```bash
docker-compose logs -f
```

### 2. 手动部署

#### 系统配置
1. 安装 Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. 安装 MongoDB
```bash
sudo apt-get install -y mongodb
```

3. 安装 IPFS
```bash
wget https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.12.0_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh
```

4. 安装 Consul
```bash
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install consul
```

#### 应用部署
1. 克隆代码
```bash
git clone https://github.com/yourusername/ai-music-platform.git
cd ai-music-platform
```

2. 安装依赖
```bash
cd backend
npm install --production
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置必要的环境变量
```

4. 启动服务
```bash
npm start
```

## 服务配置

### MongoDB 配置
1. 创建数据库用户
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "your_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

2. 开启认证
```bash
sudo nano /etc/mongod.conf
```
添加：
```yaml
security:
  authorization: enabled
```

### IPFS 配置
1. 初始化 IPFS
```bash
ipfs init
```

2. 配置 IPFS API
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
```

### Consul 配置
1. 启动 Consul
```bash
consul agent -dev -ui -client=0.0.0.0
```

2. 初始化配置
```bash
npm run init-consul
```

## 安全配置

### 防火墙设置
```bash
# 开放必要端口
sudo ufw allow 3000/tcp  # API 服务
sudo ufw allow 27017/tcp # MongoDB
sudo ufw allow 5001/tcp  # IPFS API
sudo ufw allow 8500/tcp  # Consul UI
```

### SSL 证书
1. 安装 Certbot
```bash
sudo apt-get install certbot
```

2. 获取证书
```bash
sudo certbot certonly --standalone -d your-domain.com
```

### Nginx 配置
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 监控和维护

### 日志管理
1. 配置日志轮转
```bash
sudo nano /etc/logrotate.d/ai-music-platform
```
添加：
```
/var/log/ai-music-platform/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 640 node node
}
```

### 性能监控
1. 安装 PM2
```bash
npm install -g pm2
```

2. 启动应用
```bash
pm2 start npm --name "ai-music" -- start
```

3. 监控命令
```bash
pm2 monit
pm2 logs
pm2 status
```

### 备份策略
1. MongoDB 备份
```bash
# 创建备份脚本
#!/bin/bash
MONGO_DATABASE="ai_music"
MONGO_HOST="localhost"
MONGO_PORT="27017"
BACKUP_PATH="/backup/mongodb"

mongodump --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DATABASE --out $BACKUP_PATH/$(date +"%Y%m%d")
```

2. 配置定时任务
```bash
crontab -e
# 每天凌晨 2 点执行备份
0 2 * * * /path/to/backup-script.sh
```

## 故障排除

### 常见问题

1. 服务无法启动
- 检查端口占用
```bash
sudo lsof -i :3000
```
- 检查日志
```bash
tail -f /var/log/ai-music-platform/error.log
```

2. 数据库连接失败
- 检查 MongoDB 服务状态
```bash
sudo systemctl status mongodb
```
- 检查连接字符串
```bash
mongo --eval "db.serverStatus()"
```

3. IPFS 连接问题
- 检查 IPFS 守护进程
```bash
ipfs daemon --debug
```
- 测试 API 连接
```bash
curl -X POST http://localhost:5001/api/v0/version
```

### 性能优化

1. Node.js 优化
```bash
# 设置 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096"
```

2. MongoDB 优化
```javascript
// 创建索引
db.users.createIndex({ "email": 1 }, { unique: true })
db.music.createIndex({ "creator": 1, "createdAt": -1 })
```

3. Nginx 优化
```nginx
# 开启 gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## 扩展部署

### 负载均衡
```nginx
upstream api_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://api_servers;
    }
}
```

### 容器编排
```yaml
version: '3'
services:
  api:
    image: ai-music-api
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    ports:
      - "3000-3002:3000"
```

## 更新部署

### 自动部署脚本
```bash
#!/bin/bash
# 更新代码
git pull origin main

# 安装依赖
npm install --production

# 重启服务
pm2 restart ai-music

# 检查服务状态
pm2 status
```

### 回滚策略
```bash
# 创建回滚脚本
#!/bin/bash
VERSION=$1

# 切换到指定版本
git checkout $VERSION

# 更新依赖
npm install --production

# 重启服务
pm2 restart ai-music
``` 