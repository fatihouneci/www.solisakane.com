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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const { contact } = route.params || { contact: { name: 'Marie Dubois', status: 'online' } };
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  // Messages simulés pour la démonstration
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Salut ! Comment ça va ?',
        sender: 'other',
        time: '14:25',
        avatar: null,
      },
      {
        id: '2',
        text: 'Ça va bien merci ! Et toi ?',
        sender: 'me',
        time: '14:26',
        avatar: null,
      },
      {
        id: '3',
        text: 'Très bien aussi ! Tu as vu le nouveau projet ?',
        sender: 'other',
        time: '14:27',
        avatar: null,
      },
      {
        id: '4',
        text: 'Oui, il a l\'air intéressant. On en discute demain ?',
        sender: 'me',
        time: '14:28',
        avatar: null,
      },
      {
        id: '5',
        text: 'Parfait ! À demain alors 😊',
        sender: 'other',
        time: '14:30',
        avatar: null,
      },
    ]);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'me',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        avatar: null,
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simuler une réponse automatique
      setTimeout(() => {
        const responses = [
          'D\'accord !',
          'Intéressant...',
          'Je vois',
          'Parfait !',
          'Merci pour l\'info',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const reply = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'other',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          avatar: null,
        };
        
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  const handleCall = () => {
    navigation.navigate('CallScreen', { contact, callType: 'voice' });
  };

  const handleVideoCall = () => {
    navigation.navigate('CallScreen', { contact, callType: 'video' });
  };

  const handleMoreOptions = () => {
    Alert.alert('Options', 'Plus d\'options disponibles');
  };

  const handleMediaGallery = () => {
    navigation.navigate('MediaGalleryScreen', { 
      contact, 
      chatType: 'individual' 
    });
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'me' ? styles.myMessage : styles.otherMessage,
      ]}
    >
      {message.sender === 'other' && (
        <View style={styles.avatarContainer}>
          {message.avatar ? (
            <Image source={{ uri: message.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(contact.name) }]}>
              <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.sender === 'me' ? styles.myMessageBubble : styles.otherMessageBubble,
      ]}>
        <Text style={[
          styles.messageText,
          message.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          message.sender === 'me' ? styles.myMessageTime : styles.otherMessageTime,
        ]}>
          {message.time}
        </Text>
      </View>
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
        
        <View style={styles.contactInfo}>
          <View style={styles.avatarContainer}>
            {contact.avatar ? (
              <Image source={{ uri: contact.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.defaultHeaderAvatar, { backgroundColor: getAvatarColor(contact.name) }]}>
                <Text style={styles.headerAvatarText}>{contact.name.charAt(0)}</Text>
              </View>
            )}
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(contact.status) }]} />
          </View>
          
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactStatus}>
              {contact.status === 'online' ? 'En ligne' : 
               contact.status === 'away' ? 'Absent' : 
               contact.status === 'busy' ? 'Occupé' : 'Hors ligne'}
            </Text>
          </View>
        </View>
        
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
          <TouchableOpacity style={styles.headerActionButton} onPress={handleMoreOptions}>
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
              <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(contact.name) }]}>
                <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
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
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultHeaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  contactStatus: {
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
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
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
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
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
    fontSize: 12,
    marginTop: 5,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
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
    paddingHorizontal: 15,
    paddingVertical: 10,
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
});
