import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function GroupChatScreen({ route }) {
  const navigation = useNavigation();
  const { group } = route.params || { 
    group: { 
      name: 'Équipe Projet', 
      members: [
        { id: '1', name: 'Marie Dubois', avatar: null, status: 'online' },
        { id: '2', name: 'Jean Martin', avatar: null, status: 'away' },
        { id: '3', name: 'Sophie Laurent', avatar: null, status: 'online' },
        { id: '4', name: 'Pierre Moreau', avatar: null, status: 'offline' },
      ],
      admin: '1'
    }
  };
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [scrollViewRef] = useState(useRef(null));

  // Messages simulés pour la démonstration
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Salut tout le monde ! Comment ça va ?',
        sender: { id: '1', name: 'Marie Dubois' },
        time: '14:25',
        avatar: null,
        type: 'text'
      },
      {
        id: '2',
        text: 'Ça va bien merci ! Et toi ?',
        sender: { id: '2', name: 'Jean Martin' },
        time: '14:26',
        avatar: null,
        type: 'text'
      },
      {
        id: '3',
        text: 'Très bien aussi ! Tu as vu le nouveau projet ?',
        sender: { id: '1', name: 'Marie Dubois' },
        time: '14:27',
        avatar: null,
        type: 'text'
      },
      {
        id: '4',
        text: 'Oui, il a l\'air intéressant. On en discute demain ?',
        sender: { id: '3', name: 'Sophie Laurent' },
        time: '14:28',
        avatar: null,
        type: 'text'
      },
      {
        id: '5',
        text: 'Parfait ! À demain alors 😊',
        sender: { id: '1', name: 'Marie Dubois' },
        time: '14:30',
        avatar: null,
        type: 'text'
      },
      {
        id: '6',
        text: 'Voici le document que j\'ai mentionné',
        sender: { id: '2', name: 'Jean Martin' },
        time: '14:32',
        avatar: null,
        type: 'file',
        fileName: 'document.pdf',
        fileSize: '2.3 MB'
      },
      {
        id: '7',
        text: 'Merci Jean !',
        sender: { id: '4', name: 'Pierre Moreau' },
        time: '14:33',
        avatar: null,
        type: 'text'
      }
    ]);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: { id: 'me', name: 'Moi' },
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        avatar: null,
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simuler une réponse automatique d'un membre
      setTimeout(() => {
        const randomMember = group.members[Math.floor(Math.random() * group.members.length)];
        const responses = [
          'D\'accord !',
          'Intéressant...',
          'Je vois',
          'Parfait !',
          'Merci pour l\'info',
          '👍',
          'Ok'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const reply = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: randomMember,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          avatar: null,
          type: 'text'
        };
        
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  const handleCall = () => {
    Alert.alert('Appel de groupe', `Appeler tous les membres du groupe "${group.name}" ?`);
  };

  const handleVideoCall = () => {
    Alert.alert('Appel vidéo de groupe', `Appeler en vidéo tous les membres du groupe "${group.name}" ?`);
  };

  const handleAddMember = () => {
    Alert.alert('Ajouter un membre', 'Fonctionnalité d\'ajout de membre');
  };

  const handleGroupSettings = () => {
    Alert.alert('Paramètres du groupe', 'Gérer les paramètres du groupe');
  };

  const handleMediaGallery = () => {
    navigation.navigate('MediaGalleryScreen', { 
      group, 
      chatType: 'group' 
    });
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender.id === 'me' ? styles.myMessage : styles.otherMessage,
      ]}
    >
      {message.sender.id !== 'me' && (
        <View style={styles.avatarContainer}>
          {message.sender.avatar ? (
            <Image source={{ uri: message.sender.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(message.sender.name) }]}>
              <Text style={styles.avatarText}>{message.sender.name.charAt(0)}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.messageContent}>
        {message.sender.id !== 'me' && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          message.sender.id === 'me' ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}>
          {message.type === 'text' ? (
            <Text style={[
              styles.messageText,
              message.sender.id === 'me' ? styles.myMessageText : styles.otherMessageText,
            ]}>
              {message.text}
            </Text>
          ) : message.type === 'file' ? (
            <View style={styles.fileMessage}>
              <Ionicons name="document" size={20} color="#669253" />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{message.fileName}</Text>
                <Text style={styles.fileSize}>{message.fileSize}</Text>
              </View>
            </View>
          ) : null}
          
          <Text style={[
            styles.messageTime,
            message.sender.id === 'me' ? styles.myMessageTime : styles.otherMessageTime,
          ]}>
            {message.time}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMember = ({ item: member }) => (
    <View style={styles.memberItem}>
      <View style={styles.avatarContainer}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(member.name) }]}>
            <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(member.status) }]} />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberStatus}>
          {member.status === 'online' ? 'En ligne' : 
           member.status === 'away' ? 'Absent' : 
           member.status === 'busy' ? 'Occupé' : 'Hors ligne'}
        </Text>
      </View>
      {member.id === group.admin && (
        <View style={styles.adminBadge}>
          <Ionicons name="star" size={16} color="#f39c12" />
        </View>
      )}
    </View>
  );

  const getAvatarColor = (name) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#2ecc71';
      case 'away': return '#f39c12';
      case 'busy': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#669253" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.groupInfo}
          onPress={() => setShowMembers(true)}
        >
          <View style={styles.groupAvatarContainer}>
            <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(group.name) }]}>
              <Text style={styles.avatarText}>{group.name.charAt(0)}</Text>
            </View>
          </View>
          
          <View style={styles.groupDetails}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.memberCount}>{group.members.length} membres</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleMediaGallery}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleVideoCall}>
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleGroupSettings}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.otherMessage]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.defaultAvatar, { backgroundColor: '#ccc' }]}>
                <Text style={styles.avatarText}>?</Text>
              </View>
            </View>
            <View style={[styles.messageBubble, styles.otherMessageBubble]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={24} color="#669253" />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Tapez un message..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
          </View>
          
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color="#669253" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Members Modal */}
      <Modal
        visible={showMembers}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembers(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Membres du groupe</Text>
              <TouchableOpacity onPress={() => setShowMembers(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={group.members}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
              <Ionicons name="person-add" size={20} color="#669253" />
              <Text style={styles.addMemberText}>Ajouter un membre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#669253',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  groupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  defaultAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  moreMembers: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMembersText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  memberCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  defaultAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  senderName: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
    marginLeft: 5,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#669253',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 3,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    marginLeft: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#669253',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 20,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#669253',
  },
  sendButtonInactive: {
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 15,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    padding: 5,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#669253',
  },
  addMemberText: {
    color: '#669253',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
