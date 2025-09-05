
/**
 * @file ForgotPasswordScreen.js
 * @description
 * EN: This file contains the ForgotPasswordScreen component, which handles the first step of the password reset process for the mobile application.
 * FR: Ce fichier contient le composant ForgotPasswordScreen, qui gère la première étape du processus de réinitialisation de mot de passe pour l'application mobile.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: ForgotPasswordScreen Component. Handles the first step of the password reset process.
 * FR: Composant ForgotPasswordScreen. Gère la première étape du processus de réinitialisation de mot de passe.
 */
const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
      Alert.alert('Succès', data.message);
      navigation.navigate('Otp'); // EN: Navigate to OTP screen on success / FR: Naviguer vers l'écran OTP en cas de succès
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.subtitle}>
        Entrez votre adresse e-mail pour recevoir un code de réinitialisation.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Envoyer</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backLink}>Retour à la connexion</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
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
  backLink: {
    textAlign: 'center',
    color: '#6200ee',
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
