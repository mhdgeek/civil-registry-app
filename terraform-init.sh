#!/bin/bash

set -e

echo "🔧 Initialisation Terraform..."

cd infrastructure/terraform

# Initialiser Terraform
terraform init

# Formatter le code
terraform fmt

# Valider la configuration
terraform validate

echo ""
echo "📋 Plan de déploiement:"
echo "  Région AWS: us-east-1 (la moins chère)"
echo "  Instance: t3.micro (~$8.50/mois)"
echo "  Stockage: 20GB EBS gp3"
echo "  IP Élastique: Gratuite avec l'instance"
echo "  Coût estimé: ~$10-15/mois"
echo ""
echo "🔍 Pour voir le plan:"
echo "  terraform plan"
echo ""
echo "🚀 Pour déployer:"
echo "  terraform apply"
echo ""
echo "💾 Pour détruire:"
echo "  terraform destroy"
