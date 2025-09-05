/**
 * @file HomeScreen.js
 * @description
 * EN: This file contains the HomeScreen component, which is the main dashboard for the mobile application after login.
 * It includes communication features, recent chats, and quick actions.
 * FR: Ce fichier contient le composant HomeScreen, qui est le tableau de bord principal de l'application mobile après la connexion.
 * Il inclut des fonctionnalités de communication, des chats récents et des actions rapides.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: HomeScreen Component. A comprehensive dashboard component for the application's home screen.
 * It displays user information, recent chats, quick actions, and communication features.
 * FR: Composant HomeScreen. Un composant de tableau de bord complet pour l'écran d'accueil de l'application.
 * Il affiche les informations utilisateur, les chats récents, les actions rapides et les fonctionnalités de communication.
 * @param {object} navigation - The navigation object from React Navigation. / L'objet de navigation de React Navigation.
 * @returns {JSX.Element} The rendered HomeScreen component.
 */
const HomeScreen = ({ navigation }) => {
  const { user, logout } = useUser();
  const [recentChats, setRecentChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // EN: Load dashboard data on component mount / FR: Charger les données du tableau de bord au montage du composant
    loadDashboardData();
  }, []);

  /**
   * EN: Handles navigation to a specific chat.
   * FR: Gère la navigation vers un chat spécifique.
   * @param {string} chatId - The ID of the chat to navigate to. / L'ID du chat vers lequel naviguer.
   */
  const handleChatClick = (chatId) => {
    navigation.navigate('Chat', { chatId: chatId.toString() });
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
      { id: 4, name: 'Alice Martin', lastMessage: 'À bientôt !', time: 'Hier', unread: 0 },
    ]);

    setOnlineUsers([
      { id: 1, name: 'Alice Martin', status: 'online' },
      { id: 2, name: 'Bob Wilson', status: 'away' },
      { id: 3, name: 'Claire Dubois', status: 'online' },
      { id: 4, name: 'David Lee', status: 'online' },
    ]);
  };

  /**
   * EN: Handles pull-to-refresh functionality.
   * FR: Gère la fonctionnalité de rafraîchissement par glissement.
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  /**
   * EN: Handles user logout with confirmation.
   * FR: Gère la déconnexion de l'utilisateur avec confirmation.
   */
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // EN: Navigation will be handled by RootNavigator / FR: La navigation sera gérée par RootNavigator
          }
        }
      ]
    );
  };

  /**
   * EN: Handles starting a new chat.
   * FR: Gère le démarrage d'un nouveau chat.
   */
  const handleNewChat = () => {
    Alert.alert('Nouveau Chat', 'Fonctionnalité à venir bientôt !');
  };

  /**
   * EN: Handles starting a video call.
   * FR: Gère le démarrage d'un appel vidéo.
   */
  const handleVideoCall = () => {
    Alert.alert('Appel Vidéo', 'Fonctionnalité à venir bientôt !');
  };

  /**
   * EN: Renders a quick action button.
   * FR: Affiche un bouton d'action rapide.
   * @param {string} title - The button title. / Le titre du bouton.
   * @param {string} subtitle - The button subtitle. / Le sous-titre du bouton.
   * @param {string} icon - The icon emoji. / L'emoji de l'icône.
   * @param {function} onPress - The press handler. / Le gestionnaire de pression.
   * @param {string} color - The button color. / La couleur du bouton.
   */
  const renderQuickAction = (title, subtitle, icon, onPress, color) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  /**
   * EN: Renders a recent chat item.
   * FR: Affiche un élément de chat récent.
   * @param {object} item - The chat item. / L'élément de chat.
   */
  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatClick(item.id)}
    >
      <View style={styles.chatAvatar}>
        <Text style={styles.chatAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  /**
   * EN: Renders an online user item.
   * FR: Affiche un élément d'utilisateur en ligne.
   * @param {object} item - The user item. / L'élément utilisateur.
   */
  const renderOnlineUser = ({ item }) => (
    <View style={styles.onlineUserItem}>
      <View style={styles.onlineUserAvatar}>
        <Text style={styles.onlineUserAvatarText}>{item.name.charAt(0)}</Text>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'online' ? '#10B981' : '#F59E0B' }]} />
      </View>
      <Text style={styles.onlineUserName}>{item.name}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* EN: Header with user info and logout / FR: En-tête avec les informations utilisateur et déconnexion */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>
              Bonjour, {user?.firstName || 'Utilisateur'} !
            </Text>
            <Text style={styles.subtitleText}>Prêt à communiquer ?</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* EN: Quick Actions / FR: Actions rapides */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsGrid}>
          {renderQuickAction('Nouveau Chat', 'Commencer une conversation', '💬', handleNewChat, '#10B981')}
          {renderQuickAction('Appel Vidéo', 'Lancer un appel vidéo', '📹', handleVideoCall, '#3B82F6')}
          {renderQuickAction('Galerie', 'Mes fichiers et médias', '🖼️', () => navigation.navigate('MediaGallery'), '#059669')}
          {renderQuickAction('Paramètres', 'Préférences et configuration', '⚙️', () => navigation.navigate('Settings'), '#f59e0b')}
          {renderQuickAction('Aide & Support', 'FAQ, tutoriels et assistance', '❓', () => navigation.navigate('Support'), '#3B82F6')}
          {renderQuickAction('Mon Profil', 'Gérer mon compte', '👤', () => navigation.navigate('Profile'), '#8B5CF6')}
        </View>
      </View>

      {/* EN: Recent Chats / FR: Chats récents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversations récentes</Text>
        <FlatList
          data={recentChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* EN: Online Users / FR: Utilisateurs en ligne */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>En ligne</Text>
        <FlatList
          data={onlineUsers}
          renderItem={renderOnlineUser}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.onlineUsersList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  subtitleText: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 20,
  },
  quickActionsContainer: {
    padding: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  chatTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  chatMessage: {
    fontSize: 13,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  onlineUsersList: {
    paddingRight: 20,
  },
  onlineUserItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  onlineUserAvatar: {
    position: 'relative',
    marginBottom: 8,
  },
  onlineUserAvatarText: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineUserName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeScreen;