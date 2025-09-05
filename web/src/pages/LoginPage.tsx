
/**
 * @file LoginPage.tsx
 * @description
 * EN: This file contains the LoginPage component, which handles user login.
 * FR: Ce fichier contient le composant LoginPage, qui gère la connexion de l'utilisateur.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: LoginPage Component. This component renders the login form, handles user input, and orchestrates the login process using the UserContext.
 * FR: Composant LoginPage. Ce composant affiche le formulaire de connexion, gère la saisie de l'utilisateur et orchestre le processus de connexion à l'aide du UserContext.
 */
export default function LoginPage() {
  // EN: Get the login function and loading state from the UserProvider
  // FR: Récupération de la fonction de connexion et de l'état de chargement depuis le UserProvider
  const { login, loading } = useUser();
  const navigate = useNavigate();

  // EN: State for form inputs and error messages
  // FR: État pour les champs du formulaire et les messages d'erreur
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  /**
   * EN: Handles the form submission for logging in.
   * FR: Gère la soumission du formulaire pour la connexion.
   * @param {React.FormEvent} e - The form event. / L'événement du formulaire.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // EN: Reset error before new submission / FR: Réinitialiser l'erreur avant une nouvelle soumission

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/home'); // EN: Redirect to home on successful login / FR: Rediriger vers l'accueil en cas de connexion réussie
      }
    } catch (err) {
      // EN: Set error message from the API response or a generic one
      // FR: Définir le message d'erreur à partir de la réponse de l'API ou un message générique
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>
        {/* EN: Display error message if any / FR: Afficher le message d'erreur s'il y en a un */}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="email@example.com" 
              required 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="********" 
              required 
            />
          </div>
          <div className="text-sm text-right">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Mot de passe oublié ?
            </Link>
          </div>
          <div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
