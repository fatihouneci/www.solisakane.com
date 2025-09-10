import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SplashScreenManager, AuthManager, Dashboard, MediaFilesScreen } from './components';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [userData, setUserData] = useState(null);

  const handleSplashComplete = () => {
    setIsLoading(false);
    setShowAuth(true);
  };

  const handleAuthComplete = (user) => {
    setUserData(user);
    setCurrentScreen('dashboard');
    setShowAuth(false);
  };

  const handleNavigateToMedia = () => {
    setCurrentScreen('media');
    setShowAuth(false);
  };

  const handleBackToDashboard = () => {
    // Revenir dans le flux AuthManager qui possède déjà son Dashboard et son état utilisateur
    setShowAuth(true);
    setCurrentScreen('auth');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('auth');
    setShowAuth(true);
  };

  if (isLoading) {
    return <SplashScreenManager onComplete={handleSplashComplete} />;
  }

  if (currentScreen === 'media') {
    return <MediaFilesScreen onBack={handleBackToDashboard} />;
  }

  // Priorité à showAuth pour éviter un écran de fallback
  if (showAuth) {
    return <AuthManager onComplete={handleAuthComplete} onNavigateToMedia={handleNavigateToMedia} />;
  }

  if (currentScreen === 'dashboard' && userData) {
    return (
      <Dashboard
        userData={userData}
        onLogout={handleLogout}
        onNavigateToMedia={handleNavigateToMedia}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.welcomeText}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});