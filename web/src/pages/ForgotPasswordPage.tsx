
/**
 * @file ForgotPasswordPage.tsx
 * @description
 * EN: This file contains the ForgotPasswordPage component, which handles the first step of the password reset process.
 * FR: Ce fichier contient le composant ForgotPasswordPage, qui gère la première étape du processus de réinitialisation de mot de passe.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// EN: API base URL / FR: URL de base de l'API
const API_URL = 'http://localhost:5100/api/auth';

/**
 * EN: ForgotPasswordPage Component. This component handles the first step of the password reset process. It collects the user's email and sends a request to the backend to initiate the password reset flow.
 * FR: Composant ForgotPasswordPage. Ce composant gère la première étape du processus de réinitialisation de mot de passe. Il collecte l'e-mail de l'utilisateur et envoie une requête au backend pour lancer le processus.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  /**
   * EN: Handles the form submission.
   * FR: Gère la soumission du formulaire.
   * @param {React.FormEvent} e - The form event. / L'événement du formulaire.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Mot de passe oublié</h2>
        
        {/* EN: Display success or error messages / FR: Afficher les messages de succès ou d'erreur */}
        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!message && ( // EN: Hide form on success / FR: Masquer le formulaire en cas de succès
          <>
            <p className="text-center text-gray-600">
              Entrez votre adresse e-mail et nous vous enverrons un code OTP pour réinitialiser votre mot de passe.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="text-sm font-medium">Adresse e-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border rounded-md" 
                  placeholder="email@example.com" 
                  required 
                />
              </div>
              <div>
                <button 
                  type="submit" 
                  className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </>
        )}

        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
