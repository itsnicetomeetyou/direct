#!/bin/bash
# =============================================================================
# DiReCT - Deployment Script
# =============================================================================
# Run this after setup-vps.sh and after uploading your project files.
# This script installs dependencies, builds the apps, runs migrations,
# and starts everything with PM2.
#
# Usage:
#   cd /var/www/direct
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
# =============================================================================

set -e

APP_DIR="/var/www/direct"
cd "$APP_DIR"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[STEP]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_done() { echo -e "${GREEN}[DONE]${NC} $1"; }

echo "============================================="
echo "  DiReCT - Deployment"
echo "============================================="

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================
print_step "Running pre-flight checks..."

# Check .env files exist
if [ ! -f "$APP_DIR/server/.env" ]; then
    echo -e "${RED}[ERROR]${NC} server/.env not found!"
    echo "  Copy deploy/env-examples/server.env to server/.env and fill in your values."
    exit 1
fi

if [ ! -f "$APP_DIR/client/.env.local" ]; then
    echo -e "${RED}[ERROR]${NC} client/.env.local not found!"
    echo "  Copy deploy/env-examples/client.env to client/.env.local and fill in your values."
    exit 1
fi

print_done "Environment files found"

# =============================================================================
# STEP 1: Install Server Dependencies & Build
# =============================================================================
print_step "Installing server dependencies..."
cd "$APP_DIR/server"
npm ci --production=false
print_done "Server dependencies installed"

print_step "Generating Prisma client..."
npx prisma generate
print_done "Prisma client generated"

print_step "Running database migrations..."
npx prisma migrate deploy
print_done "Database migrations applied"

print_step "Building server..."
npm run build
print_done "Server built"

# =============================================================================
# STEP 2: Install Client Dependencies & Build
# =============================================================================
print_step "Installing client dependencies..."
cd "$APP_DIR/client"
npm ci --production=false
print_done "Client dependencies installed"

print_step "Generating Prisma client for dashboard..."
npx dotenv -e .env.local -- npx prisma generate
print_done "Client Prisma client generated"

print_step "Running client database migrations..."
npx dotenv -e .env.local -- npx prisma migrate deploy
print_done "Client database migrations applied"

print_step "Building client (this may take a few minutes)..."
npm run build
print_done "Client built"

# =============================================================================
# STEP 3: Setup Nginx
# =============================================================================
print_step "Configuring Nginx..."
cd "$APP_DIR"

# Copy nginx config if not already in place
if [ ! -f /etc/nginx/sites-available/direct.conf ]; then
    cp deploy/nginx/direct.conf /etc/nginx/sites-available/direct.conf
    ln -sf /etc/nginx/sites-available/direct.conf /etc/nginx/sites-enabled/
    # Remove default nginx site
    rm -f /etc/nginx/sites-enabled/default
    print_warn "Nginx config copied. Remember to replace YOUR_DOMAIN.com with your actual domain!"
else
    print_done "Nginx config already exists (skipping)"
fi

# Test and reload nginx
nginx -t && systemctl reload nginx
print_done "Nginx configured and reloaded"

# =============================================================================
# STEP 4: Start/Restart Apps with PM2
# =============================================================================
print_step "Starting applications with PM2..."
cd "$APP_DIR"

# Stop existing processes if any
pm2 delete all 2>/dev/null || true

# Start apps using ecosystem config
pm2 start ecosystem.config.js

# Save PM2 process list (so it survives reboots)
pm2 save

print_done "Applications started"

# =============================================================================
# DONE
# =============================================================================
echo ""
echo -e "${GREEN}============================================="
echo "  DEPLOYMENT COMPLETE!"
echo "=============================================${NC}"
echo ""
echo "Your apps are running:"
echo "  - Client (Next.js):  http://localhost:3000"
echo "  - Server (NestJS):   http://localhost:3001"
echo ""
echo "Check status:  pm2 status"
echo "View logs:     pm2 logs"
echo "Client logs:   pm2 logs direct-client"
echo "Server logs:   pm2 logs direct-server"
echo ""
echo "Next steps:"
echo "  1. Edit /etc/nginx/sites-available/direct.conf"
echo "     Replace YOUR_DOMAIN.com with your actual domain"
echo "  2. Point your domain DNS A records to this VPS IP"
echo "  3. Run: certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com"
echo "  4. Test your site at https://yourdomain.com"
echo ""
