# 🚀 Guide de Déploiement en Production - Solisakane.com

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Configuration](#configuration)
3. [Déploiement](#déploiement)
4. [Sécurité](#sécurité)
5. [Monitoring](#monitoring)
6. [Maintenance](#maintenance)
7. [Dépannage](#dépannage)

## 📋 Prérequis

### 🔧 **Serveur de Production**
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **RAM** : Minimum 4GB, Recommandé 8GB+
- **CPU** : Minimum 2 cœurs, Recommandé 4 cœurs+
- **Stockage** : Minimum 50GB SSD
- **Réseau** : Connexion stable avec IP publique

### 📦 **Logiciels Requis**
```bash
# Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 🌐 **Domaine et SSL**
- **Domaine** : solisakane.com (configuré avec DNS)
- **Certificat SSL** : Let's Encrypt ou certificat commercial
- **Firewall** : Ports 80, 443, 22 ouverts

## ⚙️ Configuration

### **1. Variables d'Environnement**
```bash
# Copier le fichier d'exemple
cp env.production.example .env.production

# Éditer avec vos vraies valeurs
nano .env.production
```

**Variables importantes à configurer :**
```bash
# Base de données
MONGO_ROOT_PASSWORD=your_very_secure_password_2024
MONGO_DATABASE=solisakane_production

# JWT Secret (générer une clé sécurisée)
JWT_SECRET=your_very_secure_jwt_secret_key_for_production_2024

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
FRONTEND_URL=https://solisakane.com
API_URL=https://solisakane.com
```

### **2. Certificats SSL**
```bash
# Créer le dossier SSL
mkdir -p ssl

# Option 1: Let's Encrypt (gratuit)
sudo apt install certbot
sudo certbot certonly --standalone -d solisakane.com -d www.solisakane.com

# Copier les certificats
sudo cp /etc/letsencrypt/live/solisakane.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/solisakane.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

### **3. Configuration du Firewall**
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Ou iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## 🚀 Déploiement

### **Méthode 1: Script Automatique (Recommandé)**
```bash
# Exécuter le script de déploiement
./deploy-production.sh
```

### **Méthode 2: Déploiement Manuel**
```bash
# 1. Arrêter les conteneurs existants
docker-compose -f docker-compose.production.yml down

# 2. Construire et démarrer
docker-compose -f docker-compose.production.yml up --build -d

# 3. Vérifier l'état
docker-compose -f docker-compose.production.yml ps
```

### **Vérification du Déploiement**
```bash
# Vérifier les conteneurs
docker-compose -f docker-compose.production.yml ps

# Vérifier les logs
docker-compose -f docker-compose.production.yml logs -f

# Tester l'application
curl https://solisakane.com
curl https://solisakane.com/api/auth/me
```

## 🔒 Sécurité

### **1. Configuration Nginx**
- ✅ HTTPS obligatoire (redirection HTTP → HTTPS)
- ✅ Headers de sécurité (HSTS, CSP, etc.)
- ✅ Rate limiting sur l'API
- ✅ Compression Gzip activée

### **2. Base de Données**
- ✅ Authentification MongoDB activée
- ✅ Mot de passe fort pour l'utilisateur root
- ✅ Accès limité au réseau interne Docker

### **3. Application**
- ✅ Variables d'environnement sécurisées
- ✅ JWT avec clé secrète forte
- ✅ Validation des entrées utilisateur
- ✅ CORS configuré correctement

### **4. Serveur**
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Configuration SSH sécurisée
sudo nano /etc/ssh/sshd_config
# Port 22 → Port personnalisé
# PasswordAuthentication no
# PermitRootLogin no

# Redémarrer SSH
sudo systemctl restart ssh
```

## 📊 Monitoring

### **1. Logs en Temps Réel**
```bash
# Tous les services
docker-compose -f docker-compose.production.yml logs -f

# Service spécifique
docker-compose -f docker-compose.production.yml logs -f server
docker-compose -f docker-compose.production.yml logs -f nginx
```

### **2. Ressources Système**
```bash
# Utilisation des ressources
docker stats

# Espace disque
df -h

# Mémoire
free -h

# CPU
htop
```

### **3. Santé de l'Application**
```bash
# Test de l'API
curl -f https://solisakane.com/api/auth/me

# Test de la base de données
docker-compose -f docker-compose.production.yml exec mongodb mongosh --eval "db.runCommand('ping')"

# Test Redis
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

### **4. Monitoring Avancé (Optionnel)**
```bash
# Prometheus + Grafana
docker run -d --name prometheus -p 9090:9090 prom/prometheus
docker run -d --name grafana -p 3001:3000 grafana/grafana

# Logs centralisés avec ELK Stack
# (Configuration avancée requise)
```

## 🔧 Maintenance

### **1. Sauvegardes Automatiques**
```bash
# Script de sauvegarde MongoDB
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.production.yml exec -T mongodb mongodump --archive --gzip > backup_${DATE}.gz

# Nettoyage des anciennes sauvegardes (garder 30 jours)
find . -name "backup_*.gz" -mtime +30 -delete
```

### **2. Mises à Jour**
```bash
# Mise à jour de l'application
git pull origin main
docker-compose -f docker-compose.production.yml up --build -d

# Mise à jour des images Docker
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

### **3. Nettoyage**
```bash
# Nettoyer les images non utilisées
docker system prune -f

# Nettoyer les volumes non utilisés
docker volume prune -f

# Nettoyer les réseaux non utilisés
docker network prune -f
```

## 🆘 Dépannage

### **Problème : Application inaccessible**
```bash
# Vérifier les conteneurs
docker-compose -f docker-compose.production.yml ps

# Vérifier les logs
docker-compose -f docker-compose.production.yml logs nginx
docker-compose -f docker-compose.production.yml logs server

# Vérifier le firewall
sudo ufw status
```

### **Problème : Base de données non accessible**
```bash
# Vérifier MongoDB
docker-compose -f docker-compose.production.yml exec mongodb mongosh

# Vérifier les logs
docker-compose -f docker-compose.production.yml logs mongodb

# Redémarrer MongoDB
docker-compose -f docker-compose.production.yml restart mongodb
```

### **Problème : Certificat SSL**
```bash
# Renouveler Let's Encrypt
sudo certbot renew

# Copier les nouveaux certificats
sudo cp /etc/letsencrypt/live/solisakane.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/solisakane.com/privkey.pem ssl/key.pem

# Redémarrer Nginx
docker-compose -f docker-compose.production.yml restart nginx
```

### **Problème : Performance**
```bash
# Vérifier les ressources
docker stats

# Augmenter les limites de ressources dans docker-compose.production.yml
# Redémarrer les services
docker-compose -f docker-compose.production.yml up -d
```

## 📈 Optimisations

### **1. Performance**
- **CDN** : Utiliser CloudFlare ou AWS CloudFront
- **Cache** : Configurer Redis pour le cache
- **Compression** : Gzip activé dans Nginx
- **Images** : Optimiser les images avec WebP

### **2. Scalabilité**
- **Load Balancer** : Nginx ou HAProxy
- **Base de données** : Réplication MongoDB
- **Cache distribué** : Redis Cluster
- **Microservices** : Séparer les services

### **3. Monitoring Avancé**
- **APM** : New Relic, DataDog, ou Sentry
- **Logs** : ELK Stack ou Fluentd
- **Métriques** : Prometheus + Grafana
- **Alertes** : PagerDuty ou Slack

## 🎯 Checklist de Déploiement

### **Avant le Déploiement**
- [ ] Serveur configuré et sécurisé
- [ ] Domaine configuré avec DNS
- [ ] Certificats SSL installés
- [ ] Variables d'environnement configurées
- [ ] Firewall configuré
- [ ] Sauvegardes configurées

### **Pendant le Déploiement**
- [ ] Conteneurs démarrés
- [ ] Services vérifiés
- [ ] Logs surveillés
- [ ] Tests fonctionnels effectués

### **Après le Déploiement**
- [ ] Application accessible
- [ ] API fonctionnelle
- [ ] Base de données opérationnelle
- [ ] Monitoring configuré
- [ ] Alertes configurées
- [ ] Documentation mise à jour

---

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose -f docker-compose.production.yml logs -f`
2. Consultez la section [Dépannage](#dépannage)
3. Vérifiez la configuration des variables d'environnement
4. Testez chaque service individuellement

**Bonne chance avec votre déploiement en production ! 🚀**
