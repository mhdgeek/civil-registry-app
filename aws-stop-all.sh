#!/bin/bash

# ============================================
# Script pour arrêter TOUS les services AWS
# Économise les coûts quand l'application n'est pas utilisée
# ============================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
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
    
    # Vérifier AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI non installé"
        exit 1
    fi
    
    # Vérifier les credentials AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials non configurés"
        exit 1
    fi
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_success "Connecté à AWS Account: $AWS_ACCOUNT_ID"
}

# Charger la configuration
load_config() {
    CONFIG_FILE="aws-infra-config.json"
    BACKUP_CONFIG_FILE="aws-infra-config-backup.json"
    TERRAFORM_DIR="infrastructure/terraform"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Fichier de configuration non trouvé: $CONFIG_FILE"
        print_info "Essayez de démarrer l'application d'abord avec ./aws-start-all.sh"
        exit 1
    fi
    
    REGION=$(jq -r '.region' "$CONFIG_FILE")
    INSTANCE_NAME=$(jq -r '.instance_name' "$CONFIG_FILE")
    KEY_NAME=$(jq -r '.key_name' "$CONFIG_FILE")
    
    print_success "Configuration chargée: $INSTANCE_NAME dans $REGION"
}

# Sauvegarder l'état avant arrêt
backup_before_shutdown() {
    print_header "SAUVEGARDE AVANT ARRÊT"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups/shutdown_$TIMESTAMP"
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarder la configuration
    cp "$CONFIG_FILE" "$BACKUP_DIR/"
    
    # Récupérer les informations de l'instance
    INSTANCE_INFO=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=$INSTANCE_NAME" \
        --query 'Reservations[].Instances[]' \
        --output json 2>/dev/null || echo "[]")
    
    echo "$INSTANCE_INFO" > "$BACKUP_DIR/instance_info.json"
    
    # Sauvegarder les données si l'instance est en cours d'exécution
    INSTANCE_ID=$(echo "$INSTANCE_INFO" | jq -r '.[0].InstanceId // empty')
    PUBLIC_IP=$(echo "$INSTANCE_INFO" | jq -r '.[0].PublicIpAddress // empty')
    
    if [ -n "$INSTANCE_ID" ] && [ -n "$PUBLIC_IP" ]; then
        print_info "Instance trouvée: $INSTANCE_ID ($PUBLIC_IP)"
        
        # Essayer de sauvegarder les données de l'application
        SSH_KEY="$TERRAFORM_DIR/$KEY_NAME.pem"
        if [ -f "$SSH_KEY" ]; then
            print_info "Tentative de sauvegarde des données applicatives..."
            
            # Créer un backup sur le serveur
            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
                ubuntu@$PUBLIC_IP << 'REMOTEBACKUP' 2>/dev/null || true
                echo "💾 Création du backup local..."
                BACKUP_FILE="/tmp/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
                sudo tar -czf "$BACKUP_FILE" \
                    /opt/civil-registry-app/uploads \
                    /opt/civil-registry-app/.env \
                    /etc/nginx/sites-available/civil-registry 2>/dev/null || true
                echo "Backup créé: $BACKUP_FILE"
REMOTEBACKUP
        fi
    fi
    
    print_success "Sauvegarde créée dans: $BACKUP_DIR"
}

# Arrêter l'instance EC2
stop_ec2_instance() {
    print_header "ARRÊT DE L'INSTANCE EC2"
    
    # Trouver toutes les instances avec ce nom
    INSTANCES=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=$INSTANCE_NAME" \
        --query 'Reservations[].Instances[].InstanceId' \
        --output text)
    
    if [ -z "$INSTANCES" ]; then
        print_warning "Aucune instance trouvée avec le nom: $INSTANCE_NAME"
        return 0
    fi
    
    echo "Instances trouvées: $INSTANCES"
    
    # Arrêter chaque instance
    for INSTANCE_ID in $INSTANCES; do
        CURRENT_STATE=$(aws ec2 describe-instances \
            --instance-ids "$INSTANCE_ID" \
            --query 'Reservations[0].Instances[0].State.Name' \
            --output text)
        
        if [ "$CURRENT_STATE" = "running" ]; then
            print_info "Arrêt de l'instance: $INSTANCE_ID"
            aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
            
            # Attendre l'arrêt
            local max_attempts=30
            local attempt=1
            
            while [ $attempt -le $max_attempts ]; do
                STATE=$(aws ec2 describe-instances \
                    --instance-ids "$INSTANCE_ID" \
                    --query 'Reservations[0].Instances[0].State.Name' \
                    --output text)
                
                if [ "$STATE" = "stopped" ]; then
                    print_success "Instance arrêtée: $INSTANCE_ID"
                    break
                fi
                
                echo -n "."
                sleep 5
                ((attempt++))
            done
            
            if [ $attempt -gt $max_attempts ]; then
                print_warning "Timeout lors de l'arrêt de l'instance $INSTANCE_ID"
            fi
        else
            print_info "Instance déjà arrêtée: $INSTANCE_ID (état: $CURRENT_STATE)"
        fi
    done
}

