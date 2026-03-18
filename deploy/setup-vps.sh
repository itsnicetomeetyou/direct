#!/bin/bash
# =============================================================================
# DiReCT - Hostinger VPS Setup Script
# =============================================================================
# This script sets up a fresh Ubuntu VPS with everything needed to run DiReCT.
# Run as root or with sudo on a fresh Hostinger VPS (Ubuntu 22.04/24.04).
#
# Usage:
#   chmod +x setup-vps.sh
#   sudo ./setup-vps.sh
# =============================================================================

set -e

echo "============================================="
echo "  DiReCT - VPS Setup Script"
echo "============================================="
echo ""

# --- Colors for output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_done() {
    echo -e "${GREEN}[DONE]${NC} $1"
}

# =============================================================================
# STEP 1: System Update
# =============================================================================
print_step "Updating system packages..."
apt update && apt upgrade -y
print_done "System updated"

# =============================================================================
# STEP 2: Install Essential Tools
# =============================================================================
print_step "Installing essential tools..."
apt install -y curl wget git build-essential software-properties-common ufw
print_done "Essential tools installed"

# =============================================================================
# STEP 3: Install Node.js 20 LTS
# =============================================================================
print_step "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
print_done "Node.js 20 installed"

# =============================================================================
# STEP 4: Install PM2
# =============================================================================
print_step "Installing PM2 globally..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
print_done "PM2 installed and configured for startup"

# =============================================================================
# STEP 5: Install PostgreSQL
# =============================================================================
print_step "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

print_done "PostgreSQL installed and running"

# =============================================================================
# STEP 6: Setup PostgreSQL Database
# =============================================================================
print_step "Setting up PostgreSQL database..."

# Generate a random password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER direct_user WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE direct_db OWNER direct_user;
GRANT ALL PRIVILEGES ON DATABASE direct_db TO direct_user;
\q
EOF

echo ""
echo -e "${YELLOW}============================================="
echo "  DATABASE CREDENTIALS (SAVE THESE!)"
echo "============================================="
echo "  Database: direct_db"
echo "  User:     direct_user"
echo "  Password: ${DB_PASSWORD}"
echo "  URL:      postgresql://direct_user:${DB_PASSWORD}@localhost:5432/direct_db"
echo -e "=============================================${NC}"
echo ""

# Save credentials to a file
cat > /root/.direct-db-credentials <<CRED
DATABASE_URL=postgresql://direct_user:${DB_PASSWORD}@localhost:5432/direct_db
DB_USER=direct_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=direct_db
CRED
chmod 600 /root/.direct-db-credentials

print_done "PostgreSQL database configured (credentials saved to /root/.direct-db-credentials)"

# =============================================================================
# STEP 7: Install Nginx
# =============================================================================
print_step "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_done "Nginx installed and running"

# =============================================================================
# STEP 8: Install Certbot (SSL)
# =============================================================================
print_step "Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx
print_done "Certbot installed"

# =============================================================================
# STEP 9: Configure Firewall
# =============================================================================
print_step "Configuring firewall (UFW)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
print_done "Firewall configured (SSH + Nginx allowed)"

# =============================================================================
# STEP 10: Create App Directory
# =============================================================================
print_step "Creating application directory..."
mkdir -p /var/www/direct
chown -R $USER:$USER /var/www/direct
print_done "Application directory created at /var/www/direct"

# =============================================================================
# DONE
# =============================================================================
echo ""
echo -e "${GREEN}============================================="
echo "  VPS SETUP COMPLETE!"
echo "=============================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Upload your project to /var/www/direct"
echo "  2. Configure your .env files (see deploy/env-examples/)"
echo "  3. Run deploy/deploy.sh to build and start the apps"
echo "  4. Point your domain DNS to this VPS IP address"
echo "  5. Run: certbot --nginx -d yourdomain.com -d api.yourdomain.com"
echo ""
echo "Database credentials saved to: /root/.direct-db-credentials"
echo ""
