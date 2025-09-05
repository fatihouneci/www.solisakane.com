import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Créer le contexte
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Vérifier le token dans AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Appel API pour vérifier le token
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          user: userData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Token invalide
        await AsyncStorage.removeItem('authToken');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erreur de connexion',
      });
    }
  };

  const login = async (email, password) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Erreur de connexion',
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur de connexion',
      }));
    }
  };

  const register = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Après l'inscription, connecter automatiquement l'utilisateur
        await login(userData.email, userData.password);
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Erreur lors de l\'inscription',
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de l\'inscription',
      }));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const updateProfile = async (userData) => {
    try {
      if (!authState.user) return;

      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState(prev => ({
          ...prev,
          user: { ...prev.user, ...data.user },
          isLoading: false,
          error: null,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Erreur lors de la mise à jour',
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la mise à jour',
      }));
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      if (!authState.user) return;

      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            preferences: { ...prev.user.preferences, ...data.preferences },
          },
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const contextValue = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    refreshUser,
    clearError,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Hook pour vérifier l'authentification
export const useAuth = () => {
  const { isAuthenticated, isLoading, user } = useUser();
  return { isAuthenticated, isLoading, user };
};

export default UserProvider;