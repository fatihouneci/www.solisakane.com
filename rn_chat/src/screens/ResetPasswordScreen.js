/**
 * @file ResetPasswordScreen.js
 * @description
 * EN: This file contains the ResetPasswordScreen component, which is the final step in the password reset process for the mobile application.
 * FR: Ce fichier contient le composant ResetPasswordScreen, qui est l'étape finale du processus de réinitialisation de mot de passe pour l'application mobile.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: ResetPasswordScreen Component. The final step of the password reset process.
 * FR: Composant ResetPasswordScreen. L'étape finale du processus de réinitialisation de mot de passe.
 */
const ResetPasswordScreen = ({ route, navigation }) => {
  const { userId } = route.params; // EN: Get userId from navigation params / FR: Récupérer l'userId depuis les paramètres de navigation
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * EN: Handles the password reset button press.
   * FR: Gère l'appui sur le bouton de réinitialisation du mot de passe.
   */
  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/reset-password`, { userId, password });
      Alert.alert('Succès', data.message);
      navigation.navigate('Login'); // EN: Navigate to Login screen after successful reset / FR: Naviguer vers l'écran de connexion après une réinitialisation réussie
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialiser le mot de passe</Text>
      <TextInput
        style={styles.input}
        placeholder="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Réinitialiser</Text>
        )}
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
});

export default ResetPasswordScreen;