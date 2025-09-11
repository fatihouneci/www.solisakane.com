/**
 * Application Solisakane - Point d'entrée principal
 * Solisakane Application - Main entry point
 *
 * Configuration de l'application avec navigation et thèmes
 * Application setup with navigation and themes
 */

import React from 'react';
import {StatusBar} from 'react-native';

// Import de la navigation principale / Import main navigation
import AppNavigator from './navigation/AppNavigator';

// Import des constantes / Import constants
import {COLORS} from './constants/colors';

/**
 * Composant principal de l'application
 * Main application component
 */
export default function App() {
  return (
    <>
      <StatusBar
        backgroundColor={COLORS.PRIMARY_GREEN}
        barStyle="light-content"
      />
      <AppNavigator />
    </>
  );
}