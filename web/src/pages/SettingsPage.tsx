/**
 * @file SettingsPage.tsx
 * @description
 * EN: This page displays comprehensive user settings and preferences management.
 * FR: Cette page affiche la gestion complète des paramètres et préférences utilisateur.
 */
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  Bell, 
  Shield, 
  Eye, 
  Volume2, 
  Palette, 
  Database, 
  Smartphone,
  Key,
  QrCode,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Settings {
  notifications: {
    messageNotifications: boolean;
    callNotifications: boolean;
    groupNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    doNotDisturb: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showProfilePicture: boolean;
    allowMessagesFromStrangers: boolean;
    allowCallsFromStrangers: boolean;
    showReadReceipts: boolean;
    showTypingIndicator: boolean;
    allowContactDiscovery: boolean;
  };
  audioVideo: {
    defaultCamera: string;
    defaultMicrophone: string;
    defaultSpeaker: string;
    videoQuality: string;
    audioQuality: string;
    noiseCancellation: boolean;
    echoCancellation: boolean;
    autoAnswer: boolean;
  };
  theme: {
    theme: string;
    primaryColor: string;
    fontSize: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    twoFactorAuth: {
      enabled: boolean;
      secret: string | null;
      backupCodes: string[];
    };
    loginNotifications: boolean;
    sessionTimeout: number;
    requirePasswordForSensitiveActions: boolean;
    allowedDevices: Array<{
      deviceId: string;
      deviceName: string;
      lastUsed: string;
      isTrusted: boolean;
    }>;
  };
  data: {
    autoDownloadMedia: boolean;
    compressImages: boolean;
    compressVideos: boolean;
    maxFileSize: number;
    dataSavingMode: boolean;
    syncFrequency: string;
    autoBackup: {
      enabled: boolean;
      frequency: string;
      lastBackup: string | null;
    };
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function SettingsPage() {
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // EN: Load user settings / FR: Charger les paramètres utilisateur
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(data.settings);
    } catch (error) {
      console.error('EN: Error loading settings / FR: Erreur de chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Update specific settings / FR: Mettre à jour des paramètres spécifiques
  const updateSettings = async (category: string, newSettings: any) => {
    try {
      setIsSaving(true);
      await axios.put(`${API_URL}/settings/${category}`, newSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // EN: Update local state / FR: Mettre à jour l'état local
      setSettings(prev => ({
        ...prev!,
        [category]: newSettings
      }));
    } catch (error) {
      console.error('EN: Error updating settings / FR: Erreur de mise à jour des paramètres:', error);
      alert('Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  // EN: Setup two-factor authentication / FR: Configurer l'authentification à deux facteurs
  const setup2FA = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/settings/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrCode(data.data.qrCode);
      setBackupCodes(data.data.backupCodes);
      setShow2FASetup(true);
    } catch (error) {
      console.error('EN: Error setting up 2FA / FR: Erreur de configuration 2FA:', error);
      alert('Erreur lors de la configuration de l\'authentification à deux facteurs');
    }
  };

  // EN: Verify two-factor authentication / FR: Vérifier l'authentification à deux facteurs
  const verify2FA = async () => {
    try {
      await axios.post(`${API_URL}/settings/2fa/verify`, {
        token: verificationCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShow2FASetup(false);
      setVerificationCode('');
      await loadSettings();
      alert('Authentification à deux facteurs activée avec succès !');
    } catch (error) {
      console.error('EN: Error verifying 2FA / FR: Erreur de vérification 2FA:', error);
      alert('Code de vérification invalide');
    }
  };

  // EN: Disable two-factor authentication / FR: Désactiver l'authentification à deux facteurs
  const disable2FA = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?')) return;
    
    try {
      await axios.post(`${API_URL}/settings/2fa/disable`, {
        password: passwordData.currentPassword,
        token: verificationCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await loadSettings();
      alert('Authentification à deux facteurs désactivée avec succès !');
    } catch (error) {
      console.error('EN: Error disabling 2FA / FR: Erreur de désactivation 2FA:', error);
      alert('Erreur lors de la désactivation de l\'authentification à deux facteurs');
    }
  };

  // EN: Change password / FR: Changer le mot de passe
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    try {
      await axios.put(`${API_URL}/settings/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Mot de passe modifié avec succès !');
    } catch (error) {
      console.error('EN: Error changing password / FR: Erreur de changement de mot de passe:', error);
      alert('Erreur lors du changement de mot de passe');
    }
  };

  // EN: Load settings on component mount / FR: Charger les paramètres au montage du composant
  useEffect(() => {
    if (token) {
      loadSettings();
    }
  }, [token]);

  // EN: Tab configuration / FR: Configuration des onglets
  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Eye },
    { id: 'audioVideo', label: 'Audio/Vidéo', icon: Volume2 },
    { id: 'theme', label: 'Thème', icon: Palette },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', label: 'Données', icon: Database }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-sm text-gray-500">Gérez vos préférences et paramètres</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* EN: Sidebar Navigation / FR: Navigation latérale */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* EN: Settings Content / FR: Contenu des paramètres */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* EN: Notifications Tab / FR: Onglet Notifications */}
              {activeTab === 'notifications' && settings && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres de notification</h2>
                  
                  <div className="space-y-6">
                    {/* EN: Message Notifications / FR: Notifications de messages */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Notifications de messages</h3>
                        <p className="text-sm text-gray-500">Recevoir des notifications pour les nouveaux messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.messageNotifications}
                          onChange={(e) => updateSettings('notifications', {
                            ...settings.notifications,
                            messageNotifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* EN: Call Notifications / FR: Notifications d'appels */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Notifications d'appels</h3>
                        <p className="text-sm text-gray-500">Recevoir des notifications pour les appels entrants</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.callNotifications}
                          onChange={(e) => updateSettings('notifications', {
                            ...settings.notifications,
                            callNotifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* EN: Sound Settings / FR: Paramètres sonores */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Sons activés</h3>
                        <p className="text-sm text-gray-500">Jouer des sons pour les notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.soundEnabled}
                          onChange={(e) => updateSettings('notifications', {
                            ...settings.notifications,
                            soundEnabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* EN: Do Not Disturb / FR: Ne pas déranger */}
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Ne pas déranger</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Activer</h4>
                          <p className="text-sm text-gray-500">Désactiver les notifications pendant les heures définies</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.doNotDisturb.enabled}
                            onChange={(e) => updateSettings('notifications', {
                              ...settings.notifications,
                              doNotDisturb: {
                                ...settings.notifications.doNotDisturb,
                                enabled: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {settings.notifications.doNotDisturb.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                            <input
                              type="time"
                              value={settings.notifications.doNotDisturb.startTime}
                              onChange={(e) => updateSettings('notifications', {
                                ...settings.notifications,
                                doNotDisturb: {
                                  ...settings.notifications.doNotDisturb,
                                  startTime: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
                            <input
                              type="time"
                              value={settings.notifications.doNotDisturb.endTime}
                              onChange={(e) => updateSettings('notifications', {
                                ...settings.notifications,
                                doNotDisturb: {
                                  ...settings.notifications.doNotDisturb,
                                  endTime: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* EN: Privacy Tab / FR: Onglet Confidentialité */}
              {activeTab === 'privacy' && settings && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres de confidentialité</h2>
                  
                  <div className="space-y-6">
                    {/* EN: Online Status / FR: Statut en ligne */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Afficher le statut en ligne</h3>
                        <p className="text-sm text-gray-500">Permettre aux autres de voir quand vous êtes en ligne</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showOnlineStatus}
                          onChange={(e) => updateSettings('privacy', {
                            ...settings.privacy,
                            showOnlineStatus: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* EN: Last Seen / FR: Dernière fois vu */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Afficher la dernière fois vu</h3>
                        <p className="text-sm text-gray-500">Permettre aux autres de voir votre dernière activité</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showLastSeen}
                          onChange={(e) => updateSettings('privacy', {
                            ...settings.privacy,
                            showLastSeen: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* EN: Messages from Strangers / FR: Messages d'inconnus */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Autoriser les messages d'inconnus</h3>
                        <p className="text-sm text-gray-500">Permettre aux utilisateurs non contactés de vous envoyer des messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.allowMessagesFromStrangers}
                          onChange={(e) => updateSettings('privacy', {
                            ...settings.privacy,
                            allowMessagesFromStrangers: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* EN: Security Tab / FR: Onglet Sécurité */}
              {activeTab === 'security' && settings && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres de sécurité</h2>
                  
                  <div className="space-y-6">
                    {/* EN: Two-Factor Authentication / FR: Authentification à deux facteurs */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h3>
                          <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire à votre compte</p>
                        </div>
                        <div className="flex items-center">
                          {settings.security.twoFactorAuth.enabled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Désactivé
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!settings.security.twoFactorAuth.enabled ? (
                        <button
                          onClick={setup2FA}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Configurer 2FA
                        </button>
                      ) : (
                        <button
                          onClick={disable2FA}
                          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          Désactiver 2FA
                        </button>
                      )}
                    </div>

                    {/* EN: Change Password / FR: Changer le mot de passe */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={changePassword}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EN: Other tabs content would go here... / FR: Le contenu des autres onglets irait ici... */}
            </div>
          </div>
        </div>
      </div>

      {/* EN: 2FA Setup Modal / FR: Modal de configuration 2FA */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurer l'authentification à deux facteurs</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scannez ce code QR avec votre application d'authentification :
                </p>
                {qrCode && (
                  <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code à 6 chiffres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Codes de sauvegarde</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Sauvegardez ces codes en lieu sûr. Vous en aurez besoin si vous perdez votre appareil :
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <code key={index} className="text-xs bg-yellow-100 px-2 py-1 rounded">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShow2FASetup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={verify2FA}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
