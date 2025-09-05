/**
 * @file RegisterPage.tsx
 * @description
 * EN: This file contains the RegisterPage component, which handles user registration.
 * FR: Ce fichier contient le composant RegisterPage, qui gère l'inscription des utilisateurs.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: RegisterPage Component. This component renders the registration form, handles user input, and orchestrates the registration process using the UserContext.
 * FR: Composant RegisterPage. Ce composant affiche le formulaire d'inscription, gère la saisie de l'utilisateur et orchestre le processus d'inscription à l'aide du UserContext.
 */
export default function RegisterPage() {
  // EN: Get the register function and loading state from the UserProvider
  // FR: Récupération de la fonction d'inscription et de l'état de chargement depuis le UserProvider
  const { register, loading } = useUser();
  const navigate = useNavigate();

  // EN: State for form inputs and error messages
  // FR: État pour les champs du formulaire et les messages d'erreur
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * EN: Handles input changes for form fields.
   * FR: Gère les changements de saisie pour les champs du formulaire.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event. / L'événement de changement d'entrée.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * EN: Handles the form submission for user registration.
   * FR: Gère la soumission du formulaire pour l'inscription de l'utilisateur.
   * @param {React.FormEvent} e - The form event. / L'événement du formulaire.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // EN: Validate password confirmation / FR: Valider la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // EN: Validate password strength / FR: Valider la force du mot de passe
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        setSuccess(true);
        // EN: Redirect to OTP verification page after successful registration / FR: Rediriger vers la page de vérification OTP après une inscription réussie
        setTimeout(() => {
          navigate('/otp');
        }, 2000);
      }
    } catch (err) {
      // EN: Set error message from the API response or a generic one
      // FR: Définir le message d'erreur à partir de la réponse de l'API ou un message générique
      setError(err.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez Solisakane pour commencer à communiquer
          </p>
        </div>

        {/* EN: Display success message if registration is successful / FR: Afficher le message de succès si l'inscription réussit */}
        {success && (
          <div className="p-4 text-green-800 bg-green-100 border border-green-200 rounded-md">
            <p className="text-sm">Inscription réussie ! Redirection vers la vérification...</p>
          </div>
        )}

        {/* EN: Display error message if any / FR: Afficher le message d'erreur s'il y en a un */}
        {error && (
          <div className="p-4 text-red-800 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Votre prénom" 
                required 
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Votre nom" 
                required 
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse e-mail
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="email@example.com" 
              required 
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="Au moins 6 caractères" 
              required 
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="Répétez votre mot de passe" 
              required 
            />
          </div>

          <div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
