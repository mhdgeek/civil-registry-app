#!/bin/bash

# ============================================
# Script pour vérifier l'état des services AWS
# ============================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "running") echo -e "${GREEN}✅ $message${NC}" ;;
        "stopped") echo -e "${YELLOW}⏸️  $message${NC}" ;;
        "terminated") echo -e "${RED}❌ $message${NC}" ;;
        "healthy") echo -e "${GREEN}✓ $message${NC}" ;;
        "unhealthy") echo -e "${RED}✗ $message${NC}" ;;
        *) echo -e "${BLUE}ℹ️  $message${NC}" ;;
    esac
}

check_aws_auth() {
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ Non authentifié sur AWS${NC}"
        echo "Exécutez: aws configure"
        exit 1
    fi
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✅ Authentifié AWS: $AWS_ACCOUNT${NC}"
}

check_ec2_instances() {
    print_header "INSTANCES EC2"
    
    INSTANCES=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=civil-registry-app" \
        --query 'Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress,InstanceType,LaunchTime]' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$INSTANCES" ]; then
        print_status "terminated" "Aucune instance trouvée"
        return
    fi
    
    echo "$INSTANCES" | while read -r INSTANCE_ID STATE IP INSTANCE_TYPE LAUNCH_TIME; do
        case $STATE in
            "running")
                print_status "running" "Instance $INSTANCE_ID"
                echo "  IP: $IP | Type: $INSTANCE_TYPE"
                echo "  Démarrage: $LAUNCH_TIME"
                
                # Vérifier la santé de l'application
                if [ -n "$IP" ]; then
                    if curl -s -f --max-time 5 "http://$IP" > /dev/null; then
                        print_status "healthy" "  Application accessible"
                    else
                        print_status "unhealthy" "  Application non accessible"
                    fi
                fi
                ;;
            "stopped")
                print_status "stopped" "Instance $INSTANCE_ID (arrêtée)"
                echo "  Type: $INSTANCE_TYPE | Dernier démarrage: $LAUNCH_TIME"
                ;;
            *)
                print_status "terminated" "Instance $INSTANCE_ID ($STATE)"
                ;;
        esac
    done
}

