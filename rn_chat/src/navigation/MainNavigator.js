/**
 * @file MainNavigator.js
 * @description
 * EN: This file contains the navigation stack for the main application flow (Home, Profile, etc.).
 * FR: Ce fichier contient la pile de navigation pour le flux principal de l'application (Accueil, Profil, etc.).
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import MediaGalleryScreen from '../screens/MediaGalleryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createStackNavigator();

/**
 * EN: MainNavigator Component. This navigator handles the screens related to the main application content after successful authentication.
 * FR: Composant MainNavigator. Ce navigateur gère les écrans liés au contenu principal de l'application après une authentification réussie.
 */
const MainNavigator = () => {
  return (
    // EN: Stack.Navigator groups the main application screens.
    // FR: Stack.Navigator regroupe les écrans principaux de l'application.
    <Stack.Navigator>
      {/* EN: Home screen / FR: Écran d'accueil */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      {/* EN: Profile screen / FR: Écran de profil */}
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      {/* EN: Chat screen / FR: Écran de chat */}
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      {/* EN: Media gallery screen / FR: Écran de galerie de médias */}
      <Stack.Screen name="MediaGallery" component={MediaGalleryScreen} options={{ title: 'Galerie' }} />
      {/* EN: Settings screen / FR: Écran de paramètres */}
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
      {/* EN: Support screen / FR: Écran de support */}
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Aide & Support' }} />
    </Stack.Navigator>
  );
};

export default MainNavigator;