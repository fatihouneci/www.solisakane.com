/**
 * Écran de chat individuel
 * Individual chat screen
 *
 * Interface de messagerie complète similaire à WhatsApp
 * Complete messaging interface similar to WhatsApp
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useRoute, useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

const {width, height} = Dimensions.get('window');

/**
 * Données de test pour les messages
 * Test data for messages
 */
const mockMessages = [
  {
    id: '1',
    text: 'Salut ! Comment vas-tu ?',
    timestamp: '10:30',
    isMe: false,
    status: 'delivered',
  },
  {
    id: '2',
    text: 'Salut ! Ça va bien merci, et toi ?',
    timestamp: '10:32',
    isMe: true,
    status: 'read',
  },
  {
    id: '3',
    text: 'Très bien aussi ! Tu fais quoi ce weekend ?',
    timestamp: '10:33',
    isMe: false,
    status: 'delivered',
  },
  {
    id: '4',
    text: 'Je vais au cinéma avec des amis. Tu veux venir ?',
    timestamp: '10:35',
    isMe: true,
    status: 'read',
  },
  {
    id: '5',
    text: 'Avec plaisir ! Quel film ?',
    timestamp: '10:36',
    isMe: false,
    status: 'delivered',
  },
];

/**
 * Écran de chat individuel
 * Individual chat screen
 */
