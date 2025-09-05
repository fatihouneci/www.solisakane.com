/**
 * @file App.tsx
 * @description
 * EN: This is the main component of the web application. It sets up the routing for all the pages using react-router-dom.
 * FR: Composant principal de l'application web. Ce fichier met en place le routage pour toutes les pages en utilisant react-router-dom.
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// EN: Import all the page components
// FR: Importation de tous les composants de page
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OtpPage from './pages/OtpPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChatPage from './pages/ChatPage';
import MediaGalleryPage from './pages/MediaGalleryPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import SearchPage from './pages/SearchPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import TechnicalSettingsPage from './pages/TechnicalSettingsPage';

/**
 * EN: The main App component. It defines all the routes for the application.
 * FR: Composant principal de l'application. Il définit toutes les routes de l'application.
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  return (
    <Routes>
      {/* EN: Route for the splash screen / FR: Route pour l'écran de démarrage */}
      <Route path="/" element={<SplashPage />} />
      {/* EN: Route for the login page / FR: Route pour la page de connexion */}
      <Route path="/login" element={<LoginPage />} />
      {/* EN: Route for the registration page / FR: Route pour la page d'inscription */}
      <Route path="/register" element={<RegisterPage />} />
      {/* EN: Route for the forgot password page / FR: Route pour la page de mot de passe oublié */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* EN: Route for the OTP verification page / FR: Route pour la page de vérification OTP */}
      <Route path="/otp" element={<OtpPage />} />
      {/* EN: Route for the home page / FR: Route pour la page d'accueil */}
      <Route path="/home" element={<HomePage />} />
      {/* EN: Route for the user profile page / FR: Route pour la page de profil utilisateur */}
      <Route path="/profile" element={<ProfilePage />} />
      {/* EN: Route for the chat page, with a dynamic chatId parameter / FR: Route pour la page de chat, avec un paramètre dynamique chatId */}
      <Route path="/chat/:chatId" element={<ChatPage />} />
      {/* EN: Route for the media gallery page / FR: Route pour la page de galerie de médias */}
      <Route path="/media" element={<MediaGalleryPage />} />
      {/* EN: Route for the settings page / FR: Route pour la page de paramètres */}
      <Route path="/settings" element={<SettingsPage />} />
      {/* EN: Route for the support page / FR: Route pour la page de support */}
      <Route path="/support" element={<SupportPage />} />
      {/* EN: Route for the search page / FR: Route pour la page de recherche */}
      <Route path="/search" element={<SearchPage />} />
      {/* EN: Route for the notification center page / FR: Route pour la page du centre de notifications */}
      <Route path="/notifications" element={<NotificationCenterPage />} />
      {/* EN: Route for the technical settings page / FR: Route pour la page des paramètres techniques */}
      <Route path="/technical-settings" element={<TechnicalSettingsPage />} />
      {/* EN: Route for the reset password page, with a dynamic userId parameter / FR: Route pour la page de réinitialisation de mot de passe, avec un paramètre dynamique userId */}
      <Route path="/reset-password/:userId" element={<ResetPasswordPage />} />
    </Routes>
  );
}