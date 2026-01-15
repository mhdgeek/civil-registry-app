#!/bin/bash

set -e

echo "🚀 Déployement local..."

# Arrêter les containers existants
docker-compose -f docker-compose.dev.yml down

# Nettoyer
docker system prune -af --volumes

# Construire et démarrer
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Attente du démarrage..."
sleep 10

# Vérifier les services
echo "🏥 Vérification des services..."

if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend non démarré"
fi

if curl -s -f http://localhost:5000 > /dev/null; then
    echo "✅ Backend: http://localhost:5000"
else
    echo "❌ Backend non démarré"
fi

if docker exec civil-registry-mongodb mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "✅ MongoDB: mongodb://localhost:27017"
else
    echo "❌ MongoDB non démarré"
fi

echo ""
echo "🎉 Déploiement local terminé!"
echo ""
echo "📊 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  MongoDB: mongodb://admin:password@localhost:27017"
echo ""
echo "📝 Commandes:"
echo "  Arrêter: docker-compose -f docker-compose.dev.yml down"
echo "  Voir logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  Redémarrer: ./deploy-local.sh"
