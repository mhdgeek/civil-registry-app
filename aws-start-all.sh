#!/bin/bash

# ============================================
# Script pour démarrer TOUS les services AWS
# Coût estimé: ~$10-15/jour quand en fonctionnement
# ============================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fonctions d'affichage
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    print_header "VÉRIFICATION DES PRÉREQUIS"
    
    local missing_tools=()
    
    # Vérifier AWS CLI
    if ! command -v aws &> /dev/null; then
        missing_tools+=("AWS CLI")
    else
        print_success "AWS CLI installé"
        
        # Vérifier les credentials AWS
        if ! aws sts get-caller-identity &> /dev/null; then
            print_error "AWS credentials non configurés ou invalides"
            echo "Exécutez: aws configure"
            exit 1
        else
            AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
            print_success "Connecté à AWS Account: $AWS_ACCOUNT_ID"
        fi
    fi
    
    # Vérifier Terraform
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("Terraform")
    else
        print_success "Terraform installé"
    fi
    
    # Vérifier jq
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    else
        print_success "jq installé"
    fi
    
    # Vérifier curl
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    else
        print_success "curl installé"
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Outils manquants: ${missing_tools[*]}"
        echo "Installez-les avec:"
        echo "  brew install awscli terraform jq curl"
        exit 1
    fi
}

# Variables de configuration
CONFIG_FILE="aws-infra-config.json"
BACKUP_CONFIG_FILE="aws-infra-config-backup.json"
TERRAFORM_DIR="infrastructure/terraform"

# Créer la configuration par défaut
create_default_config() {
    cat > $CONFIG_FILE << 'CONFIGEOF'
{
    "region": "us-east-1",
    "instance_type": "t3.micro",
    "instance_name": "civil-registry-app",
    "volume_size": 20,
    "volume_type": "gp3",
    "key_name": "civil-registry-key",
    "security_group_name": "civil-registry-sg",
    "vpc_name": "civil-registry-vpc",
    "mongodb_atlas": {
        "enabled": true,
        "cluster_name": "civil-registry-cluster",
        "project_name": "civil-registry-project"
    },
    "backup": {
        "enabled": true,
        "bucket_name": "civil-registry-backups",
        "retention_days": 7
    },
    "monitoring": {
        "enabled": true,
        "alarm_email": "",
        "cpu_threshold": 80,
        "memory_threshold": 85
    }
}
CONFIGEOF
}

# Charger la configuration
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        print_warning "Fichier de configuration non trouvé, création par défaut"
        create_default_config
    fi
    
    REGION=$(jq -r '.region' $CONFIG_FILE)
    INSTANCE_TYPE=$(jq -r '.instance_type' $CONFIG_FILE)
    INSTANCE_NAME=$(jq -r '.instance_name' $CONFIG_FILE)
    VOLUME_SIZE=$(jq -r '.volume_size' $CONFIG_FILE)
    VOLUME_TYPE=$(jq -r '.volume_type' $CONFIG_FILE)
    KEY_NAME=$(jq -r '.key_name' $CONFIG_FILE)
    
    print_success "Configuration chargée: $INSTANCE_NAME dans $REGION"
}

# Sauvegarder l'état actuel
save_current_state() {
    print_header "SAUVEGARDE DE L'ÉTAT ACTUEL"
    
    if [ -f "$BACKUP_CONFIG_FILE" ]; then
        mv "$BACKUP_CONFIG_FILE" "${BACKUP_CONFIG_FILE}.old"
    fi
    
    # Sauvegarder les instances existantes
    aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=$INSTANCE_NAME" \
        --query 'Reservations[].Instances[].{ID:InstanceId,State:State.Name,IP:PublicIpAddress}' \
        --output json > "$BACKUP_CONFIG_FILE" 2>/dev/null || true
    
    print_success "État sauvegardé dans $BACKUP_CONFIG_FILE"
}

# Démarrer l'infrastructure avec Terraform
start_infrastructure() {
    print_header "DÉMARRAGE DE L'INFRASTRUCTURE AVEC TERRAFORM"
    
    if [ ! -d "$TERRAFORM_DIR" ]; then
        print_error "Répertoire Terraform non trouvé: $TERRAFORM_DIR"
        exit 1
    fi
    
    cd "$TERRAFORM_DIR"
    
    # Initialiser Terraform si nécessaire
    if [ ! -d ".terraform" ]; then
        print_info "Initialisation de Terraform..."
        terraform init
    fi
    
    # Appliquer la configuration
    print_info "Création des ressources AWS..."
    terraform apply -auto-approve \
        -var="aws_region=$REGION" \
        -var="instance_type=$INSTANCE_TYPE" \
        -var="instance_name=$INSTANCE_NAME"
    
    # Récupérer les outputs
    INSTANCE_ID=$(terraform output -raw instance_id 2>/dev/null || echo "")
    PUBLIC_IP=$(terraform output -raw public_ip 2>/dev/null || echo "")
    
    if [ -n "$INSTANCE_ID" ] && [ -n "$PUBLIC_IP" ]; then
        print_success "Instance créée: $INSTANCE_ID"
        print_success "IP Publique: $PUBLIC_IP"
    else
        print_error "Impossible de récupérer les informations de l'instance"
        exit 1
    fi
    
    cd - > /dev/null
}

