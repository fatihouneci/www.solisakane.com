#!/bin/bash

# Script de déploiement en staging pour Solisakane.com
# Usage: ./deploy-staging.sh

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Déploiement de Solisakane.com en STAGING"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
print_status "Vérification des prérequis..."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

print_success "Docker et Docker Compose sont installés"

# Vérifier les fichiers nécessaires
if [ ! -f "docker-compose.staging.yml" ]; then
    print_error "Fichier docker-compose.staging.yml manquant"
    exit 1
fi

if [ ! -f "nginx/nginx.staging.conf" ]; then
    print_error "Fichier nginx/nginx.staging.conf manquant"
    exit 1
fi

print_success "Fichiers de configuration présents"

# Arrêter les conteneurs existants
print_status "Arrêt des conteneurs existants..."
docker-compose -f docker-compose.staging.yml down --remove-orphans || true

# Nettoyer les images non utilisées
print_status "Nettoyage des images Docker..."
docker system prune -f

# Construire et démarrer les services
print_status "Construction et démarrage des services..."
docker-compose -f docker-compose.staging.yml up --build -d

# Attendre que les services soient prêts
print_status "Attente du démarrage des services..."
sleep 30

# Vérifier l'état des conteneurs
print_status "Vérification de l'état des conteneurs..."
docker-compose -f docker-compose.staging.yml ps

# Vérifier la santé des services
print_status "Vérification de la santé des services..."

# Vérifier MongoDB
if docker-compose -f docker-compose.staging.yml exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB est opérationnel"
else
    print_warning "MongoDB pourrait ne pas être prêt"
fi

# Vérifier Redis
if docker-compose -f docker-compose.staging.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis est opérationnel"
else
    print_warning "Redis pourrait ne pas être prêt"
fi

# Vérifier l'API
if curl -f http://localhost:5100/api/health > /dev/null 2>&1; then
    print_success "API est opérationnelle"
else
    print_warning "API pourrait ne pas être prête"
fi

# Vérifier le frontend
if curl -f http://localhost:3016 > /dev/null 2>&1; then
    print_success "Frontend est opérationnel"
else
    print_warning "Frontend pourrait ne pas être prêt"
fi

# Afficher les informations de connexion
echo ""
echo "🎉 Déploiement en staging terminé !"
echo "=================================="
echo ""
echo "📱 Frontend: http://localhost:3016"
echo "🔌 API: http://localhost:5100"
echo "🗄️  MongoDB: localhost:27017"
echo "📦 Redis: localhost:6379"
echo ""
echo "📊 Commandes utiles:"
echo "  - Voir les logs: docker-compose -f docker-compose.staging.yml logs -f"
echo "  - Arrêter: docker-compose -f docker-compose.staging.yml down"
echo "  - Redémarrer: docker-compose -f docker-compose.staging.yml restart"
echo "  - État des conteneurs: docker-compose -f docker-compose.staging.yml ps"
echo ""
echo "🔍 Tests recommandés:"
echo "  1. Ouvrir http://localhost:3016 dans votre navigateur"
echo "  2. Tester l'inscription/connexion"
echo "  3. Tester les fonctionnalités de chat"
echo "  4. Vérifier les appels vidéo/audio"
echo ""

print_success "Déploiement en staging réussi ! 🚀"
