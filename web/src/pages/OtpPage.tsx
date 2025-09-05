
/**
 * @file OtpPage.tsx
 * @description
 * EN: This file contains the OtpPage component for OTP verification.
 * FR: Ce fichier contient le composant OtpPage pour la vérification OTP.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// EN: API base URL / FR: URL de base de l'API
const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: OtpPage Component. This component handles the OTP verification step.
 * FR: Composant OtpPage. Ce composant gère l'étape de vérification de l'OTP.
 */
export default function OtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * EN: Handles the form submission for OTP verification.
   * FR: Gère la soumission du formulaire pour la vérification de l'OTP.
   * @param {React.FormEvent} e - The form event. / L'événement du formulaire.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/verify-account`, { activation_code: otp });
      if (data.success) {
        // EN: On success, navigate to the reset password page with the user ID
        // FR: En cas de succès, naviguer vers la page de réinitialisation du mot de passe avec l'ID utilisateur
        navigate(`/reset-password/${data.user._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or request expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Vérification OTP</h2>
        
        {error && <p className="text-red-500 text-center">{error}</p>}

        <p className="text-center text-gray-600">
          Veuillez entrer le code à 4 chiffres que nous avons envoyé à votre adresse e-mail.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="text-sm font-medium">Code OTP</label>
            <input 
              type="text" 
              id="otp" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-center border rounded-md" 
              placeholder="_ _ _ _" 
              maxLength="4" // EN: The backend generates a 4-digit token / FR: Le backend génère un token à 4 chiffres
              required 
            />
          </div>
          <div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={loading}
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button className="font-medium text-indigo-600 hover:text-indigo-500">
            Renvoyer le code
          </button>
        </div>
      </div>
    </div>
  );
}