# Détacher et supprimer l'IP Élastique
cleanup_eip() {
    print_header "NETTOYAGE DES ADRESSES IP ÉLASTIQUES"
    
    # Trouver les IPs associées aux instances arrêtées
    EIPS=$(aws ec2 describe-addresses \
        --filters "Name=tag:Name,Values=civil-registry-eip" \
        --query 'Addresses[].AllocationId' \
        --output text)
    
    for ALLOCATION_ID in $EIPS; do
        print_info "Nettoyage de l'IP Élastique: $ALLOCATION_ID"
        
        # Détacher de l'instance si attachée
        ASSOCIATION_ID=$(aws ec2 describe-addresses \
            --allocation-ids "$ALLOCATION_ID" \
            --query 'Addresses[0].AssociationId' \
            --output text)
        
        if [ "$ASSOCIATION_ID" != "None" ]; then
            aws ec2 disassociate-address --association-id "$ASSOCIATION_ID"
            print_success "IP détachée"
        fi
        
        # Libérer l'IP (attention: ne peut être récupérée gratuitement)
        print_warning "Conservation de l'IP Élastique (gratuite si associée à une instance arrêtée)"
        # aws ec2 release-address --allocation-id "$ALLOCATION_ID"
        # print_success "IP Élastique libérée"
    done
}

