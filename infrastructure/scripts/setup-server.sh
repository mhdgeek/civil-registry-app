#!/bin/bash

set -e

echo "🔧 Setting up server..."

# Get instance IP from Terraform
INSTANCE_IP=$(terraform -chdir=infrastructure/terraform output -raw public_ip 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    echo "❌ Could not get instance IP. Make sure Terraform has been applied."
    exit 1
fi

SSH_KEY="civil-registry-key.pem"
DEPLOY_USER="ubuntu"

# Save SSH key from Terraform output
terraform -chdir=infrastructure/terraform output -raw ssh_key > $SSH_KEY
chmod 600 $SSH_KEY

echo "📡 Connecting to instance: $INSTANCE_IP"

# Basic server setup commands
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $DEPLOY_USER@$INSTANCE_IP << 'REMOTESCRIPT'
    # Update system
    sudo apt-get update
    sudo apt-get upgrade -y
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Install Nginx
    sudo apt-get install -y nginx
    
    # Configure firewall
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw --force enable
    
    # Create app directory
    sudo mkdir -p /opt/civil-registry-app
    sudo chown -R ubuntu:ubuntu /opt/civil-registry-app
    
    echo "✅ Server setup completed!"
REMOTESCRIPT

# Clean up
rm -f $SSH_KEY

echo ""
echo "🎉 Server setup completed!"
echo "📁 Application directory: /opt/civil-registry-app"
echo "🔐 Firewall configured"
echo "🐳 Docker and Docker Compose installed"
echo ""
echo "Next: Run ./infrastructure/scripts/deploy.sh to deploy the application"
