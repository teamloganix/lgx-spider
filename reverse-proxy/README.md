# Reverse Proxy (Nginx + Certbot)

A minimal Nginx reverse proxy with optional HTTPS via Certbot.

## Structure
- `nginx.tmpl.conf`: Template rendered into the running Nginx config using env vars
- `docker-compose.yml`: Services for `nginx` and `certbot`
- `entrypoint.sh`: Renders template and starts Nginx
- `certbot/`, `certs/`: ACME challenge and certificate storage
- `Dockerfile`: Builds the proxy image

## Quick start
```bash
# From reverse-proxy directory
docker-compose up -d --build
```

## Env vars (examples)
- `SERVER_NAME=example.com` (comma-separated for multiple)
- `UPSTREAM_BACKEND=http://backend:3000`
- `UPSTREAM_FRONTEND=http://frontend:4321`
- `ENABLE_SSL=true` (requires DNS to point to this host)
- `FRONTEND_PATH=/links` (mount path for frontend)
- `BACKEND_PATH=/api` (mount path for API)
- `MY_HOST=my.loganix.com` (host header + rewriting for fallback)
- `MY_UPSTREAM=https://${MY_HOST}` (fallback upstream; can be overridden)

Set them in `docker-compose.yml` or an `.env` file in this folder.

## SSL Certificates

### Enabling SSL

When `ENABLE_SSL=true`, the proxy expects SSL certificates to exist. If certificates are missing, SSL will be automatically disabled with a warning.

**Certificate paths** (default):
- Certificate: `/etc/nginx/certs/live/${SERVER_NAME}/fullchain.pem`
- Private key: `/etc/nginx/certs/live/${SERVER_NAME}/privkey.pem`

These paths are mounted from `./certs` directory in the host.

### Option 1: Manual Certificate Setup

1. Create the certificate directory structure:
   ```bash
   mkdir -p certs/live/your-domain.com
   ```

2. Place your certificates:
   ```bash
   cp fullchain.pem certs/live/your-domain.com/
   cp privkey.pem certs/live/your-domain.com/
   ```

3. Set environment variables:
   ```bash
   SERVER_NAME=your-domain.com
   ENABLE_SSL=true
   ```

4. Start the proxy - SSL will auto-detect if certificates exist.

### Option 2: Using Certbot (Let's Encrypt)

If certbot service is configured in `docker-compose.yml`:

1. Ensure DNS A/AAAA records for `SERVER_NAME` point to this host.

2. Set environment variables:
   ```bash
   SERVER_NAME=your-domain.com
   ENABLE_SSL=true
   LETSENCRYPT_EMAIL=your-email@example.com
   ```

3. Start services:
   ```bash
   docker-compose up -d
   ```

4. Certbot will automatically request certificates via ACME HTTP-01 challenge (served at `/.well-known/acme-challenge/`).

5. Certificates are stored in `./certs` and auto-renewed.

### Troubleshooting

- **SSL disabled automatically**: Check logs for certificate path warnings. Ensure certificates exist at the expected paths.
- **Certificate not found**: Verify `SERVER_NAME` matches your certificate directory name.
- **Auto-detection**: If `ENABLE_SSL=false` but certificates exist, SSL will be auto-enabled.

## Common commands
```bash
docker-compose logs -f nginx

docker-compose exec nginx nginx -t  # validate config

docker-compose restart nginx
```

## Notes
- Ensure DNS A/AAAA records for `SERVER_NAME` point to this host before enabling SSL.
- Adjust upstreams and timeouts in `nginx.tmpl.conf` as needed.


