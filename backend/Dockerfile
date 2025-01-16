FROM node:18-alpine

# 安装等待脚本
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 等待其他服务就绪并初始化配置
CMD /wait && npm run init-consul && npm start 