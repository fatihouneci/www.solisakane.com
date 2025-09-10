// Export de tous les composants organisés par catégorie

// Splash Screens (exports directs)
export { default as SplashScreen } from './screens/splashScreens/SplashScreen';
export { default as SplashScreen2 } from './screens/splashScreens/SplashScreen2';
export { default as SplashScreen3 } from './screens/splashScreens/SplashScreen3';
export { default as SplashScreenManager } from './screens/splashScreens/SplashScreenManager';

// Authentification (exports directs)
export { default as AuthManager } from './screens/auth/AuthManager';
export { default as AuthCheck } from './screens/auth/AuthCheck';
export { default as AuthChoice } from './screens/auth/AuthChoice';
export { default as LoginScreen } from './screens/auth/LoginScreen';
export { default as RegisterScreen } from './screens/auth/RegisterScreen';
export { default as OTPScreen } from './screens/auth/OTPScreen';
export { default as OTPEmailScreen } from './screens/auth/OTPEmailScreen';
export { default as PasswordSetupScreen } from './screens/auth/PasswordSetupScreen';

// Dashboard (exports directs)
export { default as Dashboard } from './screens/dashboard/Dashboard';
export { default as MediaFilesScreen } from './screens/dashboard/MediaFilesScreen';

// Common (pour les composants partagés futurs)
// export * from './common';
