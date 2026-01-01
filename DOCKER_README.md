# Docker Setup for Helpro

## Quick Start

```bash
# 1. Create .env file (copy from example or create new)
cat > .env <<EOF
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
EOF

# 2. Start all services
docker-compose up

# 3. Open browser
# - Frontend: http://localhost:5173
# - API: http://localhost:3001
# - NLP: http://localhost:8000
```

## Services

### Web (Vite Frontend)
- **Port**: 5173
- **Auto-reload**: Yes (volume mounted)
- **URL**: http://localhost:5173

### API (Express Backend)
- **Port**: 3001
- **Auto-reload**: Yes (volume mounted)
- **URL**: http://localhost:3001/api/health

### NLP (Python FastAPI)
- **Port**: 8000
- **Auto-reload**: No (rebuild needed)
- **URL**: http://localhost:8000/health

## Common Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f nlp

# Stop services
docker-compose down

# Rebuild after code changes (NLP service)
docker-compose build nlp
docker-compose up -d nlp

# Rebuild all
docker-compose build
docker-compose up

# Clean everything
docker-compose down -v
docker system prune -a
```

## Development Workflow

### Frontend/Backend Changes
- Changes auto-reload (volumes mounted)
- No rebuild needed

### Python NLP Changes
```bash
# After changing services/nlp/main.py
docker-compose build nlp
docker-compose up -d nlp
```

## Environment Variables

Create `.env` file:
```bash
# Required
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com

# Optional
NODE_ENV=development
NLP_LOG_LEVEL=INFO
NLP_STORE_REQUESTS=false
ALLOWED_ORIGINS=http://localhost:5173
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 5173
lsof -i :5173
# or
netstat -an | grep 5173

# Kill process or change port in docker-compose.yml
```

### Build Fails
```bash
# Clean and rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up
```

### NLP Service Not Responding
```bash
# Check health
curl http://localhost:8000/health

# Check logs
docker-compose logs nlp

# Restart service
docker-compose restart nlp
```

### Can't Connect to API from Frontend
- Check `NLP_URL=http://nlp:8000` (uses Docker network name)
- Frontend calls API at `http://localhost:3001` (host machine)
- Ensure all services are up: `docker-compose ps`

## Cross-Platform Notes

### Windows
- Use Git Bash or PowerShell
- Line endings: configure git to checkout as-is
  ```bash
  git config --global core.autocrlf false
  ```
- Ensure Docker Desktop is running
- WSL2 backend recommended

### Mac (M1/M2)
- Works with default settings
- Python image supports ARM64

### Linux
- Ensure user is in `docker` group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

## Production Use

**Not recommended for production!** This docker-compose is for development.

For production:
- Use separate deployments (Vercel + Cloud Run recommended)
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Enable HTTPS
- Set `NODE_ENV=production`
- Restrict `ALLOWED_ORIGINS`
