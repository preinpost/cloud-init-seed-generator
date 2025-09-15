.PHONY: dev build clean install start help docker-build docker-up docker-down deploy

# Default target
help:
	@echo "Available targets:"
	@echo "  install      - Install frontend dependencies"
	@echo "  dev          - Run both frontend and backend in development mode"
	@echo "  build        - Build frontend for production"
	@echo "  start        - Start production server (backend only)"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-up    - Start with Docker Compose"
	@echo "  docker-down  - Stop Docker Compose services"
	@echo "  deploy       - Deploy with specific tag (use TAG=version)"

# Install frontend dependencies
install:
	cd frontend && npm install

# Development mode - run both servers
dev:
	@echo "Starting development servers..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:8080"
	@trap 'kill 0' SIGINT; \
	(cd frontend && npm run dev) & \
	(cd backend && go run main.go) & \
	wait

# Build frontend for production
build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Build complete! Files in backend/static/"

# Start production server
start: build
	@echo "Starting production server on http://localhost:8080"
	cd backend && go run main.go

# Clean build artifacts
clean:
	rm -rf backend/static/*
	rm -rf frontend/dist/
	rm -rf frontend/node_modules/.vite/

# Check if TAG is provided
.check-tag:
	@if [ -z "$(TAG)" ]; then \
		echo "Error: TAG is required. Use: make $(MAKECMDGOALS) TAG=v1.0.0"; \
		exit 1; \
	fi

# Build Docker image
docker-build: .check-tag
	@echo "Building Docker image..."
	TAG=$(TAG) docker buildx bake -f compose.yaml seed-generator --push

# Start with Docker Compose
docker-up:
	@echo "Starting with Docker Compose..."
	@echo "Service URL: http://localhost:8080"
	docker compose up -d

# Stop Docker Compose services
docker-down:
	@echo "Stopping Docker Compose services..."
	docker compose down

# Deploy with specific tag
deploy: .check-tag
	@echo "Deploying with tag: $(TAG)"
	TAG=$(TAG) docker compose up -d