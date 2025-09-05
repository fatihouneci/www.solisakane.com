/**
 * @file TechnicalSettingsPage.tsx
 * @description
 * EN: This page provides technical settings for network, sync, backup, and emoji management.
 * FR: Cette page fournit les paramètres techniques pour le réseau, la synchronisation, la sauvegarde et la gestion des emojis.
 */
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow, 
  SignalZero,
  Database, 
  Cloud, 
  CloudOff, 
  Sync, 
  RefreshCw, 
  Download, 
  Upload,
  Save, 
  Trash2, 
  Settings, 
  Smartphone, 
  Monitor, 
  Tablet,
  Smile, 
  Heart, 
  ThumbsUp, 
  Laugh, 
  Angry, 
  Sad,
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Info,
  Clock,
  HardDrive,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Zap,
  Battery,
  Activity
} from 'lucide-react';

interface NetworkStatus {
  isConnected: boolean;
  connectionType: string;
  signalStrength: number;
  bandwidth: {
    download: number;
    upload: number;
    latency: number;
  };
  lastConnected: string;
  connectionDuration: number;
  reconnectAttempts: number;
}

interface DataSavingMode {
  enabled: boolean;
  autoEnable: boolean;
  cellularThreshold: number;
  settings: {
    compressImages: boolean;
    reduceVideoQuality: boolean;
    limitAutoDownload: boolean;
    disableAnimations: boolean;
    reduceSyncFrequency: boolean;
    blockLargeFiles: boolean;
    maxFileSize: number;
  };
  dataUsage: {
    today: number;
    thisMonth: number;
    limit: number;
  };
}

interface SyncStatus {
  lastSync: string;
  syncFrequency: number;
  autoSync: boolean;
  syncTypes: {
    messages: boolean;
    files: boolean;
    contacts: boolean;
    settings: boolean;
    statuses: boolean;
    notifications: boolean;
  };
  pendingSync: any[];
  syncErrors: any[];
}

interface BackupSettings {
  enabled: boolean;
  frequency: string;
  lastBackup: string;
  nextBackup: string;
  backupTypes: {
    messages: boolean;
    files: boolean;
    contacts: boolean;
    settings: boolean;
    statuses: boolean;
  };
  storageLocation: string;
  encryption: {
    enabled: boolean;
    algorithm: string;
  };
  retention: number;
}

interface EmojiSettings {
  enabled: boolean;
  skinTone: string;
  categories: {
    people: boolean;
    nature: boolean;
    food: boolean;
    activity: boolean;
    travel: boolean;
    objects: boolean;
    symbols: boolean;
    flags: boolean;
  };
  recentEmojis: Array<{
    emoji: string;
    usageCount: number;
    lastUsed: string;
  }>;
  favorites: Array<{
    emoji: string;
    addedAt: string;
  }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function TechnicalSettingsPage() {
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [activeTab, setActiveTab] = useState('network');
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId] = useState('web-' + Date.now()); // EN: Generate device ID / FR: Générer ID d'appareil
  
  // EN: Technical settings states / FR: États des paramètres techniques
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [dataSavingMode, setDataSavingMode] = useState<DataSavingMode | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [emojiSettings, setEmojiSettings] = useState<EmojiSettings | null>(null);

  // EN: Tab configuration / FR: Configuration des onglets
  const tabs = [
    { id: 'network', label: 'Réseau', icon: Wifi },
    { id: 'data-saving', label: 'Économie de Données', icon: Battery },
    { id: 'sync', label: 'Synchronisation', icon: Sync },
    { id: 'backup', label: 'Sauvegarde', icon: Cloud },
    { id: 'emoji', label: 'Emojis', icon: Smile }
  ];

