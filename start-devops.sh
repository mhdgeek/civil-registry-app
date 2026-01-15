#!/bin/bash

echo "🚀 Script de déploiement DevOps complet"
echo "========================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifications
echo "🔍 Vérifications pré-déploiement..."

# Vérifier Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${YELLOW}⚠️  Terraform non installé${NC}"
    echo "Installation: brew install terraform"
    exit 1
fi

# Vérifier AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS CLI non installé${NC}"
    echo "Installation: brew install awscli"
    exit 1
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker non installé${NC}"
    echo "Installation: brew install docker"
    exit 1
fi

echo -e "${GREEN}✅ Toutes les dépendances sont installées${NC}"

# Menu
echo ""
echo "📋 Menu de déploiement:"
echo "1. Déployer localement avec Docker"
echo "2. Initialiser l'infrastructure AWS"
echo "3. Déployer sur AWS"
echo "4. Tester le déploiement"
echo "5. Nettoyer"
echo ""

read -p "Choisissez une option (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Déploiement local...${NC}"
        ./deploy-local.sh
        ;;
    2)
        echo -e "${BLUE}🔧 Initialisation Terraform...${NC}"
        ./terraform-init.sh
        ;;
    3)
        echo -e "${BLUE}☁️  Déploiement AWS...${NC}"
        
        # Demander confirmation
        echo -e "${YELLOW}⚠️  Ceci va créer des ressources AWS (coût estimé: ~$10-15/mois)${NC}"
        read -p "Continuer? (y/n): " confirm
        
        if [[ $confirm == "y" || $confirm == "Y" ]]; then
            cd infrastructure/terraform
            terraform apply
            cd ../..
            ./infrastructure/scripts/deploy.sh
        else
            echo "Annulé"
        fi
        ;;
    4)
        echo -e "${BLUE}🧪 Tests de déploiement...${NC}"
        ./infrastructure/scripts/smoke-test.sh
        ;;
    5)
        echo -e "${BLUE}🧹 Nettoyage...${NC}"
        
        # Arrêter les containers locaux
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        
        # Nettoyer Docker
        docker system prune -af --volumes
        
        echo -e "${GREEN}✅ Nettoyage terminé${NC}"
        ;;
    *)
        echo -e "${RED}❌ Option invalide${NC}"
        ;;
esac

echo ""
echo "📚 Documentation:"
echo "  - README-DEVOPS.md pour les instructions détaillées"
echo "  - Coût estimé: ~$10-15/mois sur AWS"
echo "  - Architecture: EC2 t3.micro + MongoDB Atlas gratuit"
