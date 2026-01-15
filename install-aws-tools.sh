#!/bin/bash

echo "🔧 Installation des outils AWS..."

# Vérifier Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 Installation de Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Mettre à jour Homebrew
echo "🔄 Mise à jour de Homebrew..."
brew update

# Installer AWS CLI
echo "☁️  Installation d'AWS CLI..."
brew install awscli

# Installer Terraform
echo "🏗️  Installation de Terraform..."
brew install terraform

# Installer jq pour JSON
echo "📝 Installation de jq..."
brew install jq

# Installer curl
echo "🌐 Installation de curl..."
brew install curl

# Installer netcat pour les tests réseau
echo "🔌 Installation de netcat..."
brew install netcat

# Configurer AWS (optionnel)
echo ""
echo "🔐 Configuration AWS (optionnel):"
echo "  Exécutez: aws configure"
echo "  Entrez vos informations:"
echo "    - AWS Access Key ID"
echo "    - AWS Secret Access Key"
echo "    - Default region: us-east-1"
echo "    - Default output format: json"

# Tester les installations
echo ""
echo "🧪 Tests des installations..."
echo -n "AWS CLI: "
aws --version 2>/dev/null && echo "✅" || echo "❌"
echo -n "Terraform: "
terraform --version 2>/dev/null && echo "✅" || echo "❌"
echo -n "jq: "
jq --version 2>/dev/null && echo "✅" || echo "❌"

echo ""
echo "🎉 Installation terminée!"
echo ""
echo "📋 Scripts disponibles:"
echo "  ./aws-start-all.sh    - Démarrer tous les services"
echo "  ./aws-stop-all.sh     - Arrêter tous les services"
echo "  ./aws-status.sh       - Vérifier l'état"
echo "  ./aws-backup-now.sh   - Créer un backup"
echo ""
echo "💰 Conseil: Configurez AWS Budgets pour surveiller les coûts!"
