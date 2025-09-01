#!/bin/bash

# Script de déploiement en production pour Solisakane.com
# Usage: ./deploy-production.sh

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Déploiement de Solisakane.com en PRODUCTION"
echo "==============================================="

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

# Vérifier les fichiers de configuration
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "Fichier docker-compose.production.yml manquant"
    exit 1
fi

if [ ! -f "nginx/nginx.production.conf" ]; then
    print_error "Fichier nginx/nginx.production.conf manquant"
    exit 1
fi

# Vérifier les variables d'environnement
if [ ! -f ".env.production" ]; then
    print_warning "Fichier .env.production manquant. Utilisation de env.production.example"
    if [ -f "env.production.example" ]; then
        cp env.production.example .env.production
        print_warning "Veuillez configurer .env.production avec vos vraies valeurs"
    else
        print_error "Aucun fichier de configuration d'environnement trouvé"
        exit 1
    fi
fi

print_success "Prérequis vérifiés"

# Confirmation de déploiement
echo ""
print_warning "⚠️  ATTENTION: Vous êtes sur le point de déployer en PRODUCTION"
print_warning "Cela va affecter l'application en direct pour tous les utilisateurs"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " -r
if [[ ! $REPLY =~ ^[Oo]ui$ ]]; then
    print_error "Déploiement annulé"
    exit 1
fi

# Arrêter les conteneurs existants
print_status "Arrêt des conteneurs existants..."
docker-compose -f docker-compose.production.yml down --remove-orphans || true

# Nettoyer les images non utilisées
print_status "Nettoyage des images Docker..."
docker system prune -f

# Construire et démarrer les services
print_status "Construction et démarrage des services en production..."
docker-compose -f docker-compose.production.yml up --build -d

# Attendre que les services soient prêts
print_status "Attente du démarrage des services..."
sleep 60

# Vérifier l'état des conteneurs
print_status "Vérification de l'état des conteneurs..."
docker-compose -f docker-compose.production.yml ps

# Vérifier la santé des services
print_status "Vérification de la santé des services..."

# Vérifier MongoDB
if docker-compose -f docker-compose.production.yml exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB est opérationnel"
else
    print_warning "MongoDB pourrait ne pas être prêt"
fi

# Vérifier Redis
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis est opérationnel"
else
    print_warning "Redis pourrait ne pas être prêt"
fi

# Vérifier l'API
if curl -f https://solisakane.com/api/auth/me > /dev/null 2>&1; then
    print_success "API est opérationnelle"
else
    print_warning "API pourrait ne pas être prête"
fi

# Vérifier le frontend
if curl -f https://solisakane.com > /dev/null 2>&1; then
    print_success "Frontend est opérationnel"
else
    print_warning "Frontend pourrait ne pas être prêt"
fi

# Afficher les informations de connexion
echo ""
echo "🎉 Déploiement en production terminé !"
echo "====================================="
echo ""
echo "🌐 Application: https://solisakane.com"
echo "🔌 API: https://solisakane.com/api"
echo "🗄️  MongoDB: localhost:27017"
echo "📦 Redis: localhost:6379"
echo ""
echo "📊 Commandes utiles:"
echo "  - Voir les logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  - Arrêter: docker-compose -f docker-compose.production.yml down"
echo "  - Redémarrer: docker-compose -f docker-compose.production.yml restart"
echo "  - État des conteneurs: docker-compose -f docker-compose.production.yml ps"
echo ""
echo "🔍 Tests recommandés:"
echo "  1. Ouvrir https://solisakane.com dans votre navigateur"
echo "  2. Tester l'inscription/connexion"
echo "  3. Tester les fonctionnalités de chat"
echo "  4. Vérifier les appels vidéo/audio"
echo "  5. Tester l'upload de fichiers"
echo ""
echo "📈 Monitoring:"
echo "  - Logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  - Ressources: docker stats"
echo "  - Santé: curl https://solisakane.com/api/health"
echo ""

print_success "Déploiement en production réussi ! 🚀"
