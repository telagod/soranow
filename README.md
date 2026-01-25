# Sora2API Go

Sora2API 的 Go 语言重写版本，专注于高并发和轻量化设计。

## 特性

- 🚀 高性能：基于 Gin 框架，支持高并发
- 💾 轻量化：单二进制文件，内存占用低
- 🔄 OpenAI 兼容：完全兼容 OpenAI API 格式
- 🎨 图片/视频生成：支持 Sora 图片和视频生成
- 🔐 Token 管理：支持多 Token 负载均衡
- 📊 管理后台：内置 Web 管理界面

## 快速开始

### 本地运行

```bash
# 编译
go build -o bin/sora2api ./cmd/server/

# 运行
./bin/sora2api -config config/setting.toml
```

### Docker 运行

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

### 其他端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/` | GET | 登录页面 |
| `/manage` | GET | 管理页面 |
| `/generate` | GET | 生成页面 |

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
api_key = "han1234"
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
sora2api-go/
├── cmd/server/          # 入口
├── internal/
│   ├── api/             # API 处理器
│   ├── config/          # 配置管理
│   ├── database/        # 数据库操作
│   ├── models/          # 数据模型
│   └── services/        # 核心服务
├── static/              # 前端静态文件
├── config/              # 配置文件
├── Dockerfile
└── docker-compose.yml
```

## 开发

```bash
# 运行测试
go test ./...

# 运行测试 (详细输出)
go test ./... -v

# 编译
go build -o bin/sora2api ./cmd/server/
```

## License

MIT
