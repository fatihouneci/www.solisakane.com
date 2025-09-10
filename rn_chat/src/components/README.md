# Structure des Composants - Solisakane

Cette documentation décrit l'organisation des composants React Native dans l'application Solisakane.

## 📁 Structure des Dossiers

```
src/components/
├── screens/
│   ├── auth/                    # Composants d'authentification
│   │   ├── AuthCheck.js        # Vérification de l'état d'authentification
│   │   ├── AuthChoice.js       # Choix entre Login/Register
│   │   ├── LoginScreen.js      # Écran de connexion
│   │   ├── RegisterScreen.js   # Écran d'inscription
│   │   ├── AuthManager.js      # Gestionnaire du flux d'authentification
│   │   └── index.js            # Exports du module auth
│   ├── dashboard/              # Composants du tableau de bord
│   │   ├── Dashboard.js        # Écran principal après connexion
│   │   └── index.js            # Exports du module dashboard
│   └── splashScreens/          # Écrans de démarrage
│       ├── SplashScreen.js     # Premier écran de démarrage
│       ├── SplashScreen2.js    # Deuxième écran de démarrage
│       ├── SplashScreen3.js    # Troisième écran de démarrage
│       ├── SplashScreenManager.js # Gestionnaire des splash screens
│       └── index.js            # Exports du module splashScreens
├── common/                 # Composants partagés (futur)
│   └── index.js            # Exports du module common
└── index.js                # Export principal de tous les composants
```

## 🎯 Organisation par Fonctionnalité

### 🔐 Authentification (`screens/auth/`)
- **AuthCheck** : Vérifie si l'utilisateur est connecté
- **AuthChoice** : Interface de choix entre connexion/inscription
- **LoginScreen** : Formulaire de connexion
- **RegisterScreen** : Formulaire d'inscription
- **AuthManager** : Orchestrateur du flux d'authentification

### 🏠 Dashboard (`screens/dashboard/`)
- **Dashboard** : Écran principal avec menu et statistiques

### 🚀 Splash Screens (`screens/splashScreens/`)
- **SplashScreen** : Premier écran avec logo et animation
- **SplashScreen2** : Deuxième écran avec fonctionnalités
- **SplashScreen3** : Troisième écran avec statistiques
- **SplashScreenManager** : Gestionnaire de la séquence des splash screens

### 🔧 Common (`common/`)
- Composants partagés entre différents modules (à développer)

## 📦 Imports Simplifiés

Grâce aux fichiers `index.js`, vous pouvez importer les composants de manière simplifiée :

```javascript
// Import depuis un module spécifique
import { SplashScreenManager } from './components/screens/splashScreens';
import { AuthManager } from './components/screens/auth';
import { Dashboard } from './components/screens/dashboard';

// Import depuis le module principal
import { SplashScreenManager, AuthManager, Dashboard } from './components';
```

## 🎨 Avantages de cette Structure

1. **Organisation claire** : Chaque fonctionnalité a son propre dossier
2. **Maintenabilité** : Facile de trouver et modifier les composants
3. **Scalabilité** : Facile d'ajouter de nouveaux composants
4. **Imports simplifiés** : Grâce aux fichiers index.js
5. **Séparation des responsabilités** : Chaque module a un rôle défini

## 🚀 Ajout de Nouveaux Composants

Pour ajouter un nouveau composant :

1. Placez-le dans le dossier approprié
2. Ajoutez l'export dans le fichier `index.js` du module
3. Utilisez l'import simplifié dans vos autres composants

## 📝 Conventions

- **Nommage** : PascalCase pour les noms de fichiers de composants
- **Exports** : Utilisation de `export default` pour les composants
- **Imports** : Utilisation des imports nommés via les fichiers index.js
