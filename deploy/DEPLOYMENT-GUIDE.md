# DiReCT - Hostinger VPS Deployment Guide

Complete step-by-step guide to deploy DiReCT on a Hostinger VPS.

---

## Prerequisites

- **Hostinger VPS** (KVM VPS plan, minimum 2GB RAM recommended)
- **A domain name** pointed to your VPS IP address
- **SSH access** to your VPS

---

## Quick Overview

| Component | Technology | Port | URL Pattern |
|-----------|-----------|------|-------------|
| Dashboard | Next.js | 3000 | `yourdomain.com` |
| API Server | NestJS | 3001 | `api.yourdomain.com` |
| Database | PostgreSQL | 5432 | localhost only |
| Reverse Proxy | Nginx | 80/443 | Routes traffic |
| Process Manager | PM2 | — | Keeps apps running |

---

## Step 1: Purchase & Access Your VPS

1. Go to [Hostinger VPS](https://www.hostinger.com/vps-hosting) and purchase a KVM VPS plan
   - **Minimum**: KVM 1 (1 vCPU, 4GB RAM) — ~$5-6/month
   - **Recommended**: KVM 2 (2 vCPU, 8GB RAM) — for better build performance
2. Choose **Ubuntu 22.04** or **Ubuntu 24.04** as the OS
3. Set a strong root password
4. Note your VPS **IP address** from the Hostinger dashboard

---

## Step 2: Connect to Your VPS via SSH

Open a terminal (PowerShell, CMD, or Git Bash) and connect:

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the IP address from Hostinger.

---

## Step 3: Run the Setup Script

The setup script installs Node.js, PostgreSQL, Nginx, PM2, and Certbot.

### Option A: Upload project first, then run setup

From your local machine, upload the project:

```bash
# From your local machine (in the project root directory)
scp -r . root@YOUR_VPS_IP:/var/www/direct
```

Then on the VPS:

```bash
ssh root@YOUR_VPS_IP
cd /var/www/direct
chmod +x deploy/setup-vps.sh
sudo ./deploy/setup-vps.sh
```

### Option B: Run setup first, upload project after

On the VPS:

```bash
# Download just the setup script (or create it manually)
mkdir -p /var/www/direct
cd /var/www/direct

# If you have git configured:
git clone YOUR_REPO_URL .

# Or upload from your local machine:
# scp -r . root@YOUR_VPS_IP:/var/www/direct

chmod +x deploy/setup-vps.sh
sudo ./deploy/setup-vps.sh
```

> **IMPORTANT**: Save the database credentials displayed at the end of the setup script!

---

## Step 4: Configure Environment Variables

### Server Environment

```bash
cp deploy/env-examples/server.env server/.env
nano server/.env
```

Fill in all values. Use the database credentials from Step 3:

```
DATABASE_URL=postgresql://direct_user:YOUR_DB_PASSWORD@localhost:5432/direct_db
```

### Client Environment

```bash
cp deploy/env-examples/client.env client/.env.local
nano client/.env.local
```

Fill in all values. Generate a NextAuth secret:

```bash
openssl rand -base64 32
```

> **TIP**: The database credentials were saved to `/root/.direct-db-credentials` during setup.

---

## Step 5: Configure Your Domain

### DNS Setup

Go to your domain registrar (or Hostinger DNS management) and create these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` (or `yourdomain.com`) | YOUR_VPS_IP | 3600 |
| A | `www` | YOUR_VPS_IP | 3600 |
| A | `api` | YOUR_VPS_IP | 3600 |

Wait 5-30 minutes for DNS to propagate. Check with:

```bash
ping yourdomain.com
ping api.yourdomain.com
```

### Update Nginx Config

```bash
nano /var/www/direct/deploy/nginx/direct.conf
```

Replace all instances of `YOUR_DOMAIN.com` with your actual domain name.

---

## Step 6: Deploy the Application

```bash
cd /var/www/direct
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

This will:
1. Install all npm dependencies
2. Generate Prisma clients
3. Run database migrations
4. Build both Next.js and NestJS apps
5. Configure Nginx
6. Start both apps with PM2

---

## Step 7: Enable SSL (HTTPS)

After your domain DNS has propagated:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Follow the prompts. Certbot will automatically:
- Obtain SSL certificates from Let's Encrypt
- Configure Nginx for HTTPS
- Set up auto-renewal

Test auto-renewal:

```bash
certbot renew --dry-run
```

---

## Step 8: Verify Everything Works

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Test endpoints
curl http://localhost:3000   # Client
curl http://localhost:3001/api/v1   # Server API
```

Visit your domain in a browser:
- **Dashboard**: `https://yourdomain.com`
- **API**: `https://api.yourdomain.com/api/v1`

---

## Ongoing Management

### View Logs

```bash
pm2 logs                    # All logs
pm2 logs direct-client      # Client logs only
pm2 logs direct-server      # Server logs only
pm2 logs --lines 100        # Last 100 lines
```

### Restart Apps

```bash
pm2 restart all             # Restart both
pm2 restart direct-client   # Restart client only
pm2 restart direct-server   # Restart server only
```

### Update/Redeploy

When you have code changes:

```bash
cd /var/www/direct

# Pull latest code (if using git)
git pull origin main

# Or re-upload files via scp

# Rebuild and restart
cd server && npm ci && npm run build && cd ..
cd client && npm ci && npm run build && cd ..
pm2 restart all
```

### Monitor Resources

```bash
pm2 monit                   # Real-time monitoring
htop                        # System resources
df -h                       # Disk usage
```

### Database Management

```bash
# Access PostgreSQL
sudo -u postgres psql -d direct_db

# Backup database
pg_dump -U direct_user direct_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U direct_user direct_db < backup_20260211.sql

# Run new migrations
cd /var/www/direct/server
npx prisma migrate deploy
```

---

## Troubleshooting

### App not starting?

```bash
pm2 logs direct-server --lines 50   # Check error logs
pm2 logs direct-client --lines 50
```

### Nginx errors?

```bash
nginx -t                              # Test config
systemctl status nginx                # Check status
tail -f /var/log/nginx/error.log      # View error log
```

### Database connection issues?

```bash
systemctl status postgresql           # Check if running
sudo -u postgres psql -c "\l"         # List databases
cat /root/.direct-db-credentials      # Check saved credentials
```

### Port already in use?

```bash
lsof -i :3000                         # Check what's using port 3000
lsof -i :3001                         # Check what's using port 3001
pm2 delete all                        # Kill all PM2 processes
```

### Out of memory during build?

```bash
# Add swap space (if VPS has limited RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Then retry the build
cd /var/www/direct/client && npm run build
```

### SSL certificate not renewing?

```bash
certbot renew --dry-run                # Test renewal
systemctl status certbot.timer         # Check timer
```

---

## Security Recommendations

1. **Change SSH port** (optional):
   ```bash
   nano /etc/ssh/sshd_config
   # Change "Port 22" to another port like "Port 2222"
   systemctl restart sshd
   ufw allow 2222/tcp
   ```

2. **Disable root login** (after creating a non-root user):
   ```bash
   adduser deploy
   usermod -aG sudo deploy
   # Then in /etc/ssh/sshd_config: PermitRootLogin no
   ```

3. **Keep system updated**:
   ```bash
   apt update && apt upgrade -y
   ```

4. **Never commit secrets** to git — use `.env` files only on the server.

---

## File Structure on VPS

```
/var/www/direct/
├── client/                  # Next.js dashboard
│   ├── .env.local           # Client environment variables
│   ├── .next/               # Built Next.js app
│   └── ...
├── server/                  # NestJS API
│   ├── .env                 # Server environment variables
│   ├── dist/                # Built NestJS app
│   └── ...
├── deploy/                  # Deployment configs & scripts
│   ├── nginx/direct.conf    # Nginx config
│   ├── env-examples/        # Example env files
│   ├── setup-vps.sh         # Initial VPS setup
│   └── deploy.sh            # Build & deploy script
└── ecosystem.config.js      # PM2 process config
```
