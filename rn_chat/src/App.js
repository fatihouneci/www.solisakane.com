
/**
 * @file App.js
 * @description
 * EN: This is the main entry point component for the React Native application. It wraps the entire app with the UserProvider to handle global user state.
 * FR: Ceci est le composant de point d'entrée principal pour l'application React Native. Il enveloppe toute l'application avec le UserProvider pour gérer l'état global de l'utilisateur.
 */
import React from 'react';
import RootNavigator from './navigation/RootNavigator';
import { UserProvider } from './contexts/UserProvider';

/**
 * EN: The main App component.
 * FR: Le composant principal de l'application.
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  return (
    // EN: UserProvider provides user authentication state to the entire app.
    // FR: UserProvider fournit l'état d'authentification de l'utilisateur à toute l'application.
    <UserProvider>
      {/* EN: RootNavigator handles all the navigation logic. */}
      {/* FR: RootNavigator gère toute la logique de navigation. */}
      <RootNavigator />
    </UserProvider>
  );
}