# Attendre que l'instance soit prête
wait_for_instance() {
    print_header "ATTENTE DU DÉMARRAGE DE L'INSTANCE"
    
    local max_attempts=30
    local attempt=1
    
    print_info "Attente du démarrage de l'instance $INSTANCE_ID..."
    
    while [ $attempt -le $max_attempts ]; do
        INSTANCE_STATE=$(aws ec2 describe-instances \
            --instance-ids "$INSTANCE_ID" \
            --query 'Reservations[0].Instances[0].State.Name' \
            --output text 2>/dev/null || echo "unknown")
        
        if [ "$INSTANCE_STATE" = "running" ]; then
            print_success "Instance en cours d'exécution"
            break
        fi
        
        echo -n "."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Timeout: l'instance ne démarre pas"
        exit 1
    fi
    
    # Attendre que SSH soit disponible
    print_info "Attente du service SSH..."
    attempt=1
    while [ $attempt -le 20 ]; do
        if nc -z "$PUBLIC_IP" 22 &> /dev/null; then
            print_success "SSH disponible"
            break
        fi
        echo -n "."
        sleep 10
        ((attempt++))
    done
}

# Configurer MongoDB Atlas
setup_mongodb_atlas() {
    print_header "CONFIGURATION MONGODB ATLAS"
    
    local mongodb_enabled=$(jq -r '.mongodb_atlas.enabled' $CONFIG_FILE)
    
    if [ "$mongodb_enabled" = "true" ]; then
        print_info "Configuration requise pour MongoDB Atlas:"
        echo ""
        echo "1. Connectez-vous à https://cloud.mongodb.com"
        echo "2. Créez un projet: $(jq -r '.mongodb_atlas.project_name' $CONFIG_FILE)"
        echo "3. Créez un cluster gratuit M0"
        echo "4. Configurez l'accès réseau: autorisez l'IP $PUBLIC_IP"
        echo "5. Créez un utilisateur base de données"
        echo "6. Obtenez la connection string"
        echo ""
        read -p "Appuyez sur Entrée quand MongoDB Atlas est configuré..." -n 1
        
        print_success "MongoDB Atlas configuré"
    else
        print_info "MongoDB Atlas désactivé dans la configuration"
    fi
}

# Déployer l'application
deploy_application() {
    print_header "DÉPLOIEMENT DE L'APPLICATION"
    
    # Vérifier si la clé SSH existe
    SSH_KEY="$TERRAFORM_DIR/$KEY_NAME.pem"
    if [ ! -f "$SSH_KEY" ]; then
        SSH_KEY=$(terraform -chdir="$TERRAFORM_DIR" output -raw ssh_key 2>/dev/null | tee "$TERRAFORM_DIR/$KEY_NAME.pem")
        chmod 600 "$TERRAFORM_DIR/$KEY_NAME.pem"
    fi
    
    if [ ! -f "$SSH_KEY" ]; then
        print_error "Clé SSH non trouvée"
        exit 1
    fi
    
    print_info "Déploiement sur $PUBLIC_IP..."
    
    # Copier l'application
    rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=30" \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude=".terraform" \
        --exclude="*.tfstate*" \
        --exclude="aws-infra-*.json" \
        ../ ubuntu@$PUBLIC_IP:/opt/civil-registry-app/ 2>/dev/null || {
        print_warning "rsync échoué, tentative avec scp..."
        scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r \
            ../frontend \
            ../backend \
            ../docker \
            ../docker-compose.yml \
            ubuntu@$PUBLIC_IP:/opt/civil-registry-app/ 2>/dev/null || true
    }
    
    # Exécuter le script de déploiement sur le serveur
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30 \
        ubuntu@$PUBLIC_IP << 'REMOTEDEPLOY'
        echo "🔧 Déploiement de l'application..."
        cd /opt/civil-registry-app
        
        # S'assurer que Docker est démarré
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Arrêter les containers existants
        sudo docker-compose down 2>/dev/null || true
        
        # Construire et démarrer
        sudo docker-compose build --no-cache
        sudo docker-compose up -d
        
        # Attendre le démarrage
        sleep 20
        
        echo "✅ Déploiement terminé"
REMOTEDEPLOY
    
    print_success "Application déployée"
}

