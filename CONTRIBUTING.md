# 🤝 Guide de Contribution - Solisakane.com

## 📋 Table des Matières
1. [Workflow Git](#workflow-git)
2. [Standards de Code](#standards-de-code)
3. [Tests](#tests)
4. [Déploiement](#déploiement)
5. [Pull Requests](#pull-requests)

## 🔄 Workflow Git

### **Structure des Branches**
```
main (production)
├── develop (développement)
├── feature/nom-fonctionnalite
├── hotfix/correction-urgente
└── release/version-x.x.x
```

### **Types de Branches**
- **`main`** : Code en production, toujours stable
- **`develop`** : Branche de développement principal
- **`feature/*`** : Nouvelles fonctionnalités
- **`hotfix/*`** : Corrections urgentes
- **`release/*`** : Préparation des releases

### **Convention de Nommage**
```bash
# Fonctionnalités
feature/chat-video
feature/notifications-push
feature/authentification-2fa

# Corrections
hotfix/correction-memory-leak
hotfix/correction-security-vulnerability

# Releases
release/v1.2.0
release/v2.0.0
```

## 📝 Standards de Code

### **Commits Conventionnels**
```bash
# Format
<type>(<scope>): <description>

# Types
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, point-virgules manquants
refactor: refactoring du code
test: ajout de tests
chore: tâches de maintenance

# Exemples
feat(chat): ajout des emojis dans les messages
fix(auth): correction de la validation JWT
docs(api): mise à jour de la documentation
style(frontend): correction de l'indentation
refactor(backend): optimisation des requêtes DB
test(chat): ajout de tests unitaires
chore(deps): mise à jour des dépendances
```

### **Messages de Commit Détaillés**
```bash
feat(chat): ajout des appels vidéo en groupe

- Implémentation de WebRTC avec mediasoup
- Interface utilisateur pour contrôles vidéo
- Gestion des participants multiples
- Tests unitaires et d'intégration

Closes #123
```

## 🧪 Tests

### **Avant chaque commit**
```bash
# Tests backend
cd server && npm test

# Tests frontend
cd web && npm test

# Tests mobile
cd rn_chat && npm test

# Tests E2E
node test-functionalities.js
```

### **Couverture de Tests**
- **Backend** : Minimum 80%
- **Frontend** : Minimum 70%
- **API** : 100% des endpoints critiques

## 🚀 Déploiement

### **Environnements**
- **`staging`** : Tests et validation
- **`production`** : Application en ligne

### **Pipeline de Déploiement**
1. **Développement** → Tests locaux
2. **Feature Branch** → Tests automatisés
3. **Develop** → Déploiement staging
4. **Release** → Tests de régression
5. **Main** → Déploiement production

## 🔀 Pull Requests

### **Processus de Review**
1. **Créer une branche** depuis `develop`
2. **Développer** la fonctionnalité
3. **Tester** localement
4. **Créer une PR** vers `develop`
5. **Review** par l'équipe
6. **Merge** après approbation

### **Template de PR**
```markdown
## 📝 Description
Brève description des changements

## 🔗 Issue liée
Closes #123

## 🧪 Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Tests manuels effectués

## 📸 Screenshots
(Si applicable)

## ✅ Checklist
- [ ] Code respecte les standards
- [ ] Documentation mise à jour
- [ ] Tests ajoutés/mis à jour
- [ ] Pas de breaking changes
```

## 🔧 Configuration Git

### **Alias Recommandés**
```bash
# Ajouter dans ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    df = diff
    lg = log --oneline --graph --decorate
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
```

### **Hooks Git**
```bash
# Pre-commit hook
#!/bin/sh
npm test && npm run lint

# Commit-msg hook
#!/bin/sh
# Validation du format de commit
```

## 📚 Ressources

### **Documentation**
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

### **Outils**
- **GitHub Desktop** : Interface graphique
- **GitKraken** : Client Git avancé
- **VS Code Git** : Intégration IDE

## 🆘 Support

En cas de problème :
1. Consulter la documentation
2. Chercher dans les issues existantes
3. Créer une nouvelle issue
4. Contacter l'équipe

---

**Merci de contribuer à Solisakane.com ! 🚀**
