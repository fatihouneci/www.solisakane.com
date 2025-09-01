import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  timestamp: Date;
  chatId: string;
  replyTo?: string;
  likes: string[];
}

interface Chat {
  _id: string;
  users: Array<{
    _id: string;
    fullName: string;
    profilePicture?: string;
    online: boolean;
  }>;
  isGroupChat: boolean;
  groupName?: string;
  groupPicture?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Update last message in chats
    setChats(prev => prev.map(chat => 
      chat._id === message.chatId 
        ? { ...chat, lastMessage: message }
        : chat
    ));
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats(prev => prev.map(chat => 
      chat._id === chatId 
        ? { ...chat, ...updates }
        : chat
    ));
  };

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    setChats,
    setCurrentChat,
    setMessages,
    addMessage,
    updateChat,
    loading,
    setLoading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
