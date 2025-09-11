/**
 * Navigation principale de l'application Solisakane
 * Main navigation for Solisakane application
 *
 * Structure de navigation avec React Navigation
 * Navigation structure with React Navigation
 */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import des écrans / Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import ChatScreen from '../screens/chat/ChatScreen';
import CallScreen from '../screens/calls/CallScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Import des constantes / Import constants
import {COLORS} from '../constants/colors';

const Stack = createStackNavigator();

/**
 * Navigateur principal de l'application
 * Main application navigator
 *
 * Gère l'état d'authentification et la navigation conditionnelle
 * Manages authentication state and conditional navigation
 */
const AppNavigator = () => {
  // État d'authentification / Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  /**
   * Vérifier l'état d'authentification au démarrage
   * Check authentication state on startup
   */
  useEffect(() => {
    checkAuthState();
  }, []);

  /**
   * Vérifier si l'utilisateur est connecté
   * Check if user is logged in
   */
  const checkAuthState = async () => {
    try {
      // Vérifier le token d'authentification / Check authentication token
      const token = await AsyncStorage.getItem('authToken');
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      // Pour le test, forçons la première connexion
      // For testing, force first launch
      setIsAuthenticated(false);
      setIsFirstLaunch(true);
      
      console.log('Auth State:', {
        token: !!token,
        hasSeenOnboarding: !!hasSeenOnboarding,
        isAuthenticated: false,
        isFirstLaunch: true
      });
    } catch (error) {
      console.error("Erreur lors de la vérification de l'auth:", error);
      // Error checking auth state
      setIsAuthenticated(false);
      setIsFirstLaunch(true);
    } finally {
      // Attendre au moins 7 secondes pour afficher le splash screen
      // Wait at least 7 seconds to display splash screen
      setTimeout(() => {
        setIsLoading(false);
      }, 7000);
    }
  };

  // Configuration des options d'écran par défaut / Default screen options
  const screenOptions = {
    headerStyle: {
      backgroundColor: COLORS.PRIMARY_GREEN,
    },
    headerTintColor: COLORS.WHITE,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitleVisible: false,
  };

  // Écran de chargement / Loading screen
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          isFirstLaunch ? 'Onboarding' : isAuthenticated ? 'MainTabs' : 'Login'
        }
        screenOptions={screenOptions}>
        {/* Écran d'onboarding / Onboarding screen */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />

        {/* Écrans d'authentification / Authentication screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Connexion',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Inscription',
            headerShown: false,
          }}
        />

        {/* Navigation principale / Main navigation */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{headerShown: false}}
        />

        {/* Écran de chat individuel / Individual chat screen */}
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerStyle: {
              backgroundColor: COLORS.PRIMARY_GREEN,
            },
            headerTintColor: COLORS.WHITE,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />

        {/* Écran d'appel / Call screen */}
        <Stack.Screen
          name="Call"
          component={CallScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />

        {/* Écran de profil / Profile screen */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerStyle: {
              backgroundColor: COLORS.PRIMARY_GREEN,
            },
            headerTintColor: COLORS.WHITE,
            headerTitle: 'Profil',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
