/**
 * @file NotificationCenterPage.tsx
 * @description
 * EN: This page displays the notification center with all user notifications.
 * FR: Cette page affiche le centre de notifications avec toutes les notifications utilisateur.
 */
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Settings,
  MessageSquare,
  Phone,
  Video,
  Users,
  Star,
  Calendar,
  File,
  Shield,
  Database,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: {
    senderId?: any;
    chatId?: any;
    messageId?: any;
    callId?: any;
    statusId?: any;
    meetingId?: any;
    fileId?: any;
    actionUrl?: string;
    priority: string;
    category: string;
  };
  isRead: boolean;
  isDelivered: boolean;
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function NotificationCenterPage() {
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  
  // EN: Filter states / FR: États des filtres
  const [filters, setFilters] = useState({
    unreadOnly: false,
    type: '',
    category: '',
    priority: ''
  });

  // EN: Notification types configuration / FR: Configuration des types de notifications
  const notificationTypes = [
    { id: 'message', label: 'Messages', icon: MessageSquare, color: 'blue' },
    { id: 'call', label: 'Appels', icon: Phone, color: 'green' },
    { id: 'friend_request', label: 'Demandes d\'ami', icon: Users, color: 'purple' },
    { id: 'group_invite', label: 'Invitations de groupe', icon: Users, color: 'indigo' },
    { id: 'status_like', label: 'Réactions aux statuts', icon: Star, color: 'yellow' },
    { id: 'meeting_reminder', label: 'Rappels de réunion', icon: Calendar, color: 'orange' },
    { id: 'system', label: 'Système', icon: Settings, color: 'gray' },
    { id: 'security', label: 'Sécurité', icon: Shield, color: 'red' }
  ];

  // EN: Priority levels / FR: Niveaux de priorité
  const priorityLevels = [
    { id: 'low', label: 'Faible', color: 'gray' },
    { id: 'medium', label: 'Moyenne', color: 'blue' },
    { id: 'high', label: 'Élevée', color: 'orange' },
    { id: 'urgent', label: 'Urgente', color: 'red' }
  ];

  // EN: Categories / FR: Catégories
  const categories = [
    { id: 'social', label: 'Social' },
    { id: 'communication', label: 'Communication' },
    { id: 'system', label: 'Système' },
    { id: 'security', label: 'Sécurité' },
    { id: 'reminder', label: 'Rappel' }
  ];

  // EN: Load notifications / FR: Charger les notifications
  const loadNotifications = async (resetNotifications: boolean = true) => {
    if (!token) return;

    setIsLoading(true);
    if (resetNotifications) {
      setSkip(0);
    }

    try {
      const { data } = await axios.get(`${API_URL}/notifications`, {
        params: {
          limit: 20,
          skip: resetNotifications ? 0 : skip,
          unreadOnly: filters.unreadOnly,
          type: filters.type || undefined,
          category: filters.category || undefined,
          priority: filters.priority || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (resetNotifications) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }
      
      setUnreadCount(data.unreadCount);
      setHasMore(data.notifications.length === 20);
      setSkip(data.notifications.length);
    } catch (error) {
      console.error('EN: Error loading notifications / FR: Erreur de chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Mark notification as read / FR: Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('EN: Error marking as read / FR: Erreur de marquage comme lu:', error);
    }
  };

  // EN: Mark all as read / FR: Marquer toutes comme lues
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('EN: Error marking all as read / FR: Erreur de marquage de toutes comme lues:', error);
    }
  };

  // EN: Delete notification / FR: Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.isRead ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('EN: Error deleting notification / FR: Erreur de suppression de notification:', error);
    }
  };

  // EN: Clear all notifications / FR: Effacer toutes les notifications
  const clearAllNotifications = async () => {
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('EN: Error clearing notifications / FR: Erreur d\'effacement des notifications:', error);
    }
  };

  // EN: Toggle notification selection / FR: Basculer la sélection de notification
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // EN: Select all notifications / FR: Sélectionner toutes les notifications
  const selectAllNotifications = () => {
    setSelectedNotifications(notifications.map(notif => notif._id));
  };

  // EN: Deselect all notifications / FR: Désélectionner toutes les notifications
  const deselectAllNotifications = () => {
    setSelectedNotifications([]);
  };

  // EN: Delete selected notifications / FR: Supprimer les notifications sélectionnées
  const deleteSelectedNotifications = async () => {
    if (!token || selectedNotifications.length === 0) return;

    try {
      await Promise.all(
        selectedNotifications.map(id => 
          axios.delete(`${API_URL}/notifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif._id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('EN: Error deleting selected notifications / FR: Erreur de suppression des notifications sélectionnées:', error);
    }
  };

  // EN: Get notification icon / FR: Récupérer l'icône de notification
  const getNotificationIcon = (type: string) => {
    const notificationType = notificationTypes.find(nt => nt.id === type);
    return notificationType ? notificationType.icon : Bell;
  };

  // EN: Get notification color / FR: Récupérer la couleur de notification
  const getNotificationColor = (type: string) => {
    const notificationType = notificationTypes.find(nt => nt.id === type);
    return notificationType ? notificationType.color : 'gray';
  };

  // EN: Get priority color / FR: Récupérer la couleur de priorité
  const getPriorityColor = (priority: string) => {
    const priorityLevel = priorityLevels.find(pl => pl.id === priority);
    return priorityLevel ? priorityLevel.color : 'gray';
  };

  // EN: Format notification date / FR: Formater la date de notification
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${Math.floor(diffInMinutes)} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
    return date.toLocaleDateString('fr-FR');
  };

  // EN: Load notifications on component mount / FR: Charger les notifications au montage du composant
  useEffect(() => {
    loadNotifications();
  }, [token, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Centre de Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* EN: Filters Sidebar / FR: Barre latérale de filtres */}
          <div className="lg:col-span-1">
            {/* EN: Quick Actions / FR: Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="space-y-3">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </button>
                
                <button
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tout effacer
                </button>
              </div>
            </div>

            {/* EN: Filters / FR: Filtres */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
                
                <div className="space-y-4">
                  {/* EN: Unread Only / FR: Non lues seulement */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.unreadOnly}
                        onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Non lues seulement</span>
                    </label>
                  </div>

                  {/* EN: Type Filter / FR: Filtre de type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Tous les types</option>
                      {notificationTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* EN: Priority Filter / FR: Filtre de priorité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Toutes les priorités</option>
                      {priorityLevels.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* EN: Category Filter / FR: Filtre de catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* EN: Notification Settings / FR: Paramètres de notifications */}
            {showSettings && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres</h3>
                <p className="text-sm text-gray-500">
                  Les paramètres de notifications sont disponibles dans la page des paramètres.
                </p>
                <button className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm">
                  Ouvrir les paramètres
                </button>
              </div>
            )}
          </div>

          {/* EN: Notifications List / FR: Liste des notifications */}
          <div className="lg:col-span-3">
            {/* EN: Bulk Actions / FR: Actions en lot */}
            {selectedNotifications.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-700">
                    {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} sélectionnée{selectedNotifications.length > 1 ? 's' : ''}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={deselectAllNotifications}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Désélectionner tout
                    </button>
                    <button
                      onClick={deleteSelectedNotifications}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EN: Notifications / FR: Notifications */}
            <div className="space-y-4">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const notificationColor = getNotificationColor(notification.type);
                const priorityColor = getPriorityColor(notification.data.priority);
                
                return (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-lg shadow-sm border p-6 ${
                      !notification.isRead ? 'border-l-4 border-l-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* EN: Selection Checkbox / FR: Case à cocher de sélection */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => toggleNotificationSelection(notification._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>

                      {/* EN: Notification Icon / FR: Icône de notification */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${notificationColor}-100`}>
                          <Icon className={`h-5 w-5 text-${notificationColor}-600`} />
                        </div>
                      </div>

                      {/* EN: Notification Content / FR: Contenu de notification */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {/* EN: Priority Badge / FR: Badge de priorité */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${priorityColor}-100 text-${priorityColor}-800`}>
                              {notification.data.priority}
                            </span>
                            
                            {/* EN: Read Status / FR: Statut de lecture */}
                            {notification.isRead ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{formatNotificationDate(notification.createdAt)}</span>
                            {notification.data.category && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{notification.data.category}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                Marquer comme lu
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EN: Load More Button / FR: Bouton Charger Plus */}
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => loadNotifications(false)}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </button>
              </div>
            )}

            {/* EN: No Notifications / FR: Aucune notification */}
            {notifications.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
                <p className="text-gray-500">
                  Vous n'avez pas encore de notifications.
                </p>
              </div>
            )}

            {/* EN: Loading State / FR: État de chargement */}
            {isLoading && notifications.length === 0 && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des notifications...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
