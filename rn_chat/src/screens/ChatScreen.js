/**
 * @file ChatScreen.js
 * @description
 * EN: This screen displays the chat interface for individual and group conversations.
 * FR: Cet écran affiche l'interface de chat pour les conversations individuelles et de groupe.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserProvider';
import io from 'socket.io-client';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

// EN: Icons from react-native-vector-icons / FR: Icônes de react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://localhost:3000/api';

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { chatId } = route.params;

  // EN: State management / FR: Gestion d'état
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // EN: 'idle', 'calling', 'ringing', 'connected' / FR: 'idle', 'calling', 'ringing', 'connected'
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // EN: Refs / FR: Références
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // EN: Scroll to bottom of messages / FR: Faire défiler vers le bas des messages
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // EN: Initialize socket connection / FR: Initialiser la connexion socket
  useEffect(() => {
    if (token) {
      socketRef.current = io(API_URL.replace('/api', ''), {
        auth: { token }
      });

      socketRef.current.on('authenticated', (data) => {
        console.log('EN: Socket authenticated / FR: Socket authentifié:', data);
        // EN: Join chat room / FR: Rejoindre la salle de chat
        socketRef.current.emit('join_chat', { chatId });
      });

      socketRef.current.on('new_message', (data) => {
        setMessages(prev => [...prev, data.message]);
      });

      socketRef.current.on('user_typing', (data) => {
        if (data.userId !== user?._id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u._id !== data.userId);
            if (data.isTyping) {
              return [...filtered, data.user];
            }
            return filtered;
          });
        }
      });

      socketRef.current.on('incoming_call', (data) => {
        setCallStatus('ringing');
        // EN: Show incoming call notification / FR: Afficher la notification d'appel entrant
        Alert.alert(
          'Appel entrant',
          `Appel ${data.callType} de ${data.caller.firstName} ${data.caller.lastName}`,
          [
            { text: 'Refuser', onPress: () => handleAnswerCall(false) },
            { text: 'Accepter', onPress: () => handleAnswerCall(true) }
          ]
        );
      });

      socketRef.current.on('call_answered', (data) => {
        if (data.accepted) {
          setCallStatus('connected');
          setIsInCall(true);
        } else {
          setCallStatus('idle');
        }
      });

      socketRef.current.on('call_ended', () => {
        setCallStatus('idle');
        setIsInCall(false);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [token, chatId, user?._id]);

  // EN: Load chat data / FR: Charger les données du chat
  useEffect(() => {
    const loadChat = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${API_URL}/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChat(data.chat);
      } catch (error) {
        console.error('EN: Error loading chat / FR: Erreur de chargement du chat:', error);
        Alert.alert('Erreur', 'Impossible de charger le chat');
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId && token) {
      loadChat();
    }
  }, [chatId, token]);

  // EN: Load messages / FR: Charger les messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/messages/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(data.messages);
      } catch (error) {
        console.error('EN: Error loading messages / FR: Erreur de chargement des messages:', error);
      }
    };

    if (chatId && token) {
      loadMessages();
    }
  }, [chatId, token]);

  // EN: Handle sending message / FR: Gérer l'envoi de message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socketRef.current) return;

    try {
      // EN: Send message via socket / FR: Envoyer le message via socket
      socketRef.current.emit('send_message', {
        chatId,
        content: newMessage.trim(),
        type: 'text'
      });

      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('EN: Error sending message / FR: Erreur d\'envoi de message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  // EN: Handle typing indicator / FR: Gérer l'indicateur de frappe
  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (!isTyping && socketRef.current) {
      setIsTyping(true);
      socketRef.current.emit('typing', { chatId, isTyping: true });
    }

    // EN: Clear previous timeout / FR: Effacer le timeout précédent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // EN: Set new timeout to stop typing indicator / FR: Définir un nouveau timeout pour arrêter l'indicateur de frappe
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing', { chatId, isTyping: false });
        setIsTyping(false);
      }
    }, 1000);
  };

  // EN: Handle call initiation / FR: Gérer l'initiation d'appel
  const handleCall = (callType) => {
    if (socketRef.current && chat) {
      const recipientId = chat.users.find(u => u._id !== user?._id)?._id;
      if (recipientId) {
        socketRef.current.emit('initiate_call', {
          chatId,
          callType,
          recipientId
        });
        setCallStatus('calling');
      }
    }
  };

  // EN: Handle call answer / FR: Gérer la réponse à l'appel
  const handleAnswerCall = (accepted) => {
    if (socketRef.current) {
      socketRef.current.emit('answer_call', {
        chatId,
        callId: chat?.ongoingCall?.callId,
        accepted
      });
    }
  };

  // EN: Handle call end / FR: Gérer la fin d'appel
  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('end_call', {
        chatId,
        callId: chat?.ongoingCall?.callId
      });
    }
  };

  // EN: Get chat display name / FR: Obtenir le nom d'affichage du chat
  const getChatDisplayName = () => {
    if (!chat) return '';
    if (chat.isGroupChat) return chat.chatName || 'Groupe';
    const otherUser = chat.users.find(u => u._id !== user?._id);
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Chat';
  };

  // EN: Get chat display picture / FR: Obtenir l'image d'affichage du chat
  const getChatDisplayPicture = () => {
    if (!chat) return null;
    if (chat.isGroupChat) return null; // EN: Use default group icon / FR: Utiliser l'icône de groupe par défaut
    const otherUser = chat.users.find(u => u._id !== user?._id);
    return otherUser?.profilePicture;
  };

  // EN: Render message item / FR: Rendre l'élément de message
  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender._id === user?._id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Image
            source={{ uri: item.sender.profilePicture || 'https://via.placeholder.com/40' }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {item.replyTo && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyText}>
                Réponse à {item.replyTo.user.firstName}: {item.replyTo.message.content}
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
            ]}>
              {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            
            {item.likes.length > 0 && (
              <Text style={[
                styles.likeCount,
                isOwnMessage ? styles.ownLikeCount : styles.otherLikeCount
              ]}>
                ❤️ {item.likes.length}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  // EN: Render typing indicator / FR: Rendre l'indicateur de frappe
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { animationDelay: '0s' }]} />
            <View style={[styles.typingDot, { animationDelay: '0.1s' }]} />
            <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
          </View>
          <Text style={styles.typingText}>
            {typingUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')} en train d'écrire...
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement du chat...</Text>
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="chat-bubble-outline" size={64} color="#9ca3af" />
        <Text style={styles.errorTitle}>Chat non trouvé</Text>
        <Text style={styles.errorMessage}>
          Ce chat n'existe pas ou vous n'y avez pas accès.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* EN: Chat Header / FR: En-tête du chat */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {getChatDisplayPicture() ? (
            <Image
              source={{ uri: getChatDisplayPicture() }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Icon name={chat.isGroupChat ? "group" : "person"} size={24} color="#6b7280" />
            </View>
          )}
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{getChatDisplayName()}</Text>
            <Text style={styles.headerSubtitle}>
              {chat.isGroupChat 
                ? `${chat.users.length} membres`
                : chat.users.find(u => u._id !== user?._id)?.online ? 'En ligne' : 'Hors ligne'
              }
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {!isInCall && (
            <>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={() => handleCall('audio')}
                disabled={callStatus !== 'idle'}
              >
                <Icon name="call" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={() => handleCall('video')}
                disabled={callStatus !== 'idle'}
              >
                <Icon name="videocam" size={20} color="#374151" />
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.headerActionButton}>
            <Icon name="more-vert" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* EN: Call Status Bar / FR: Barre de statut d'appel */}
      {callStatus !== 'idle' && (
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.callStatusBar}
        >
          <View style={styles.callStatusContent}>
            <View style={styles.callStatusInfo}>
              <View style={styles.callStatusDots}>
                <View style={[styles.callStatusDot, { animationDelay: '0s' }]} />
                <View style={[styles.callStatusDot, { animationDelay: '0.2s' }]} />
                <View style={[styles.callStatusDot, { animationDelay: '0.4s' }]} />
              </View>
              <Text style={styles.callStatusText}>
                {callStatus === 'calling' && 'Appel en cours...'}
                {callStatus === 'ringing' && 'Appel entrant...'}
                {callStatus === 'connected' && 'Appel en cours'}
              </Text>
            </View>
            
            <View style={styles.callStatusActions}>
              {callStatus === 'connected' && (
                <>
                  <TouchableOpacity
                    style={[styles.callActionButton, micEnabled ? styles.callActionButtonActive : styles.callActionButtonInactive]}
                    onPress={() => setMicEnabled(!micEnabled)}
                  >
                    <Icon name={micEnabled ? "mic" : "mic-off"} size={20} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.callActionButton, cameraEnabled ? styles.callActionButtonActive : styles.callActionButtonInactive]}
                    onPress={() => setCameraEnabled(!cameraEnabled)}
                  >
                    <Icon name={cameraEnabled ? "videocam" : "videocam-off"} size={20} color="#ffffff" />
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity
                style={styles.callEndButton}
                onPress={handleEndCall}
              >
                <Icon name="call-end" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* EN: Messages Area / FR: Zone des messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* EN: Message Input / FR: Saisie de message */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputActionButton}>
            <Icon name="attach-file" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Tapez votre message..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={1000}
              editable={!isInCall}
            />
          </View>
          
          <TouchableOpacity style={styles.inputActionButton}>
            <Icon name="emoji-emotions" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isInCall}
          >
            <Icon name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  callStatusBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  callStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callStatusDots: {
    flexDirection: 'row',
    marginRight: 12,
  },
  callStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  callStatusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  callStatusActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callActionButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  callActionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  callActionButtonInactive: {
    backgroundColor: '#ef4444',
  },
  callEndButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ef4444',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  replyContainer: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    paddingLeft: 8,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  likeCount: {
    fontSize: 12,
    marginLeft: 8,
  },
  ownLikeCount: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherLikeCount: {
    color: '#9ca3af',
  },
  typingContainer: {
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: width * 0.6,
  },
  typingDots: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 4,
  },
  typingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputActionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 12,
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
};
