import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ConversationScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('chats');
  const [chats, setChats] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Simuler des conversations
    setChats([
      { 
        id: '1', 
        name: 'Marie Dubois', 
        lastMessage: 'Salut ! Comment ça va ?', 
        time: '14:30', 
        unread: 2, 
        avatar: null,
        status: 'online'
      },
      { 
        id: '2', 
        name: 'Équipe Projet', 
        lastMessage: 'Réunion à 15h', 
        time: '13:45', 
        unread: 0, 
        avatar: null,
        status: 'group',
        members: [
          { name: 'Marie Dubois', avatar: null },
          { name: 'Jean Martin', avatar: null },
          { name: 'Sophie Laurent', avatar: null }
        ]
      },
      { 
        id: '3', 
        name: 'Jean Martin', 
        lastMessage: 'Merci pour le fichier', 
        time: '12:20', 
        unread: 1, 
        avatar: null,
        status: 'away'
      },
      { 
        id: '4', 
        name: 'Famille', 
        lastMessage: 'À bientôt !', 
        time: '11:15', 
        unread: 3, 
        avatar: null,
        status: 'group',
        members: [
          { name: 'Maman', avatar: null },
          { name: 'Papa', avatar: null },
          { name: 'Sœur', avatar: null }
        ]
      },
    ]);

    // Simuler des appels récents
    setRecentCalls([
      { 
        id: '1', 
        name: 'Marie Dubois', 
        time: '14:25', 
        type: 'missed', 
        duration: '0:00',
        avatar: null
      },
      { 
        id: '2', 
        name: 'Jean Martin', 
        time: '13:30', 
        type: 'outgoing', 
        duration: '5:23',
        avatar: null
      },
      { 
        id: '3', 
        name: 'Sophie Laurent', 
        time: '12:15', 
        type: 'incoming', 
        duration: '2:45',
        avatar: null
      },
    ]);

    // Simuler des utilisateurs en ligne
    setOnlineUsers([
      { 
        id: '1', 
        name: 'Marie Dubois', 
        status: 'online', 
        avatar: null
      },
      { 
        id: '2', 
        name: 'Sophie Laurent', 
        status: 'online', 
        avatar: null
      },
      { 
        id: '3', 
        name: 'Pierre Moreau', 
        status: 'away', 
        avatar: null
      },
    ]);
  }, []);

  const getAvatarColor = (name) => {
    const colors = ['#669253', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleStartChat = () => {
    navigation.navigate('NewChatScreen');
  };

  const handleCall = (contact) => {
    navigation.navigate('CallScreen', { contact });
  };

  const handleOpenChat = (chat) => {
    if (chat.status === 'group') {
      navigation.navigate('GroupChatScreen', { group: chat });
    } else {
      navigation.navigate('CommChatScreen', { contact: chat });
    }
  };

  const handleCallBack = (call) => {
    navigation.navigate('CallScreen', { contact: call });
  };

  const handleCreateGroup = () => {
    navigation.navigate('NewGroupChatScreen');
  };

  const renderChat = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenChat(item)}>
      <View style={styles.avatarContainer}>
        {item.status === 'group' ? (
          <View style={styles.groupAvatarContainer}>
            <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          </View>
        ) : (
          <>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
            )}
            <View style={[styles.statusIndicator, { backgroundColor: 
              item.status === 'online' ? '#4CAF50' : 
              item.status === 'away' ? '#FF9800' : '#9E9E9E'
            }]} />
          </>
        )}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.chatMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCall = ({ item }) => (
    <TouchableOpacity style={styles.callItem} onPress={() => handleCallBack(item)}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.callInfo}>
        <View style={styles.callHeader}>
          <Text style={styles.callName}>{item.name}</Text>
          <Text style={styles.callTime}>{item.time}</Text>
        </View>
        <View style={styles.callFooter}>
          <View style={styles.callTypeContainer}>
            <Ionicons 
              name={item.type === 'missed' ? 'call' : item.type === 'incoming' ? 'call' : 'call'} 
              size={16} 
              color={item.type === 'missed' ? '#F44336' : item.type === 'incoming' ? '#4CAF50' : '#669253'} 
            />
            <Text style={[styles.callType, { color: 
              item.type === 'missed' ? '#F44336' : 
              item.type === 'incoming' ? '#4CAF50' : '#669253'
            }]}>
              {item.type === 'missed' ? 'Manqué' : item.type === 'incoming' ? 'Entrant' : 'Sortant'}
            </Text>
          </View>
          <Text style={styles.callDuration}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOnlineUser = ({ item }) => (
    <TouchableOpacity style={styles.onlineUserItem} onPress={() => handleOpenChat(item)}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.statusIndicator, { backgroundColor: 
          item.status === 'online' ? '#4CAF50' : 
          item.status === 'away' ? '#FF9800' : '#9E9E9E'
        }]} />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userStatus}>
          {item.status === 'online' ? 'En ligne' : 
           item.status === 'away' ? 'Absent' : 'Hors ligne'}
        </Text>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCall(item)}
        >
          <Ionicons name="call" size={20} color="#669253" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chats':
        // Trier les chats par temps (plus récent en premier)
        const sortedChats = [...chats].sort((a, b) => {
          const timeA = new Date(`2024-01-01 ${a.time}`);
          const timeB = new Date(`2024-01-01 ${b.time}`);
          return timeB - timeA;
        });
        
        return (
          <FlatList
            data={sortedChats}
            keyExtractor={(item) => item.id}
            renderItem={renderChat}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'calls':
        return (
          <FlatList
            data={recentCalls}
            keyExtractor={(item) => item.id}
            renderItem={renderCall}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'contacts':
        return (
          <FlatList
            data={onlineUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderOnlineUser}
            showsVerticalScrollIndicator={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#669253" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solisakane</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleCreateGroup}
          >
            <Ionicons name="people" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            Discussions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'calls' && styles.activeTab]}
          onPress={() => setActiveTab('calls')}
        >
          <Text style={[styles.tabText, activeTab === 'calls' && styles.activeTabText]}>
            Appels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleStartChat}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#669253',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#669253',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#669253',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  onlineUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  groupAvatarContainer: {
    // Container pour l'avatar de groupe
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#669253',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  callName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  callTime: {
    fontSize: 12,
    color: '#666',
  },
  callFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callType: {
    fontSize: 12,
    fontWeight: '500',
  },
  callDuration: {
    fontSize: 12,
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#669253',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