const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {chat} = route.params || {};
  
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Configurer l'en-tête / Setup header
    navigation.setOptions({
      title: chat?.name || 'Chat',
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={startVideoCall}>
            <Icon name="videocam" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={startAudioCall}>
            <Icon name="call" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowCallOptions(true)}>
            <Icon name="more-vert" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, chat]);

  /**
   * Envoyer un message
   * Send message
   */
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: true,
        status: 'sending',
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simuler l'envoi / Simulate sending
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === message.id ? {...msg, status: 'delivered'} : msg
          )
        );
      }, 1000);

      // Simuler la lecture / Simulate read
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === message.id ? {...msg, status: 'read'} : msg
          )
        );
      }, 2000);
    }
  };

  /**
   * Ajouter un emoji
   * Add emoji
   */
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  /**
   * Démarrer l'enregistrement vocal
   * Start voice recording
   */
  const startVoiceRecording = () => {
    setIsRecording(true);
    Alert.alert('Enregistrement vocal', 'Enregistrement en cours...');
  };

  /**
   * Arrêter l'enregistrement vocal
   * Stop voice recording
   */
  const stopVoiceRecording = () => {
    setIsRecording(false);
    Alert.alert('Message vocal', 'Message vocal envoyé !');
  };

  /**
   * Lancer un appel audio
   * Start audio call
   */
  const startAudioCall = () => {
    setShowCallOptions(false);
    navigation.navigate('Call', {call: {...chat, type: 'audio'}});
  };

  /**
   * Lancer un appel vidéo
   * Start video call
   */
  const startVideoCall = () => {
    setShowCallOptions(false);
    navigation.navigate('Call', {call: {...chat, type: 'video'}});
  };

  /**
   * Ajouter des participants à l'appel
   * Add participants to call
   */
  const addParticipantsToCall = () => {
    setShowCallOptions(false);
    Alert.alert('Appel de groupe', 'Fonctionnalité d\'appel de groupe en cours de développement');
  };

  /**
   * Rendu d'un message
   * Render message
   */
  const renderMessage = ({item}) => (
    <View
      style={[
        styles.messageContainer,
        item.isMe ? styles.myMessage : styles.otherMessage,
      ]}>
      <View
        style={[
          styles.messageBubble,
          item.isMe ? styles.myBubble : styles.otherBubble,
        ]}>
        <Text
          style={[
            styles.messageText,
            item.isMe ? styles.myMessageText : styles.otherMessageText,
          ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              item.isMe ? styles.myTimestamp : styles.otherTimestamp,
            ]}>
            {item.timestamp}
          </Text>
          {item.isMe && (
            <Icon
              name={
                item.status === 'read'
                  ? 'done-all'
                  : item.status === 'delivered'
                  ? 'done-all'
                  : 'done'
              }
              size={16}
              color={
                item.status === 'read'
                  ? COLORS.PRIMARY_BLUE
                  : COLORS.TEXT_SECONDARY_LIGHT
              }
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Liste des messages / Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Indicateur de frappe / Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>
            {chat?.name} est en train d'écrire...
          </Text>
        </View>
      )}

      {/* Zone de saisie / Input area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="attach-file" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Tapez un message..."
            placeholderTextColor={COLORS.TEXT_SECONDARY_LIGHT}
            multiline
            maxLength={1000}
          />
        </View>

        <TouchableOpacity 
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Icon name="emoji-emotions" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cameraButton}>
          <Icon name="camera-alt" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>

        {newMessage.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}>
            <Icon name="send" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.voiceButton}
            onPressIn={startVoiceRecording}
            onPressOut={stopVoiceRecording}>
            <Icon 
              name={isRecording ? "stop" : "mic"} 
              size={24} 
              color={isRecording ? COLORS.ERROR : COLORS.TEXT_SECONDARY_LIGHT} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Emoji Picker / Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.emojiPickerContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Emojis</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY_LIGHT} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.emojiGrid}>
              {['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏'].map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => addEmoji(emoji)}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Call Options / Call Options Modal */}
      <Modal
        visible={showCallOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCallOptions(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.callOptionsContainer}>
            <Text style={styles.callOptionsTitle}>Options d'appel</Text>
            <TouchableOpacity style={styles.callOption} onPress={startAudioCall}>
              <Icon name="call" size={24} color={COLORS.PRIMARY_GREEN} />
              <Text style={styles.callOptionText}>Appel audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callOption} onPress={startVideoCall}>
              <Icon name="videocam" size={24} color={COLORS.PRIMARY_GREEN} />
              <Text style={styles.callOptionText}>Appel vidéo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callOption} onPress={addParticipantsToCall}>
              <Icon name="group-add" size={24} color={COLORS.PRIMARY_GREEN} />
              <Text style={styles.callOptionText}>Appel de groupe</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowCallOptions(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    padding: 8,
    marginLeft: 8,
  },

  messagesList: {
    flex: 1,
  },

  messagesContent: {
    padding: 16,
  },

  messageContainer: {
    marginVertical: 4,
  },

  myMessage: {
    alignItems: 'flex-end',
  },

  otherMessage: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 18,
  },

  myBubble: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderBottomRightRadius: 4,
  },

  otherBubble: {
    backgroundColor: COLORS.SURFACE_LIGHT,
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },

  myMessageText: {
    color: COLORS.WHITE,
  },

  otherMessageText: {
    color: COLORS.TEXT_PRIMARY_LIGHT,
  },

  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },

  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },

  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  otherTimestamp: {
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  statusIcon: {
    marginLeft: 4,
  },

  typingContainer: {
    padding: 16,
    alignItems: 'flex-start',
  },

  typingText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    fontStyle: 'italic',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
  },

  attachButton: {
    padding: 8,
    marginRight: 8,
  },

  textInputContainer: {
    flex: 1,
    backgroundColor: COLORS.SURFACE_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },

  textInput: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    minHeight: 20,
  },

  cameraButton: {
    padding: 8,
    marginRight: 8,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonActive: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  sendButtonInactive: {
    backgroundColor: COLORS.SURFACE_LIGHT,
  },

  emojiButton: {
    padding: 8,
    marginRight: 8,
  },

  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_LIGHT,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  emojiPickerContainer: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.4,
  },

  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
  },

  emojiGrid: {
    padding: 16,
  },

  emojiButton: {
    padding: 8,
    margin: 4,
  },

  emojiText: {
    fontSize: 24,
  },

  callOptionsContainer: {
    backgroundColor: COLORS.WHITE,
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },

  callOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 16,
    textAlign: 'center',
  },

  callOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.SURFACE_LIGHT,
  },

  callOptionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginLeft: 12,
  },

  cancelButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.ERROR,
    marginTop: 8,
  },

  cancelButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
