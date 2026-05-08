# 部署指南

本文档介绍如何将 **AI 效率精灵** 部署到不同的平台。

---

## 目录

- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [生产构建](#生产构建)
- [部署到 Vercel](#部署到-vercel)
- [部署到 Docker](#部署到-docker)
- [部署到云服务器](#部署到云服务器)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.x | 20.x LTS |
| bun | 1.0+ | 最新版 |
| npm | 8.x+ | 最新版（备选） |
| Git | 2.x | 最新版 |

### 操作系统支持

- macOS 12+
- Ubuntu 20.04+
- Windows 10+（需 WSL2）

---

## 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/Vincent-zwc/ai-efficiency-spirit.git
cd ai-efficiency-spirit
```

### 2. 安装依赖

```bash
# 推荐使用 bun（更快）
bun install

# 或使用 npm
npm install
```

### 3. 初始化数据库

```bash
# 推送 Prisma schema 到 SQLite 数据库
bun run db:push
```

### 4. 启动开发服务器

```bash
bun run dev
```

应用将在 `http://localhost:3000` 启动，支持热重载。

### 5. 代码检查

```bash
bun run lint
```

---

## 生产构建

### 构建项目

```bash
bun run build
```

构建产物将输出到 `.next/standalone` 目录。

### 启动生产服务器

```bash
bun run start
```

生产模式默认运行在 `http://localhost:3000`。

### 构建优化说明

- Next.js 16 的 `output: 'standalone'` 模式会自动优化构建产物
- 构建后需要将 `public` 和 `.next/static` 目录复制到 standalone 目录中
- `bun run build` 脚本已包含此步骤

---

## 部署到 Vercel

Vercel 是 Next.js 的官方推荐部署平台，零配置即可部署。

### 方法一：通过 Vercel Dashboard

1. 登录 [Vercel](https://vercel.com)
2. 点击 **"New Project"**
3. 导入 GitHub 仓库 `Vincent-zwc/ai-efficiency-spirit`
4. Framework Preset 自动检测为 **Next.js**
5. 点击 **"Deploy"**
6. 等待部署完成，获得访问地址

### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

### 注意事项

> Vercel 的 Serverless 环境不支持 SQLite 持久化，如需数据库功能，建议替换为 PostgreSQL 或 PlanetScale。

---

## 部署到 Docker

### 1. 创建 Dockerfile

项目根目录下创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS base

# 安装 bun
RUN npm install -g bun

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run db:push
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2. 构建与运行

```bash
# 构建镜像
docker build -t ai-efficiency-spirit .

# 运行容器
docker run -p 3000:3000 ai-efficiency-spirit
```

### 3. Docker Compose（可选）

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## 部署到云服务器

适用于阿里云、腾讯云、AWS 等云服务器。

### 1. 服务器准备

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 bun
curl -fsSL https://bun.sh/install | bash

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

### 2. 部署项目

```bash
# 克隆项目
git clone https://github.com/Vincent-zwc/ai-efficiency-spirit.git
cd ai-efficiency-spirit

# 安装依赖
bun install

# 构建
bun run build

# 使用 PM2 启动
pm2 start ecosystem.config.js
```

### 3. PM2 配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'ai-efficiency-spirit',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/path/to/ai-efficiency-spirit',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 4. Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

---

## 环境变量配置

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `DATABASE_URL` | 否 | `file:./dev.db` | Prisma 数据库连接字符串 |
| `NEXTAUTH_SECRET` | 否 | - | NextAuth 加密密钥（如需认证） |
| `NEXTAUTH_URL` | 否 | `http://localhost:3000` | NextAuth 回调地址 |

> `z-ai-web-dev-sdk` 的 AI 调用无需额外配置 API Key，SDK 已内置认证。

---

## 常见问题

### Q: 启动报错 "Module not found"

```bash
# 清除缓存并重新安装
rm -rf node_modules .next
bun install
bun run dev
```

### Q: 数据库迁移失败

```bash
# 重置数据库
bun run db:reset

# 或重新推送 schema
bun run db:push
```

### Q: 端口被占用

```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 杀掉进程
kill -9 <PID>

# 或使用其他端口启动
PORT=3001 bun run dev
```

### Q: AI 接口调用失败

1. 检查网络连接是否正常
2. 确认 `z-ai-web-dev-sdk` 版本为最新
3. 查看浏览器控制台和服务器日志的错误信息

### Q: 生产环境 SQLite 数据丢失

SQLite 文件存储在本地文件系统，Serverless 环境（如 Vercel）不支持持久化。解决方案：

- 使用 PostgreSQL + Prisma（推荐）
- 使用 PlanetScale / Supabase 等托管数据库
- 部署到支持持久化存储的云服务器

---

## 更新部署

```bash
# 拉取最新代码
git pull origin main

# 安装依赖（如有更新）
bun install

# 重新构建
bun run build

# 重启服务（PM2）
pm2 restart ai-efficiency-spirit

# 或 Docker
docker-compose down && docker-compose up -d --build
```

---

<p align="center">
  如有问题，欢迎提 <a href="https://github.com/Vincent-zwc/ai-efficiency-spirit/issues">Issue</a>
</p>
