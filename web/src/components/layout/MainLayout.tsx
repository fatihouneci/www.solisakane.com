/**
 * Layout principal pour l'application web
 * Main layout for web application
 * 
 * Interface similaire à WhatsApp avec sidebar et zone de contenu
 * WhatsApp-like interface with sidebar and content area
 */

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { cn } from '../../lib/utils';

// Import des icônes / Import icons
import { 
  MessageSquare, 
  Phone, 
  Users, 
  Settings, 
  Moon, 
  Sun,
  LogOut,
  Search
} from 'lucide-react';

// Import des constantes / Import constants
import { COLORS } from '../../constants/colors';

/**
 * Layout principal
 * Main layout
 */
const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Navigation items / Navigation items
  const navigationItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/chats' },
    { id: 'calls', label: 'Appels', icon: Phone, path: '/calls' },
    { id: 'contacts', label: 'Contacts', icon: Users, path: '/contacts' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
  ];

  /**
   * Changer de thème
   * Toggle theme
   */
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  /**
   * Déconnexion
   * Logout
   */
  const handleLogout = () => {
    // TODO: Implémenter la déconnexion / Implement logout
    navigate('/login');
  };

  return (
    <div className={cn(
      "flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors",
      isDarkMode ? "dark" : ""
    )}>
      {/* Sidebar / Sidebar */}
      <div className={cn(
        "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
        "shadow-lg"
      )}>
        {/* Header / Header */}
        <div 
          className="p-6 border-b border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: COLORS.PRIMARY_GREEN }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6" style={{ color: COLORS.PRIMARY_GREEN }} />
              </div>
              <h1 className="text-xl font-bold text-white">Solisakane</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche / Search bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600",
                "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white",
                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              )}
            />
          </div>
        </div>

        {/* Navigation / Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      isActive && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                    )} />
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profil utilisateur / User profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">MD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Marie Dupont
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                En ligne
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de contenu / Content area */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
