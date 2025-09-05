
/**
 * @file RootNavigator.js
 * @description
 * EN: This file contains the RootNavigator component, which is the main navigator of the application.
 * FR: Ce fichier contient le composant RootNavigator, qui est le navigateur principal de l'application.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useUser } from '../contexts/UserProvider';

const Stack = createStackNavigator();

/**
 * EN: RootNavigator Component. This is the main navigator of the application. It decides which flow to show (Auth or Main) based on the user's authentication state, which is provided by the UserContext. It also shows a splash screen while the initial state is loading.
 * FR: Composant RootNavigator. C'est le navigateur principal de l'application. Il décide quel flux afficher (Auth ou Main) en fonction de l'état d'authentification de l'utilisateur, fourni par le UserContext. Il affiche également un écran de démarrage pendant le chargement de l'état initial.
 */
const RootNavigator = () => {
  const { token, loading } = useUser();

  // EN: Show splash screen while the user state is loading
  // FR: Afficher l'écran de démarrage pendant le chargement de l'état de l'utilisateur
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // EN: If token exists, user is logged in, show main app
          // FR: Si le token existe, l'utilisateur est connecté, afficher l'application principale
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // EN: Otherwise, show authentication flow
          // FR: Sinon, afficher le flux d'authentification
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