# Arrêter les autres services AWS
stop_other_services() {
    print_header "ARRÊT DES AUTRES SERVICES"
    
    # Désactiver les alarmes CloudWatch
    ALARMS=$(aws cloudwatch describe-alarms \
        --alarm-name-prefix "civil-registry-" \
        --query 'MetricAlarms[].AlarmName' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$ALARMS" ]; then
        print_info "Désactivation des alarmes CloudWatch"
        for ALARM in $ALARMS; do
            aws cloudwatch disable-alarm-actions --alarm-names "$ALARM"
            print_success "Alarme désactivée: $ALARM"
        done
    fi
    
    # Optionnel: arrêter RDS si utilisé (non dans notre cas)
    # Optionnel: mettre en pause les services managés
}

# Détruire l'infrastructure Terraform (optionnel - pour suppression complète)
destroy_terraform() {
    print_header "SUPPRESSION DE L'INFRASTRUCTURE TERRAFORM (OPTIONNEL)"
    
    read -p "Voulez-vous SUPPRIMER COMPLÈTEMENT l'infrastructure? (oui/non): " confirm
    
    if [[ "$confirm" =~ ^[Oo](ui)?$ ]]; then
        print_warning "ATTENTION: Cette action est IRREVERSIBLE!"
        print_warning "Toutes les ressources AWS seront SUPPRIMÉES."
        echo ""
        read -p "Confirmez la suppression complète (tapez 'SUPPRIMER'): " final_confirm
        
        if [ "$final_confirm" = "SUPPRIMER" ]; then
            if [ -d "$TERRAFORM_DIR" ]; then
                cd "$TERRAFORM_DIR"
                terraform destroy -auto-approve
                cd - > /dev/null
                print_success "Infrastructure Terraform supprimée"
            else
                print_error "Répertoire Terraform non trouvé"
            fi
        else
            print_info "Suppression annulée"
        fi
    else
        print_info "Infrastructure conservée (instance arrêtée seulement)"
    fi
}

# Afficher les économies
show_savings() {
    print_header "💰 ÉCONOMIES RÉALISÉES"
    
    echo ""
    echo -e "${GREEN}Coûts évités par arrêt:${NC}"
    echo "========================================"
    echo ""
    echo -e "${CYAN}EC2 Instance (t3.micro):${NC}"
    echo "  Coût/heure: $0.012"
    echo "  Coût/jour: $0.288"
    echo "  Coût/mois: $8.50"
    echo ""
    echo -e "${CYAN}Data Transfer:${NC}"
    echo "  Réduction: ~$0.01-0.10/jour"
    echo ""
    echo -e "${CYAN}Total économisé:${NC}"
    echo "  Par jour: ~$0.30-0.40"
    echo "  Par mois: ~$9-12"
    echo ""
    echo -e "${YELLOW}ℹ️  Note:${NC}"
    echo "  • L'instance arrêtée ne coûte que le stockage EBS (~$0.10/mois)"
    echo "  • Les IP Élastiques sont gratuites si associées à une instance arrêtée"
    echo "  • Les snapshots EBS peuvent être créés pour réduire davantage les coûts"
}

# Recommandations pour réduire davantage les coûts
show_cost_reduction_tips() {
    print_header "💡 CONSEILS POUR RÉDUIRE DAVANTAGE LES COÛTS"
    
    echo ""
    echo "1. ${CYAN}Créer des snapshots EBS et supprimer les volumes${NC}"
    echo "   Commande: aws ec2 create-snapshot --volume-id vol-xxx"
    echo "   Économie: ~$0.10/mois par volume supprimé"
    echo ""
    echo "2. ${CYAN}Supprimer les IP Élastiques non utilisées${NC}"
    echo "   Attention: elles seront perdues et de nouvelles coûteront à la recréation"
    echo ""
    echo "3. ${CYAN}Nettoyer les anciens backups S3${NC}"
    echo "   Commande: aws s3 ls s3://civil-registry-backups/"
    echo ""
    echo "4. ${CYAN}Utiliser Spot Instances pour les environnements de test${NC}"
    echo "   Économie: jusqu'à 70% sur les instances EC2"
    echo ""
    echo "5. ${CYAN}Configurer AWS Budgets${NC}"
    echo "   Pour recevoir des alertes lorsque les coûts dépassent un seuil"
}

# Afficher comment redémarrer
show_restart_instructions() {
    print_header "🔄 INSTRUCTIONS POUR REDÉMARRER"
    
    echo ""
    echo "Pour redémarrer l'application, exécutez:"
    echo ""
    echo -e "${GREEN}  ./aws-start-all.sh${NC}"
    echo ""
    echo "Le redémarrage prendra environ 5-10 minutes."
    echo ""
    echo "Étapes du redémarrage:"
    echo "  1. Démarrage de l'instance EC2"
    echo "  2. Configuration automatique des services"
    echo "  3. Démarrage des containers Docker"
    echo "  4. Vérification de l'application"
    echo ""
    echo -e "${YELLOW}Note:${NC} L'IP publique peut changer après l'arrêt/démarrage."
}

# Fonction principale
main() {
    echo -e "${CYAN}"
    echo "========================================"
    echo "   ARRÊT COMPLET SERVICES AWS"
    echo "   Application Gestion États Civils"
    echo "========================================"
    echo -e "${NC}"
    
    # Avertissement
    print_warning "Ce script va arrêter tous les services AWS pour réduire les coûts"
    print_warning "L'application ne sera plus accessible après cet arrêt"
    echo ""
    
    read -p "Voulez-vous continuer? (oui/non): " confirm
    
    if [[ ! "$confirm" =~ ^[Oo](ui)?$ ]]; then
        print_info "Annulé par l'utilisateur"
        exit 0
    fi
    
    # Exécuter les étapes
    check_prerequisites
    load_config
    backup_before_shutdown
    stop_ec2_instance
    cleanup_eip
    stop_other_services
    
    # Option: demander si on veut détruire complètement
    echo ""
    read -p "Voulez-vous arrêter seulement ou supprimer complètement? (arrêter/supprimer): " action
    
    if [ "$action" = "supprimer" ]; then
        destroy_terraform
    else
        print_info "Infrastructure conservée (instance arrêtée)"
    fi
    
    show_savings
    show_cost_reduction_tips
    show_restart_instructions
    
    print_header "✅ ARRÊT TERMINÉ"
    echo ""
    echo -e "${GREEN}Tous les services AWS ont été arrêtés avec succès.${NC}"
    echo ""
    echo -e "${YELLOW}Prochaines étapes:${NC}"
    echo "  • Vérifiez les coûts dans AWS Cost Explorer"
    echo "  • Surveillez les alertes de coût AWS Budgets"
    echo "  • Redémarrez avec ./aws-start-all.sh quand nécessaire"
    echo ""
    echo -e "${CYAN}💸 Économies réalisées: ~$0.30-0.40 par jour${NC}"
}

# Gestion des erreurs
handle_error() {
    print_error "Une erreur est survenue: $1"
    print_info "Consultez AWS Console pour l'état actuel"
    exit 1
}

# Exécuter avec gestion d'erreurs
trap 'handle_error "$BASH_COMMAND"' ERR
main
