# Production Startup Guide for n8n Docker Setup

## Prerequisites

- Docker and Docker Compose installed
- Minimum 4GB RAM and 2 CPU cores recommended
- At least 10GB available disk space

## Quick Start

### 1. Generate SSL Certificates (Required for Production)

#### Option A: Self-signed certificates (for testing)

```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

#### Option B: Let's Encrypt certificates (for production)

```bash
# Install certbot
sudo apt-get install certbot

# Get certificates (replace your-domain.com)
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

### 2. Environment Setup

#### Update Domain Configuration

1. Edit `nginx.conf` and replace `server_name _;` with your actual domain
2. Update `.env` file with your production domain:

   ```bash
   N8N_HOST=your-domain.com
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://your-domain.com/
   ```

#### Generate New Security Keys

```bash
# Generate new encryption key
echo "N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env.production

# Generate new passwords
echo "POSTGRES_PASSWORD=your_secure_postgres_password" >> .env.production
echo "MONGODB_PASSWORD=your_secure_mongo_password" >> .env.production
echo "N8N_BASIC_AUTH_PASSWORD=your_secure_admin_password" >> .env.production
```

### 3. Start Services

#### Development Mode (HTTP only)

```bash
docker-compose up -d
```

#### Production Mode (HTTPS with SSL)

```bash
# Start all services
docker-compose up -d

# Check all services are healthy
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Your n8n Installation

- **Main Interface (HTTPS)**: <https://your-domain.com>
- **Direct Access (HTTP)**: <http://your-domain.com:56784>
- **Health Check**: <https://your-domain.com/health>

### 5. Default Credentials (CHANGE IMMEDIATELY)

- **Username**: admin
- **Password**: As configured in `.env` (N8N_BASIC_AUTH_PASSWORD)

⚠️ **SECURITY WARNING**: Change default passwords immediately after first login!

## Service Ports

| Service    | Internal Port | External Port | Purpose                    |
|------------|---------------|---------------|----------------------------|
| n8n (via Nginx) | 5678 (container) | 56784/56785   | Main application (proxy)  |
| PostgreSQL | 5432          | 56781         | Database access            |
| Redis      | 6379          | 56782         | Queue monitoring           |
| MongoDB    | 27017         | 56783         | AI Agent memory            |
| Nginx      | 80/443        | 56784/56785   | Reverse proxy              |

## AI Agent Memory Services

### PostgreSQL (Primary Database + AI Memory)

- **External Access**: localhost:56781
- **Database**: n8n
- **Username**: n8n
- **Password**: As configured in `.env` (POSTGRES_PASSWORD)

### Redis (Queue + AI Caching)

- **External Access**: localhost:56782
- **Password**: None (configure in production)
- **Purpose**: Queue mode + AI memory caching

### MongoDB (AI Chat Memory)

- **External Access**: localhost:56783
- **Database**: n8n_ai_memory
- **Username**: n8n_admin
- **Password**: As configured in `.env` (MONGODB_PASSWORD)

## Monitoring & Health Checks

### Check Service Status

```bash
docker-compose ps
docker-compose logs -f n8n-main
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Database Connections

```bash
# PostgreSQL
docker exec -it n8n-postgres psql -U n8n -d n8n

# MongoDB
docker exec -it n8n-mongodb mongosh --username n8n_admin --password "$MONGODB_PASSWORD" --authenticationDatabase admin

# Redis
docker exec -it n8n-redis redis-cli
```

## Backup & Maintenance

### Database Backup

```bash
# PostgreSQL backup
docker exec n8n-postgres pg_dump -U n8n n8n > backup_$(date +%Y%m%d).sql

# MongoDB backup
docker exec n8n-mongodb mongodump --username n8n_admin --password "$MONGODB_PASSWORD" --authenticationDatabase admin --db n8n_ai_memory --out /tmp/mongo_backup
```

### Update Services

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Verify certificates exist in `ssl/` directory
   - Check certificate permissions
   - Ensure domain matches certificate

2. **Database Connection Issues**
   - Check PostgreSQL logs: `docker-compose logs postgres`
   - Verify environment variables in `.env`
   - Ensure database is fully initialized

3. **Redis Connection Issues**
   - Check Redis logs: `docker-compose logs redis`
   - Verify queue mode configuration
   - Check Redis memory usage

4. **High Memory Usage**
   - Increase Docker memory limits
   - Adjust `NODE_OPTIONS` in environment
   - Monitor workflow execution patterns

### Performance Optimization

1. **Scale Workers**

   ```bash
   docker-compose up -d --scale n8n-worker=3
   ```

2. **Database Tuning**
   - Adjust `postgres.conf` parameters
   - Monitor query performance
   - Regular VACUUM and ANALYZE

3. **Redis Optimization**
   - Adjust memory policies in `redis.conf`
   - Monitor queue lengths
   - Configure appropriate persistence

## Security Checklist

- [ ] Change all default passwords
- [ ] Configure SSL certificates
- [ ] Update server_name in nginx.conf
- [ ] Restrict external access to databases
- [ ] Enable firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Configure backup retention

## Support

For issues and support:

1. Check Docker logs: `docker-compose logs`
2. Verify health endpoints
3. Review n8n documentation: <https://docs.n8n.io>
4. Check AI Agent node requirements
5. Monitor resource usage

=============================================================================
