
/**
 * @file OtpScreen.js
 * @description
 * EN: This file contains the OtpScreen component for OTP verification in the mobile application.
 * FR: Ce fichier contient le composant OtpScreen pour la vérification OTP dans l'application mobile.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: OtpScreen Component. Handles the OTP verification step.
 * FR: Composant OtpScreen. Gère l'étape de vérification de l'OTP.
 */
const OtpScreen = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/verify-account`, { activation_code: otp });
      if (data.success) {
        Alert.alert('Succès', 'OTP vérifié avec succès.');
        navigation.navigate('ResetPassword', { userId: data.user._id });
      }
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Code OTP invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification OTP</Text>
      <Text style={styles.subtitle}>
        Veuillez entrer le code que nous avons envoyé à votre adresse e-mail.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="_ _ _ _"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={4}
        textAlign="center"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Vérifier</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.resendLink}>Renvoyer le code</Text>
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
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 24,
    letterSpacing: 10,
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
  resendLink: {
    textAlign: 'center',
    color: '#6200ee',
    marginTop: 20,
  },
});

export default OtpScreen;
