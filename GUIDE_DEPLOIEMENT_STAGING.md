# 🚀 Guide de Déploiement en Staging - Solisakane.com

## 📋 Table des Matières
1. [Qu'est-ce que Docker ?](#quest-ce-que-docker-)
2. [Prérequis](#prérequis)
3. [Déploiement Pas à Pas](#déploiement-pas-à-pas)
4. [Vérification](#vérification)
5. [Tests](#tests)
6. [Dépannage](#dépannage)
7. [Commandes Utiles](#commandes-utiles)

## 🐳 Qu'est-ce que Docker ?

**Docker** est un système de conteneurisation qui permet de :

### ✅ **Avantages de Docker**
- **Isolation** : Chaque service fonctionne dans son propre conteneur
- **Cohérence** : Même environnement sur dev, staging et production
- **Portabilité** : Fonctionne sur Windows, Mac, Linux
- **Scalabilité** : Facile d'ajouter plus d'instances
- **Gestion des dépendances** : Chaque conteneur a ses propres dépendances
- **Déploiement simplifié** : Une seule commande pour tout démarrer

### 🏗️ **Architecture de Solisakane.com**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Données       │
│   Port: 3000    │    │   Port: 5000    │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   (Proxy)       │
                    │   Port: 80      │
                    └─────────────────┘
```

## 📋 Prérequis

### 🔧 **Installation de Docker**
1. **Windows** : Téléchargez Docker Desktop depuis [docker.com](https://www.docker.com/products/docker-desktop)
2. **Mac** : Téléchargez Docker Desktop depuis [docker.com](https://www.docker.com/products/docker-desktop)
3. **Linux** : Suivez le guide officiel Docker

### ✅ **Vérification de l'installation**
```bash
docker --version
docker-compose --version
```

## 🚀 Déploiement Pas à Pas

### **Étape 1 : Préparation**
```bash
# 1. Ouvrir un terminal dans le dossier du projet
cd /c/Users/TRAORE\ Ibrahima/Documents/www.solisakane.com

# 2. Vérifier que tous les fichiers sont présents
ls -la
```

### **Étape 2 : Configuration des variables d'environnement**
```bash
# Créer un fichier .env.staging (optionnel)
cp .env .env.staging
```

### **Étape 3 : Déploiement automatique**
```bash
# Exécuter le script de déploiement
./deploy-staging.sh
```

### **Étape 4 : Déploiement manuel (alternative)**
```bash
# 1. Arrêter les conteneurs existants
docker-compose -f docker-compose.staging.yml down

# 2. Construire et démarrer les services
docker-compose -f docker-compose.staging.yml up --build -d

# 3. Vérifier l'état des conteneurs
docker-compose -f docker-compose.staging.yml ps
```

## ✅ Vérification

### **1. Vérifier les conteneurs**
```bash
docker-compose -f docker-compose.staging.yml ps
```

**Résultat attendu :**
```
Name                        Command               State           Ports
--------------------------------------------------------------------------------
solisakane_api_staging      npm start             Up      0.0.0.0:5100->5000/tcp
solisakane_app_staging      serve -s dist         Up      0.0.0.0:3000->3000/tcp
solisakane_db_staging       docker-entrypoint.sh  Up      0.0.0.0:27017->27017/tcp
solisakane_nginx_staging    nginx -g daemon off;  Up      0.0.0.0:3016->80/tcp
solisakane_redis_staging    docker-entrypoint.sh  Up      0.0.0.0:6379->6379/tcp
```

### **2. Vérifier les services**
```bash
# Vérifier MongoDB
docker-compose -f docker-compose.staging.yml exec mongodb mongosh --eval "db.runCommand('ping')"

# Vérifier Redis
docker-compose -f docker-compose.staging.yml exec redis redis-cli ping

# Vérifier l'API
curl http://localhost:5100/api/health

# Vérifier le frontend
curl http://localhost:3016
```

## 🧪 Tests

### **1. Test du Frontend**
- Ouvrir http://localhost:3016 dans votre navigateur
- Vérifier que la page se charge correctement

### **2. Test de l'API**
```bash
# Test de l'endpoint de santé
curl http://localhost:5100/api/health

# Test de l'inscription
curl -X POST http://localhost:5100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
```

### **3. Test des fonctionnalités**
1. **Inscription/Connexion** : Créer un compte et se connecter
2. **Chat** : Envoyer des messages
3. **Appels** : Tester les appels vidéo/audio
4. **Médias** : Uploader et partager des fichiers

## 🔧 Dépannage

### **Problème : Conteneur ne démarre pas**
```bash
# Voir les logs
docker-compose -f docker-compose.staging.yml logs [nom_du_conteneur]

# Redémarrer un conteneur spécifique
docker-compose -f docker-compose.staging.yml restart [nom_du_conteneur]
```

### **Problème : Port déjà utilisé**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3016
netstat -tulpn | grep :5100

# Arrêter les processus utilisant ces ports
sudo kill -9 [PID]
```

### **Problème : Base de données non accessible**
```bash
# Vérifier la connexion MongoDB
docker-compose -f docker-compose.staging.yml exec mongodb mongosh

# Vérifier Redis
docker-compose -f docker-compose.staging.yml exec redis redis-cli
```

## 📚 Commandes Utiles

### **Gestion des conteneurs**
```bash
# Voir l'état des conteneurs
docker-compose -f docker-compose.staging.yml ps

# Voir les logs en temps réel
docker-compose -f docker-compose.staging.yml logs -f

# Arrêter tous les conteneurs
docker-compose -f docker-compose.staging.yml down

# Redémarrer tous les conteneurs
docker-compose -f docker-compose.staging.yml restart

# Reconstruire et redémarrer
docker-compose -f docker-compose.staging.yml up --build -d
```

### **Gestion des volumes**
```bash
# Voir les volumes
docker volume ls

# Supprimer les volumes (ATTENTION : supprime les données)
docker-compose -f docker-compose.staging.yml down -v
```

### **Nettoyage**
```bash
# Nettoyer les images non utilisées
docker system prune -f

# Nettoyer tout (ATTENTION : supprime tout)
docker system prune -a -f
```

## 🌐 Accès aux Services

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **Frontend** | http://localhost:3016 | 3016 | Interface utilisateur |
| **API** | http://localhost:5100 | 5100 | API REST |
| **MongoDB** | localhost:27017 | 27017 | Base de données |
| **Redis** | localhost:6379 | 6379 | Cache et sessions |

## 📊 Monitoring

### **Logs en temps réel**
```bash
# Tous les services
docker-compose -f docker-compose.staging.yml logs -f

# Service spécifique
docker-compose -f docker-compose.staging.yml logs -f server
docker-compose -f docker-compose.staging.yml logs -f web
docker-compose -f docker-compose.staging.yml logs -f mongodb
```

### **Statistiques des conteneurs**
```bash
# Utilisation des ressources
docker stats
```

## 🎯 Prochaines Étapes

1. **Tests complets** : Tester toutes les fonctionnalités
2. **Optimisation** : Ajuster les performances si nécessaire
3. **Déploiement en production** : Utiliser la même méthode avec des configurations de production
4. **Monitoring** : Mettre en place des outils de surveillance
5. **Backup** : Configurer des sauvegardes automatiques

---

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose -f docker-compose.staging.yml logs -f`
2. Consultez la section [Dépannage](#dépannage)
3. Vérifiez que tous les ports sont libres
4. Redémarrez Docker Desktop si nécessaire

**Bonne chance avec votre déploiement ! 🚀**
