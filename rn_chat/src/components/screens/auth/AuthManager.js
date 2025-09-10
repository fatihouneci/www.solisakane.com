import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthCheck from './AuthCheck';
import AuthChoice from './AuthChoice';
import LoginScreen from './LoginScreen';
import OTPEmailScreen from './OTPEmailScreen';
import OTPScreen from './OTPScreen';
import PasswordSetupScreen from './PasswordSetupScreen';
import Dashboard from '../dashboard/Dashboard';

const AuthManager = ({ onComplete, onNavigateToMedia }) => {
  const [currentScreen, setCurrentScreen] = useState('authCheck');
  const [userData, setUserData] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    email: '',
    otpCode: '',
  });

  // Gestionnaire pour la vérification d'authentification
  const handleAuthCheckComplete = (result) => {
    if (result.isAuthenticated) {
      setUserData(result.userData);
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('authChoice');
    }
  };

  // Gestionnaire pour le choix d'authentification
  const handleLoginPress = () => {
    setCurrentScreen('login');
  };

  const handleRegisterPress = () => {
    setCurrentScreen('otpEmail');
  };

  // Gestionnaire pour la connexion réussie
  const handleLoginSuccess = (user) => {
    setUserData(user);
    setCurrentScreen('dashboard');
  };

  // Gestionnaire pour l'email validé (OTP)
  const handleEmailValidated = (email) => {
    setRegistrationData(prev => ({ ...prev, email }));
    setCurrentScreen('otp');
  };

  // Gestionnaire pour l'OTP validé
  const handleOTPValidated = (email, otpCode) => {
    setRegistrationData(prev => ({ ...prev, email, otpCode }));
    setCurrentScreen('passwordSetup');
  };

  // Gestionnaire pour l'inscription réussie
  const handlePasswordSet = (userData) => {
    setUserData(userData);
    setCurrentScreen('dashboard');
  };

  // Gestionnaire pour retour au choix d'authentification
  const handleBackToChoice = () => {
    setCurrentScreen('authChoice');
    setRegistrationData({ email: '', otpCode: '' });
  };

  // Gestionnaire pour retour à l'écran email
  const handleBackToEmail = () => {
    setCurrentScreen('otpEmail');
    setRegistrationData(prev => ({ ...prev, otpCode: '' }));
  };

  // Gestionnaire pour retour à l'écran OTP
  const handleBackToOTP = () => {
    setCurrentScreen('otp');
  };

  // Gestionnaire pour la déconnexion
  const handleLogout = () => {
    setUserData(null);
    setRegistrationData({ email: '', otpCode: '' });
    setCurrentScreen('authChoice');
  };

  // Gestionnaire pour terminer le flux d'authentification
  const handleAuthComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Rendu conditionnel des écrans
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'authCheck':
        return <AuthCheck onAuthComplete={handleAuthCheckComplete} />;
      
      case 'authChoice':
        return (
          <AuthChoice
            onLogin={handleLoginPress}
            onRegister={handleRegisterPress}
          />
        );
      
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onBack={handleBackToChoice}
          />
        );
      
      case 'otpEmail':
        return (
          <OTPEmailScreen
            onEmailValidated={handleEmailValidated}
            onBack={handleBackToChoice}
          />
        );
      
      case 'otp':
        return (
          <OTPScreen
            email={registrationData.email}
            onOTPValidated={handleOTPValidated}
            onBack={handleBackToEmail}
          />
        );
      
      case 'passwordSetup':
        return (
          <PasswordSetupScreen
            email={registrationData.email}
            onPasswordSet={handlePasswordSet}
            onBack={handleBackToOTP}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard
            userData={userData}
            onLogout={handleLogout}
            onNavigateToMedia={onNavigateToMedia}
          />
        );
      
      default:
        return <AuthCheck onAuthComplete={handleAuthCheckComplete} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthManager;
