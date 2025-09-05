
/**
 * @file HomePage.tsx
 * @description
 * EN: This is the main home page of the application, displayed after a user successfully logs in.
 * It includes a dashboard with communication features, recent chats, and quick actions.
 * FR: Page d'accueil principale de l'application, affichée après la connexion réussie d'un utilisateur.
 * Elle inclut un tableau de bord avec des fonctionnalités de communication, des chats récents et des actions rapides.
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: HomePage Component. A comprehensive dashboard component for the application's home page. 
 * It displays user information, recent chats, quick actions, and communication features.
 * FR: Composant HomePage. Un composant de tableau de bord complet pour la page d'accueil de l'application.
 * Il affiche les informations utilisateur, les chats récents, les actions rapides et les fonctionnalités de communication.
 * @returns {JSX.Element} The rendered HomePage component.
 */
export default function HomePage() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // EN: Load recent chats and online users data
    // FR: Charger les données des chats récents et des utilisateurs en ligne
    loadDashboardData();
  }, []);

  /**
   * EN: Handles navigation to a specific chat.
   * FR: Gère la navigation vers un chat spécifique.
   * @param {string} chatId - The ID of the chat to navigate to. / L'ID du chat vers lequel naviguer.
   */
  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  /**
   * EN: Loads dashboard data including recent chats and online users.
   * FR: Charge les données du tableau de bord incluant les chats récents et les utilisateurs en ligne.
   */
  const loadDashboardData = async () => {
    // EN: Mock data for demonstration - replace with actual API calls
    // FR: Données factices pour la démonstration - remplacer par de vrais appels API
    setRecentChats([
      { id: 1, name: 'John Doe', lastMessage: 'Salut, comment ça va ?', time: '10:30', unread: 2 },
      { id: 2, name: 'Équipe Projet', lastMessage: 'Réunion à 15h', time: '09:45', unread: 0 },
      { id: 3, name: 'Marie Dupont', lastMessage: 'Merci pour le fichier', time: 'Hier', unread: 1 },
    ]);

    setOnlineUsers([
      { id: 1, name: 'Alice Martin', status: 'online' },
      { id: 2, name: 'Bob Wilson', status: 'away' },
      { id: 3, name: 'Claire Dubois', status: 'online' },
    ]);
  };

  /**
   * EN: Handles user logout.
   * FR: Gère la déconnexion de l'utilisateur.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * EN: Handles starting a new chat.
   * FR: Gère le démarrage d'un nouveau chat.
   */
  const handleNewChat = () => {
    // EN: Navigate to chat creation or contact selection
    // FR: Naviguer vers la création de chat ou la sélection de contacts
    console.log('Starting new chat...');
  };

  /**
   * EN: Handles starting a video call.
   * FR: Gère le démarrage d'un appel vidéo.
   */
  const handleVideoCall = () => {
    // EN: Navigate to video call interface
    // FR: Naviguer vers l'interface d'appel vidéo
    console.log('Starting video call...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header with user info and logout / FR: En-tête avec les informations utilisateur et déconnexion */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  Bonjour, {user?.firstName || 'Utilisateur'} !
                </h1>
                <p className="text-sm text-gray-500">Prêt à communiquer ?</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN: Quick Actions / FR: Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleNewChat}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Nouveau Chat</h3>
                <p className="text-sm text-gray-500">Commencer une conversation</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleVideoCall}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Appel Vidéo</h3>
                <p className="text-sm text-gray-500">Lancer un appel vidéo</p>
              </div>
            </div>
          </button>

          <Link
            to="/media"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Galerie</h3>
                <p className="text-sm text-gray-500">Mes fichiers et médias</p>
              </div>
            </div>
          </Link>

          <Link
            to="/settings"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Paramètres</h3>
                <p className="text-sm text-gray-500">Préférences et configuration</p>
              </div>
            </div>
          </Link>

          <Link
            to="/search"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Recherche Globale</h3>
                <p className="text-sm text-gray-500">Rechercher dans tous vos contenus</p>
              </div>
            </div>
          </Link>

          <Link
            to="/notifications"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17h8l-2.586-2.586a2 2 0 00-2.828 0L4.828 17z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Centre de Notifications</h3>
                <p className="text-sm text-gray-500">Voir toutes vos notifications</p>
              </div>
            </div>
          </Link>

          <Link
            to="/technical-settings"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Paramètres Techniques</h3>
                <p className="text-sm text-gray-500">Réseau, sync, sauvegarde, emojis</p>
              </div>
            </div>
          </Link>

          <Link
            to="/support"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Aide & Support</h3>
                <p className="text-sm text-gray-500">FAQ, tutoriels et assistance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Mon Profil</h3>
                <p className="text-sm text-gray-500">Gérer mon compte</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* EN: Recent Chats / FR: Chats récents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Conversations récentes</h2>
              </div>
              <div className="divide-y">
                {recentChats.map((chat) => (
                  <div 
                    key={chat.id} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleChatClick(chat.id.toString())}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {chat.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{chat.name}</h3>
                          <p className="text-sm text-gray-500">{chat.lastMessage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{chat.time}</p>
                        {chat.unread > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EN: Online Users / FR: Utilisateurs en ligne */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">En ligne</h2>
              </div>
              <div className="px-6 py-4">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center mb-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
