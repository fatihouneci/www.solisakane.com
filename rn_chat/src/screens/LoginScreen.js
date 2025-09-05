
/**
 * @file LoginScreen.js
 * @description
 * EN: This file contains the LoginScreen component, which handles user login for the mobile application.
 * FR: Ce fichier contient le composant LoginScreen, qui gère la connexion de l'utilisateur pour l'application mobile.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: LoginScreen Component. Renders the login form and handles the authentication process.
 * FR: Composant LoginScreen. Affiche le formulaire de connexion et gère le processus d'authentification.
 */
const LoginScreen = ({ navigation }) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * EN: Handles the login button press.
   * FR: Gère l'appui sur le bouton de connexion.
   */
  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      // EN: The RootNavigator will automatically navigate to the Main stack on success
      // FR: Le RootNavigator naviguera automatiquement vers la pile principale en cas de succès
    } catch (error) {
      Alert.alert('Erreur de connexion', error.response?.data?.message || 'Vos identifiants sont incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Vous n'avez pas de compte ?{' '}
          <Text 
            style={styles.linkText}
            onPress={() => navigation.navigate('Register')}
          >
            Créer un compte
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#6200ee',
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#6200ee',
    fontWeight: '600',
  },
});

export default LoginScreen;
