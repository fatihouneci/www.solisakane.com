/**
 * Écran d'inscription
 * Registration screen
 *
 * Interface d'inscription avec formulaire complet
 * Registration interface with complete form
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
 * Écran d'inscription
 * Registration screen
 */
const RegisterScreen = () => {
  const navigation = useNavigation();

  // États du formulaire / Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  /**
   * Gérer l'inscription
   * Handle registration
   */
  const handleRegister = async () => {
    // Validation des champs / Field validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 6 caractères',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Erreur', "Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API / API call simulation
      // TODO: Remplacer par l'appel API réel / Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sauvegarder les données utilisateur / Save user data
      const userData = {
        firstName,
        lastName,
        email,
        phone,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', 'fake-token-123');
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      Alert.alert('Succès', 'Votre compte a été créé avec succès !', [
        {
          text: 'OK',
          onPress: () => navigation.replace('MainTabs'),
        },
      ]);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      // Registration error
      Alert.alert('Erreur', "Échec de l'inscription. Veuillez réessayer.");
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
   * Naviguer vers la connexion
   * Navigate to login
   */
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  /**
   * Rendre un champ de saisie
   * Render input field
   */
  const renderInput = (
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType = 'default',
    secureText = false,
    showEye = false,
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Icon
          name={icon}
          size={20}
          color={COLORS.PRIMARY_GREEN}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_SECONDARY_LIGHT}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {showEye && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}>
            <Icon
              name={
                secureText
                  ? showPassword
                    ? 'visibility-off'
                    : 'visibility'
                  : 'visibility'
              }
              size={20}
              color={COLORS.TEXT_SECONDARY_LIGHT}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.BACKGROUND_LIGHT}
      style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.BACKGROUND_LIGHT}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled">
          {/* Header / Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={COLORS.PRIMARY_GREEN} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Icon name="person-add" size={40} color={COLORS.PRIMARY_GREEN} />
            </View>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoignez la communauté Solisakane
            </Text>
          </View>

          {/* Formulaire d'inscription / Registration form */}
          <View style={styles.formContainer}>
            {/* Prénom / First name */}
            {renderInput(
              'Prénom *',
              firstName,
              setFirstName,
              'Votre prénom',
              'person',
            )}

            {/* Nom / Last name */}
            {renderInput('Nom *', lastName, setLastName, 'Votre nom', 'person')}

            {/* Email */}
            {renderInput(
              'Email *',
              email,
              setEmail,
              'votre@email.com',
              'email',
              'email-address',
            )}

            {/* Téléphone / Phone */}
            {renderInput(
              'Téléphone',
              phone,
              setPhone,
              '+33 6 12 34 56 78',
              'phone',
              'phone-pad',
            )}

            {/* Mot de passe / Password */}
            {renderInput(
              'Mot de passe *',
              password,
              setPassword,
              'Minimum 6 caractères',
              'lock',
              'default',
              !showPassword,
              true,
            )}

            {/* Confirmation mot de passe / Confirm password */}
            {renderInput(
              'Confirmer le mot de passe *',
              confirmPassword,
              setConfirmPassword,
              'Répétez votre mot de passe',
              'lock',
              'default',
              !showConfirmPassword,
              true,
            )}

            {/* Conditions d'utilisation / Terms and conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}>
              <View
                style={[
                  styles.checkbox,
                  acceptTerms && styles.checkboxChecked,
                ]}>
                {acceptTerms && (
                  <Icon name="check" size={16} color={COLORS.WHITE} />
                )}
              </View>
              <Text style={styles.termsText}>
                J'accepte les{' '}
                <Text style={styles.termsLink}>conditions d'utilisation</Text>{' '}
                et la{' '}
                <Text style={styles.termsLink}>
                  politique de confidentialité
                </Text>
              </Text>
            </TouchableOpacity>

          </View>

          {/* Bouton d'inscription / Register button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}>
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </Text>
          </TouchableOpacity>

          {/* Lien vers la connexion / Link to login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 10,
  },

  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY_GREEN + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    textAlign: 'center',
  },

  formContainer: {
    marginBottom: 5,
  },

  fieldContainer: {
    marginBottom: 5,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 5,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
    minHeight: 40,
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    paddingVertical: 8,
  },

  eyeIcon: {
    padding: 4,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_GREEN,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  checkboxChecked: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    lineHeight: 20,
  },

  termsLink: {
    color: COLORS.PRIMARY_GREEN,
    fontWeight: '600',
  },

  registerButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 10,
    minHeight: 40,
    borderWidth: 2,
    borderColor: '#FF0000', // Bordure rouge temporaire pour debug
  },

  registerButtonDisabled: {
    opacity: 0.6,
  },

  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },

  loginText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  loginLink: {
    fontSize: 14,
    color: COLORS.PRIMARY_GREEN,
    fontWeight: '600',
  },
});

export default RegisterScreen;
