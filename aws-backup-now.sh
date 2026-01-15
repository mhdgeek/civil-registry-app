#!/bin/bash

# ============================================
# Script pour créer un backup manuel avant arrêt
# ============================================

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Création d'un backup manuel...${NC}"

# Charger la configuration
CONFIG_FILE="aws-infra-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Fichier de configuration non trouvé${NC}"
    exit 1
fi

REGION=$(jq -r '.region' "$CONFIG_FILE")
INSTANCE_NAME=$(jq -r '.instance_name' "$CONFIG_FILE")
KEY_NAME=$(jq -r '.key_name' "$CONFIG_FILE")
TERRAFORM_DIR="infrastructure/terraform"

# Trouver l'instance
INSTANCE_INFO=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=$INSTANCE_NAME" \
    --query 'Reservations[].Instances[0]' \
    --output json)

INSTANCE_ID=$(echo "$INSTANCE_INFO" | jq -r '.InstanceId // empty')
PUBLIC_IP=$(echo "$INSTANCE_INFO" | jq -r '.PublicIpAddress // empty')
STATE=$(echo "$INSTANCE_INFO" | jq -r '.State.Name // empty')

if [ -z "$INSTANCE_ID" ] || [ "$STATE" != "running" ]; then
    echo -e "${RED}❌ Instance non trouvée ou non en cours d'exécution${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Instance trouvée: $INSTANCE_ID ($PUBLIC_IP)${NC}"

# Créer le répertoire de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/manual_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Backup directory: $BACKUP_DIR"

# Backup 1: Configuration AWS
echo "💾 Sauvegarde de la configuration AWS..."
aws ec2 describe-instances --instance-ids "$INSTANCE_ID" > "$BACKUP_DIR/instance_details.json"
aws ec2 describe-volumes --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" > "$BACKUP_DIR/volumes.json"

# Backup 2: Données applicatives via SSH
SSH_KEY="$TERRAFORM_DIR/$KEY_NAME.pem"
if [ -f "$SSH_KEY" ]; then
    echo "💾 Sauvegarde des données applicatives..."
    
    # Créer un backup sur le serveur
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP << 'REMOTEBACKUP'
        echo "Création du backup sur le serveur..."
        BACKUP_FILE="/tmp/full_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        sudo tar -czf "$BACKUP_FILE" \
            /opt/civil-registry-app \
            /etc/nginx \
            /etc/systemd/system/civil-registry.service \
            /home/ubuntu/.env 2>/dev/null || true
        echo "Backup créé: $BACKUP_FILE"
        ls -lh "$BACKUP_FILE"
REMOTEBACKUP
    
    # Télécharger le backup
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
        ubuntu@$PUBLIC_IP:/tmp/full_backup_*.tar.gz "$BACKUP_DIR/" 2>/dev/null || true
fi

# Backup 3: Configuration Terraform
echo "💾 Sauvegarde de la configuration Terraform..."
cp -r "$TERRAFORM_DIR" "$BACKUP_DIR/terraform_config/" 2>/dev/null || true

# Backup 4: Fichiers locaux
echo "💾 Sauvegarde des fichiers locaux..."
cp aws-infra-config.json "$BACKUP_DIR/"
cp aws-start-all.sh "$BACKUP_DIR/"
cp aws-stop-all.sh "$BACKUP_DIR/"

# Créer un fichier récapitulatif
cat > "$BACKUP_DIR/README.txt" << READMEEOF
Backup manuel créé le: $(date)
Instance ID: $INSTANCE_ID
IP Publique: $PUBLIC_IP
État: $STATE

Contenu du backup:
1. Détails de l'instance AWS
2. Données applicatives (si disponibles)
3. Configuration Terraform
4. Scripts de déploiement

Pour restaurer:
1. Démarrer une nouvelle instance
2. Copier les fichiers de backup
3. Configurer l'application
4. Restaurer les données si nécessaire

Commande pour lister les backups:
  ls -la backups/
READMEEOF

# Calculer la taille du backup
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo -e "${GREEN}✅ Backup terminé: $BACKUP_DIR (${TOTAL_SIZE})${NC}"
echo ""
echo "📋 Résumé:"
echo "  Instance: $INSTANCE_ID"
echo "  IP: $PUBLIC_IP"
echo "  Fichiers sauvegardés: $(find "$BACKUP_DIR" -type f | wc -l)"
echo "  Taille totale: $TOTAL_SIZE"
echo ""
echo "⚠️  Important:"
echo "  Ce backup ne contient PAS la base de données MongoDB"
echo "  Sauvegardez MongoDB Atlas séparément"
echo ""
echo "Pour restaurer: consultez $BACKUP_DIR/README.txt"
