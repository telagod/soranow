# SoraNow

SoraNow - AI 视频生成平台，基于 Go 语言构建，专注于高并发和轻量化设计。

## 特性

- 🚀 高性能：基于 Gin 框架，支持高并发
- 💾 轻量化：单二进制文件，内存占用低
- 🔄 OpenAI 兼容：完全兼容 OpenAI API 格式
- 🎨 图片/视频生成：支持 Sora 图片和视频生成
- 🔐 Token 管理：支持多 Token 负载均衡
- 📊 管理后台：内置 Web 管理界面
- 🎬 故事模式：可视化分镜编辑器
- 👤 角色一致性：创建和管理角色，保持视频中角色一致
- 📚 模板库：20+ 专业预设模板
- 🎨 风格预设：10 种视觉风格

## 快速开始

### Docker 运行 (推荐)

```bash
docker run -d \
  -p 8000:8000 \
  -v ./config:/app/config \
  -v ./data:/app/data \
  teraccc/soranow:latest
```

### 本地运行

```bash
# 编译
go build -o bin/soranow ./cmd/server/

# 运行
./bin/soranow -config config/setting.toml
```

### Docker Compose

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## API 端点

### OpenAI 兼容 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/models` | GET | 获取可用模型列表 |
| `/v1/chat/completions` | POST | 生成图片/视频 |

### 管理 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/login` | POST | 管理员登录 |
| `/api/tokens` | GET | 获取所有 Token |
| `/api/tokens` | POST | 添加 Token |
| `/api/tokens/:id` | PUT | 更新 Token |
| `/api/tokens/:id` | DELETE | 删除 Token |
| `/api/config` | GET | 获取系统配置 |
| `/api/config` | PUT | 更新系统配置 |

### 角色 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/characters` | GET | 获取角色列表 |
| `/api/characters/upload` | POST | 上传角色视频 |
| `/api/characters/:id/status` | GET | 获取处理状态 |
| `/api/characters/finalize` | POST | 完成角色创建 |
| `/api/characters/:id` | DELETE | 删除角色 |

### 其他端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/` | GET | 登录页面 |
| `/manage` | GET | 管理页面 |

## 支持的模型

- `sora-image` - 图片生成
- `gpt-image-1` - 图片生成 (别名)
- `gpt-image` - 图片生成 (别名)
- `sora` - 视频生成
- `sora-video` - 视频生成 (别名)

## 配置文件

配置文件位于 `config/setting.toml`，主要配置项：

```toml
[global]
api_key = "your-api-key"
admin_username = "admin"
admin_password = ""

[server]
host = "0.0.0.0"
port = 8000

[sora]
base_url = "https://sora.chatgpt.com/backend"
timeout = 120

[generation]
image_timeout = 300
video_timeout = 3000
```

## 项目结构

```
soranow/
├── cmd/server/          # 入口
├── internal/
│   ├── api/             # API 处理器
│   ├── config/          # 配置管理
│   ├── database/        # 数据库操作
│   ├── models/          # 数据模型
│   └── services/        # 核心服务
├── web/                 # 前端源码
├── static/              # 前端构建产物
├── config/              # 配置文件
├── Dockerfile
└── docker-compose.yml
```

## 开发

```bash
# 运行测试
go test ./...

# 编译后端
go build -o bin/soranow ./cmd/server/

# 构建前端
cd web && npm run build
```

## License

MIT
