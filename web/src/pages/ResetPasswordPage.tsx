/**
 * @file ResetPasswordPage.tsx
 * @description
 * EN: This file contains the ResetPasswordPage component, which is the final step in the password reset process.
 * FR: Ce fichier contient le composant ResetPasswordPage, qui est l'étape finale du processus de réinitialisation de mot de passe.
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// EN: API base URL / FR: URL de base de l'API
const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: ResetPasswordPage Component. This is the final step in the password reset process. The user enters and confirms their new password.
 * FR: Composant ResetPasswordPage. C'est l'étape finale du processus de réinitialisation de mot de passe. L'utilisateur saisit et confirme son nouveau mot de passe.
 */
export default function ResetPasswordPage() {
  const { userId } = useParams(); // EN: Get userId from URL / FR: Récupérer l'userId depuis l'URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  /**
   * EN: Handles the form submission to reset the password.
   * FR: Gère la soumission du formulaire pour réinitialiser le mot de passe.
   * @param {React.FormEvent} e - The form event. / L'événement du formulaire.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const { data } = await axios.post(`${API_URL}/reset-password`, { userId, password });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000); // EN: Redirect to login after 3s / FR: Rediriger vers la connexion après 3s
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Réinitialiser le mot de passe</h2>
        
        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md">
              {loading ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}