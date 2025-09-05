/**
 * @file ChatPage.tsx
 * @description
 * EN: This page displays the chat interface for individual and group conversations.
 * FR: Cette page affiche l'interface de chat pour les conversations individuelles et de groupe.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';
import io from 'socket.io-client';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Smile, 
  Paperclip, 
  Mic,
  MicOff,
  PhoneOff,
  VideoOff,
  Users,
  Search,
  MessageCircle
} from 'lucide-react';

interface Message {
  _id: string;
  content: string;
  type: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  likes: string[];
  replyTo?: {
    message: Message;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  file?: {
    _id: string;
    filename: string;
    url: string;
    type: string;
  };
}

interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    online: boolean;
    status: string;
  }>;
  lastMessage?: Message;
  ongoingCall?: {
    callId: string;
    callerId: string;
    cameraStatus: boolean;
    microphoneStatus: boolean;
  };
}

interface TypingUser {
  _id: string;
  firstName: string;
  lastName: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  
  // EN: Refs / FR: Références
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // EN: Scroll to bottom of messages / FR: Faire défiler vers le bas des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      socketRef.current.on('authenticated', (data: any) => {
        console.log('EN: Socket authenticated / FR: Socket authentifié:', data);
        // EN: Join chat room / FR: Rejoindre la salle de chat
        socketRef.current.emit('join_chat', { chatId });
      });

      socketRef.current.on('new_message', (data: any) => {
        setMessages(prev => [...prev, data.message]);
      });

      socketRef.current.on('user_typing', (data: any) => {
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

      socketRef.current.on('incoming_call', (data: any) => {
        setCallStatus('ringing');
        // EN: Show incoming call notification / FR: Afficher la notification d'appel entrant
      });

      socketRef.current.on('call_answered', (data: any) => {
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
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  // EN: Handle typing indicator / FR: Gérer l'indicateur de frappe
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
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
  const handleCall = (callType: 'audio' | 'video') => {
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
  const handleAnswerCall = (accepted: boolean) => {
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
    if (!chat) return '';
    if (chat.isGroupChat) return '/images/group-avatar.png';
    const otherUser = chat.users.find(u => u._id !== user?._id);
    return otherUser?.profilePicture || '/images/default-avatar.png';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Chat non trouvé</h2>
          <p className="text-gray-500 mb-4">Ce chat n'existe pas ou vous n'y avez pas accès.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* EN: Chat Header / FR: En-tête du chat */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <img
            src={getChatDisplayPicture()}
            alt={getChatDisplayName()}
            className="h-10 w-10 rounded-full object-cover"
          />
          
          <div>
            <h2 className="font-semibold text-gray-900">{getChatDisplayName()}</h2>
            <div className="flex items-center space-x-2">
              {chat.isGroupChat ? (
                <span className="text-sm text-gray-500">{chat.users.length} membres</span>
              ) : (
                <span className="text-sm text-gray-500">
                  {chat.users.find(u => u._id !== user?._id)?.online ? 'En ligne' : 'Hors ligne'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isInCall && (
            <>
              <button
                onClick={() => handleCall('audio')}
                className="p-2 hover:bg-gray-100 rounded-full"
                disabled={callStatus !== 'idle'}
              >
                <Phone className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleCall('video')}
                className="p-2 hover:bg-gray-100 rounded-full"
                disabled={callStatus !== 'idle'}
              >
                <Video className="h-5 w-5" />
              </button>
            </>
          )}
          
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* EN: Call Status Bar / FR: Barre de statut d'appel */}
      {callStatus !== 'idle' && (
        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="font-medium">
              {callStatus === 'calling' && 'Appel en cours...'}
              {callStatus === 'ringing' && 'Appel entrant...'}
              {callStatus === 'connected' && 'Appel en cours'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {callStatus === 'ringing' && (
              <>
                <button
                  onClick={() => handleAnswerCall(true)}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded-full"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAnswerCall(false)}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                >
                  <PhoneOff className="h-4 w-4" />
                </button>
              </>
            )}
            
            {callStatus === 'connected' && (
              <>
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-2 rounded-full ${micEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`p-2 rounded-full ${cameraEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                >
                  <PhoneOff className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* EN: Messages Area / FR: Zone des messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender._id === user?._id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              {message.replyTo && (
                <div className="text-xs opacity-75 mb-1 border-l-2 pl-2">
                  Réponse à {message.replyTo.user.firstName}: {message.replyTo.message.content}
                </div>
              )}
              
              <p className="text-sm">{message.content}</p>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-75">
                  {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                
                {message.likes.length > 0 && (
                  <span className="text-xs opacity-75">
                    ❤️ {message.likes.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* EN: Typing indicator / FR: Indicateur de frappe */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {typingUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')} en train d'écrire...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* EN: Message Input / FR: Saisie de message */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isInCall}
            />
          </div>
          
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </button>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isInCall}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
