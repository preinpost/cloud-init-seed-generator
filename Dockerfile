# Multi-stage build
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Production image
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    genisoimage \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Go
ARG TARGETARCH
RUN apt-get update && apt-get install -y wget && \
    case ${TARGETARCH} in \
        "amd64") GOARCH=amd64 ;; \
        "arm64") GOARCH=arm64 ;; \
        *) echo "Unsupported architecture: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -O go.tar.gz https://go.dev/dl/go1.24.4.linux-${GOARCH}.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz && \
    apt-get remove -y wget && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

ENV PATH=$PATH:/usr/local/go/bin

WORKDIR /app

# Copy backend source
COPY backend/ ./

# Copy built frontend files
COPY --from=frontend-builder /app/backend/static ./static

# Build Go application
RUN go mod download && \
    go build -o main .

EXPOSE 8080

CMD ["./main"]