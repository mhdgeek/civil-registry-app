#!/bin/bash

echo "📦 Installation complète avec tous les types d'actes..."
echo "======================================================"

# Backend
echo "🔧 Installation du backend..."
cd backend
npm install
cd ..

# Frontend
echo "🎨 Installation du frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Installation terminée!"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "1. 📊 Démarrer MongoDB: mongod"
echo "2. 🔧 Démarrer le backend: cd backend && npm run dev"
echo "3. 🎨 Démarrer le frontend: cd frontend && npm start"
echo ""
echo "🌐 Accès:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
