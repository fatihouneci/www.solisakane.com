import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types pour l'utilisateur
export interface User {
  id: number;
  _id?: string; // Pour compatibilité avec MongoDB
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  bio?: string;
  telephone?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    showOnlineStatus: boolean;
    allowMessagesFromStrangers: boolean;
    showLastSeen: boolean;
    showProfilePicture: boolean;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    soundEnabled: boolean;
  };
}

// Types pour l'authentification
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Types pour les actions
export interface UserContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  // Propriétés de compatibilité
  loading: boolean;
  token: string | null;
}

// Créer le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props pour le provider
interface UserProviderProps {
  children: ReactNode;
}

// Provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
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
      
      // Vérifier le token dans localStorage
      const token = localStorage.getItem('authToken');
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
        localStorage.removeItem('authToken');
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

  const login = async (email: string, password: string): Promise<void> => {
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
        localStorage.setItem('authToken', data.token);
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
        throw new Error(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur de connexion',
      }));
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
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

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!authState.user) return;

      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const token = localStorage.getItem('authToken');
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
          user: { ...prev.user!, ...data.user },
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

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      if (!authState.user) return;

      const token = localStorage.getItem('authToken');
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
            ...prev.user!,
            preferences: { ...prev.user!.preferences, ...data.preferences },
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

  const contextValue: UserContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    refreshUser,
    clearError,
    // Propriétés de compatibilité
    loading: authState.isLoading,
    token: localStorage.getItem('authToken'),
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useUser = (): UserContextType => {
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