/**
 * Écran de liste des chats
 * Chat list screen
 *
 * Interface principale similaire à WhatsApp pour afficher les conversations
 * Main WhatsApp-like interface to display conversations
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

/**
 * Données de test pour les chats
 * Test data for chats
 */
const mockChats = [
  {
    id: '1',
    name: 'Marie Dupont',
    lastMessage: 'Salut ! Comment vas-tu ?',
    timestamp: '10:30',
    unreadCount: 2,
    isOnline: true,
    avatar: null,
    isGroup: false,
  },
  {
    id: '2',
    name: 'Famille',
    lastMessage: 'Jean: À quelle heure arrivez-vous ?',
    timestamp: '09:15',
    unreadCount: 5,
    isOnline: false,
    avatar: null,
    isGroup: true,
    participants: ['Marie', 'Jean', 'Sophie'],
  },
  {
    id: '3',
    name: 'Équipe Projet',
    lastMessage: 'Sophie: La réunion est reportée à demain',
    timestamp: 'Hier',
    unreadCount: 0,
    isOnline: false,
    avatar: null,
    isGroup: true,
    participants: ['Sophie', 'Marc', 'Alice'],
  },
  {
    id: '4',
    name: 'Pierre Martin',
    lastMessage: 'Merci pour le document !',
    timestamp: 'Hier',
    unreadCount: 0,
    isOnline: true,
    avatar: null,
    isGroup: false,
  },
];

/**
 * Écran de liste des chats
 * Chat list screen
 */
const ChatListScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState(mockChats);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Charger les chats
   * Load chats
   */
  const loadChats = async () => {
    try {
      // TODO: Remplacer par l'appel API réel / Replace with real API call
      console.log('Chargement des chats...');
      // Loading chats...
    } catch (error) {
      console.error('Erreur lors du chargement des chats:', error);
      // Error loading chats
    }
  };

  /**
   * Actualiser la liste des chats
   * Refresh chat list
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  /**
   * Ouvrir un chat
   * Open a chat
   */
  const openChat = chat => {
    navigation.navigate('Chat', {chat});
  };

  /**
   * Créer un nouveau chat
   * Create new chat
   */
  const createNewChat = () => {
    Alert.alert(
      'Nouveau chat',
      'Comment souhaitez-vous créer un nouveau chat ?',
      [
        {
          text: 'Nouveau contact',
          onPress: () => {
            // Simuler la création d'un nouveau chat
            const newChat = {
              id: Date.now().toString(),
              name: 'Nouveau contact',
              lastMessage: 'Chat créé',
              timestamp: new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              unreadCount: 0,
              isOnline: false,
              avatar: null,
              isGroup: false,
            };
            setChats(prev => [newChat, ...prev]);
            navigation.navigate('Chat', {chat: newChat});
          },
        },
        {
          text: 'Nouveau groupe',
          onPress: () => {
            // Simuler la création d'un nouveau groupe
            const newGroup = {
              id: Date.now().toString(),
              name: 'Nouveau groupe',
              lastMessage: 'Groupe créé',
              timestamp: new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              unreadCount: 0,
              isOnline: false,
              avatar: null,
              isGroup: true,
              participants: ['Vous'],
            };
            setChats(prev => [newGroup, ...prev]);
            navigation.navigate('Chat', {chat: newGroup});
          },
        },
        {text: 'Annuler', style: 'cancel'},
      ]
    );
  };

  /**
   * Marquer comme lu
   * Mark as read
   */
  const markAsRead = chatId => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? {...chat, unreadCount: 0} : chat,
      ),
    );
  };

  /**
   * Rendre l'avatar d'un utilisateur
   * Render user avatar
   */
  const renderAvatar = chat => {
    if (chat.avatar) {
      return <Image source={{uri: chat.avatar}} style={styles.avatar} />;
    }

    if (chat.isGroup) {
      return (
        <View style={[styles.avatar, styles.groupAvatar]}>
          <Icon name="group" size={24} color={COLORS.WHITE} />
        </View>
      );
    }

    return (
      <View style={[styles.avatar, styles.individualAvatar]}>
        <Icon name="person" size={24} color={COLORS.WHITE} />
      </View>
    );
  };

  /**
   * Rendre un élément de chat
   * Render chat item
   */
  const renderChatItem = ({item: chat}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => openChat(chat)}
      onLongPress={() => markAsRead(chat.id)}>
      {/* Avatar / Avatar */}
      <View style={styles.avatarContainer}>
        {renderAvatar(chat)}
        {chat.isOnline && !chat.isGroup && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      {/* Contenu du chat / Chat content */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={styles.timestamp}>{chat.timestamp}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header avec recherche / Header with search */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Liste des chats / Chat list */}
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        style={styles.chatList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY_GREEN]}
            tintColor={COLORS.PRIMARY_GREEN}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bouton nouveau chat / New chat button */}
      <TouchableOpacity style={styles.newChatButton} onPress={createNewChat}>
        <Icon name="chat" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  searchButton: {
    padding: 8,
  },

  moreButton: {
    padding: 8,
  },

  chatList: {
    flex: 1,
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  groupAvatar: {
    backgroundColor: COLORS.SECONDARY_BLUE,
  },

  individualAvatar: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },

  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },

  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    flex: 1,
  },

  timestamp: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    flex: 1,
  },

  unreadBadge: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },

  newChatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default ChatListScreen;
