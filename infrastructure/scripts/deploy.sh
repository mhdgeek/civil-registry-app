#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Variables
INSTANCE_IP=$(terraform -chdir=infrastructure/terraform output -raw public_ip 2>/dev/null || echo "")
SSH_KEY="civil-registry-key.pem"
DEPLOY_USER="ubuntu"

if [ -z "$INSTANCE_IP" ]; then
    echo "❌ Could not get instance IP from Terraform"
    exit 1
fi

echo "📡 Connecting to instance: $INSTANCE_IP"

# Save SSH key from Terraform output
terraform -chdir=infrastructure/terraform output -raw ssh_key > $SSH_KEY
chmod 600 $SSH_KEY

# Copy application files
echo "📤 Uploading application files..."
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude=".env" \
    --exclude="infrastructure" \
    ./ $DEPLOY_USER@$INSTANCE_IP:/opt/civil-registry-app/

# Copy .env.example if .env doesn't exist
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $DEPLOY_USER@$INSTANCE_IP \
    "if [ ! -f /opt/civil-registry-app/.env ]; then \
        cp /opt/civil-registry-app/.env.example /opt/civil-registry-app/.env; \
        echo '⚠️  Please update /opt/civil-registry-app/.env with your credentials'; \
    fi"

# Run deploy script on server
echo "🔨 Running deployment on server..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $DEPLOY_USER@$INSTANCE_IP \
    "cd /opt/civil-registry-app && chmod +x deploy.sh && ./deploy.sh"

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Run health checks
echo "🏥 Running health checks..."

# Check frontend
if curl -s -f "http://$INSTANCE_IP" > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check backend
if curl -s -f "http://$INSTANCE_IP/api" > /dev/null; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
    exit 1
fi

# Clean up SSH key
rm -f $SSH_KEY

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Application URL: http://$INSTANCE_IP"
echo "🔧 API URL: http://$INSTANCE_IP/api"
echo ""
echo "📝 To SSH into the server:"
echo "   ssh -i infrastructure/terraform/civil-registry-key.pem ubuntu@$INSTANCE_IP"