check_elastic_ips() {
    print_header "ADDRESSES IP ÉLASTIQUES"
    
    EIPS=$(aws ec2 describe-addresses \
        --filters "Name=tag:Name,Values=civil-registry-eip" \
        --query 'Addresses[].[PublicIp,AssociationId,InstanceId]' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$EIPS" ]; then
        echo "Aucune IP Élastique trouvée"
        return
    fi
    
    echo "$EIPS" | while read -r IP ASSOC INSTANCE; do
        if [ "$ASSOC" != "None" ]; then
            print_status "running" "IP $IP → Instance $INSTANCE"
        else
            print_status "stopped" "IP $IP (non associée)"
        fi
    done
}

check_s3_backups() {
    print_header "BACKUPS S3"
    
    BUCKETS=$(aws s3api list-buckets \
        --query 'Buckets[?contains(Name, `civil-registry-backups`)].Name' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$BUCKETS" ]; then
        echo "Aucun bucket de backup trouvé"
        return
    fi
    
    for BUCKET in $BUCKETS; do
        SIZE=$(aws s3 ls s3://$BUCKET --recursive | awk 'BEGIN {total=0} {total+=$3} END {printf "%.2f", total/1024/1024}')
        COUNT=$(aws s3 ls s3://$BUCKET --recursive | wc -l)
        
        echo "Bucket: $BUCKET"
        echo "  Fichiers: $COUNT | Taille: ${SIZE}MB"
        
        # Dernier backup
        LAST_FILE=$(aws s3 ls s3://$BUCKET --recursive | sort | tail -1 | awk '{print $4}')
        if [ -n "$LAST_FILE" ]; then
            echo "  Dernier backup: $LAST_FILE"
        fi
    done
}

check_cloudwatch_alarms() {
    print_header "ALARMES CLOUDWATCH"
    
    ALARMS=$(aws cloudwatch describe-alarms \
        --alarm-name-prefix "civil-registry-" \
        --query 'MetricAlarms[].[AlarmName,StateValue]' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$ALARMS" ]; then
        echo "Aucune alarme trouvée"
        return
    fi
    
    echo "$ALARMS" | while read -r ALARM STATE; do
        case $STATE in
            "ALARM") echo -e "${RED}🔴 $ALARM${NC}" ;;
            "OK") echo -e "${GREEN}🟢 $ALARM${NC}" ;;
            "INSUFFICIENT_DATA") echo -e "${YELLOW}🟡 $ALARM${NC}" ;;
            *) echo "⚪ $ALARM ($STATE)" ;;
        esac
    done
}

check_costs() {
    print_header "ESTIMATION DES COÛTS"
    
    # Obtenir le premier jour du mois actuel
    START_DATE=$(date +%Y-%m-01)
    TODAY=$(date +%Y-%m-%d)
    
    echo "Période: $START_DATE à $TODAY"
    echo ""
    
    # Vérifier si Cost Explorer est activé
    if aws ce get-cost-and-usage --time-period Start=$START_DATE,End=$TODAY \
        --granularity MONTHLY --metrics "UnblendedCost" \
        --query 'ResultsByTime[0].Total.UnblendedCost.Amount' \
        --output text 2>/dev/null; then
        
        COST=$(aws ce get-cost-and-usage --time-period Start=$START_DATE,End=$TODAY \
            --granularity MONTHLY --metrics "UnblendedCost" \
            --filter '{"Dimensions": {"Key": "SERVICE", "Values": ["Amazon Elastic Compute Cloud - Compute", "AmazonEC2"]}}' \
            --query 'ResultsByTime[0].Total.UnblendedCost.Amount' \
            --output text 2>/dev/null || echo "0")
        
        echo -e "${CYAN}Coût EC2 ce mois: \$${COST}${NC}"
    else
        echo "Cost Explorer non disponible"
        echo ""
        echo -e "${YELLOW}Estimation manuelle:${NC}"
        echo "  Instance t3.micro (running): ~$0.012/heure"
        echo "  Instance t3.micro (stopped): ~$0.000/heure"
        echo "  Stockage EBS 20GB: ~$0.10/mois"
        echo "  IP Élastique: Gratuit si associée"
    fi
}

show_recommendations() {
    print_header "RECOMMANDATIONS"
    
    # Vérifier l'état des instances
    INSTANCE_STATE=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=civil-registry-app" \
        --query 'Reservations[].Instances[0].State.Name' \
        --output text 2>/dev/null || echo "none")
    
    case $INSTANCE_STATE in
        "running")
            echo -e "${GREEN}✅ Application en cours d'exécution${NC}"
            echo ""
            echo -e "${YELLOW}Pour réduire les coûts:${NC}"
            echo "  Exécutez: ./aws-stop-all.sh"
            echo "  Coût actuel: ~$0.30-0.40/jour"
            ;;
        "stopped")
            echo -e "${YELLOW}⏸️  Application arrêtée${NC}"
            echo ""
            echo -e "${GREEN}✅ Coûts minimisés${NC}"
            echo "  Coût actuel: ~$0.10/mois (stockage seulement)"
            echo ""
            echo -e "${CYAN}Pour redémarrer:${NC}"
            echo "  Exécutez: ./aws-start-all.sh"
            ;;
        "terminated"|"none")
            echo -e "${RED}❌ Aucune infrastructure trouvée${NC}"
            echo ""
            echo -e "${CYAN}Pour déployer:${NC}"
            echo "  Exécutez: ./aws-start-all.sh"
            ;;
    esac
}

main() {
    echo -e "${CYAN}"
    echo "========================================"
    echo "   ÉTAT DES SERVICES AWS"
    echo "   Application Gestion États Civils"
    echo "========================================"
    echo -e "${NC}"
    
    check_aws_auth
    check_ec2_instances
    check_elastic_ips
    check_s3_backups
    check_cloudwatch_alarms
    check_costs
    show_recommendations
    
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}   VÉRIFICATION TERMINÉE${NC}"
    echo -e "${CYAN}========================================${NC}"
}

main
