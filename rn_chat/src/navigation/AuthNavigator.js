
/**
 * @file AuthNavigator.js
 * @description
 * EN: This file contains the navigation stack for the authentication flow (Login, Forgot Password, etc.).
 * FR: Ce fichier contient la pile de navigation pour le flux d'authentification (Connexion, Mot de passe oublié, etc.).
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpScreen from '../screens/OtpScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createStackNavigator();

/**
 * EN: AuthNavigator Component. This navigator handles the screens related to user authentication.
 * FR: Composant AuthNavigator. Ce navigateur gère les écrans liés à l'authentification de l'utilisateur.
 */
const AuthNavigator = () => {
  return (
    // EN: Stack.Navigator groups the authentication screens. `headerShown: false` hides the default header.
    // FR: Stack.Navigator regroupe les écrans d'authentification. `headerShown: false` masque l'en-tête par défaut.
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
