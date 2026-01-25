# Build stage
FROM golang:1.22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build with CGO enabled for SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -a -ldflags '-linkmode external -extldflags "-static"' -o sora2api ./cmd/server/

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/sora2api .

# Copy static files if needed
COPY --from=builder /app/static ./static

# Create data directory
RUN mkdir -p /app/data /app/config

# Expose port
EXPOSE 8000

# Set environment variables
ENV GIN_MODE=release

# Run the application
CMD ["./sora2api", "-config", "/app/config/setting.toml"]
