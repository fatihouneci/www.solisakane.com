/**
 * Application Solisakane Web - Point d'entrée principal
 * Solisakane Web Application - Main entry point
 * 
 * Configuration de l'application web avec React Router
 * Web application setup with React Router
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from 'next-themes';

// Import des composants / Import components
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import MainLayout from './components/layout/MainLayout';
import ChatListScreen from './components/chat/ChatListScreen';
import CallListScreen from './components/calls/CallListScreen';
import ContactsScreen from './components/contacts/ContactsScreen';
import SettingsScreen from './components/settings/SettingsScreen';

// Import des constantes / Import constants
import { COLORS } from './constants/colors';

/**
 * Composant principal de l'application web
 * Main web application component
 */
export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      themes={['light', 'dark']}
      enableSystem={false}
    >
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Écran de démarrage / Splash screen */}
            <Route path="/splash" element={<SplashScreen />} />
            
            {/* Onboarding / Onboarding */}
            <Route path="/onboarding" element={<OnboardingScreen />} />
            
            {/* Authentification / Authentication */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            
            {/* Interface principale / Main interface */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/chats" replace />} />
              <Route path="chats" element={<ChatListScreen />} />
              <Route path="calls" element={<CallListScreen />} />
              <Route path="contacts" element={<ContactsScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
            </Route>
            
            {/* Redirection par défaut / Default redirect */}
            <Route path="*" element={<Navigate to="/chats" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}