# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloud-init ISO generator web application with a React frontend and Go backend. The application creates ISO files containing cloud-init configuration data (user-data, meta-data, and optional network-config) for cloud VM initialization.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (port 5173 in dev)
- **Backend**: Go with Gin web framework (port 8080)
- **ISO Generation**: Uses platform-specific tools (`mkisofs` on macOS, `genisoimage` on Linux)
- **Build Output**: Frontend builds to `backend/static/` for production serving

## Development Commands

### Setup
```bash
make install          # Install frontend dependencies
```

### Development
```bash
make dev              # Run both frontend (5173) and backend (8080) in parallel
```

### Building
```bash
make build            # Build frontend for production (outputs to backend/static/)
make start            # Build and start production server
```

### Frontend Only
```bash
cd frontend
npm run dev           # Development server
npm run build         # Production build
npm run lint          # ESLint
```

### Backend Only
```bash
cd backend
go run main.go        # Start backend server
```

### Docker
```bash
make docker-up        # Start with Docker Compose
make docker-down      # Stop Docker services
make docker-build TAG=v1.0.0  # Build and push Docker image
```

### Cleanup
```bash
make clean            # Remove build artifacts and cache
```

## Key Files

- `backend/main.go`: Go server with API endpoints `/api/generate` and `/api/health`
- `frontend/src/`: React application source
- `Makefile`: All build and development commands
- `compose.yaml`: Docker Compose configuration
- `Dockerfile`: Multi-stage build (Node.js frontend + Ubuntu backend)

## Important Notes

- Frontend builds are copied to `backend/static/` and served by the Go server
- The Go server requires `mkisofs` (macOS) or `genisoimage` (Linux) to be installed
- ISO files are generated in `/tmp` with automatic cleanup
- The application serves a SPA with API routes under `/api/`