#!/bin/bash

echo "Installation de l'application de gestion des états civils..."
echo "=================================================="

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js n'est pas installé. Veuillez installer Node.js v14+."
    exit 1
fi

# Vérifier MongoDB
if ! command -v mongod &> /dev/null; then
    echo "MongoDB n'est pas installé. Veuillez installer MongoDB."
    exit 1
fi

# Installer le backend
echo "Installation du backend..."
cd backend
npm install
cd ..

# Installer le frontend
echo "Installation du frontend..."
cd frontend
npm install
cd ..

echo "=================================================="
echo "Installation terminée avec succès!"
echo ""
echo "Pour démarrer l'application:"
echo "1. Démarrer MongoDB: mongod"
echo "2. Démarrer le backend: cd backend && npm run dev"
echo "3. Démarrer le frontend: cd frontend && npm start"
echo ""
echo "Accédez à l'application sur: http://localhost:3000"
