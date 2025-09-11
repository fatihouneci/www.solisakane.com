# Guide de Test Android Studio Emulator - Solisakane

## 📱 Configuration de l'Émulateur Android

### Prérequis
- Android Studio installé
- SDK Android configuré
- Émulateur Android créé

### Configuration de l'Émulateur Recommandée
```
- Device: Pixel 6 Pro ou similaire
- API Level: 33 (Android 13) ou supérieur
- RAM: 4GB minimum
- Storage: 8GB minimum
- GPU: Hardware - GLES 2.0
```

## 🚀 Lancement de l'Application

### 1. Démarrer l'Émulateur
```bash
# Dans Android Studio
Tools > AVD Manager > Lancer l'émulateur
```

### 2. Installer les Dépendances
```bash
cd rn_chat
npm install
# ou
yarn install
```

### 3. Lancer l'Application (Méthodes)

#### Méthode 1 : Script Automatique (Recommandé)
```bash
# PowerShell
.\launch-android.ps1

# Ou Command Prompt
launch-android.bat
```

#### Méthode 2 : Manuel (2 terminaux)
```bash
# Terminal 1 - Metro Bundler
npm start

# Terminal 2 - Application (attendre que Metro démarre)
npx react-native run-android
```

#### Méthode 3 : Commande Simple
```bash
npm run android
```

## 🧪 Tests à Effectuer

### Écran de Démarrage (Splash Screen)
- [ ] Logo animé s'affiche correctement
- [ ] Animation des anneaux entrelacés
- [ ] Barre de progression fonctionne
- [ ] Transition vers l'onboarding

### Écran d'Onboarding
- [ ] Navigation entre les 4 pages
- [ ] Boutons "Suivant" et "Précédent"
- [ ] Bouton "Passer" fonctionne
- [ ] Animation des indicateurs de page

### Authentification
- [ ] Écran de connexion s'affiche
- [ ] Validation des champs email/mot de passe
- [ ] Navigation vers l'inscription
- [ ] Formulaire d'inscription complet

### Interface Principale
- [ ] Navigation par onglets (Chats, Appels, Contacts, Paramètres)
- [ ] Couleurs de la charte graphique (vert Solisakane)
- [ ] Icônes et boutons fonctionnels

### Écran Chats
- [ ] Liste des conversations
- [ ] Avatars des utilisateurs
- [ ] Indicateurs de messages non lus
- [ ] Statuts en ligne

### Écran Appels
- [ ] Historique des appels
- [ ] Boutons d'appel rapide
- [ ] Types d'appels (audio/vidéo)
- [ ] Statuts des appels

### Écran Contacts
- [ ] Liste des contacts
- [ ] Barre de recherche
- [ ] Onglets de filtrage
- [ ] Statistiques

### Écran Paramètres
- [ ] Profil utilisateur
- [ ] Paramètres de notifications
- [ ] Paramètres de confidentialité
- [ ] Bouton de déconnexion

## 🐛 Dépannage Commun

### Erreur "SDK not found"
```bash
# Configurer les variables d'environnement
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Erreur "Metro bundler not found"
```bash
# Nettoyer et réinstaller
npx react-native clean
npm install
npm start --reset-cache
```

### Émulateur lent
- Augmenter la RAM allouée
- Activer l'accélération matérielle
- Fermer les applications inutiles

### Problèmes de connexion
```bash
# Redémarrer ADB
adb kill-server
adb start-server
```

## 📊 Métriques de Performance

### Temps de Chargement
- Splash Screen: < 3 secondes
- Navigation entre écrans: < 1 seconde
- Chargement des listes: < 2 secondes

### Utilisation Mémoire
- Application de base: < 100MB
- Avec listes chargées: < 150MB

### Fluidité
- 60 FPS pour les animations
- Pas de lag lors du scroll
- Transitions fluides

## ✅ Checklist de Validation

### Fonctionnalités de Base
- [ ] Application se lance sans erreur
- [ ] Navigation fonctionne dans tous les sens
- [ ] Tous les écrans s'affichent correctement
- [ ] Charte graphique respectée

### Compatibilité
- [ ] Rotation d'écran gérée
- [ ] Clavier virtuel fonctionne
- [ ] Gestes tactiles fluides
- [ ] Notifications système

### Performance
- [ ] Pas de fuites mémoire
- [ ] Animations fluides
- [ ] Temps de réponse acceptable
- [ ] Stabilité sur session longue

## 🔄 Prochaines Étapes

Après validation des écrans de base, nous implémenterons :
1. Chat individuel avec messages
2. Fonctionnalités audio/vidéo
3. Notifications push
4. Intégration backend complète
5. Tests de charge et optimisation
