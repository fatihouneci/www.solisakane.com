# 🔧 Guide de Résolution de Problèmes - Solisakane

## 🚨 Problèmes Courants et Solutions

### 1. **"Could not connect to development server"**

#### Solution :
```bash
# Terminal 1 - Démarrer Metro
cd rn_chat
npm start

# Terminal 2 - Lancer l'application (après que Metro soit démarré)
cd rn_chat
npx react-native run-android
```

### 2. **Erreurs de Compilation Java**

#### Solutions Appliquées :
- ✅ **Corrigé** : `android.enableDexingArtifactTransform.desugaring=true` dans `gradle.properties`
- ✅ **Ajouté** : Configuration JDK optimisée dans `gradle.properties`
- ✅ **Augmenté** : Mémoire Gradle à 4GB (`-Xmx4096m`)
- ✅ **Activé** : Gradle parallel et daemon pour de meilleures performances

### 3. **Metro ne démarre pas**

#### Vérifications :
```bash
# Vérifier que nous sommes dans le bon répertoire
pwd
# Doit afficher : C:\Users\TRAORE Ibrahima\Documents\www.solisakane.com\rn_chat

# Vérifier le package.json
ls package.json
# Doit exister

# Nettoyer et réinstaller si nécessaire
npm install
npm start --reset-cache
```

### 4. **"Unable to make progress running work" - Blocage Gradle**

#### Solution :
```bash
# Arrêter tous les daemons Gradle
cd android
./gradlew --stop

# Nettoyer complètement
./gradlew clean

# Retourner au répertoire principal
cd ..

# Relancer avec optimisations
npx react-native run-android --no-packager
```

### 5. **Émulateur Android non détecté**

#### Solutions :
```bash
# Vérifier les émulateurs disponibles
adb devices

# Redémarrer ADB
adb kill-server
adb start-server

# Vérifier que l'émulateur est en cours d'exécution
# Dans Android Studio : Tools > AVD Manager
```

## 📱 **Procédure de Lancement Correcte**

### Étape 1 : Vérifier l'Émulateur
1. Ouvrir Android Studio
2. Tools > AVD Manager
3. Lancer un émulateur (Pixel 6 Pro recommandé)

### Étape 2 : Démarrer Metro
```bash
cd rn_chat
npm start
```
**Attendre** que Metro affiche :
```
Metro waiting on exp://192.168.x.x:8081
```

### Étape 3 : Lancer l'Application
```bash
# Dans un nouveau terminal
cd rn_chat
npx react-native run-android
```

## 🐛 **Dépannage Avancé**

### Nettoyage Complet
```bash
# Nettoyer tout
cd rn_chat
npm install
cd android
./gradlew clean
cd ..
npx react-native start --reset-cache
```

### Variables d'Environnement
```bash
# Vérifier JAVA_HOME
echo $JAVA_HOME

# Vérifier ANDROID_HOME
echo $ANDROID_HOME
```

### Logs Détaillés
```bash
# Lancer avec logs détaillés
npx react-native run-android --verbose
```

## ✅ **Checklist de Validation**

- [ ] Émulateur Android démarré
- [ ] Metro bundler en cours d'exécution
- [ ] Pas d'erreurs de compilation Java
- [ ] Application se lance sur l'émulateur
- [ ] Écran splash s'affiche
- [ ] Navigation fonctionne

## 🆘 **En Cas de Problème Persistant**

1. **Redémarrer complètement** :
   - Fermer Android Studio
   - Fermer tous les terminaux
   - Redémarrer l'ordinateur
   - Relancer la procédure

2. **Vérifier les versions** :
   - Node.js : 18+
   - Java : 11 ou 17
   - Android SDK : API 33+

3. **Créer un nouvel émulateur** si nécessaire
