import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthCheck = ({ onAuthComplete }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Simuler un délai de vérification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si l'utilisateur est connecté
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userToken && userData) {
        // Utilisateur connecté - aller au dashboard
        onAuthComplete({ isAuthenticated: true, userData: JSON.parse(userData) });
      } else {
        // Utilisateur non connecté - aller à l'écran de choix
        onAuthComplete({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      // En cas d'erreur, considérer comme non connecté
      onAuthComplete({ isAuthenticated: false });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#45a049', '#2E7D32']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>S</Text>
        </View>
        
        <Text style={styles.appName}>Solisakane</Text>
        <Text style={styles.checkingText}>Vérification de votre compte...</Text>
        
        <ActivityIndicator 
          size="large" 
          color="#ffffff" 
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  checkingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default AuthCheck;
