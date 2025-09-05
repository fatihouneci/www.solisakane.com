/**
 * @file UserProvider.js
 * @description
 * EN: This file contains the UserProvider component and the useUser hook for the React Native app. It handles the authentication state of the user using AsyncStorage.
 * FR: Ce fichier contient le composant UserProvider et le hook useUser pour l'application React Native. Il gère l'état d'authentification de l'utilisateur en utilisant AsyncStorage.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// EN: Create the context / FR: Création du contexte
const UserContext = createContext(null);

// EN: API base URL. Note: For Android emulator, use 'http://10.0.2.2:PORT' to connect to localhost. For physical devices, use your computer's network IP.
// FR: URL de base de l'API. Note : Pour l'émulateur Android, utilisez 'http://10.0.2.2:PORT' pour vous connecter à localhost. Pour les appareils physiques, utilisez l'adresse IP de votre ordinateur sur le réseau.
const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: UserProvider Component. This component provides the user authentication state and functions to the rest of the application.
 * FR: Composant UserProvider. Ce composant fournit l'état d'authentification de l'utilisateur et les fonctions associées au reste de l'application.
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * EN: Loads the token from AsyncStorage and fetches the user profile if a token exists.
     * FR: Charge le token depuis AsyncStorage et récupère le profil de l'utilisateur si un token existe.
     */
    const loadTokenAndUser = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { data } = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(data.user);
        } catch (error) {
          // EN: Token is invalid or expired, so remove it
          // FR: Le token est invalide ou a expiré, donc on le supprime
          await AsyncStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadTokenAndUser();
  }, [token]);

  /**
   * EN: Logs in the user.
   * FR: Connecte l'utilisateur.
   * @param {string} email - The user's email. / L'email de l'utilisateur.
   * @param {string} password - The user's password. / Le mot de passe de l'utilisateur.
   * @returns {boolean} True if login is successful, false otherwise. / Vrai si la connexion réussit, sinon faux.
   */
  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/login`, { email, password });
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
      setToken(data.token); // EN: This will trigger the useEffect to fetch the user / FR: Ceci déclenchera le useEffect pour récupérer l'utilisateur
      return true;
    }
    return false;
  };

  /**
   * EN: Registers a new user.
   * FR: Enregistre un nouvel utilisateur.
   * @param {object} userData - The user registration data. / Les données d'inscription de l'utilisateur.
   * @returns {boolean} True if registration is successful, false otherwise. / Vrai si l'inscription réussit, sinon faux.
   */
  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, userData);
      if (data.success) {
        // EN: Store activation token for OTP verification / FR: Stocker le token d'activation pour la vérification OTP
        await AsyncStorage.setItem('activationToken', data.activationToken);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  /**
   * EN: Verifies the user's account using activation code.
   * FR: Vérifie le compte de l'utilisateur en utilisant le code d'activation.
   * @param {string} activationCode - The activation code. / Le code d'activation.
   * @returns {boolean} True if verification is successful, false otherwise. / Vrai si la vérification réussit, sinon faux.
   */
  const verifyAccount = async (activationCode) => {
    try {
      const activationToken = await AsyncStorage.getItem('activationToken');
      const { data } = await axios.post(`${API_URL}/activation`, {
        activation_token: activationToken,
        activation_code: activationCode
      });
      
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        await AsyncStorage.removeItem('activationToken');
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  /**
   * EN: Sends forgot password email.
   * FR: Envoie un email de mot de passe oublié.
   * @param {string} email - The user's email. / L'email de l'utilisateur.
   * @returns {boolean} True if email is sent successfully, false otherwise. / Vrai si l'email est envoyé avec succès, sinon faux.
   */
  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
      return data.success;
    } catch (error) {
      throw error;
    }
  };

  /**
   * EN: Verifies the reset password code.
   * FR: Vérifie le code de réinitialisation du mot de passe.
   * @param {string} activationCode - The activation code. / Le code d'activation.
   * @returns {object} User data if verification is successful. / Données utilisateur si la vérification réussit.
   */
  const verifyResetCode = async (activationCode) => {
    try {
      const { data } = await axios.post(`${API_URL}/verify-account`, {
        activation_code: activationCode
      });
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * EN: Resets the user's password.
   * FR: Réinitialise le mot de passe de l'utilisateur.
   * @param {string} userId - The user's ID. / L'ID de l'utilisateur.
   * @param {string} password - The new password. / Le nouveau mot de passe.
   * @returns {boolean} True if password reset is successful, false otherwise. / Vrai si la réinitialisation réussit, sinon faux.
   */
  const resetPassword = async (userId, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/reset-password`, {
        userId,
        password
      });
      return data.success;
    } catch (error) {
      throw error;
    }
  };

  /**
   * EN: Updates the user's profile information.
   * FR: Met à jour les informations du profil de l'utilisateur.
   * @param {object} profileData - The profile data to update. / Les données de profil à mettre à jour.
   * @returns {boolean} True if update is successful, false otherwise. / Vrai si la mise à jour réussit, sinon faux.
   */
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put(`${API_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  /**
   * EN: Logs out the user.
   * FR: Déconnecte l'utilisateur.
   */
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('activationToken');
    setToken(null);
    setUser(null);
  };

  // EN: The value provided to the context consumers
  // FR: La valeur fournie aux consommateurs du contexte
  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyAccount,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    updateProfile,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * EN: Custom hook to use the UserContext.
 * FR: Hook personnalisé pour utiliser le UserContext.
 * @returns The user context. / Le contexte utilisateur.
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};