#!/bin/bash

# Mettre à jour le système
apt-get update
apt-get upgrade -y

# Installer les dépendances
apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx \
    nodejs \
    npm \
    git \
    awscli \
    fail2ban \
    ufw \
    curl \
    wget \
    unzip

# Configurer le firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Configurer Docker
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# Créer le dossier de l'application
mkdir -p /opt/civil-registry-app
cd /opt/civil-registry-app

# Configurer Nginx
cat > /etc/nginx/sites-available/civil-registry << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/civil-registry /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Redémarrer Nginx
systemctl restart nginx
systemctl enable nginx

# Créer fichier .env
cat > /opt/civil-registry-app/.env << 'ENVCONFIG'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civil_registry?retryWrites=true&w=majority
JWT_SECRET=change-this-to-a-random-secret-key
FRONTEND_URL=http://localhost:3000
ENVCONFIG

# Créer script de déploiement
cat > /opt/civil-registry-app/deploy.sh << 'DEPLOYSCRIPT'
#!/bin/bash
cd /opt/civil-registry-app

# Pull latest code
git pull origin main

# Stop and remove old containers
docker-compose down

# Build and start new containers
docker-compose build --no-cache
docker-compose up -d

# Clean up old images
docker image prune -f
DEPLOYSCRIPT

chmod +x /opt/civil-registry-app/deploy.sh

# Créer docker-compose pour production
cat > /opt/civil-registry-app/docker-compose.yml << 'DOCKERCOMPOSE'
version: '3.8'

services:
  frontend:
    image: \${DOCKER_USERNAME}/civil-registry-frontend:latest
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 3s
      retries: 3

  backend:
    image: \${DOCKER_USERNAME}/civil-registry-backend:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=\${MONGODB_URI}
      - JWT_SECRET=\${JWT_SECRET}
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/"]
      interval: 30s
      timeout: 3s
      retries: 3

volumes:
  uploads:
DOCKERCOMPOSE

# Créer service systemd
cat > /etc/systemd/system/civil-registry.service << 'SYSTEMD'
[Unit]
Description=Civil Registry Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/civil-registry-app
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
SYSTEMD

systemctl daemon-reload
systemctl enable civil-registry.service

# Configurer fail2ban
cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
FAIL2BAN

systemctl restart fail2ban

# Configurer backup quotidien
cat > /etc/cron.daily/civil-registry-backup << 'BACKUPSCRIPT'
#!/bin/bash
BACKUP_DIR="/opt/civil-registry-backups"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup des fichiers importants
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz \
    /opt/civil-registry-app \
    /etc/nginx/sites-available/civil-registry \
    /etc/systemd/system/civil-registry.service 2>/dev/null

# Garder seulement les 7 derniers backups
ls -t \$BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm
BACKUPSCRIPT

chmod +x /etc/cron.daily/civil-registry-backup

# Créer script de monitoring
cat > /opt/civil-registry-app/monitor.sh << 'MONITORSCRIPT'
#!/bin/bash

LOG_FILE="/var/log/civil-registry-monitor.log"

# Check services
check_service() {
    SERVICE=\$1
    PORT=\$2
    
    if docker ps | grep -q \$SERVICE; then
        echo "\$(date): \$SERVICE is running" >> \$LOG_FILE
        return 0
    else
        echo "\$(date): CRITICAL - \$SERVICE is down" >> \$LOG_FILE
        return 1
    fi
}

# Check all services
check_service frontend 3000
check_service backend 5000

# Check disk space
DISK_USAGE=\$(df -h / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "\$(date): WARNING - Disk usage is at \$DISK_USAGE%" >> \$LOG_FILE
fi
MONITORSCRIPT

chmod +x /opt/civil-registry-app/monitor.sh

# Ajouter au cron pour exécution toutes les heures
echo "0 * * * * root /opt/civil-registry-app/monitor.sh" >> /etc/crontab

echo "✅ Server setup completed successfully!"
echo "📝 Next steps:"
echo "1. Update /opt/civil-registry-app/.env with your MongoDB credentials"
echo "2. Run: cd /opt/civil-registry-app && ./deploy.sh"
echo "3. Application will be available at: http://$(curl -s ifconfig.me)"