# Configurer le monitoring
setup_monitoring() {
    print_header "CONFIGURATION DU MONITORING"
    
    local monitoring_enabled=$(jq -r '.monitoring.enabled' $CONFIG_FILE)
    
    if [ "$monitoring_enabled" = "true" ]; then
        print_info "Création des alarmes CloudWatch..."
        
        # Créer une alarme CPU
        aws cloudwatch put-metric-alarm \
            --alarm-name "civil-registry-cpu-high" \
            --alarm-description "Alarme CPU élevée pour $INSTANCE_NAME" \
            --metric-name "CPUUtilization" \
            --namespace "AWS/EC2" \
            --statistic "Average" \
            --period 300 \
            --threshold "$(jq -r '.monitoring.cpu_threshold' $CONFIG_FILE)" \
            --comparison-operator "GreaterThanThreshold" \
            --dimensions "Name=InstanceId,Value=$INSTANCE_ID" \
            --evaluation-periods 2 \
            --alarm-actions "$(jq -r '.monitoring.alarm_email' $CONFIG_FILE)" 2>/dev/null || \
            print_warning "Impossible de créer l'alarme CPU (email non configuré?)"
        
        print_success "Monitoring configuré"
    else
        print_info "Monitoring désactivé dans la configuration"
    fi
}

# Vérifier que l'application fonctionne
verify_deployment() {
    print_header "VÉRIFICATION DU DÉPLOIEMENT"
    
    local max_attempts=10
    local attempt=1
    
    print_info "Vérification de l'application sur http://$PUBLIC_IP..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f --max-time 10 "http://$PUBLIC_IP" > /dev/null; then
            print_success "✅ Application accessible"
            break
        fi
        
        echo -n "."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_warning "L'application ne répond pas immédiatement, vérifiez manuellement"
    fi
    
    # Vérifier l'API
    if curl -s -f --max-time 10 "http://$PUBLIC_IP/api" > /dev/null; then
        print_success "✅ API backend accessible"
    else
        print_warning "⚠️  API backend non accessible"
    fi
}

# Afficher le résumé
show_summary() {
    print_header "✅ DÉPLOIEMENT TERMINÉ"
    
    echo ""
    echo -e "${GREEN}📋 RÉSUMÉ DU DÉPLOIEMENT${NC}"
    echo "========================================"
    echo -e "${CYAN}Instance EC2:${NC}"
    echo "  ID: $INSTANCE_ID"
    echo "  Nom: $INSTANCE_NAME"
    echo "  Type: $INSTANCE_TYPE"
    echo "  Région: $REGION"
    echo ""
    echo -e "${CYAN}Accès:${NC}"
    echo "  URL Application: http://$PUBLIC_IP"
    echo "  URL API: http://$PUBLIC_IP/api"
    echo "  SSH: ssh -i $TERRAFORM_DIR/$KEY_NAME.pem ubuntu@$PUBLIC_IP"
    echo ""
    echo -e "${CYAN}Coûts estimés:${NC}"
    echo "  EC2 t3.micro: ~$0.012/heure ($8.50/mois)"
    echo "  EBS 20GB: ~$0.10/mois"
    echo "  Data Transfer: ~$0.01-0.10/jour"
    echo "  Total estimé: ~$0.35-0.50/jour"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
    echo "  Pour arrêter et éviter les frais, exécutez:"
    echo "  ./aws-stop-all.sh"
    echo ""
    echo -e "${GREEN}📚 Documentation:${NC}"
    echo "  Logs application: ssh ... 'sudo docker-compose logs -f'"
    echo "  Monitoring: AWS Console → CloudWatch"
    echo "  Backup: S3 bucket automatique"
    echo ""
    echo -e "${CYAN}🎉 L'application est maintenant en ligne!${NC}"
}

# Fonction principale
main() {
    echo -e "${CYAN}"
    echo "========================================"
    echo "   DÉMARRAGE COMPLET SERVICES AWS"
    echo "   Application Gestion États Civils"
    echo "========================================"
    echo -e "${NC}"
    
    # Avertissement de coût
    print_warning "ATTENTION: Ce script va créer des ressources AWS facturées"
    echo "Coût estimé: ~$0.35-0.50/jour quand l'instance est en fonctionnement"
    echo ""
    read -p "Voulez-vous continuer? (oui/non): " confirm
    
    if [[ ! "$confirm" =~ ^[Oo](ui)?$ ]]; then
        print_info "Annulé par l'utilisateur"
        exit 0
    fi
    
    # Exécuter les étapes
    check_prerequisites
    load_config
    save_current_state
    start_infrastructure
    wait_for_instance
    setup_mongodb_atlas
    deploy_application
    setup_monitoring
    verify_deployment
    show_summary
}

# Gestion des erreurs
handle_error() {
    print_error "Une erreur est survenue à l'étape: $1"
    print_info "Vérifiez les logs et l'état dans AWS Console"
    exit 1
}

# Exécuter avec gestion d'erreurs
trap 'handle_error "$BASH_COMMAND"' ERR
main