  // EN: Connection type icons / FR: Icônes de type de connexion
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Wifi;
      case 'cellular': return Smartphone;
      case 'ethernet': return Monitor;
      default: return WifiOff;
    }
  };

  // EN: Signal strength icon / FR: Icône de force du signal
  const getSignalIcon = (strength: number) => {
    if (strength >= 80) return SignalHigh;
    if (strength >= 60) return SignalMedium;
    if (strength >= 40) return SignalLow;
    return SignalZero;
  };

  // EN: Format file size / FR: Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // EN: Format data usage percentage / FR: Formater le pourcentage d'utilisation des données
  const getDataUsagePercentage = () => {
    if (!dataSavingMode) return 0;
    return (dataSavingMode.dataUsage.thisMonth / dataSavingMode.dataUsage.limit) * 100;
  };

  // EN: Get data usage color / FR: Récupérer la couleur d'utilisation des données
  const getDataUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  // EN: Load network status / FR: Charger le statut réseau
  const loadNetworkStatus = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/network/${deviceId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNetworkStatus(data.network.connectionStatus);
    } catch (error) {
      console.error('EN: Error loading network status / FR: Erreur de chargement du statut réseau:', error);
    }
  };

  // EN: Load data saving mode / FR: Charger le mode d'économie de données
  const loadDataSavingMode = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/network/${deviceId}/data-saving`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataSavingMode(data.dataSavingMode);
    } catch (error) {
      console.error('EN: Error loading data saving mode / FR: Erreur de chargement du mode d\'économie de données:', error);
    }
  };

  // EN: Load sync status / FR: Charger le statut de synchronisation
  const loadSyncStatus = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/network/${deviceId}/sync`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyncStatus(data.syncStatus);
    } catch (error) {
      console.error('EN: Error loading sync status / FR: Erreur de chargement du statut de sync:', error);
    }
  };

  // EN: Load backup settings / FR: Charger les paramètres de sauvegarde
  const loadBackupSettings = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/network/${deviceId}/backup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackupSettings(data.backupSettings);
    } catch (error) {
      console.error('EN: Error loading backup settings / FR: Erreur de chargement des paramètres de sauvegarde:', error);
    }
  };

  // EN: Load emoji settings / FR: Charger les paramètres d'emojis
  const loadEmojiSettings = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/network/${deviceId}/emoji`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmojiSettings(data.emojiSettings);
    } catch (error) {
      console.error('EN: Error loading emoji settings / FR: Erreur de chargement des paramètres d\'emojis:', error);
    }
  };

  // EN: Update data saving mode / FR: Mettre à jour le mode d'économie de données
  const updateDataSavingMode = async (updates: Partial<DataSavingMode>) => {
    if (!token || !dataSavingMode) return;

    try {
      const { data } = await axios.put(`${API_URL}/network/${deviceId}/data-saving`, {
        dataSavingMode: { ...dataSavingMode, ...updates }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataSavingMode(data.dataSavingMode);
    } catch (error) {
      console.error('EN: Error updating data saving mode / FR: Erreur de mise à jour du mode d\'économie de données:', error);
    }
  };

  // EN: Update sync settings / FR: Mettre à jour les paramètres de synchronisation
  const updateSyncSettings = async (updates: Partial<SyncStatus>) => {
    if (!token || !syncStatus) return;

    try {
      const { data } = await axios.put(`${API_URL}/network/${deviceId}/sync`, {
        syncSettings: { ...syncStatus, ...updates }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyncStatus(data.syncStatus);
    } catch (error) {
      console.error('EN: Error updating sync settings / FR: Erreur de mise à jour des paramètres de sync:', error);
    }
  };

  // EN: Update backup settings / FR: Mettre à jour les paramètres de sauvegarde
  const updateBackupSettings = async (updates: Partial<BackupSettings>) => {
    if (!token || !backupSettings) return;

    try {
      const { data } = await axios.put(`${API_URL}/network/${deviceId}/backup`, {
        backupSettings: { ...backupSettings, ...updates }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackupSettings(data.backupSettings);
    } catch (error) {
      console.error('EN: Error updating backup settings / FR: Erreur de mise à jour des paramètres de sauvegarde:', error);
    }
  };

  // EN: Update emoji settings / FR: Mettre à jour les paramètres d'emojis
  const updateEmojiSettings = async (updates: Partial<EmojiSettings>) => {
    if (!token || !emojiSettings) return;

    try {
      const { data } = await axios.put(`${API_URL}/network/${deviceId}/emoji`, {
        emojiSettings: { ...emojiSettings, ...updates }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmojiSettings(data.emojiSettings);
    } catch (error) {
      console.error('EN: Error updating emoji settings / FR: Erreur de mise à jour des paramètres d\'emojis:', error);
    }
  };

  // EN: Trigger manual backup / FR: Déclencher une sauvegarde manuelle
  const triggerBackup = async () => {
    if (!token) return;

    try {
      await axios.post(`${API_URL}/network/${deviceId}/backup/trigger`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadBackupSettings(); // EN: Reload backup settings / FR: Recharger les paramètres de sauvegarde
    } catch (error) {
      console.error('EN: Error triggering backup / FR: Erreur de déclenchement de sauvegarde:', error);
    }
  };

  // EN: Load all technical settings / FR: Charger tous les paramètres techniques
  const loadAllSettings = async () => {
    setIsLoading(true);
    await Promise.all([
      loadNetworkStatus(),
      loadDataSavingMode(),
      loadSyncStatus(),
      loadBackupSettings(),
      loadEmojiSettings()
    ]);
    setIsLoading(false);
  };

  // EN: Load settings on component mount / FR: Charger les paramètres au montage du composant
  useEffect(() => {
    loadAllSettings();
  }, [token]);

  // EN: Render network tab / FR: Rendre l'onglet réseau
  const renderNetworkTab = () => (
    <div className="space-y-6">
      {/* EN: Connection Status / FR: Statut de Connexion */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statut de Connexion</h3>
        
        {networkStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              {networkStatus.isConnected ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {networkStatus.isConnected ? 'Connecté' : 'Déconnecté'}
                </p>
                <p className="text-xs text-gray-500">
                  {networkStatus.connectionType.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {React.createElement(getSignalIcon(networkStatus.signalStrength), {
                className: `h-6 w-6 ${networkStatus.signalStrength >= 60 ? 'text-green-500' : networkStatus.signalStrength >= 40 ? 'text-yellow-500' : 'text-red-500'}`
              })}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Signal: {networkStatus.signalStrength}%
                </p>
                <p className="text-xs text-gray-500">
                  {networkStatus.bandwidth?.download ? `${networkStatus.bandwidth.download} Mbps` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Durée: {Math.floor(networkStatus.connectionDuration / 3600)}h {Math.floor((networkStatus.connectionDuration % 3600) / 60)}m
                </p>
                <p className="text-xs text-gray-500">
                  Tentatives: {networkStatus.reconnectAttempts}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EN: Network Statistics / FR: Statistiques Réseau */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques Réseau</h3>
        
        {networkStatus?.bandwidth && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Téléchargement</p>
              <p className="text-lg font-bold text-blue-600">{networkStatus.bandwidth.download} Mbps</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Téléversement</p>
              <p className="text-lg font-bold text-green-600">{networkStatus.bandwidth.upload} Mbps</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Latence</p>
              <p className="text-lg font-bold text-purple-600">{networkStatus.bandwidth.latency} ms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // EN: Render data saving tab / FR: Rendre l'onglet économie de données
  const renderDataSavingTab = () => (
    <div className="space-y-6">
      {/* EN: Data Usage Overview / FR: Aperçu de l'Utilisation des Données */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisation des Données</h3>
        
        {dataSavingMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Ce mois</span>
              <span className={`text-sm font-bold ${getDataUsageColor(getDataUsagePercentage())}`}>
                {formatFileSize(dataSavingMode.dataUsage.thisMonth)} / {formatFileSize(dataSavingMode.dataUsage.limit)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  getDataUsagePercentage() >= 90 ? 'bg-red-500' :
                  getDataUsagePercentage() >= 75 ? 'bg-orange-500' :
                  getDataUsagePercentage() >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(getDataUsagePercentage(), 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Aujourd'hui</span>
              <span className="text-sm text-gray-600">{formatFileSize(dataSavingMode.dataUsage.today)}</span>
            </div>
          </div>
        )}
      </div>

      {/* EN: Data Saving Settings / FR: Paramètres d'Économie de Données */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres d'Économie</h3>
        
        {dataSavingMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Mode d'économie activé</p>
                <p className="text-xs text-gray-500">Réduire l'utilisation des données</p>
              </div>
              <button
                onClick={() => updateDataSavingMode({ enabled: !dataSavingMode.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dataSavingMode.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dataSavingMode.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Activation automatique</p>
                <p className="text-xs text-gray-500">Activer sur réseau mobile</p>
              </div>
              <button
                onClick={() => updateDataSavingMode({ autoEnable: !dataSavingMode.autoEnable })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dataSavingMode.autoEnable ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dataSavingMode.autoEnable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Compresser les images</span>
                <button
                  onClick={() => updateDataSavingMode({
                    settings: { ...dataSavingMode.settings, compressImages: !dataSavingMode.settings.compressImages }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dataSavingMode.settings.compressImages ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dataSavingMode.settings.compressImages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Réduire la qualité vidéo</span>
                <button
                  onClick={() => updateDataSavingMode({
                    settings: { ...dataSavingMode.settings, reduceVideoQuality: !dataSavingMode.settings.reduceVideoQuality }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dataSavingMode.settings.reduceVideoQuality ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dataSavingMode.settings.reduceVideoQuality ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Bloquer les gros fichiers</span>
                <button
                  onClick={() => updateDataSavingMode({
                    settings: { ...dataSavingMode.settings, blockLargeFiles: !dataSavingMode.settings.blockLargeFiles }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dataSavingMode.settings.blockLargeFiles ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dataSavingMode.settings.blockLargeFiles ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // EN: Render sync tab / FR: Rendre l'onglet synchronisation
  const renderSyncTab = () => (
    <div className="space-y-6">
      {/* EN: Sync Status / FR: Statut de Sync */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statut de Synchronisation</h3>
        
        {syncStatus && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Synchronisation automatique</p>
                <p className="text-xs text-gray-500">Synchroniser automatiquement les données</p>
              </div>
              <button
                onClick={() => updateSyncSettings({ autoSync: !syncStatus.autoSync })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  syncStatus.autoSync ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    syncStatus.autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Dernière sync</p>
                <p className="text-xs text-gray-500">
                  {new Date(syncStatus.lastSync).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">En attente</p>
                <p className="text-xs text-gray-500">{syncStatus.pendingSync.length} éléments</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Erreurs</p>
                <p className="text-xs text-gray-500">
                  {syncStatus.syncErrors.filter(error => !error.resolved).length} erreurs
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EN: Sync Types / FR: Types de Sync */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Types de Synchronisation</h3>
        
        {syncStatus && (
          <div className="space-y-3">
            {Object.entries(syncStatus.syncTypes).map(([type, enabled]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{type}</span>
                <button
                  onClick={() => updateSyncSettings({
                    syncTypes: { ...syncStatus.syncTypes, [type]: !enabled }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // EN: Render backup tab / FR: Rendre l'onglet sauvegarde
  const renderBackupTab = () => (
    <div className="space-y-6">
      {/* EN: Backup Status / FR: Statut de Sauvegarde */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statut de Sauvegarde</h3>
        
        {backupSettings && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Sauvegarde automatique</p>
                <p className="text-xs text-gray-500">Sauvegarder automatiquement les données</p>
              </div>
              <button
                onClick={() => updateBackupSettings({ enabled: !backupSettings.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Save className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Dernière sauvegarde</p>
                <p className="text-xs text-gray-500">
                  {backupSettings.lastBackup ? 
                    new Date(backupSettings.lastBackup).toLocaleString('fr-FR') : 
                    'Jamais'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Prochaine sauvegarde</p>
                <p className="text-xs text-gray-500">
                  {new Date(backupSettings.nextBackup).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={triggerBackup}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sauvegarder maintenant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EN: Backup Settings / FR: Paramètres de Sauvegarde */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres de Sauvegarde</h3>
        
        {backupSettings && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
              <select
                value={backupSettings.frequency}
                onChange={(e) => updateBackupSettings({ frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emplacement</label>
              <select
                value={backupSettings.storageLocation}
                onChange={(e) => updateBackupSettings({ storageLocation: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="local">Local</option>
                <option value="cloud">Cloud</option>
                <option value="both">Local et Cloud</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Chiffrement</p>
                <p className="text-xs text-gray-500">Chiffrer les sauvegardes</p>
              </div>
              <button
                onClick={() => updateBackupSettings({
                  encryption: { ...backupSettings.encryption, enabled: !backupSettings.encryption.enabled }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.encryption.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.encryption.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // EN: Render emoji tab / FR: Rendre l'onglet emoji
  const renderEmojiTab = () => (
    <div className="space-y-6">
      {/* EN: Emoji Settings / FR: Paramètres d'Emojis */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres d'Emojis</h3>
        
        {emojiSettings && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Emojis activés</p>
                <p className="text-xs text-gray-500">Afficher les emojis dans l'application</p>
              </div>
              <button
                onClick={() => updateEmojiSettings({ enabled: !emojiSettings.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emojiSettings.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emojiSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teint de peau</label>
              <select
                value={emojiSettings.skinTone}
                onChange={(e) => updateEmojiSettings({ skinTone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="default">Par défaut</option>
                <option value="light">Clair</option>
                <option value="medium-light">Moyennement clair</option>
                <option value="medium">Moyen</option>
                <option value="medium-dark">Moyennement foncé</option>
                <option value="dark">Foncé</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* EN: Emoji Categories / FR: Catégories d'Emojis */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Catégories d'Emojis</h3>
        
        {emojiSettings && (
          <div className="space-y-3">
            {Object.entries(emojiSettings.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{category}</span>
                <button
                  onClick={() => updateEmojiSettings({
                    categories: { ...emojiSettings.categories, [category]: !enabled }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EN: Recent Emojis / FR: Emojis Récents */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emojis Récents</h3>
        
        {emojiSettings && emojiSettings.recentEmojis.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emojiSettings.recentEmojis.slice(0, 20).map((item, index) => (
              <button
                key={index}
                className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
                title={`Utilisé ${item.usageCount} fois`}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // EN: Render active tab content / FR: Rendre le contenu de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'network':
        return renderNetworkTab();
      case 'data-saving':
        return renderDataSavingTab();
      case 'sync':
        return renderSyncTab();
      case 'backup':
        return renderBackupTab();
      case 'emoji':
        return renderEmojiTab();
      default:
        return renderNetworkTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres Techniques</h1>
              <p className="text-sm text-gray-500">Gestion du réseau, synchronisation et sauvegarde</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* EN: Sidebar Navigation / FR: Navigation latérale */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres</h3>
              
              <nav className="space-y-2">
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
          </div>

          {/* EN: Main Content / FR: Contenu principal */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des paramètres techniques...</p>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
