#!/bin/bash

echo "Démarrage de l'application de gestion des états civils..."
echo "=================================================="

# Démarrer MongoDB en arrière-plan
echo "Vérification de MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "Veuillez démarrer MongoDB: mongod"
    exit 1
fi

# Démarrer le backend
echo "Démarrage du backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 5

# Démarrer le frontend
echo "Démarrage du frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "=================================================="
echo "Application démarrée!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter l'application"

# Gérer l'arrêt propre
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT

wait
