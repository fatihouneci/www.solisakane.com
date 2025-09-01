# 🚀 Guide de Déploiement - Solisakane.com

## 📋 Prérequis

### Système
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 5.0
- **Redis** >= 6.0
- **Docker** (optionnel)

### Outils de développement
- **Git**
- **VS Code** (recommandé)
- **Postman** (pour tester les APIs)

---

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/solisakane.com.git
cd solisakane.com
```

### 2. Installer les dépendances
```bash
# Backend
cd server
npm install

# Frontend Web
cd ../web
npm install

# Mobile (optionnel)
cd ../rn_chat
npm install
```

### 3. Configuration de l'environnement

#### Backend (server/.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=votre_secret_jwt_tres_securise
MONGODB_URL=mongodb://localhost:27017/solisakane
REDIS_URL=redis://localhost:6379
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre_email@gmail.com
MAIL_PASS=votre_mot_de_passe_app
MAIL_EMAIL=votre_email@gmail.com
```

#### Frontend Web (web/.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Démarrage

### Option 1: Démarrage automatique (Recommandé)
```bash
node start-app.js
```

### Option 2: Démarrage manuel

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend Web
```bash
cd web
npm run dev
```

### Option 3: Docker Compose
```bash
docker-compose up -d
```

---

## 🧪 Tests

### Lancer tous les tests
```bash
node run-tests.js
```

### Tests individuels

#### Backend
```bash
cd server
npm test
```

#### Frontend Web
```bash
cd web
npm test
```

#### Mobile
```bash
cd rn_chat
npm test
```

---

## 🔍 Vérification de déploiement

```bash
node deploy-check.js
```

Ce script vérifie :
- ✅ Dépendances installées
- ✅ Configuration environnement
- ✅ Connexion base de données
- ✅ Tests passés
- ✅ Build réussi
- ✅ Sécurité configurée

---

## 📊 Monitoring

### Endpoints de santé
- **API Health**: `GET http://localhost:5000/api/health`
- **Frontend**: `GET http://localhost:3000`

### Logs
```bash
# Logs serveur
tail -f server/logs/combined.log

# Logs erreurs
tail -f server/logs/error.log
```

---

## 🔧 Configuration Production

### Variables d'environnement critiques
```env
NODE_ENV=production
JWT_SECRET=secret_production_tres_long_et_securise
MONGODB_URL=mongodb://user:password@host:port/database
REDIS_URL=redis://user:password@host:port
```

### Sécurité
- ✅ HTTPS obligatoire
- ✅ CORS configuré
- ✅ Rate limiting activé
- ✅ Headers de sécurité
- ✅ Validation des entrées

---

## 📱 Déploiement Mobile

### Android
```bash
cd rn_chat
npx react-native run-android
```

### iOS
```bash
cd rn_chat
npx react-native run-ios
```

---

## 🐳 Docker

### Build des images
```bash
docker-compose build
```

### Démarrage des services
```bash
docker-compose up -d
```

### Arrêt des services
```bash
docker-compose down
```

---

## 🔄 CI/CD

### GitHub Actions (exemple)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd server && npm install
          cd ../web && npm install
      - name: Run tests
        run: node run-tests.js
      - name: Deploy
        run: node deploy-check.js
```

---

## 🆘 Dépannage

### Problèmes courants

#### Port déjà utilisé
```bash
# Trouver le processus utilisant le port
lsof -i :5000
# Tuer le processus
kill -9 PID
```

#### Erreur MongoDB
```bash
# Vérifier que MongoDB est démarré
sudo systemctl status mongod
# Démarrer MongoDB
sudo systemctl start mongod
```

#### Erreur Redis
```bash
# Vérifier que Redis est démarré
redis-cli ping
# Démarrer Redis
redis-server
```

### Logs de débogage
```bash
# Activer les logs détaillés
DEBUG=* npm run dev
```

---

## 📚 Documentation API

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur

#### Chats
- `GET /api/chats` - Liste des chats
- `POST /api/chats` - Créer un chat
- `GET /api/chats/:id` - Détails d'un chat

#### Messages
- `GET /api/messages/:chatId` - Messages d'un chat
- `POST /api/messages` - Envoyer un message
- `PUT /api/messages/:id` - Modifier un message

#### Appels
- `POST /api/calls/initiate` - Initier un appel
- `POST /api/calls/:id/answer` - Répondre à un appel
- `POST /api/calls/:id/end` - Terminer un appel

---

## 🎯 Performance

### Optimisations implémentées
- ✅ Compression gzip
- ✅ Cache Redis
- ✅ Index MongoDB
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Image optimization

### Métriques cibles
- **Temps de réponse API**: < 200ms
- **Temps de chargement page**: < 2s
- **Temps de connexion WebSocket**: < 100ms
- **Uptime**: > 99.9%

---

## 🔐 Sécurité

### Mesures implémentées
- ✅ Authentification JWT
- ✅ Hachage bcrypt des mots de passe
- ✅ Validation des entrées
- ✅ Protection CORS
- ✅ Headers de sécurité
- ✅ Rate limiting
- ✅ Sanitisation des données

### Bonnes pratiques
- 🔒 Utiliser HTTPS en production
- 🔒 Changer les secrets par défaut
- 🔒 Mettre à jour les dépendances
- 🔒 Surveiller les logs
- 🔒 Sauvegarder régulièrement

---

## 📞 Support

### Contact
- **Email**: support@solisakane.com
- **Documentation**: [docs.solisakane.com](https://docs.solisakane.com)
- **Issues**: [GitHub Issues](https://github.com/votre-repo/issues)

### Ressources
- 📖 [Documentation complète](./RAPPORT_ANALYSE_SOLISAKANE.md)
- 🧪 [Guide des tests](./tests/README.md)
- 🔧 [Configuration avancée](./docs/configuration.md)

---

*Guide de déploiement Solisakane.com - Version 1.0.0*
