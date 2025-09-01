import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import { SocketProvider } from '../contexts/SocketContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true
  }))
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const renderWithProviders = (component) => {
  return render(
    <NavigationContainer>
      <SocketProvider>
        <AuthProvider>
          <ChatProvider>
            {component}
          </ChatProvider>
        </AuthProvider>
      </SocketProvider>
    </NavigationContainer>
  );
};

describe('Chat Tests', () => {
  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    profilePicture: 'profile.jpg'
  };

  const mockChat = {
    _id: 'chat-id',
    users: [
      { _id: 'user-id', fullName: 'Test User' },
      { _id: 'other-user-id', fullName: 'Other User' }
    ],
    isGroupChat: false,
    lastMessage: {
      _id: 'message-id',
      content: 'Hello world!',
      sender: 'other-user-id',
      createdAt: new Date().toISOString()
    }
  };

  const mockMessages = [
    {
      _id: 'message-1',
      content: 'Hello!',
      sender: 'other-user-id',
      type: 'text',
      createdAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      _id: 'message-2',
      content: 'How are you?',
      sender: 'user-id',
      type: 'text',
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
  });

  describe('Chat List', () => {
    test('should render chat list correctly', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
        expect(getByText('Hello world!')).toBeTruthy();
      });
    });

    test('should handle empty chat list', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: []
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('No chats yet')).toBeTruthy();
      });
    });

    test('should handle chat list error', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Failed to load chats'
          }
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Failed to load chats')).toBeTruthy();
      });
    });
  });

  describe('Message Sending', () => {
    test('should send text message', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: {
            _id: 'new-message-id',
            content: 'New message',
            sender: 'user-id',
            type: 'text',
            createdAt: new Date().toISOString()
          }
        }
      });

      const { getByText, getByPlaceholderText } = renderWithProviders(<ChatScreen />);

      // Select a chat
      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      // Send message
      const messageInput = getByPlaceholderText('Type a message...');
      const sendButton = getByText('Send');

      fireEvent.changeText(messageInput, 'New message');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/messages', {
          chat: 'chat-id',
          content: 'New message',
          type: 'text'
        });
      });
    });

    test('should not send empty message', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const sendButton = getByText('Send');
      fireEvent.press(sendButton);

      expect(axios.post).not.toHaveBeenCalled();
    });

    test('should handle message send error', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Failed to send message'
          }
        }
      });

      const { getByText, getByPlaceholderText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const messageInput = getByPlaceholderText('Type a message...');
      const sendButton = getByText('Send');

      fireEvent.changeText(messageInput, 'New message');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(getByText('Failed to send message')).toBeTruthy();
      });
    });
  });

  describe('Message Display', () => {
    test('should display messages correctly', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          messages: mockMessages
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      await waitFor(() => {
        expect(getByText('Hello!')).toBeTruthy();
        expect(getByText('How are you?')).toBeTruthy();
      });
    });

    test('should show message timestamps', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          messages: mockMessages
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      await waitFor(() => {
        // Check if timestamps are displayed
        const timestamps = getByText(/\d{1,2}:\d{2}/);
        expect(timestamps).toBeTruthy();
      });
    });
  });

  describe('Voice Messages', () => {
    test('should record voice message', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const voiceButton = getByText('Voice');
      fireEvent.press(voiceButton);

      // Simulate recording
      await waitFor(() => {
        expect(getByText('Recording...')).toBeTruthy();
      });
    });

    test('should send voice message', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            _id: 'audio-file-id',
            name: 'voice-message.mp3',
            type: 'audio/mp3'
          }
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: {
            _id: 'new-message-id',
            content: '',
            sender: 'user-id',
            type: 'audio',
            file: 'audio-file-id',
            createdAt: new Date().toISOString()
          }
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const voiceButton = getByText('Voice');
      fireEvent.press(voiceButton);

      // Simulate recording and sending
      await waitFor(() => {
        expect(getByText('Recording...')).toBeTruthy();
      });

      // Stop recording
      fireEvent.press(getByText('Stop'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/files/upload'),
          expect.any(FormData)
        );
      });
    });
  });

  describe('Image Sharing', () => {
    test('should open image picker', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const imageButton = getByText('Image');
      fireEvent.press(imageButton);

      // Should show image picker options
      await waitFor(() => {
        expect(getByText('Camera')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
      });
    });

    test('should send image from gallery', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            _id: 'image-file-id',
            name: 'image.jpg',
            type: 'image/jpeg'
          }
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: {
            _id: 'new-message-id',
            content: '',
            sender: 'user-id',
            type: 'image',
            file: 'image-file-id',
            createdAt: new Date().toISOString()
          }
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const imageButton = getByText('Image');
      fireEvent.press(imageButton);

      const galleryButton = getByText('Gallery');
      fireEvent.press(galleryButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/files/upload'),
          expect.any(FormData)
        );
      });
    });
  });

  describe('Call Functionality', () => {
    test('should initiate voice call', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          call: {
            _id: 'call-id',
            callId: 'call-123',
            callType: 'audio',
            status: 'initiated'
          }
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const callButton = getByText('Call');
      fireEvent.press(callButton);

      const voiceCallButton = getByText('Voice Call');
      fireEvent.press(voiceCallButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/calls/initiate', {
          chatId: 'chat-id',
          callType: 'audio',
          recipientId: 'other-user-id'
        });
      });
    });

    test('should initiate video call', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          chats: [mockChat]
        }
      });

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          call: {
            _id: 'call-id',
            callId: 'call-123',
            callType: 'video',
            status: 'initiated'
          }
        }
      });

      const { getByText } = renderWithProviders(<ChatScreen />);

      await waitFor(() => {
        expect(getByText('Other User')).toBeTruthy();
      });

      fireEvent.press(getByText('Other User'));

      const callButton = getByText('Call');
      fireEvent.press(callButton);

      const videoCallButton = getByText('Video Call');
      fireEvent.press(videoCallButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/calls/initiate', {
          chatId: 'chat-id',
          callType: 'video',
          recipientId: 'other-user-id'
        });
      });
    });
  });
});
