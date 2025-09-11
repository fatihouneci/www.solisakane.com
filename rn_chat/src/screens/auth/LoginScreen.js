/**
 * Écran de connexion
 * Login screen
 *
 * Interface de connexion avec email/mot de passe
 * Login interface with email/password
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import des constantes / Import constants
import {COLORS, GRADIENTS} from '../../constants/colors';

/**
 * Écran de connexion
 * Login screen
 */
const LoginScreen = () => {
  const navigation = useNavigation();

  // États du formulaire / Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Gérer la connexion
   * Handle login
   */
  const handleLogin = async () => {
    // Validation des champs / Field validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API / API call simulation
      // TODO: Remplacer par l'appel API réel / Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sauvegarder le token / Save token
      await AsyncStorage.setItem('authToken', 'fake-token-123');
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      // Navigation vers l'écran principal / Navigate to main screen
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      // Login error
      Alert.alert('Erreur', 'Échec de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Valider l'email
   * Validate email
   */
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Naviguer vers l'inscription
   * Navigate to registration
   */
  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient colors={GRADIENTS.PRIMARY} style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.PRIMARY_GREEN}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Logo et titre / Logo and title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="chat" size={60} color={COLORS.WHITE} />
            </View>
            <Text style={styles.title}>Solisakane</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          {/* Formulaire de connexion / Login form */}
          <View style={styles.formContainer}>
            {/* Champ email / Email field */}
            <View style={styles.inputContainer}>
              <Icon
                name="email"
                size={20}
                color={COLORS.WHITE}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Champ mot de passe / Password field */}
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color={COLORS.WHITE}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}>
                <Icon
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={COLORS.WHITE}
                />
              </TouchableOpacity>
            </View>

            {/* Bouton de connexion / Login button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            {/* Lien mot de passe oublié / Forgot password link */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Séparateur / Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Bouton d'inscription / Register button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={goToRegister}>
            <Text style={styles.registerButtonText}>
              Créer un nouveau compte
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  header: {
    alignItems: 'center',
    marginBottom: 50,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },

  formContainer: {
    marginBottom: 30,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.WHITE,
    paddingVertical: 16,
  },

  eyeIcon: {
    padding: 4,
  },

  loginButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
  },

  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.8,
  },

  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.7,
  },

  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default LoginScreen;
