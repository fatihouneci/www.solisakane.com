/**
 * @file RegisterScreen.js
 * @description
 * EN: This file contains the RegisterScreen component for React Native, which handles user registration.
 * FR: Ce fichier contient le composant RegisterScreen pour React Native, qui gère l'inscription des utilisateurs.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: RegisterScreen Component. This component renders the registration form, handles user input, and orchestrates the registration process using the UserContext.
 * FR: Composant RegisterScreen. Ce composant affiche le formulaire d'inscription, gère la saisie de l'utilisateur et orchestre le processus d'inscription à l'aide du UserContext.
 */
export default function RegisterScreen({ navigation }) {
  // EN: Get the register function and loading state from the UserProvider
  // FR: Récupération de la fonction d'inscription et de l'état de chargement depuis le UserProvider
  const { register, loading } = useUser();

  // EN: State for form inputs
  // FR: État pour les champs du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  /**
   * EN: Handles input changes for form fields.
   * FR: Gère les changements de saisie pour les champs du formulaire.
   * @param {string} field - The field name. / Le nom du champ.
   * @param {string} value - The field value. / La valeur du champ.
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * EN: Handles the form submission for user registration.
   * FR: Gère la soumission du formulaire pour l'inscription de l'utilisateur.
   */
  const handleSubmit = async () => {
    // EN: Validate password confirmation / FR: Valider la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // EN: Validate password strength / FR: Valider la force du mot de passe
    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        Alert.alert(
          'Succès', 
          'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Otp')
            }
          ]
        );
      }
    } catch (err) {
      // EN: Show error message from the API response or a generic one
      // FR: Afficher le message d'erreur à partir de la réponse de l'API ou un message générique
      const errorMessage = err.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.';
      Alert.alert('Erreur', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez Solisakane pour commencer à communiquer
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                autoCapitalize="words"
                required
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                autoCapitalize="words"
                required
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Au moins 6 caractères"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              required
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Répétez votre mot de passe"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              required
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Créer un compte</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vous avez déjà un compte ?{' '}
            <Text 
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              Se connecter
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
