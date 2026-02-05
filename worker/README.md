# STL Worker Docker Setup

## Quick Start

1. **Copy environment file:**
   ```bash
   cp env.docker .env
   ```

2. **Update API keys in `.env`:**
   - Set `AHREFS_API_KEY` for backlinks analysis
   - Set `SERPAPI_KEY` for organic keywords
   - Set `OPENROUTER_API_KEY` for AI analysis

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Check logs:**
   ```bash
   docker-compose logs -f worker
   ```

## Services

- **worker**: Main STL analysis worker
- **redis**: Job queue and result storage
- **postgres**: Database for persistent storage
- **redis-commander**: Web UI for Redis monitoring (optional)

## Usage

### Add a job to the queue:
```bash
# Using Redis CLI
docker exec -it stl-redis redis-cli
LPUSH stl_jobs '{"url": "https://example.com", "job_id": "test-123"}'
```

### Monitor Redis queue:
```bash
# Check queue length
docker exec -it stl-redis redis-cli LLEN stl_jobs

# View dead letter queue
docker exec -it stl-redis redis-cli LLEN stl_jobs_dlq
```

### Access Redis Commander (if enabled):
```bash
# Start with monitoring profile
docker-compose --profile monitoring up -d
# Then visit http://localhost:8081
```

## Scaling

### Run multiple workers:
```bash
docker-compose up -d --scale worker=3
```

### Resource limits:
The worker is configured with:
- Memory limit: 2GB
- CPU limit: 1 core
- Memory reservation: 512MB
- CPU reservation: 0.5 cores

## Development

### Build and run locally:
```bash
docker build -t stl-worker .
docker run --env-file .env stl-worker
```

### Debug mode:
```bash
docker-compose run --rm worker python worker.py
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/0` |
| `REDIS_QUEUE` | Job queue name | `stl_jobs` |
| `REDIS_DLQ` | Dead letter queue name | `stl_jobs_dlq` |
| `AHREFS_API_KEY` | Ahrefs API key | Required |
| `SERPAPI_KEY` | SerpAPI key | Required |
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |
| `DATABASE_URL` | PostgreSQL connection URL | Required |
| `LOG_LEVEL` | Logging level | `INFO` |

## Troubleshooting

### Check worker health:
```bash
docker-compose ps
docker-compose logs worker
```

### Restart worker:
```bash
docker-compose restart worker
```

### Clear Redis data:
```bash
docker-compose down -v
docker-compose up -d
```

### Check database:
```bash
docker exec -it stl-postgres psql -U postgres -d stl_v2
\dt
SELECT COUNT(*) FROM stl_results;
```
