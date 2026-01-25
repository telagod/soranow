# Frontend build stage
FROM node:20-alpine AS frontend

WORKDIR /app/web

# Copy frontend files
COPY web/package*.json ./
RUN npm ci

COPY web/ ./
RUN npm run build

# Backend build stage
FROM golang:1.24-alpine3.21 AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev upx tzdata

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Copy frontend build
COPY --from=frontend /app/static/dist ./static/dist

# Build with CGO enabled for SQLite, optimized for size
RUN CGO_ENABLED=1 GOOS=linux go build -a \
    -ldflags '-linkmode external -extldflags "-static" -s -w' \
    -trimpath \
    -o sora2api ./cmd/server/

# Compress binary with UPX (extreme compression)
RUN upx --best --lzma sora2api

# Runtime stage - use scratch for minimal size
FROM scratch

# Copy CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/sora2api .

# Copy static files (includes React build)
COPY --from=builder /app/static ./static

# Expose port
EXPOSE 8000

# Set environment variables
ENV GIN_MODE=release
ENV TZ=Asia/Shanghai

# Run the application
ENTRYPOINT ["./sora2api", "-config", "/app/config/setting.toml"]
