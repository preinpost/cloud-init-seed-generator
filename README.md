# go-mkisofs

A Cloud-init ISO generator web application that creates ISO files containing cloud-init configuration data for cloud VM initialization.

🌐 **Live Demo**: [https://seed.preinpost.in/](https://seed.preinpost.in/)

## Features

- Web-based interface for creating cloud-init ISO files
- Support for user-data, meta-data, and network-config
- Cross-platform ISO generation (macOS/Linux)
- React frontend with Go backend
- Docker support

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Go with Gin web framework
- **ISO Generation**: Platform-specific tools (`mkisofs` on macOS, `genisoimage` on Linux)

## Prerequisites

- Node.js (for frontend development)
- Go 1.19+ (for backend)
- `mkisofs` (macOS) or `genisoimage` (Linux) for ISO generation

### Installing ISO tools

**macOS:**
```bash
brew install cdrtools
```

**Ubuntu/Debian:**
```bash
sudo apt-get install genisoimage
```

## Quick Start

### Try Online
Visit the live demo at [https://seed.preinpost.in/](https://seed.preinpost.in/) to use the application without any setup.

### Local Development

1. Install dependencies:
   ```bash
   make install
   ```

2. Start development servers:
   ```bash
   make dev
   ```
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## Development

### Available Commands

```bash
make install          # Install frontend dependencies
make dev              # Run both frontend and backend in development
make build            # Build frontend for production
make start            # Build and start production server
make clean            # Remove build artifacts and cache
```

### Frontend Development
```bash
cd frontend
npm run dev           # Development server
npm run build         # Production build
npm run lint          # ESLint
```

### Backend Development
```bash
cd backend
go run main.go        # Start backend server
```

## Docker

Run with Docker Compose:
```bash
make docker-up        # Start services
make docker-down      # Stop services
```

Build Docker image:
```bash
make docker-build TAG=v1.0.0
```

## API Endpoints

- `POST /api/generate` - Generate cloud-init ISO
- `GET /api/health` - Health check

## Project Structure

```
├── backend/
│   ├── main.go           # Go server
│   └── static/           # Built frontend files
├── frontend/
│   └── src/              # React application
├── Makefile              # Build commands
├── compose.yaml          # Docker Compose
└── Dockerfile           # Multi-stage build
```

## License

MIT