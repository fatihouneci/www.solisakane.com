#!/bin/bash

# Script de sauvegarde automatique pour Solisakane.com
# Usage: ./backup-production.sh [--restore backup_file]

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="solisakane_backup_${DATE}"
RETENTION_DAYS=30

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Créer le dossier de sauvegarde
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_info "Dossier de sauvegarde créé: $BACKUP_DIR"
    fi
}

# Sauvegarde de la base de données MongoDB
backup_mongodb() {
    log_info "Sauvegarde de MongoDB..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}_mongodb.gz"
    
    if docker-compose -f docker-compose.production.yml exec -T mongodb mongodump \
        --archive --gzip > "$backup_file"; then
        log_success "Sauvegarde MongoDB réussie: $backup_file"
        echo "$backup_file"
    else
        log_error "Échec de la sauvegarde MongoDB"
        return 1
    fi
}

# Sauvegarde de Redis
backup_redis() {
    log_info "Sauvegarde de Redis..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"
    
    # Créer un dump Redis
    if docker-compose -f docker-compose.production.yml exec -T redis redis-cli BGSAVE; then
        # Attendre que le dump soit terminé
        sleep 5
        
        # Copier le fichier dump
        if docker-compose -f docker-compose.production.yml cp redis:/data/dump.rdb "$backup_file"; then
            log_success "Sauvegarde Redis réussie: $backup_file"
            echo "$backup_file"
        else
            log_error "Échec de la copie du dump Redis"
            return 1
        fi
    else
        log_error "Échec de la création du dump Redis"
        return 1
    fi
}

# Sauvegarde des fichiers uploadés
backup_uploads() {
    log_info "Sauvegarde des fichiers uploadés..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz"
    
    if docker-compose -f docker-compose.production.yml exec -T server tar -czf - /app/uploads > "$backup_file"; then
        log_success "Sauvegarde des uploads réussie: $backup_file"
        echo "$backup_file"
    else
        log_error "Échec de la sauvegarde des uploads"
        return 1
    fi
}

# Sauvegarde de la configuration
backup_config() {
    log_info "Sauvegarde de la configuration..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz"
    
    # Sauvegarder les fichiers de configuration
    tar -czf "$backup_file" \
        docker-compose.production.yml \
        nginx/nginx.production.conf \
        .env.production \
        ssl/ 2>/dev/null || true
    
    log_success "Sauvegarde de la configuration réussie: $backup_file"
    echo "$backup_file"
}

# Créer un manifest de sauvegarde
create_manifest() {
    local manifest_file="${BACKUP_DIR}/${BACKUP_NAME}_manifest.json"
    
    cat > "$manifest_file" << EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$(date -Iseconds)",
    "version": "1.0",
    "components": {
        "mongodb": "$(basename $1)",
        "redis": "$(basename $2)",
        "uploads": "$(basename $3)",
        "config": "$(basename $4)"
    },
    "size": {
        "mongodb": "$(du -h $1 | cut -f1)",
        "redis": "$(du -h $2 | cut -f1)",
        "uploads": "$(du -h $3 | cut -f1)",
        "config": "$(du -h $4 | cut -f1)"
    }
}
EOF
    
    log_success "Manifest créé: $manifest_file"
    echo "$manifest_file"
}

# Nettoyer les anciennes sauvegardes
cleanup_old_backups() {
    log_info "Nettoyage des sauvegardes anciennes (> $RETENTION_DAYS jours)..."
    
    local deleted_count=0
    
    # Supprimer les fichiers de sauvegarde anciens
    find "$BACKUP_DIR" -name "solisakane_backup_*" -type f -mtime +$RETENTION_DAYS -delete -print | while read file; do
        log_info "Suppression: $file"
        ((deleted_count++))
    done
    
    if [ $deleted_count -gt 0 ]; then
        log_success "$deleted_count anciennes sauvegardes supprimées"
    else
        log_info "Aucune ancienne sauvegarde à supprimer"
    fi
}

# Restaurer une sauvegarde
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    log_warning "⚠️  ATTENTION: Vous êtes sur le point de restaurer une sauvegarde"
    log_warning "Cela va remplacer les données actuelles"
    echo ""
    read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " -r
    if [[ ! $REPLY =~ ^[Oo]ui$ ]]; then
        log_info "Restauration annulée"
        return 0
    fi
    
    log_info "Restauration de la sauvegarde: $backup_file"
    
    # Arrêter les services
    log_info "Arrêt des services..."
    docker-compose -f docker-compose.production.yml down
    
    # Restaurer MongoDB
    log_info "Restauration de MongoDB..."
    docker-compose -f docker-compose.production.yml up -d mongodb
    sleep 10
    
    # Attendre que MongoDB soit prêt
    until docker-compose -f docker-compose.production.yml exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; do
        log_info "Attente de MongoDB..."
        sleep 5
    done
    
    # Restaurer les données
    if [[ "$backup_file" == *"_mongodb.gz" ]]; then
        docker-compose -f docker-compose.production.yml exec -T mongodb mongorestore --archive --gzip < "$backup_file"
        log_success "MongoDB restauré"
    fi
    
    # Redémarrer tous les services
    log_info "Redémarrage des services..."
    docker-compose -f docker-compose.production.yml up -d
    
    log_success "Restauration terminée"
}

# Fonction principale de sauvegarde
main_backup() {
    log_info "🚀 Démarrage de la sauvegarde Solisakane.com"
    echo "=============================================="
    
    create_backup_dir
    
    # Vérifier que les services sont en cours d'exécution
    if ! docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        log_error "Les services ne sont pas en cours d'exécution"
        log_info "Démarrage des services..."
        docker-compose -f docker-compose.production.yml up -d
        sleep 30
    fi
    
    # Effectuer les sauvegardes
    local mongodb_backup=$(backup_mongodb)
    local redis_backup=$(backup_redis)
    local uploads_backup=$(backup_uploads)
    local config_backup=$(backup_config)
    
    # Créer le manifest
    local manifest=$(create_manifest "$mongodb_backup" "$redis_backup" "$uploads_backup" "$config_backup")
    
    # Nettoyer les anciennes sauvegardes
    cleanup_old_backups
    
    # Résumé
    echo ""
    log_success "🎉 Sauvegarde terminée avec succès !"
    echo "=============================================="
    echo "📁 Dossier de sauvegarde: $BACKUP_DIR"
    echo "📄 Manifest: $manifest"
    echo "🗄️  MongoDB: $mongodb_backup"
    echo "📦 Redis: $redis_backup"
    echo "📎 Uploads: $uploads_backup"
    echo "⚙️  Configuration: $config_backup"
    echo ""
    
    # Calculer la taille totale
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "💾 Taille totale des sauvegardes: $total_size"
    echo ""
}

# Fonction d'aide
show_help() {
    echo "Script de sauvegarde pour Solisakane.com"
    echo ""
    echo "Usage:"
    echo "  $0                    # Effectuer une sauvegarde"
    echo "  $0 --restore FILE     # Restaurer une sauvegarde"
    echo "  $0 --help             # Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0"
    echo "  $0 --restore ./backups/solisakane_backup_20240101_120000_mongodb.gz"
    echo ""
}

# Point d'entrée principal
main() {
    case "${1:-}" in
        --restore)
            if [ -z "${2:-}" ]; then
                log_error "Fichier de sauvegarde requis pour la restauration"
                show_help
                exit 1
            fi
            restore_backup "$2"
            ;;
        --help|-h)
            show_help
            ;;
        "")
            main_backup
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécution
main "$@"
