import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from './SplashScreen';
import SplashScreen2 from './SplashScreen2';
import SplashScreen3 from './SplashScreen3';

const SplashScreenManager = ({ onComplete }) => {
  const [currentSplash, setCurrentSplash] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const splashScreens = [
    { component: SplashScreen, name: "Bienvenue" },
    { component: SplashScreen2, name: "Fonctionnalités" },
    { component: SplashScreen3, name: "Prêt" },
  ];

  // Plus de timer automatique - navigation manuelle uniquement

  const handleSplashFinish = () => {
    // Navigation manuelle uniquement - passer à la splash screen suivante
    if (currentSplash < splashScreens.length - 1) {
      setCurrentSplash(currentSplash + 1);
    } else {
      // Dernière splash screen - terminer la séquence
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  const CurrentSplashComponent = splashScreens[currentSplash].component;

  return (
    <View style={styles.container}>
      <CurrentSplashComponent onFinish={handleSplashFinish} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SplashScreenManager;
