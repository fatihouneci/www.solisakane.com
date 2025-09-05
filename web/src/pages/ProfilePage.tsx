
/**
 * @file ProfilePage.tsx
 * @description
 * EN: This file contains the ProfilePage component, which displays and allows editing of the authenticated user's profile information.
 * It includes personal information, contacts management, privacy settings, and account management.
 * FR: Ce fichier contient le composant ProfilePage, qui affiche et permet l'édition des informations du profil de l'utilisateur authentifié.
 * Il inclut les informations personnelles, la gestion des contacts, les paramètres de confidentialité et la gestion du compte.
 */
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import { useNavigate } from 'react-router-dom';

/**
 * EN: ProfilePage Component. A comprehensive profile management component that displays and allows editing of user information.
 * It includes personal details, contacts, privacy settings, and account management features.
 * FR: Composant ProfilePage. Un composant de gestion de profil complet qui affiche et permet l'édition des informations utilisateur.
 * Il inclut les détails personnels, les contacts, les paramètres de confidentialité et les fonctionnalités de gestion de compte.
 */
export default function ProfilePage() {
  const { user, loading, logout, updateProfile } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    telephone: ''
  });
  const [contacts, setContacts] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowMessagesFromStrangers: false,
    showLastSeen: true,
    showProfilePicture: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        telephone: user.telephone || ''
      });
      setPrivacySettings({
        showOnlineStatus: user.notificationSettings?.showOnlineStatus ?? true,
        allowMessagesFromStrangers: user.notificationSettings?.allowMessagesFromStrangers ?? false,
        showLastSeen: user.notificationSettings?.showLastSeen ?? true,
        showProfilePicture: user.notificationSettings?.showProfilePicture ?? true
      });
    }
  }, [user]);

  /**
   * EN: Handles the logout process.
   * FR: Gère le processus de déconnexion.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * EN: Handles form input changes.
   * FR: Gère les changements de saisie du formulaire.
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
   * EN: Handles privacy settings changes.
   * FR: Gère les changements des paramètres de confidentialité.
   * @param {string} setting - The setting name. / Le nom du paramètre.
   * @param {boolean} value - The setting value. / La valeur du paramètre.
   */
  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  /**
   * EN: Handles profile update submission.
   * FR: Gère la soumission de la mise à jour du profil.
   */
  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      // EN: Show success message / FR: Afficher un message de succès
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  /**
   * EN: Handles adding a new contact.
   * FR: Gère l'ajout d'un nouveau contact.
   */
  const handleAddContact = () => {
    const email = prompt('Entrez l\'adresse email du contact :');
    if (email) {
      // EN: Add contact logic here / FR: Logique d'ajout de contact ici
      setContacts(prev => [...prev, { id: Date.now(), email, name: email.split('@')[0] }]);
    }
  };

  /**
   * EN: Handles removing a contact.
   * FR: Gère la suppression d'un contact.
   * @param {number} contactId - The contact ID. / L'ID du contact.
   */
  const handleRemoveContact = (contactId) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
  };

  // EN: Show a loading state while user data is being fetched
  // FR: Afficher un état de chargement pendant la récupération des données de l'utilisateur
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // EN: Show a message if the user is not logged in
  // FR: Afficher un message si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Vous n'êtes pas connecté.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/home')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* EN: Profile Overview / FR: Aperçu du profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">
                    {user.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    En ligne
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* EN: Main Content / FR: Contenu principal */}
          <div className="lg:col-span-3">
            {/* EN: Tab Navigation / FR: Navigation par onglets */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'personal', name: 'Informations personnelles' },
                    { id: 'contacts', name: 'Contacts' },
                    { id: 'privacy', name: 'Confidentialité' },
                    { id: 'security', name: 'Sécurité' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* EN: Personal Information Tab / FR: Onglet Informations personnelles */}
                {activeTab === 'personal' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        {isEditing ? 'Annuler' : 'Modifier'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    {isEditing && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleUpdateProfile}
                          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Sauvegarder
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* EN: Contacts Tab / FR: Onglet Contacts */}
                {activeTab === 'contacts' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Mes Contacts</h3>
                      <button
                        onClick={handleAddContact}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Ajouter un contact
                      </button>
                    </div>

                    <div className="space-y-4">
                      {contacts.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Aucun contact ajouté</p>
                          <p className="text-sm text-gray-400 mt-2">Cliquez sur "Ajouter un contact" pour commencer</p>
                        </div>
                      ) : (
                        contacts.map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-gray-600 font-medium">
                                  {contact.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{contact.name}</p>
                                <p className="text-sm text-gray-500">{contact.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveContact(contact.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* EN: Privacy Tab / FR: Onglet Confidentialité */}
                {activeTab === 'privacy' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Paramètres de confidentialité</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Afficher le statut en ligne</h4>
                          <p className="text-sm text-gray-500">Permettre aux autres de voir quand vous êtes en ligne</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.showOnlineStatus}
                            onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Autoriser les messages d'inconnus</h4>
                          <p className="text-sm text-gray-500">Permettre aux utilisateurs non contactés de vous envoyer des messages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.allowMessagesFromStrangers}
                            onChange={(e) => handlePrivacyChange('allowMessagesFromStrangers', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Afficher la dernière connexion</h4>
                          <p className="text-sm text-gray-500">Permettre aux autres de voir quand vous vous êtes connecté pour la dernière fois</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.showLastSeen}
                            onChange={(e) => handlePrivacyChange('showLastSeen', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Afficher la photo de profil</h4>
                          <p className="text-sm text-gray-500">Permettre aux autres de voir votre photo de profil</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.showProfilePicture}
                            onChange={(e) => handlePrivacyChange('showProfilePicture', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* EN: Security Tab / FR: Onglet Sécurité */}
                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Sécurité du compte</h3>
                    
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Changer le mot de passe</h4>
                        <p className="text-sm text-gray-500 mb-4">Mettez à jour votre mot de passe pour sécuriser votre compte</p>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                          Changer le mot de passe
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Sessions actives</h4>
                        <p className="text-sm text-gray-500 mb-4">Gérez vos sessions de connexion actives</p>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                          Voir les sessions
                        </button>
                      </div>

                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h4 className="text-sm font-medium text-red-900 mb-2">Zone dangereuse</h4>
                        <p className="text-sm text-red-700 mb-4">Supprimer définitivement votre compte</p>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                          Supprimer le compte
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
